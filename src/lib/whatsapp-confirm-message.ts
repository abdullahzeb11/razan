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
  /** Payment method the customer chose at booking. */
  paymentMethod: "CASH" | "TRANSFER" | "ONLINE_CARD";
  /** Payment lifecycle state — drives the "Paid" vs "Pending" suffix. */
  paymentStatus: "PENDING_OFFLINE" | "AWAITING_CARD" | "PAID" | "FAILED" | "REFUNDED";
  appointmentId: string;
  siteUrl: string;
  /** When true, swap colorful emojis for plain BMP/ASCII glyphs. Default false. */
  preferAscii?: boolean;
};

function paymentLabel(
  method: "CASH" | "TRANSFER" | "ONLINE_CARD",
  status: "PENDING_OFFLINE" | "AWAITING_CARD" | "PAID" | "FAILED" | "REFUNDED",
  locale: "ar" | "en",
  preferAscii: boolean,
): string {
  // When sending to desktop WhatsApp Web we swap the trailing 4-byte emoji
  // (✅) for a BMP checkmark — Gmail's URL re-encoder corrupts 4-byte UTF-8
  // when the wa.me link is opened from an email view.
  const paidSuffix = preferAscii ? " ✓" : " ✅";
  if (locale === "ar") {
    if (method === "CASH") return "نقدًا عند الوصول";
    if (method === "TRANSFER") return "تحويل بنكي / مدى أثير / STC Pay";
    if (status === "PAID") return "دفع إلكتروني · مدفوع" + paidSuffix;
    if (status === "FAILED") return "دفع إلكتروني · فشل";
    return "دفع إلكتروني · قيد الانتظار";
  }
  if (method === "CASH") return "Cash on arrival";
  if (method === "TRANSFER") return "Bank transfer / Mada Atheer / STC Pay";
  if (status === "PAID") return "Online card · Paid" + paidSuffix;
  if (status === "FAILED") return "Online card · Failed";
  return "Online card · Pending";
}

const DIVIDER = "━━━━━━━━━━━━━━━";

type Glyphs = {
  brand: string;       // line prefix for the brand header
  check: string;       // confirmation checkmark
  service: string;     // service field
  date: string;        // date field
  time: string;        // time field
  where: string;       // location field
  pay: string;         // payment field
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
  pay: "💳",
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
  pay: "▸",
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

  // Trailing pin emoji (📍) is 4-byte UTF-8 and corrupts via Gmail's URL
  // re-encoder for desktop WhatsApp Web. Strip it in ASCII mode — the
  // ▸ glyph at the line start already signals what the line is about.
  const pinSuffix = args.preferAscii ? "" : " 📍";

  if (args.locale === "ar") {
    const mapsBlockAr = hasMapsUrl
      ? `\n${g.where} *الموقع:* ${args.mapsUrl}\n`
      : "";
    const pinRequestAr = needsPinRequest
      ? `\n${g.where} لمساعدتنا في الوصول، يُرجى مشاركة موقعك عبر زر الموقع في واتساب${pinSuffix}\n`
      : "";

    return `${g.brand}*مركز رزان للحجامة*
${DIVIDER}

السلام عليكم *${args.customerName}*،

موعدك مؤكد ${g.check}

${g.service} *الخدمة:* ${args.serviceNameAr}
${g.date} *التاريخ:* ${date}
${g.time} *الوقت:* ${time}
${g.where} *المكان:* ${whereAr}
${g.pay} *الدفع:* ${paymentLabel(args.paymentMethod, args.paymentStatus, "ar", Boolean(args.preferAscii))}
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
    ? `\n${g.where} To help us find you, please share your live location via WhatsApp's location button${pinSuffix}\n`
    : "";

  return `${g.brand}*Razan Hijama Center*
${DIVIDER}

As-salamu alaykum *${args.customerName}*,

Your appointment is confirmed ${g.check}

${g.service} *Service:* ${args.serviceNameEn}
${g.date} *Date:* ${date}
${g.time} *Time:* ${time}
${g.where} *Where:* ${whereEn}
${g.pay} *Payment:* ${paymentLabel(args.paymentMethod, args.paymentStatus, "en", Boolean(args.preferAscii))}
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
