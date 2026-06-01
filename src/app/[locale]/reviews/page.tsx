import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Star, Quote, MessageCircleHeart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Reviews" });
  const url = `${siteConfig.url}/${locale}/reviews`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      languages: {
        ar: `${siteConfig.url}/ar/reviews`,
        en: `${siteConfig.url}/en/reviews`,
      },
    },
    openGraph: {
      type: "website",
      url,
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = (locale === "en" ? "en" : "ar") as "ar" | "en";
  const t = await getTranslations({ locale, namespace: "Reviews" });

  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({
      where: { approved: true, locale: loc },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        authorName: true,
        rating: true,
        body: true,
        createdAt: true,
        featured: true,
      },
    }),
    prisma.review.aggregate({
      where: { approved: true, locale: loc },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const average =
    agg._count._all > 0 && agg._avg.rating != null
      ? Math.round(agg._avg.rating * 10) / 10
      : null;
  const totalCount = agg._count._all;

  const localeTag = loc === "ar" ? "ar-SA" : "en-GB";
  const numberFmt = new Intl.NumberFormat(localeTag, {
    maximumFractionDigits: 1,
    minimumFractionDigits:
      average != null && average % 1 === 0 ? 0 : 1,
  });
  const countFmt = new Intl.NumberFormat(localeTag);
  const dateFmt = new Intl.DateTimeFormat(localeTag, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative pb-24 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_60%)]" />

      <div className="container-wide max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className={loc === "ar" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
          {t("backHome")}
        </Link>

        <header className="mt-6 max-w-3xl">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-3 text-display-lg balance">{t("title")}</h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </header>

        {totalCount > 0 && average != null ? (
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-soft">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(average)
                      ? "fill-gold text-gold"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-foreground">
                {numberFmt.format(average)}
              </span>
              <span className="text-muted-foreground"> / 5</span>
              <span className="ms-2 text-muted-foreground">
                · {t("totalLabel", { count: countFmt.format(totalCount) })}
              </span>
            </div>
          </div>
        ) : null}

        {reviews.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-border bg-card/60 p-10 text-center sm:p-14">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircleHeart className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-foreground sm:text-3xl">
              {t("emptyTitle")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("emptyBody")}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure
                key={r.id}
                className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-elevated"
              >
                <Quote className="absolute end-5 top-5 h-10 w-10 text-primary/8" />
                {r.featured ? (
                  <span className="absolute start-5 top-5 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold dark:text-gold">
                    {t("featuredBadge")}
                  </span>
                ) : null}
                <div
                  className={`flex items-center gap-0.5 ${r.featured ? "mt-8" : ""}`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < r.rating
                          ? "fill-gold text-gold"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground pretty">
                  “{r.body}”
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-gradient text-xs font-semibold text-primary-foreground">
                      {r.authorName.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold">{r.authorName}</p>
                  </div>
                  <time
                    dateTime={r.createdAt.toISOString()}
                    className="text-[11px] text-muted-foreground"
                  >
                    {dateFmt.format(r.createdAt)}
                  </time>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
