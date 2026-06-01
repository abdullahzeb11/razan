import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/sections/hero";
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

  const [services, reviewRows] = await Promise.all([
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
      where: { approved: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        authorName: true,
        rating: true,
        body: true,
      },
    }),
  ]);

  const reviews: TestimonialItem[] = reviewRows.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    body: r.body,
  }));

  return (
    <>
      <Hero />
      <Benefits />
      <Sunnah />
      <Services services={services} />
      <Gallery />
      <Testimonials reviews={reviews} />
      <FAQ />
      <MapSection />
      <Contact />
      <CTA />
    </>
  );
}
