/**
 * Hijri-day helpers. Uses Intl with the islamic-umalqura calendar, which is
 * the official Saudi calendar (matches Umm al-Qura published dates).
 */

/** Returns the Hijri day-of-month (1..30) for a given Gregorian Date. */
export function getHijriDay(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", {
    day: "numeric",
  }).formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value;
  return day ? Number(day) : NaN;
}

/** True if the date falls on a recommended sunnah day (17, 19, or 21 Hijri). */
export function isSunnahDay(date: Date): boolean {
  const d = getHijriDay(date);
  return d === 17 || d === 19 || d === 21;
}

/** Formats a Hijri short label, e.g. "١٧ ربيع الأول" / "17 Rabiʿ I". */
export function formatHijriShort(date: Date, locale: "ar" | "en" = "ar"): string {
  return new Intl.DateTimeFormat(
    locale === "ar"
      ? "ar-SA-u-ca-islamic-umalqura"
      : "en-SA-u-ca-islamic-umalqura",
    { day: "numeric", month: "short" },
  ).format(date);
}
