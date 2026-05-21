import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { routing, localeMeta, type Locale } from "@/i18n/routing";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";
import { localBusinessJsonLd } from "@/lib/seo";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0E6E5A" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1612" },
  ],
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("title"), template: `%s · ${siteConfig.brand.shortEn}` },
    description: t("description"),
    keywords: t("keywords"),
    applicationName: siteConfig.brand.nameEn,
    authors: [{ name: siteConfig.brand.nameEn }],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: "/ar",
        en: "/en",
        "x-default": "/ar",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      url: `${siteConfig.url}/${locale}`,
      title: t("title"),
      description: t("description"),
      siteName: siteConfig.brand.nameEn,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t("ogAlt") }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og.png"],
    },
    icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const [messages, t, session] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "Meta" }),
    auth(),
  ]);
  const typedLocale = locale as Locale;
  const jsonLd = localBusinessJsonLd(typedLocale, {
    name: siteConfig.brand.nameEn,
    description: t("description"),
  });
  const isCustomer = Boolean(session?.user) && session?.user.role !== "ADMIN" && session?.user.role !== "STAFF";

  return (
    <html
      lang={locale}
      dir={localeMeta[typedLocale].dir}
      suppressHydrationWarning
      className={fontVariables}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Navbar isSignedIn={isCustomer} />
            <main>{children}</main>
            <Footer />
            <WhatsAppFloat />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
