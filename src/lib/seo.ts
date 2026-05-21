import { siteConfig } from "@/lib/site-config";
import type { Locale } from "@/i18n/routing";

export function localBusinessJsonLd(locale: Locale, t: { name: string; description: string }) {
  const name =
    locale === "ar" ? siteConfig.brand.nameAr : siteConfig.brand.nameEn;
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "HealthAndBeautyBusiness"],
    name,
    image: `${siteConfig.url}/og.png`,
    url: siteConfig.url,
    description: t.description,
    telephone: siteConfig.contact.phoneTel,
    email: siteConfig.contact.email,
    priceRange: "SAR 280 – 650",
    address: {
      "@type": "PostalAddress",
      streetAddress: "King Fahd Rd",
      addressLocality: "Riyadh",
      addressRegion: "Riyadh",
      postalCode: "12212",
      addressCountry: "SA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.contact.geo.lat,
      longitude: siteConfig.contact.geo.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "22:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "14:00",
        closes: "22:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteConfig.stats.rating,
      reviewCount: siteConfig.stats.reviewCount,
    },
    sameAs: Object.values(siteConfig.social),
  };
}
