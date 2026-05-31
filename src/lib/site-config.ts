/**
 * Single source of truth for non-translatable site data:
 * brand, contact, social, navigation, structured data.
 * All translatable strings live in /messages/*.json.
 */
export const siteConfig = {
  brand: {
    nameEn: "Razan Hijama Center",
    nameAr: "مركز رزان للحجامة",
    shortEn: "Razan",
    shortAr: "رزان",
    domain: "razan.sa",
  },
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://razan.sa",
  contact: {
    phoneDisplay: "+966 55 250 7654",
    phoneTel: "+966552507654",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966575056318",
    email: "hello@razan.sa",
    addressEn: "King Fahd Rd, Al-Olaya, Riyadh 12212, Saudi Arabia",
    addressAr: "طريق الملك فهد، حي العليا، الرياض ١٢٢١٢، المملكة العربية السعودية",
    geo: { lat: 24.7136, lng: 46.6753 },
    hours: {
      weekdays: { open: "09:00", close: "22:00" },
      friday: { open: "14:00", close: "22:00" },
    },
  },
  social: {
    instagram: "https://instagram.com/razan.sa",
    twitter: "https://twitter.com/razan_sa",
    tiktok: "https://tiktok.com/@razan.sa",
    snapchat: "https://snapchat.com/add/razan.sa",
    youtube: "https://youtube.com/@razan",
  },
  nav: [
    { key: "services", href: "#services" },
    { key: "benefits", href: "#benefits" },
    { key: "sunnah", href: "#sunnah" },
    { key: "gallery", href: "#gallery" },
    { key: "testimonials", href: "#testimonials" },
    { key: "blog", href: "/blog" },
    { key: "faq", href: "#faq" },
    { key: "contact", href: "#contact" },
  ] as const,
  stats: { rating: 4.9, reviewCount: 7200 },
} as const;

export type SiteConfig = typeof siteConfig;
