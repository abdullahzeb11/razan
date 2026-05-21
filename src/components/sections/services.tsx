"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check, ArrowRight, Home, Stethoscope, Sparkles, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { SectionHeader, Reveal } from "./section";
import { formatSAR, cn } from "@/lib/utils";

export type ServiceDisplayData = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  priceSar: number;
  durationMinutes: number;
  icon: string | null;
  featured: boolean;
};

const ICONS: Record<string, LucideIcon> = { Stethoscope, Sparkles, Home };

export function Services({ services }: { services: ServiceDisplayData[] }) {
  const t = useTranslations("Services");
  const locale = useLocale() as "ar" | "en";

  return (
    <section id="services" className="relative py-20 sm:py-28">
      <div className="container-wide">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon ?? "Stethoscope"] ?? Stethoscope;
            const hasIncludes = ["classic", "therapeutic", "home"].includes(s.slug);
            return (
              <Reveal key={s.id} delay={i * 0.08}>
                <article
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated",
                    s.featured &&
                      "border-gold/60 bg-gradient-to-b from-gold/[0.04] to-card shadow-glow",
                  )}
                >
                  {s.featured ? (
                    <span className="absolute end-5 top-5 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
                      {t("popular")}
                    </span>
                  ) : null}

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">
                    {locale === "ar" ? s.nameAr : s.nameEn}
                  </h3>
                  {hasIncludes ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(`items.${s.slug}.description`)}
                    </p>
                  ) : null}

                  {hasIncludes ? (
                    <ul className="mt-5 space-y-2.5">
                      {[0, 1, 2, 3].map((idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          <span className="text-foreground/80">
                            {t(`items.${s.slug}.includes.${idx}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-7 flex items-end justify-between border-t border-border pt-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {t("from")}
                      </p>
                      <p className="mt-1 text-3xl font-semibold tracking-tight">
                        {formatSAR(s.priceSar, locale)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("duration", { minutes: s.durationMinutes })}
                      </p>
                    </div>
                    <Button
                      asChild
                      variant={s.featured ? "gold" : "default"}
                      size="sm"
                    >
                      <Link href={`/book?service=${s.slug}`}>
                        {t("book")}
                        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                      </Link>
                    </Button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
