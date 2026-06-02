import { notFound, redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { MoyasarForm } from "@/components/booking/moyasar-form";

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale: "ar" | "en" = rawLocale === "en" ? "en" : "ar";
  setRequestLocale(locale);

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!appointment) notFound();

  // If the customer somehow lands here for a non-card booking, redirect them
  // straight to the confirmation page — nothing to pay through Moyasar.
  if (appointment.paymentMethod !== "ONLINE_CARD") {
    redirect(`/${locale}/book/confirmed/${id}`);
  }
  // Already paid — skip the form and send them to the confirmation.
  if (appointment.paymentStatus === "PAID") {
    redirect(`/${locale}/book/confirmed/${id}`);
  }

  const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY;
  const isTestMode = Boolean(publishableKey?.startsWith("pk_test_"));
  const t = await getTranslations({ locale, namespace: "Booking.pay" });

  return (
    <div className="relative pb-24 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />

      <div className="container-wide max-w-2xl">
        <header className="text-center sm:text-start">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-4 text-display-md balance">{t("title")}</h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t("subtitle", {
              service: locale === "ar" ? appointment.service.nameAr : appointment.service.nameEn,
            })}
          </p>
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-soft sm:mt-10">
          <div className="border-b border-border bg-primary-gradient p-6 text-primary-foreground">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
              {t("amountLabel")}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {appointment.priceSar.toLocaleString(locale === "ar" ? "ar-SA" : "en-SA")} {t("currency")}
            </p>
            <p className="mt-1 text-xs opacity-80">
              {t("for", { service: locale === "ar" ? appointment.service.nameAr : appointment.service.nameEn })}
            </p>
          </div>

          {isTestMode ? (
            <div className="border-b border-border bg-gold/10 px-5 py-3 text-xs font-medium text-gold-foreground dark:text-gold sm:px-7">
              {t("testMode")}
            </div>
          ) : null}

          <div className="p-5 sm:p-7">
            {publishableKey ? (
              <MoyasarForm
                publishableKey={publishableKey}
                amountHalalas={appointment.priceSar * 100}
                description={`Razan Hijama · ${appointment.service.nameEn} · ${id.slice(-8).toUpperCase()}`}
                callbackUrl={`${siteConfig.url}/${locale}/book/pay/${id}/callback`}
                locale={locale}
                customerName={appointment.guestName ?? ""}
                customerEmail={appointment.guestEmail ?? ""}
                appointmentId={id}
              />
            ) : (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
                <p className="font-semibold">{t("notConfiguredTitle")}</p>
                <p className="mt-1 text-xs opacity-90">{t("notConfiguredBody")}</p>
              </div>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("secured")}
        </p>
      </div>
    </div>
  );
}
