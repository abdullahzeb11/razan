"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHeader } from "./section";

const ITEMS = [0, 1, 2, 3] as const;

export function Testimonials() {
  const t = useTranslations("Testimonials");

  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="container-wide">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {ITEMS.map((idx) => (
            <motion.figure
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: idx * 0.06 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-elevated"
            >
              <Quote className="absolute end-5 top-5 h-12 w-12 text-primary/8" />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="mt-5 text-base leading-relaxed text-foreground pretty">
                “{t(`items.${idx}.body`)}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-gradient text-sm font-semibold text-primary-foreground">
                  {t(`items.${idx}.name`).charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {t(`items.${idx}.name`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`items.${idx}.city`)}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
