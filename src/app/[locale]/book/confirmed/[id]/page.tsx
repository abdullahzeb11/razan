import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  ArrowLeft,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { formatSAR, waLink } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function ConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const sp = await searchParams;
  const locale: "ar" | "en" = rawLocale === "en" ? "en" : "ar";
  setRequestLocale(locale);

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!appointment) notFound();

  // payment=paid|failed|verifying is set by the Moyasar callback so we can
  // show a contextual banner. paymentStatus is the source of truth though —
  // the query string is just a UX hint.
  const justPaid = sp.payment === "paid" || appointment.paymentStatus === "PAID";
  const paymentFailed =
    sp.payment === "failed" || appointment.paymentStatus === "FAILED";

  const t = await getTranslations({ locale, namespace: "Booking.confirmed" });

  const scheduledAt = appointment.scheduledAt;
  const dateLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(scheduledAt);
  const timeLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  }).format(scheduledAt);

  const serviceName =
    locale === "ar" ? appointment.service.nameAr : appointment.service.nameEn;

  // ICS calendar download for the client (simple data URL).
  const ics = buildIcs({
    id: appointment.id,
    title: `${siteConfig.brand.nameEn} — ${appointment.service.nameEn}`,
    description:
      locale === "ar"
        ? "موعد حجامة في مركز رزان"
        : "Hijama appointment at Razan",
    start: scheduledAt,
    durationMin: appointment.durationMin,
    location: appointment.addressLine ?? siteConfig.contact.serviceAreaEn,
  });
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

  return (
    <div className="relative pb-24 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.14),transparent_60%)]" />

      <div className="container-wide max-w-3xl">
        <header className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-display-lg balance">{t("title")}</h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t("subtitle", { name: appointment.guestName ?? "" })}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t("reference")} · <span dir="ltr">{appointment.id.slice(-8).toUpperCase()}</span>
          </p>
        </header>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border bg-primary-gradient p-6 text-primary-foreground">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
              {t("service")}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{serviceName}</h2>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold tracking-tight">
                {formatSAR(appointment.priceSar, locale)}
              </p>
              <span className="text-xs uppercase tracking-wider opacity-80">
                {appointment.durationMin} {t("minutes")}
              </span>
            </div>
          </div>

          <dl className="divide-y divide-border">
            <Row icon={<Calendar className="h-4 w-4" />} label={t("date")}>
              {dateLabel}
            </Row>
            <Row icon={<Clock className="h-4 w-4" />} label={t("time")}>
              <span dir="ltr">{timeLabel}</span>
            </Row>
            <Row icon={<MapPin className="h-4 w-4" />} label={t("location")}>
              {`${t("home")} · ${appointment.addressLine ?? (locale === "ar" ? siteConfig.contact.serviceAreaAr : siteConfig.contact.serviceAreaEn)}`}
            </Row>
            {appointment.mapsUrl ? (
              <Row icon={<ExternalLink className="h-4 w-4" />} label={t("mapsUrl")}>
                <a
                  href={appointment.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  dir="ltr"
                  className="text-primary hover:underline"
                >
                  {t("openInMaps")}
                </a>
              </Row>
            ) : null}
            <Row icon={<User className="h-4 w-4" />} label={t("name")}>
              {appointment.guestName}
            </Row>
            <Row icon={<Phone className="h-4 w-4" />} label={t("phone")}>
              <span dir="ltr">{appointment.guestPhone}</span>
            </Row>
            {appointment.guestEmail ? (
              <Row icon={<Mail className="h-4 w-4" />} label={t("email")}>
                <span dir="ltr">{appointment.guestEmail}</span>
              </Row>
            ) : null}
            <Row icon={<Wallet className="h-4 w-4" />} label={t("payment")}>
              {t(`paymentMethod.${appointment.paymentMethod}`)}
            </Row>
          </dl>
        </div>

        {justPaid && appointment.paymentMethod === "ONLINE_CARD" ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/40 bg-primary/5 px-5 py-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t("paidTitle")}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {t("paidBody")}
              </p>
            </div>
          </div>
        ) : null}

        {paymentFailed && appointment.paymentMethod === "ONLINE_CARD" ? (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-destructive">
                {t("paymentFailedTitle")}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {t("paymentFailedBody")}
              </p>
            </div>
            <Button asChild variant="default" size="sm">
              <Link href={`/book/pay/${id}`}>{t("retryPayment")}</Link>
            </Button>
          </div>
        ) : null}

        <p className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 px-5 py-4 text-sm leading-relaxed text-foreground">
          {t("approvalNote")}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Button asChild variant="gold" size="lg">
            <a
              href={waLink(siteConfig.contact.whatsappNumber, t("whatsappPrefilled"))}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("whatsappCta")}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={icsHref} download={`razan-${appointment.id.slice(-8)}.ics`}>
              {t("addToCalendar")}
            </a>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("backHome")}
            </Link>
          </Button>
        </div>
      </div>
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

function buildIcs(args: {
  id: string;
  title: string;
  description: string;
  start: Date;
  durationMin: number;
  location: string;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const end = new Date(args.start.getTime() + args.durationMin * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Razan//Hijama Booking//EN",
    "BEGIN:VEVENT",
    `UID:${args.id}@razan.sa`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(args.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${args.title}`,
    `DESCRIPTION:${args.description}`,
    `LOCATION:${args.location.replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
