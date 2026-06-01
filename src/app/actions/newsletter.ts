"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { emailShell, escapeHtml, sendEmail } from "@/lib/email";

const subscribeSchema = z.object({
  email: z.string().trim().email().max(254),
  locale: z.enum(["ar", "en"]),
});

type Result =
  | { ok: true; alreadySubscribed?: boolean }
  | { ok: false; error: "invalid_email" | "server_error" };

export async function subscribeNewsletter(
  input: z.infer<typeof subscribeSchema>,
): Promise<Result> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_email" };

  const email = parsed.data.email.toLowerCase();
  const { locale } = parsed.data;

  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing) {
      // Don't leak that the email already exists — just return success.
      return { ok: true, alreadySubscribed: true };
    }

    await prisma.subscriber.create({ data: { email, locale } });

    // Fire-and-forget admin notification (don't block the form on it).
    void sendEmail({
      subject: `New newsletter subscriber — ${email}`,
      html: emailShell({
        eyebrow: "Newsletter",
        title: "Someone just subscribed",
        bodyHtml: `
<table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:16px;">
  <tr><td style="padding:6px 0; color:#666; width:96px;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#0E6E5A; text-decoration:none;"><strong>${escapeHtml(email)}</strong></a></td></tr>
  <tr><td style="padding:6px 0; color:#666;">Locale</td><td style="padding:6px 0;">${escapeHtml(locale)}</td></tr>
  <tr><td style="padding:6px 0; color:#666;">Joined</td><td style="padding:6px 0;">${escapeHtml(new Date().toISOString())}</td></tr>
</table>
<p style="font-size:13px; color:#666; margin:0; line-height:1.55;">
  When you're ready to send your first newsletter, you can export the full list from your database.
</p>`,
      }),
    });

    return { ok: true };
  } catch (err) {
    console.error("[subscribeNewsletter]", err);
    return { ok: false, error: "server_error" };
  }
}
