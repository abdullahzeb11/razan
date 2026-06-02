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
import { ChatWidget } from "@/components/chat/chat-widget";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";
import { localBusinessJsonLd } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
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

  const typedLocale = locale as Locale;
  const [messages, t, session, services, reviewAgg] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "Meta" }),
    auth(),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        nameEn: true,
        nameAr: true,
        priceSar: true,
        durationMinutes: true,
      },
    }),
    prisma.review.aggregate({
      where: { approved: true, locale: typedLocale },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const rating =
    reviewAgg._count._all > 0 && reviewAgg._avg.rating != null
      ? {
          average: Math.round(reviewAgg._avg.rating * 10) / 10,
          count: reviewAgg._count._all,
        }
      : undefined;

  const jsonLd = localBusinessJsonLd(typedLocale, {
    description: t("description"),
    services,
    rating,
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
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar isSignedIn={isCustomer} />
            <main>{children}</main>
            <Footer />
            <WhatsAppFloat />
            <ChatWidget />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
