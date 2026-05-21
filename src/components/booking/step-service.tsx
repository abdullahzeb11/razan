"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check, Home, Stethoscope, Sparkles, type LucideIcon } from "lucide-react";
import { cn, formatSAR } from "@/lib/utils";

export type ServiceOption = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  shortEn: string | null;
  shortAr: string | null;
  priceSar: number;
  durationMinutes: number;
  icon: string | null;
  featured: boolean;
  homeVisit: boolean;
};

const ICON_MAP: Record<string, LucideIcon> = {
  Stethoscope,
  Sparkles,
  Home,
};

export function StepService({
  services,
  selectedId,
  onSelect,
}: {
  services: ServiceOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("Services");
  const tb = useTranslations("Booking.step1");
  const locale = useLocale() as "ar" | "en";

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold sm:text-3xl">{tb("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {tb("subtitle")}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {services.map((s) => {
          const Icon = ICON_MAP[s.icon ?? "Stethoscope"] ?? Stethoscope;
          const active = selectedId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                "group relative flex h-full flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-start transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated",
                active
                  ? "border-gold shadow-glow ring-2 ring-gold/40"
                  : "border-border",
                s.featured && !active && "border-gold/40",
              )}
            >
              {s.featured ? (
                <span className="absolute end-3 top-3 rounded-full bg-gold-gradient px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
                  {t("popular")}
                </span>
              ) : null}

              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-colors",
                  active
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-primary/10 text-primary ring-primary/15",
                )}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              </div>

              <div>
                <h3 className="text-base font-semibold leading-tight">
                  {locale === "ar" ? s.nameAr : s.nameEn}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {locale === "ar" ? s.shortAr : s.shortEn}
                </p>
              </div>

              <div className="mt-auto flex w-full items-end justify-between pt-3">
                <div>
                  <p className="text-lg font-semibold tracking-tight">
                    {formatSAR(s.priceSar, locale)}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t("duration", { minutes: s.durationMinutes })}
                  </p>
                </div>
                {active ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-gold-foreground">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
