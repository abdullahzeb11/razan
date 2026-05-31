import { setRequestLocale, getTranslations } from "next-intl/server";
import { LogoMark } from "@/components/brand/logo";
import { Link } from "@/i18n/routing";
import { LoginForm } from "@/components/account/login-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Account.login" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function AccountLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Account.login" });

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary-gradient p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-primary-foreground">
          <LogoMark className="h-9 w-9" />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold">
              {locale === "ar" ? "رزان" : "Razan"}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-gold">
              {locale === "ar" ? "للحجامة" : "Hijama Center"}
            </span>
          </div>
        </Link>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
            {t("heroEyebrow")}
          </p>
          <h1 className="mt-3 max-w-md font-display text-4xl font-semibold leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/75">
            {t("heroBody")}
          </p>
        </div>

        <svg
          className="pointer-events-none absolute -end-32 -top-32 h-[480px] w-[480px] text-gold/15"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <g stroke="currentColor" strokeWidth="0.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <circle key={i} cx="100" cy="100" r={20 + i * 7} />
            ))}
          </g>
        </svg>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="lg:hidden">
          <LogoMark className="h-10 w-10" />
        </div>
        <div className="w-full max-w-sm">
          <h2 className="mt-6 text-2xl font-semibold">{t("title")}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("subtitle")}</p>
          <LoginForm next={sp.next} />
          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              ← {t("backToSite")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
