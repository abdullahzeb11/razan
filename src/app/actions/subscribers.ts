"use server";

import { revalidatePath } from "next/cache";
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

export async function deleteSubscriber(id: string) {
  await requireAdmin();
  await prisma.subscriber.delete({ where: { id } });
  revalidatePath("/admin/subscribers");
  return { ok: true as const };
}
