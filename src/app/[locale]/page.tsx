import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Hero, type HeroRating } from "@/components/sections/hero";
import { Benefits } from "@/components/sections/benefits";
import { Sunnah } from "@/components/sections/sunnah";
import { Services } from "@/components/sections/services";
import { Gallery } from "@/components/sections/gallery";
import { Testimonials, type TestimonialItem } from "@/components/sections/testimonials";
import { FAQ } from "@/components/sections/faq";
import { MapSection } from "@/components/sections/map";
import { Contact } from "@/components/sections/contact";
import { CTA } from "@/components/sections/cta";

// Revalidate every 5 minutes; admin edits trigger immediate revalidation
// via `revalidatePath` in src/app/actions/admin.ts.
export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale === "en" ? "en" : "ar";

  const [services, reviewRows, reviewAgg] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameAr: true,
        priceSar: true,
        durationMinutes: true,
        icon: true,
        featured: true,
      },
    }),
    prisma.review.findMany({
      where: { approved: true, locale: loc },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: {
        id: true,
        authorName: true,
        rating: true,
        body: true,
      },
    }),
    prisma.review.aggregate({
      where: { approved: true, locale: loc },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const reviews: TestimonialItem[] = reviewRows.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    body: r.body,
  }));

  const rating: HeroRating | undefined =
    reviewAgg._count._all > 0 && reviewAgg._avg.rating != null
      ? {
          average: Math.round(reviewAgg._avg.rating * 10) / 10,
          count: reviewAgg._count._all,
        }
      : undefined;

  return (
    <>
      <Hero rating={rating} />
      <Benefits />
      <Sunnah />
      <Services services={services} />
      <Gallery />
      <Testimonials
        reviews={reviews}
        totalCount={reviewAgg._count._all}
      />
      <FAQ />
      <MapSection />
      <Contact />
      <CTA />
    </>
  );
}
