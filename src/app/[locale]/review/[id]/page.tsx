import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CalendarDays, Clock, Inbox, Hourglass } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/review/review-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Review" });
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const loc = (locale === "en" ? "en" : "ar") as "ar" | "en";
  const t = await getTranslations({ locale, namespace: "Review" });

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      service: true,
      review: { select: { id: true } },
    },
  });

  if (!appointment) {
    return (
      <Shell>
        <State
          icon={<Inbox className="h-6 w-6" />}
          title={t("notFoundTitle")}
          body={t("notFoundBody")}
          ctaHref="/"
          ctaLabel={t("backHome")}
        />
      </Shell>
    );
  }

  if (appointment.review) {
    return (
      <Shell>
        <State
          icon={<Inbox className="h-6 w-6" />}
          title={t("alreadyTitle")}
          body={t("alreadyBody")}
          ctaHref="/"
          ctaLabel={t("backHome")}
        />
      </Shell>
    );
  }

  if (appointment.status !== "COMPLETED") {
    return (
      <Shell>
        <State
          icon={<Hourglass className="h-6 w-6" />}
          title={t("notEligibleTitle")}
          body={t("notEligibleBody")}
          ctaHref="/"
          ctaLabel={t("backHome")}
        />
      </Shell>
    );
  }

  // Show the form. Pre-fill name from the guest booking.
  const serviceName = loc === "ar" ? appointment.service.nameAr : appointment.service.nameEn;
  const date = new Intl.DateTimeFormat(loc === "ar" ? "ar-SA" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(appointment.scheduledAt);
  const time = new Intl.DateTimeFormat(loc === "ar" ? "ar-SA" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  }).format(appointment.scheduledAt);

  return (
    <Shell>
      <header className="mb-8 text-center">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 text-display-lg balance">{t("title")}</h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          {t("subtitle")}
        </p>
      </header>

      {/* Appointment context card */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("yourSession")}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">
          {serviceName}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={appointment.scheduledAt.toISOString()}>{date}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span dir="ltr">{time}</span>
          </span>
        </div>
      </div>

      <ReviewForm
        appointmentId={appointment.id}
        defaultName={appointment.guestName ?? ""}
        locale={loc}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pb-24 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_60%)]" />
      <div className="container-wide max-w-xl">{children}</div>
    </div>
  );
}

function State({
  icon,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {body}
      </p>
      <Button asChild variant="ghost" className="mt-6">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
