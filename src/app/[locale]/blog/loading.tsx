import { getTranslations } from "next-intl/server";

export default async function BlogLoading() {
  // Fall back to English copy here — the loading boundary doesn't have
  // access to the URL params, so we just render the most generic shell.
  const t = await getTranslations({ locale: "en", namespace: "Blog" });

  return (
    <div className="relative pb-24 pt-12 sm:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_60%)]" />

      <div className="container-wide max-w-6xl">
        <header className="max-w-2xl">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-3 text-display-lg balance">{t("title")}</h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </header>

        {/* Category pill placeholders */}
        <div className="mt-8 flex flex-wrap items-center gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 animate-pulse rounded-full bg-secondary"
            />
          ))}
        </div>

        {/* Post card skeletons */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Featured card (spans 2 cols on desktop) */}
          <SkeletonCard featured />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-card ${
        featured ? "lg:col-span-2 lg:flex lg:flex-row" : ""
      }`}
    >
      <div
        className={`aspect-[16/10] animate-pulse bg-secondary ${
          featured ? "shrink-0 lg:aspect-auto lg:w-1/2" : ""
        }`}
      />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="h-5 w-20 animate-pulse rounded-full bg-secondary" />
        <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-secondary" />
        <div className="mt-1 h-4 w-5/6 animate-pulse rounded bg-secondary" />
        <div className="mt-auto pt-4">
          <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
        </div>
      </div>
    </div>
  );
}
