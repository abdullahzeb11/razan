"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  appointmentInputSchema,
  normalizePhone,
  SLOT_CAPACITY,
  type AppointmentInput,
} from "@/lib/booking";
import { sendTemplate } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site-config";

type Result =
  | { ok: true; id: string }
  | { ok: false; error: string; field?: keyof AppointmentInput };

export async function createAppointment(raw: unknown): Promise<Result> {
  const parsed = appointmentInputSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue.message,
      field: issue.path[0] as keyof AppointmentInput,
    };
  }
  const input = parsed.data;

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
  });
  if (!service || !service.active) {
    return { ok: false, error: "Service not available", field: "serviceId" };
  }

  const scheduledAt = new Date(input.scheduledAt);

  // Capacity check: any overlap at the same slot is rejected.
  const overlapping = await prisma.appointment.count({
    where: {
      scheduledAt,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });
  if (overlapping >= SLOT_CAPACITY) {
    return { ok: false, error: "Slot is no longer available", field: "scheduledAt" };
  }

  const phone = normalizePhone(input.guestPhone);

  // If the booker is signed in, link the appointment to their account.
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const appointment = await prisma.appointment.create({
    data: {
      userId,
      serviceId: service.id,
      scheduledAt,
      durationMin: service.durationMinutes,
      priceSar: service.priceSar,
      location: input.location,
      guestName: input.guestName,
      guestPhone: phone,
      guestEmail: input.guestEmail || null,
      addressLine: input.addressLine || null,
      city: input.city || null,
      notes: input.notes || null,
      status: "PENDING",
    },
  });

  // Fire WhatsApp confirmations side-effect — non-blocking. We don't fail the
  // booking if Meta is unreachable; the appointment is already persisted.
  // The customer template + admin notify template need to be approved in Meta
  // Business Manager (names below). If env vars are missing this is a no-op.
  void notifyOnBooking({
    appointmentId: appointment.id,
    customerName: input.guestName,
    customerPhone: phone,
    serviceName: input.locale === "ar" ? service.nameAr : service.nameEn,
    scheduledAt,
    locale: input.locale,
  });

  return { ok: true, id: appointment.id };
}

async function notifyOnBooking(args: {
  appointmentId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  scheduledAt: Date;
  locale: "ar" | "en";
}) {
  const when = new Intl.DateTimeFormat(args.locale === "ar" ? "ar-SA" : "en-SA", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Riyadh",
  }).format(args.scheduledAt);

  // Customer confirmation
  await sendTemplate({
    to: args.customerPhone,
    template: "appointment_confirmation",
    language: args.locale,
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: args.customerName },
          { type: "text", text: args.serviceName },
          { type: "text", text: when },
        ],
      },
    ],
  });

  // Admin alert (if number configured)
  const admin = process.env.WHATSAPP_ADMIN_NUMBER || siteConfig.contact.whatsappNumber;
  if (admin) {
    await sendTemplate({
      to: admin,
      template: "admin_new_booking",
      language: "ar",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: args.customerName },
            { type: "text", text: args.serviceName },
            { type: "text", text: when },
            { type: "text", text: args.customerPhone },
          ],
        },
      ],
    });
  }
}
