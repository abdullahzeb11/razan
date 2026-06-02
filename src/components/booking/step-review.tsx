"use client";

import { useLocale, useTranslations } from "next-intl";
import { Calendar, Clock, MapPin, User, Phone, Mail, FileText, ExternalLink } from "lucide-react";
import { formatSAR } from "@/lib/utils";
import type { ServiceOption } from "./step-service";
import type { Details } from "./step-details";

export function StepReview({
  service,
  scheduledAt,
  details,
}: {
  service: ServiceOption;
  scheduledAt: string;
  details: Details;
}) {
  const tb = useTranslations("Booking.step4");
  const locale = useLocale() as "ar" | "en";

  const date = new Date(scheduledAt);
  const dateLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  }).format(date);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold sm:text-3xl">{tb("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {tb("subtitle")}
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {/* Service banner */}
        <div className="border-b border-border bg-primary-gradient p-6 text-primary-foreground">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
            {tb("service")}
          </p>
          <h3 className="mt-1 text-xl font-semibold">
            {locale === "ar" ? service.nameAr : service.nameEn}
          </h3>
          <p className="mt-1 text-sm opacity-80">
            {locale === "ar" ? service.shortAr : service.shortEn}
          </p>
          <div className="mt-4 flex items-end justify-between">
            <p className="text-3xl font-semibold tracking-tight">
              {formatSAR(service.priceSar, locale)}
            </p>
            <span className="text-xs uppercase tracking-wider opacity-80">
              {service.durationMinutes} {tb("minutes")}
            </span>
          </div>
        </div>

        {/* Details */}
        <dl className="divide-y divide-border">
          <Row icon={<Calendar className="h-4 w-4" />} label={tb("date")}>
            {dateLabel}
          </Row>
          <Row icon={<Clock className="h-4 w-4" />} label={tb("time")}>
            <span dir="ltr">{timeLabel}</span>
          </Row>
          <Row icon={<MapPin className="h-4 w-4" />} label={tb("location")}>
            {details.location === "HOME_VISIT"
              ? `${tb("home")} · ${details.addressLine}${details.city ? ` · ${details.city}` : ""}`
              : tb("clinic")}
          </Row>
          {details.mapsUrl ? (
            <Row icon={<ExternalLink className="h-4 w-4" />} label={tb("mapsUrl")}>
              <a
                href={details.mapsUrl}
                target="_blank"
                rel="noreferrer"
                dir="ltr"
                className="break-all text-primary hover:underline"
              >
                {details.mapsUrl}
              </a>
            </Row>
          ) : null}
          <Row icon={<User className="h-4 w-4" />} label={tb("name")}>
            {details.guestName}
          </Row>
          <Row icon={<Phone className="h-4 w-4" />} label={tb("phone")}>
            <span dir="ltr">{details.guestPhone}</span>
          </Row>
          {details.guestEmail ? (
            <Row icon={<Mail className="h-4 w-4" />} label={tb("email")}>
              <span dir="ltr">{details.guestEmail}</span>
            </Row>
          ) : null}
          {details.notes ? (
            <Row icon={<FileText className="h-4 w-4" />} label={tb("notes")}>
              {details.notes}
            </Row>
          ) : null}
        </dl>
      </div>

      <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
        {tb("terms")}
      </p>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 p-5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
      </div>
    </div>
  );
}
