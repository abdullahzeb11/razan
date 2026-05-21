"use client";

import { useTranslations } from "next-intl";
import {
  Activity,
  Droplets,
  HeartPulse,
  ShieldCheck,
  Moon,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader, Reveal } from "./section";

const ICONS: Record<string, LucideIcon> = {
  circulation: Activity,
  detox: Droplets,
  pain: HeartPulse,
  immune: ShieldCheck,
  stress: Moon,
  energy: Zap,
};

const KEYS = ["circulation", "detox", "pain", "immune", "stress", "energy"] as const;

export function Benefits() {
  const t = useTranslations("Benefits");

  return (
    <section id="benefits" className="relative py-20 sm:py-28">
      <div className="container-wide">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {KEYS.map((key, i) => {
            const Icon = ICONS[key];
            return (
              <Reveal key={key} delay={i * 0.05}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated">
                  <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5" />
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`items.${key}.body`)}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
