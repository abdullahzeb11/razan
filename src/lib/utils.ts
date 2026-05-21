import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSAR(amount: number, locale: "ar" | "en" = "ar") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatHijriDate(date: Date, locale: "ar" | "en" = "ar") {
  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-SA-u-ca-islamic-umalqura",
    { day: "numeric", month: "long", year: "numeric" },
  ).format(date);
}

export function waLink(phone: string, message: string) {
  const sanitized = phone.replace(/\D/g, "");
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}
