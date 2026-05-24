"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionHeader } from "./section";

/**
 * Curated Unsplash photos showing the clinical / wellness environment.
 * Replace with your own clinic photography once available.
 * All four images are sized to a 3:4 portrait aspect ratio at 900px width.
 */
const GALLERY = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
  },
] as const;

export function Gallery() {
  const t = useTranslations("Gallery");

  return (
    <section id="gallery" className="relative py-16 sm:py-24 lg:py-28">
      <div className="container-wide">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {GALLERY.map((item, i) => (
            <GalleryCard
              key={item.id}
              url={item.url}
              caption={t(`captions.${item.id}`)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryCard({
  url,
  caption,
  index,
}: {
  url: string;
  caption: string;
  index: number;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-secondary shadow-soft transition-shadow hover:shadow-elevated"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={caption}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
      />
      {/* Subtle bottom gradient for the caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
      <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
          {caption}
        </p>
        <div className="mt-1 h-px w-8 bg-gold/60 transition-all duration-500 group-hover:w-14 group-hover:bg-gold" />
      </figcaption>
    </motion.figure>
  );
}
