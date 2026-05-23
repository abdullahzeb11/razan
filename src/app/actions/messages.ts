"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]),
});

export async function updateMessageStatus(input: z.infer<typeof statusSchema>) {
  await requireAdmin();
  const parsed = statusSchema.parse(input);
  await prisma.contactMessage.update({
    where: { id: parsed.id },
    data: { status: parsed.status },
  });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true as const };
}
