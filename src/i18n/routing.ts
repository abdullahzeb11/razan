import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["ar", "en"] as const,
  defaultLocale: "ar",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const localeMeta: Record<Locale, { label: string; dir: "rtl" | "ltr"; flag: string }> = {
  ar: { label: "العربية", dir: "rtl", flag: "🇸🇦" },
  en: { label: "English", dir: "ltr", flag: "🇬🇧" },
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
