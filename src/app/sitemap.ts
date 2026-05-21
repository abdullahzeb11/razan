import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/blog", "/privacy", "/terms"];
  return pages.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${page}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: page === "" ? 1 : 0.6,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${siteConfig.url}/${l}${page}`]),
        ),
      },
    })),
  );
}
