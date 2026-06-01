"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star, Quote, MessageCircleHeart } from "lucide-react";
import { SectionHeader } from "./section";

export type TestimonialItem = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
};

export function Testimonials({
  reviews,
}: {
  reviews: TestimonialItem[];
}) {
  const t = useTranslations("Testimonials");

  return (
    <section id="testimonials" className="relative py-16 sm:py-24 lg:py-28">
      <div className="container-wide">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mt-14 mx-auto max-w-2xl rounded-3xl border border-border bg-card/60 p-10 text-center backdrop-blur-sm sm:p-14"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircleHeart className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("emptyTitle")}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("emptyBody")}
            </p>
          </motion.div>
        ) : (
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {reviews.map((r, idx) => (
              <motion.figure
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: idx * 0.06 }}
                className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-elevated"
              >
                <Quote className="absolute end-5 top-5 h-12 w-12 text-primary/8" />
                <div className="flex items-center gap-1">
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
                <blockquote className="mt-5 text-base leading-relaxed text-foreground pretty">
                  “{r.body}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-gradient text-sm font-semibold text-primary-foreground">
                    {r.authorName.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold">{r.authorName}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
