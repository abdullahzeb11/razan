import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { sendTemplate, sendText } from "./whatsapp";
import { normalizePhone } from "./booking";

export const OTP_TTL_MIN = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SEC = 30;

/** Generate a 6-digit numeric OTP. */
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Request a new OTP for `phone`. Returns ok always (don't leak existence). */
export async function requestOtp(rawPhone: string): Promise<{ ok: true; devCode?: string }> {
  const phone = normalizePhone(rawPhone);
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60_000);

  // Cooldown: refuse if a non-expired code was just issued.
  const existing = await prisma.oneTimeCode.findUnique({ where: { phone } });
  if (existing && existing.createdAt > new Date(Date.now() - RESEND_COOLDOWN_SEC * 1000)) {
    return { ok: true };
  }

  await prisma.oneTimeCode.upsert({
    where: { phone },
    create: { phone, codeHash, expiresAt, attempts: 0 },
    update: { codeHash, expiresAt, attempts: 0, consumedAt: null },
  });

  // Try WhatsApp template first; fall back to text (works in 24h window or stub).
  const templateRes = await sendTemplate({
    to: phone,
    template: "phone_otp",
    language: "ar",
    components: [
      { type: "body", parameters: [{ type: "text", text: code }] },
    ],
  });
  if (!templateRes.ok) {
    await sendText({ to: phone, text: `Al-Shifa OTP: ${code}` });
  }

  // In dev only, return the code so the UI/terminal can surface it.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[otp] ${phone} → ${code}`);
    return { ok: true, devCode: code };
  }
  return { ok: true };
}

export type VerifyResult =
  | { ok: true; phone: string; userId: string }
  | { ok: false; error: "invalid" | "expired" | "too_many_attempts" | "no_code" };

/**
 * Verify the OTP. On success, find-or-create the User row keyed by phone
 * and return its id (caller will issue the session).
 */
export async function verifyOtp(rawPhone: string, code: string): Promise<VerifyResult> {
  const phone = normalizePhone(rawPhone);

  const otp = await prisma.oneTimeCode.findUnique({ where: { phone } });
  if (!otp || otp.consumedAt) return { ok: false, error: "no_code" };
  if (otp.expiresAt < new Date()) return { ok: false, error: "expired" };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, error: "too_many_attempts" };

  const ok = await bcrypt.compare(code, otp.codeHash);
  if (!ok) {
    await prisma.oneTimeCode.update({
      where: { phone },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "invalid" };
  }

  await prisma.oneTimeCode.update({
    where: { phone },
    data: { consumedAt: new Date() },
  });

  // Find or create the user keyed by phone. Link any prior guest appointments.
  const user = await prisma.user.upsert({
    where: { phone },
    create: { phone, role: "CUSTOMER" },
    update: {},
  });

  await prisma.appointment.updateMany({
    where: { userId: null, guestPhone: phone },
    data: { userId: user.id },
  });

  return { ok: true, phone, userId: user.id };
}
