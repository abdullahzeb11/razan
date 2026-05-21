import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Booking" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: true },
  };
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const [services, session] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameAr: true,
        shortEn: true,
        shortAr: true,
        priceSar: true,
        durationMinutes: true,
        icon: true,
        featured: true,
        homeVisit: true,
      },
    }),
    auth(),
  ]);

  let prefill: { name: string; phone: string; email: string } | undefined;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    });
    if (user) {
      prefill = {
        name: user.name ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
      };
    }
  }

  const t = await getTranslations({ locale, namespace: "Booking" });

  return (
    <div className="relative pb-24 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
      <div className="container-wide max-w-4xl">
        <header className="mb-10 text-center sm:text-start">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-4 text-display-lg balance">{t("title")}</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <BookingWizard
          services={services}
          initialServiceSlug={sp.service}
          prefill={prefill}
        />
      </div>
    </div>
  );
}
