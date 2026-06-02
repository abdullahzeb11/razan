import { siteConfig } from "@/lib/site-config";
import type { Locale } from "@/i18n/routing";

type Service = {
  slug: string;
  nameEn: string;
  nameAr: string;
  priceSar: number;
  durationMinutes: number;
};

type LocalBusinessArgs = {
  description: string;
  /** Real review aggregate from the DB. Omit when 0 reviews. */
  rating?: { average: number; count: number };
  /** Services to declare price range + offer catalog. */
  services?: Service[];
};

export function localBusinessJsonLd(
  locale: Locale,
  args: LocalBusinessArgs,
) {
  const name =
    locale === "ar" ? siteConfig.brand.nameAr : siteConfig.brand.nameEn;

  const prices = args.services?.map((s) => s.priceSar) ?? [];
  const priceRange =
    prices.length > 0
      ? `SAR ${Math.min(...prices)}–${Math.max(...prices)}`
      : undefined;

  const offers = args.services?.map((s) => ({
    "@type": "Offer",
    name: locale === "ar" ? s.nameAr : s.nameEn,
    price: s.priceSar,
    priceCurrency: "SAR",
    priceSpecification: {
      "@type": "PriceSpecification",
      price: s.priceSar,
      priceCurrency: "SAR",
    },
    availability: "https://schema.org/InStock",
    url: `${siteConfig.url}/${locale}/book`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "HealthAndBeautyBusiness"],
    name,
    image: `${siteConfig.url}/opengraph-image`,
    url: `${siteConfig.url}/${locale}`,
    description: args.description,
    telephone: siteConfig.contact.phoneTel,
    email: siteConfig.contact.email,
    ...(priceRange ? { priceRange } : {}),
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
    // Only include aggregateRating when we have REAL approved reviews.
    // Google penalizes fake review markup if caught.
    ...(args.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: args.rating.average,
            reviewCount: args.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(offers && offers.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: locale === "ar" ? "خدمات الحجامة" : "Hijama Services",
            itemListElement: offers,
          },
        }
      : {}),
    areaServed: {
      "@type": "City",
      name: locale === "ar" ? "الرياض" : "Riyadh",
    },
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.twitter,
      siteConfig.social.youtube,
    ],
  };
}

/** FAQ structured data — Google can show rich result snippets from this. */
export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
