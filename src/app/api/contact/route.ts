import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  phone: z
    .string()
    .min(8, "Phone number is too short")
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Phone number looks invalid"),
  email: z
    .string()
    .email("Email looks invalid")
    .optional()
    .or(z.literal("")),
  message: z.string().min(8, "Message is too short").max(1000),
});

const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 5;

function rateLimit(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count += 1;
  return true;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]!,
  );
}

// Lazy email helper — only runs when RESEND_API_KEY is configured.
// Always returns true if disabled (so we don't fail the form when email is off).
async function sendNotificationEmail(data: {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;
  if (!apiKey || !to) {
    console.log("[contact] email disabled (no RESEND_API_KEY / CONTACT_EMAIL)");
    return true;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const from =
      process.env.CONTACT_FROM || "Al-Shifa <onboarding@resend.dev>";
    const subject = `New website message from ${data.name}`;
    const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="border-radius: 12px; background: linear-gradient(135deg,#0E6E5A,#08433B); color:#fff; padding:20px 24px; margin-bottom:20px;">
    <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; opacity:0.7;">${escapeHtml(siteConfig.brand.shortEn)}</div>
    <div style="font-size:20px; font-weight:600; margin-top:6px;">New message from the website</div>
  </div>
  <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:16px;">
    <tr><td style="padding:6px 0; color:#666; width:96px;">From</td><td style="padding:6px 0;"><strong>${escapeHtml(data.name)}</strong></td></tr>
    <tr><td style="padding:6px 0; color:#666;">Phone</td><td style="padding:6px 0;"><a href="tel:${escapeHtml(data.phone)}" style="color:#0E6E5A; text-decoration:none;">${escapeHtml(data.phone)}</a></td></tr>
    ${data.email ? `<tr><td style="padding:6px 0; color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color:#0E6E5A; text-decoration:none;">${escapeHtml(data.email)}</a></td></tr>` : ""}
    <tr><td style="padding:6px 0; color:#666;">Ref</td><td style="padding:6px 0; font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; color:#888;">${escapeHtml(data.id)}</td></tr>
  </table>
  <div style="border-left:3px solid #C9A961; background:#fafaf7; padding:14px 16px; border-radius:6px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(data.message)}</div>
</div>`.trim();

    await resend.emails.send({
      from,
      to,
      replyTo: data.email || undefined,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("[contact] email send failed", err);
    return false;
  }
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";

  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { name, phone, email, message } = parsed.data;

  const record = await prisma.contactMessage.create({
    data: {
      name,
      phone,
      email: email || null,
      message,
      source: "landing",
    },
    select: { id: true },
  });

  // Fire-and-forget email; don't block the response on it.
  void sendNotificationEmail({
    id: record.id,
    name,
    phone,
    email: email || "",
    message,
  });

  return NextResponse.json({ ok: true, id: record.id });
}
