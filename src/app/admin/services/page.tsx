import { prisma } from "@/lib/prisma";
import { ServiceRow } from "@/components/admin/service-row";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Services
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit pricing, duration, and visibility. Changes go live immediately.
        </p>
      </header>

      <div className="grid gap-4">
        {services.map((s) => (
          <ServiceRow
            key={s.id}
            id={s.id}
            slug={s.slug}
            nameEn={s.nameEn}
            nameAr={s.nameAr}
            priceSar={s.priceSar}
            durationMinutes={s.durationMinutes}
            active={s.active}
            featured={s.featured}
            homeVisit={s.homeVisit}
          />
        ))}
      </div>
    </div>
  );
}
