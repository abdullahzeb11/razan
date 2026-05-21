"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sendTemplate } from "@/lib/whatsapp";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/* ─── Appointments ────────────────────────────────────────────────────── */

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  cancelReason: z.string().max(500).optional(),
});

export async function updateAppointmentStatus(input: z.infer<typeof updateStatusSchema>) {
  await requireAdmin();
  const parsed = updateStatusSchema.parse(input);

  const updated = await prisma.appointment.update({
    where: { id: parsed.id },
    data: {
      status: parsed.status,
      cancelReason: parsed.status === "CANCELLED" ? parsed.cancelReason ?? null : null,
    },
    include: { service: true },
  });

  // Notify customer on key transitions (stub-safe).
  if (parsed.status === "CONFIRMED" && updated.guestPhone) {
    void sendTemplate({
      to: updated.guestPhone,
      template: "appointment_status_confirmed",
      language: "ar",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: updated.guestName ?? "" },
            { type: "text", text: updated.service.nameAr },
            {
              type: "text",
              text: new Intl.DateTimeFormat("ar-SA", {
                dateStyle: "full",
                timeStyle: "short",
                timeZone: "Asia/Riyadh",
              }).format(updated.scheduledAt),
            },
          ],
        },
      ],
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  return { ok: true as const };
}

const noteSchema = z.object({ id: z.string().min(1), notes: z.string().max(2000) });
export async function updateAppointmentNotes(input: z.infer<typeof noteSchema>) {
  await requireAdmin();
  const { id, notes } = noteSchema.parse(input);
  await prisma.appointment.update({ where: { id }, data: { notes } });
  revalidatePath("/admin/appointments");
  return { ok: true as const };
}

/* ─── Services CMS ────────────────────────────────────────────────────── */

const serviceUpdateSchema = z.object({
  id: z.string().min(1),
  priceSar: z.number().int().min(0).max(100_000).optional(),
  durationMinutes: z.number().int().min(15).max(240).optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  homeVisit: z.boolean().optional(),
});

export async function updateService(input: z.infer<typeof serviceUpdateSchema>) {
  await requireAdmin();
  const { id, ...rest } = serviceUpdateSchema.parse(input);
  await prisma.service.update({ where: { id }, data: rest });
  revalidatePath("/admin/services");
  revalidatePath("/[locale]", "page");
  return { ok: true as const };
}

/* ─── Reviews moderation ──────────────────────────────────────────────── */

const reviewSchema = z.object({
  id: z.string().min(1),
  approved: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function updateReview(input: z.infer<typeof reviewSchema>) {
  await requireAdmin();
  const { id, ...rest } = reviewSchema.parse(input);
  await prisma.review.update({ where: { id }, data: rest });
  revalidatePath("/admin/reviews");
  revalidatePath("/[locale]", "page");
  return { ok: true as const };
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  return { ok: true as const };
}
