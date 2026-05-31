import { redirect } from "next/navigation";
import {
  setRequestLocale,
  getTranslations,
} from "next-intl/server";
import { CalendarPlus, History, LogOut } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { AppointmentList, type CustomerAppointment } from "@/components/account/appointment-list";
import { ProfileCard } from "@/components/account/profile-card";
import { signOutCustomer } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account.dashboard" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function AccountDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/account/login`);

  const [user, appointments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, city: true },
    }),
    prisma.appointment.findMany({
      where: { userId: session.user.id },
      orderBy: { scheduledAt: "desc" },
      include: { service: true },
    }),
  ]);

  if (!user) redirect(`/${locale}/account/login`);

  const t = await getTranslations({ locale, namespace: "Account.dashboard" });
  const now = new Date();
  const upcoming: CustomerAppointment[] = [];
  const past: CustomerAppointment[] = [];

  for (const a of appointments) {
    const item: CustomerAppointment = {
      id: a.id,
      status: a.status,
      scheduledAt: a.scheduledAt.toISOString(),
      durationMin: a.durationMin,
      priceSar: a.priceSar,
      location: a.location,
      addressLine: a.addressLine,
      serviceNameEn: a.service.nameEn,
      serviceNameAr: a.service.nameAr,
    };
    const isUpcoming =
      a.scheduledAt > now && (a.status === "PENDING" || a.status === "CONFIRMED");
    if (isUpcoming) upcoming.unshift(item);
    else past.push(item);
  }

  const displayName =
    user.name?.trim() ||
    (locale === "ar" ? "ضيفنا الكريم" : "Welcome");
  const isFirstTime = appointments.length === 0;

  return (
    <div className="relative pb-24 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_60%)]" />

      <div className="container-wide max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              {isFirstTime ? t("eyebrowFirst") : t("eyebrow")}
            </p>
            <h1 className="mt-3 text-display-lg balance">
              {t("greeting", { name: displayName })}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isFirstTime ? t("subtitleFirst") : t("subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="gold">
              <Link href="/book">
                <CalendarPlus className="h-4 w-4" />
                {isFirstTime ? t("bookFirst") : t("bookAnother")}
              </Link>
            </Button>
            <form action={signOutCustomer}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
                {t("signOut")}
              </Button>
            </form>
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="mb-3 text-base font-semibold">{t("upcoming")}</h2>
              <AppointmentList
                appointments={upcoming}
                emptyLabel={t("emptyUpcoming")}
              />
            </div>
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
                <History className="h-4 w-4 text-muted-foreground" />
                {t("past")}
              </h2>
              <AppointmentList
                appointments={past}
                emptyLabel={t("emptyPast")}
              />
            </div>
          </section>

          <aside className="lg:col-span-1">
            <ProfileCard
              initial={{
                name: user.name ?? "",
                email: user.email ?? "",
                phone: user.phone ?? "",
                city: user.city ?? "",
              }}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
