/**
 * Single source of truth for the WhatsApp confirmation message.
 *
 * Two render modes:
 *  - Full emojis (🌿 ✅ 📋 📅 🕐 📍 🎫) — for WhatsApp mobile app, which
 *    handles 4-byte UTF-8 via wa.me deep links correctly.
 *  - ASCII/BMP fallback (✓ ▸) — for WhatsApp Web, which corrupts 4-byte
 *    UTF-8 emojis when they arrive via the wa.me text parameter.
 *
 * The server picks the right variant via User-Agent in the redirect route.
 */

export type WhatsAppConfirmArgs = {
  locale: "ar" | "en";
  customerName: string;
  serviceNameEn: string;
  serviceNameAr: string;
  scheduledAt: Date;
  location: "CLINIC" | "HOME_VISIT";
  addressLine: string | null;
  /** Optional Google Maps share URL the customer pasted at booking time. */
  mapsUrl: string | null;
  appointmentId: string;
  siteUrl: string;
  /** When true, swap colorful emojis for plain BMP/ASCII glyphs. Default false. */
  preferAscii?: boolean;
};

const DIVIDER = "━━━━━━━━━━━━━━━";

type Glyphs = {
  brand: string;       // line prefix for the brand header
  check: string;       // confirmation checkmark
  service: string;     // service field
  date: string;        // date field
  time: string;        // time field
  where: string;       // location field
  ref: string;         // reference field
  closing: string;     // closing line trailing accent
};

const EMOJI_GLYPHS: Glyphs = {
  brand: "🌿 ",
  check: "✅",
  service: "📋",
  date: "📅",
  time: "🕐",
  where: "📍",
  ref: "🎫",
  closing: " 🌿",
};

const ASCII_GLYPHS: Glyphs = {
  brand: "",
  check: "✓",
  service: "▸",
  date: "▸",
  time: "▸",
  where: "▸",
  ref: "▸",
  closing: "",
};

export function buildWhatsAppConfirmMessage(args: WhatsAppConfirmArgs): string {
  const g: Glyphs = args.preferAscii ? ASCII_GLYPHS : EMOJI_GLYPHS;

  const localeTag = args.locale === "ar" ? "ar-SA" : "en-SA";
  const date = new Intl.DateTimeFormat(localeTag, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(args.scheduledAt);
  const time = new Intl.DateTimeFormat(localeTag, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  }).format(args.scheduledAt);
  const ref = args.appointmentId.slice(-8).toUpperCase();
  const bookingUrl = `${args.siteUrl}/${args.locale}/book/confirmed/${args.appointmentId}`;

  const whereAr =
    args.location === "HOME_VISIT"
      ? "زيارة منزلية" + (args.addressLine ? ` — ${args.addressLine}` : "")
      : "في العيادة";
  const whereEn =
    args.location === "HOME_VISIT"
      ? "Home visit" + (args.addressLine ? ` — ${args.addressLine}` : "")
      : "At the clinic";

  // Location pin handling for home visits:
  //   - If the customer pasted a Google Maps link at booking → echo it back
  //     so the practitioner has it in WhatsApp too.
  //   - Otherwise → ask the customer to share their WhatsApp location pin.
  //     This is the most natural flow in Saudi Arabia where text addresses
  //     are often vague.
  const isHomeVisit = args.location === "HOME_VISIT";
  const hasMapsUrl = isHomeVisit && Boolean(args.mapsUrl);
  const needsPinRequest = isHomeVisit && !args.mapsUrl;

  if (args.locale === "ar") {
    const mapsBlockAr = hasMapsUrl
      ? `\n${g.where} *الموقع:* ${args.mapsUrl}\n`
      : "";
    const pinRequestAr = needsPinRequest
      ? `\n${g.where} لمساعدتنا في الوصول، يُرجى مشاركة موقعك عبر زر الموقع في واتساب 📍\n`
      : "";

    return `${g.brand}*مركز رزان للحجامة*
${DIVIDER}

السلام عليكم *${args.customerName}*،

موعدك مؤكد ${g.check}

${g.service} *الخدمة:* ${args.serviceNameAr}
${g.date} *التاريخ:* ${date}
${g.time} *الوقت:* ${time}
${g.where} *المكان:* ${whereAr}
${g.ref} *المرجع:* ${ref}
${mapsBlockAr}${pinRequestAr}
${DIVIDER}

عرض الحجز:
${bookingUrl}

ردّوا على هذه الرسالة إذا احتجتم لإعادة الجدولة.
نراكم قريبًا إن شاء الله${g.closing}`;
  }

  const mapsBlockEn = hasMapsUrl
    ? `\n${g.where} *Location pin:* ${args.mapsUrl}\n`
    : "";
  const pinRequestEn = needsPinRequest
    ? `\n${g.where} To help us find you, please share your live location via WhatsApp's location button 📍\n`
    : "";

  return `${g.brand}*Razan Hijama Center*
${DIVIDER}

As-salamu alaykum *${args.customerName}*,

Your appointment is confirmed ${g.check}

${g.service} *Service:* ${args.serviceNameEn}
${g.date} *Date:* ${date}
${g.time} *Time:* ${time}
${g.where} *Where:* ${whereEn}
${g.ref} *Ref:* ${ref}
${mapsBlockEn}${pinRequestEn}
${DIVIDER}

View your booking:
${bookingUrl}

Reply to this message if you need to reschedule.
See you then${g.closing}`;
}

/**
 * Returns true if the User-Agent looks like a mobile device. We use this to
 * decide which glyph set to send — mobile WhatsApp handles 4-byte emojis,
 * WhatsApp Web corrupts them.
 */
export function isMobileUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
}
