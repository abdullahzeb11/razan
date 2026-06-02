import { z } from "zod";

/* ─── Business config ──────────────────────────────────────────────────── */

export const SLOT_MINUTES = 30;
export const TIMEZONE = "Asia/Riyadh";
/**
 * Saudi Arabia is UTC+3 year-round (no DST). Hardcoding the offset is
 * intentional and safer than `Intl.DateTimeFormat` gymnastics for slot
 * generation, which must produce the same UTC ISO whether it runs on a
 * Vercel server (UTC), a Saudi browser (UTC+3), or anywhere else.
 */
const RIYADH_TZ_OFFSET = "+03:00";

/** Saudi week: Sun = 0 ... Sat = 6. Friday opens later. */
function getHoursForDayOfWeek(dayOfWeek: number): { open: number; close: number } {
  if (dayOfWeek === 5) return { open: 14, close: 22 }; // Friday
  return { open: 9, close: 22 };
}

/** Public hours helper — interprets the date in Riyadh time. */
export function getHours(date: Date): { open: number; close: number } {
  const dayName = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  }).format(date);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return getHoursForDayOfWeek(dayMap[dayName] ?? 0);
}

/** Lead time (don't allow same-day bookings inside this window). */
export const MIN_LEAD_MINUTES = 60;

/** Default capacity per slot (one practitioner per slot in MVP). */
export const SLOT_CAPACITY = 1;

/* ─── Slot generation ─────────────────────────────────────────────────── */

export type Slot = {
  /** ISO 8601 UTC (canonical storage form). */
  iso: string;
  /** "09:30" — what we show in the grid (Riyadh wall time). */
  label: string;
  /** Bucket for grouping. */
  period: "morning" | "afternoon" | "evening";
  /** Already booked / past / outside hours. */
  available: boolean;
};

/** Generate all candidate slots for a given Riyadh-local-date (YYYY-MM-DD). */
export function generateSlots(localDate: string, takenIsos: Set<string>): Slot[] {
  // Anchor at noon Riyadh time so day-of-week is unambiguous regardless of
  // server/browser TZ.
  const dayAnchor = new Date(`${localDate}T12:00:00${RIYADH_TZ_OFFSET}`);
  const { open, close } = getHours(dayAnchor);
  const now = new Date();
  const leadCutoff = new Date(now.getTime() + MIN_LEAD_MINUTES * 60_000);

  const slots: Slot[] = [];
  for (let h = open; h < close; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      // Construct the slot using an explicit Riyadh offset, then ISO
      // serializes it back to UTC. Same UTC result on any runtime.
      const riyadhWall = `${localDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00${RIYADH_TZ_OFFSET}`;
      const slot = new Date(riyadhWall);

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

/** Generate the next N booking dates as Riyadh-local YYYY-MM-DD strings. */
export function nextDates(n: number, from: Date = new Date()): string[] {
  const out: string[] = [];
  // `en-CA` produces YYYY-MM-DD format.
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  for (let i = 0; i < n; i++) {
    const d = new Date(from.getTime() + i * 24 * 60 * 60_000);
    out.push(formatter.format(d));
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
    // Optional Google Maps share URL. Accept any https URL up to 500 chars;
    // we don't enforce a domain whitelist because Google rotates short-link
    // hosts (maps.app.goo.gl, goo.gl/maps, g.co/maps, google.com/maps).
    mapsUrl: z
      .string()
      .trim()
      .max(500)
      .url("Please paste a valid link")
      .refine((v) => v.startsWith("https://"), "Link must start with https://")
      .optional()
      .or(z.literal("")),
    notes: z.string().trim().max(500).optional(),
    // Payment method the customer chose at booking. ONLINE_CARD is only
    // selectable from the UI once the Moyasar merchant account is live —
    // until then the UI only sends CASH or TRANSFER, but we accept the
    // enum so future integration doesn't need a schema change.
    paymentMethod: z.enum(["CASH", "TRANSFER", "ONLINE_CARD"]).default("CASH"),
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
