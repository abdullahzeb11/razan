"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const submitSchema = z.object({
  appointmentId: z.string().min(1),
  authorName: z.string().trim().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(20).max(1000),
});

type Result =
  | { ok: true }
  | {
      ok: false;
      error:
        | "not_found"
        | "not_eligible"
        | "already_reviewed"
        | "invalid"
        | "server_error";
    };

export async function submitReview(
  input: z.infer<typeof submitSchema>,
): Promise<Result> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { appointmentId, authorName, rating, body } = parsed.data;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, status: true, userId: true },
  });

  if (!appointment) return { ok: false, error: "not_found" };
  if (appointment.status !== "COMPLETED") {
    return { ok: false, error: "not_eligible" };
  }

  const existing = await prisma.review.findUnique({
    where: { appointmentId },
    select: { id: true },
  });
  if (existing) return { ok: false, error: "already_reviewed" };

  try {
    await prisma.review.create({
      data: {
        appointmentId,
        userId: appointment.userId,
        authorName,
        rating,
        body,
        approved: false,
      },
    });
    revalidatePath("/admin/reviews");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("[submitReview]", err);
    return { ok: false, error: "server_error" };
  }
}
