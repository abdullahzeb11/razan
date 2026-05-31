import "server-only";
import { siteConfig } from "@/lib/site-config";

export function escapeHtml(s: string): string {
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

type SendArgs = {
  subject: string;
  html: string;
  to?: string;
  replyTo?: string;
};

/**
 * Send an email via Resend. No-op when RESEND_API_KEY / CONTACT_EMAIL are
 * unset — returns `false` so callers can decide whether to surface that.
 */
export async function sendEmail(args: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = args.to || process.env.CONTACT_EMAIL;
  if (!apiKey || !to) return false;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from =
      process.env.CONTACT_FROM || "Razan <onboarding@resend.dev>";
    await resend.emails.send({
      from,
      to,
      replyTo: args.replyTo,
      subject: args.subject,
      html: args.html,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

/** Branded email card wrapper — used by both contact and booking notifications. */
export function emailShell(args: {
  eyebrow: string;
  title: string;
  bodyHtml: string;
}): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="border-radius: 12px; background: linear-gradient(135deg,#0E6E5A,#08433B); color:#fff; padding:20px 24px; margin-bottom:20px;">
    <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; opacity:0.7;">${escapeHtml(args.eyebrow)}</div>
    <div style="font-size:20px; font-weight:600; margin-top:6px;">${escapeHtml(args.title)}</div>
  </div>
  ${args.bodyHtml}
  <p style="margin-top:24px; font-size:11px; color:#999; text-align:center;">
    ${escapeHtml(siteConfig.brand.nameEn)} · <a href="${escapeHtml(siteConfig.url)}/admin" style="color:#0E6E5A; text-decoration:none;">Open admin</a>
  </p>
</div>`.trim();
}
