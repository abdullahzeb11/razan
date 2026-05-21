"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Moon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sunnah() {
  const t = useTranslations("Sunnah");

  return (
    <section id="sunnah" className="relative overflow-hidden py-20 sm:py-28">
      {/* Deep emerald slab with gold filigree. */}
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary-gradient p-8 text-primary-foreground sm:p-14 lg:p-20">
          {/* Filigree backdrop */}
          <FiligreeBackdrop />

          <div className="relative grid items-center gap-12 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <span className="eyebrow text-gold/90 [&::before]:bg-gold/60">
                {t("eyebrow")}
              </span>
              <h2 className="mt-5 text-display-xl text-primary-foreground balance">
                <span className="text-gold-leaf">{t("title")}</span>
              </h2>
              <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-gold/80">
                {t("narrator")}
              </p>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80">
                {t("body")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 text-gold">
                    <Moon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold/90">
                    {t("daysTitle")}
                  </p>
                </div>
                <p className="mt-5 text-lg leading-relaxed text-primary-foreground/90">
                  {t("daysBody")}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {["17", "19", "21"].map((d) => (
                    <div
                      key={d}
                      className="rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/15 to-gold/5 p-4 text-center"
                    >
                      <p className="text-3xl font-semibold tracking-tight text-gold">
                        {d}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-gold/80">
                        Hijri
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  variant="gold"
                  size="sm"
                  className="mt-6 w-full"
                >
                  <a href="#services">
                    {t("viewSchedule")}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FiligreeBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute -end-24 -top-24 h-[520px] w-[520px] text-gold/12"
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.7">
        {Array.from({ length: 16 }).map((_, i) => (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={20 + i * 6}
            strokeDasharray={i % 2 === 0 ? "1 4" : "3 3"}
          />
        ))}
      </g>
      <g transform="translate(100 100)" fill="currentColor" opacity="0.18">
        <rect x="-40" y="-40" width="80" height="80" />
        <rect x="-40" y="-40" width="80" height="80" transform="rotate(45)" />
      </g>
    </svg>
  );
}
