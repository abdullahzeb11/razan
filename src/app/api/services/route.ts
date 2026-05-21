import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // 5 min

export async function GET() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ services });
}
