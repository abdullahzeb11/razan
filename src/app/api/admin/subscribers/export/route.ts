import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  // Wrap in quotes and escape any inner quotes. Handles commas + line breaks.
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: { email: true, locale: true, createdAt: true },
  });

  const rows = [
    ["email", "locale", "subscribed_at"].join(","),
    ...subscribers.map((s) =>
      [
        csvEscape(s.email),
        csvEscape(s.locale),
        csvEscape(s.createdAt.toISOString()),
      ].join(","),
    ),
  ];

  // UTF-8 BOM so Excel opens Arabic characters correctly.
  const csv = "﻿" + rows.join("\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="razan-subscribers-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
