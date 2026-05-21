import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlots } from "@/lib/booking";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?date=YYYY-MM-DD
 * Returns the slot grid for that local date with availability flags.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date query param required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const taken = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { scheduledAt: true },
  });

  const slots = generateSlots(date, new Set(taken.map((a) => a.scheduledAt.toISOString())));

  return NextResponse.json({ date, slots });
}
