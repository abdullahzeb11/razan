import { Inter, Fraunces, Tajawal, Reem_Kufi } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const fontArabic = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export const fontKufi = Reem_Kufi({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kufi",
  display: "swap",
});

export const fontVariables = [
  fontSans.variable,
  fontDisplay.variable,
  fontArabic.variable,
  fontKufi.variable,
].join(" ");
