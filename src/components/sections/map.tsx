"use client";

import { useLocale, useTranslations } from "next-intl";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section";
import { siteConfig } from "@/lib/site-config";

export function MapSection() {
  const t = useTranslations("Map");
  const locale = useLocale() as "ar" | "en";

  const { lat, lng } = siteConfig.contact.geo;
  const embedUrl =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED ||
    `https://www.google.com/maps?q=${lat},${lng}&hl=${locale}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section id="contact" className="relative py-16 sm:py-24 lg:py-28">
      <div className="container-wide">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-10 grid gap-6 sm:mt-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="aspect-[5/4] overflow-hidden rounded-2xl border border-border bg-card shadow-soft sm:aspect-[16/10] sm:rounded-3xl">
              <iframe
                title="Razan Hijama Center location"
                src={embedUrl}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-5 sm:rounded-3xl sm:p-7">
              <div className="space-y-5 text-sm">
                <InfoRow icon={<MapPin className="h-4 w-4" />} title={t("address")}>
                  {locale === "ar"
                    ? siteConfig.contact.addressAr
                    : siteConfig.contact.addressEn}
                </InfoRow>
                <InfoRow icon={<Clock className="h-4 w-4" />} title={t("hours")}>
                  Sat – Thu · 09:00 – 22:00
                  <br />
                  Fri · 14:00 – 22:00
                </InfoRow>
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  title={t("call")}
                >
                  <a
                    href={`tel:${siteConfig.contact.phoneTel}`}
                    dir="ltr"
                    className="text-primary hover:underline"
                  >
                    {siteConfig.contact.phoneDisplay}
                  </a>
                </InfoRow>
              </div>

              <div className="mt-6 grid gap-2.5 sm:mt-7 sm:grid-cols-2 sm:gap-3">
                <Button asChild variant="default">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="h-4 w-4" />
                    {t("directions")}
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${siteConfig.contact.phoneTel}`}>
                    <Phone className="h-4 w-4" />
                    {t("call")}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <div className="mt-1 text-sm leading-relaxed text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
