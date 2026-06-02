import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMoyasarPayment, moyasarConfigured } from "@/lib/moyasar";
import { notifyOnBooking } from "@/app/actions/booking";

export const dynamic = "force-dynamic";

/**
 * Moyasar redirects the customer here after they finish (or fail) 3D Secure.
 * We don't trust the URL params alone — we re-fetch the payment from Moyasar
 * server-side to confirm status before updating the appointment.
 *
 * Flow:
 *   1. Customer pays on /book/pay/[id] (Moyasar.js embed)
 *   2. Moyasar processes the card → 3D Secure if Mada
 *   3. Browser redirects here with ?id=<moyasar_payment_id>&status=<paid|failed>
 *   4. We verify via API, update DB, then redirect to the confirmation page
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ locale: string; id: string }> },
) {
  const { locale: rawLocale, id: appointmentId } = await context.params;
  const locale: "ar" | "en" = rawLocale === "en" ? "en" : "ar";

  const moyasarId = req.nextUrl.searchParams.get("id");
  const status = req.nextUrl.searchParams.get("status");

  // No payment ID — likely the customer hit this URL directly. Send them back.
  if (!moyasarId) {
    return NextResponse.redirect(
      new URL(`/${locale}/book/pay/${appointmentId}`, req.url),
      302,
    );
  }

  // Sanity: if Moyasar isn't configured we can't verify. Mark failed and bounce.
  if (!moyasarConfigured()) {
    await prisma.appointment
      .update({
        where: { id: appointmentId },
        data: { paymentStatus: "FAILED", paymentTxnId: moyasarId },
      })
      .catch(() => {});
    return NextResponse.redirect(
      new URL(`/${locale}/book/confirmed/${appointmentId}?payment=failed`, req.url),
      302,
    );
  }

  try {
    const payment = await fetchMoyasarPayment(moyasarId);

    // Moyasar's "paid" status means the charge was successfully captured.
    // Anything else — initiated, authorized-only, failed, voided — we treat
    // as not-yet-paid so the customer can retry.
    const isPaid = payment.status === "paid";

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: isPaid ? "PAID" : "FAILED",
        paymentTxnId: payment.id,
      },
      include: { service: true },
    });

    // Fire admin email + customer WhatsApp template only AFTER payment is
    // confirmed — avoids notifying about bookings that never paid.
    if (isPaid) {
      void notifyOnBooking({
        appointmentId: updated.id,
        customerName: updated.guestName ?? "",
        customerPhone: updated.guestPhone ?? "",
        customerEmail: updated.guestEmail,
        serviceName: locale === "ar" ? updated.service.nameAr : updated.service.nameEn,
        serviceNameEn: updated.service.nameEn,
        scheduledAt: updated.scheduledAt,
        durationMin: updated.durationMin,
        priceSar: updated.priceSar,
        location: updated.location,
        addressLine: updated.addressLine,
        mapsUrl: updated.mapsUrl,
        paymentMethod: updated.paymentMethod,
        paymentStatus: updated.paymentStatus,
        notes: updated.notes,
        locale,
      });
    }

    const dest = new URL(
      `/${locale}/book/confirmed/${appointmentId}${isPaid ? "?payment=paid" : "?payment=failed"}`,
      req.url,
    );
    return NextResponse.redirect(dest, 302);
  } catch {
    // Verification failed — flag as FAILED so the customer can retry, and
    // bounce them to the confirmation page where they'll see the error.
    await prisma.appointment
      .update({
        where: { id: appointmentId },
        data: { paymentStatus: "FAILED", paymentTxnId: moyasarId },
      })
      .catch(() => {});

    // Status hint from URL is also useful in case API verification is slow.
    const hint = status === "paid" ? "verifying" : "failed";
    return NextResponse.redirect(
      new URL(`/${locale}/book/confirmed/${appointmentId}?payment=${hint}`, req.url),
      302,
    );
  }
}
