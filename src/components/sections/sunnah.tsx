"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Moon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sunnah() {
  const t = useTranslations("Sunnah");

  return (
    <section id="sunnah" className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
      {/* Deep emerald slab with gold filigree. */}
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-3xl bg-primary-gradient p-6 text-primary-foreground sm:rounded-[2rem] sm:p-10 lg:rounded-[2.5rem] lg:p-20">
          {/* Filigree backdrop */}
          <FiligreeBackdrop />

          <div className="relative grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
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
              <h2 className="mt-4 text-display-lg text-primary-foreground balance sm:mt-5 sm:text-display-xl">
                <span className="text-gold-leaf">{t("title")}</span>
              </h2>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-gold/80 sm:text-sm">
                {t("narrator")}
              </p>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-primary-foreground/80 sm:mt-6 sm:text-base">
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
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl sm:rounded-3xl sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold sm:h-11 sm:w-11">
                    <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold/90 sm:text-sm">
                    {t("daysTitle")}
                  </p>
                </div>
                <p className="mt-4 text-base leading-relaxed text-primary-foreground/90 sm:mt-5 sm:text-lg">
                  {t("daysBody")}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
                  {["17", "19", "21"].map((d) => (
                    <div
                      key={d}
                      className="rounded-xl border border-gold/30 bg-gradient-to-b from-gold/15 to-gold/5 p-3 text-center sm:rounded-2xl sm:p-4"
                    >
                      <p className="text-2xl font-semibold tracking-tight text-gold sm:text-3xl">
                        {d}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-gold/80">
                        {t("hijri")}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  variant="gold"
                  size="sm"
                  className="mt-5 w-full sm:mt-6"
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
      className="pointer-events-none absolute -end-20 -top-16 h-[280px] w-[280px] text-gold/12 sm:-end-24 sm:-top-24 sm:h-[420px] sm:w-[420px] lg:h-[520px] lg:w-[520px]"
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
