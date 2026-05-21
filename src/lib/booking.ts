import { z } from "zod";

/* ─── Business config ──────────────────────────────────────────────────── */

export const SLOT_MINUTES = 30;
export const TIMEZONE = "Asia/Riyadh";

/** Saudi week: Sun = 0 ... Sat = 6 (JS Date). Friday (5) opens later. */
export function getHours(date: Date): { open: number; close: number } {
  const day = date.getDay(); // 0 = Sun
  if (day === 5) return { open: 14, close: 22 }; // Friday
  return { open: 9, close: 22 };
}

/** Lead time (don't allow same-day bookings inside this window). */
export const MIN_LEAD_MINUTES = 60;

/** Default capacity per slot (one practitioner per slot in MVP). */
export const SLOT_CAPACITY = 1;

/* ─── Slot generation ─────────────────────────────────────────────────── */

export type Slot = {
  /** ISO 8601 in Asia/Riyadh wall time. */
  iso: string;
  /** "09:30" — what we show in the grid. */
  label: string;
  /** Bucket for grouping. */
  period: "morning" | "afternoon" | "evening";
  /** Already booked / past / outside hours. */
  available: boolean;
};

/** Generate all candidate slots for a given local-date (YYYY-MM-DD). */
export function generateSlots(localDate: string, takenIsos: Set<string>): Slot[] {
  const date = new Date(`${localDate}T00:00:00`);
  const { open, close } = getHours(date);
  const now = new Date();
  const leadCutoff = new Date(now.getTime() + MIN_LEAD_MINUTES * 60_000);

  const slots: Slot[] = [];
  for (let h = open; h < close; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const slot = new Date(date);
      slot.setHours(h, m, 0, 0);

      const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const period: Slot["period"] =
        h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";

      const inPast = slot < leadCutoff;
      const taken = takenIsos.has(slot.toISOString());

      slots.push({
        iso: slot.toISOString(),
        label,
        period,
        available: !inPast && !taken,
      });
    }
  }
  return slots;
}

/** Generate the next N booking dates as YYYY-MM-DD strings. */
export function nextDates(n: number, from: Date = new Date()): string[] {
  const out: string[] = [];
  const base = new Date(from);
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    out.push(`${yyyy}-${mm}-${dd}`);
  }
  return out;
}

/* ─── Validation ──────────────────────────────────────────────────────── */

// Accept +966 5XXXXXXXX, 05XXXXXXXX, or international 8–15 digits.
const phoneRegex = /^\+?\d[\d\s()-]{7,18}$/;

export const appointmentInputSchema = z
  .object({
    serviceId: z.string().min(1),
    scheduledAt: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid datetime"),
    location: z.enum(["CLINIC", "HOME_VISIT"]),
    guestName: z.string().trim().min(2).max(80),
    guestPhone: z
      .string()
      .trim()
      .regex(phoneRegex, "Invalid phone number"),
    guestEmail: z
      .string()
      .trim()
      .email()
      .optional()
      .or(z.literal("")),
    addressLine: z.string().trim().max(200).optional(),
    city: z.string().trim().max(80).optional(),
    notes: z.string().trim().max(500).optional(),
    locale: z.enum(["ar", "en"]).default("ar"),
  })
  .refine(
    (v) => v.location !== "HOME_VISIT" || (v.addressLine && v.addressLine.length >= 5),
    { path: ["addressLine"], message: "Address is required for home visits" },
  );

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;

/** Normalize a Saudi phone to E.164 +9665XXXXXXXX where possible. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00966")) return `+${digits.slice(2)}`;
  if (digits.startsWith("966")) return `+${digits}`;
  if (digits.startsWith("05") && digits.length === 10) return `+966${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length === 9) return `+966${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}
