"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { LogoWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { waLink } from "@/lib/utils";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export function Footer() {
  const t = useTranslations("Footer");
  const tn = useTranslations("Nav");
  const tw = useTranslations("Whatsapp");
  const pathname = usePathname();
  const onHome = pathname === "/";
  const locale = useLocale() as "ar" | "en";

  return (
    <footer className="relative mt-24 border-t border-border bg-gradient-to-b from-background to-secondary/40">
      <div className="container-wide py-12 sm:py-16">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <LogoWordmark locale={locale} />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>

            <div className="mt-8 max-w-md">
              <h3 className="text-sm font-semibold text-foreground">
                {t("newsletterTitle")}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {t("newsletterBody")}
              </p>
              <NewsletterForm locale={locale} />
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("navTitle")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {siteConfig.nav.map((n) => {
                const cls =
                  "text-foreground/80 transition-colors hover:text-primary";
                // Route link (e.g. /blog) — always Link
                if (n.href.startsWith("/")) {
                  return (
                    <li key={n.key}>
                      <Link href={n.href} className={cls}>
                        {tn(n.key)}
                      </Link>
                    </li>
                  );
                }
                // Hash link on homepage — plain anchor scrolls within page
                if (onHome) {
                  return (
                    <li key={n.key}>
                      <a href={n.href} className={cls}>
                        {tn(n.key)}
                      </a>
                    </li>
                  );
                }
                // Hash link off homepage — route home first, then scroll
                return (
                  <li key={n.key}>
                    <Link href={`/${n.href}`} className={cls}>
                      {tn(n.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("contactTitle")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-3 text-foreground/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  {locale === "ar"
                    ? siteConfig.contact.serviceAreaAr
                    : siteConfig.contact.serviceAreaEn}
                </span>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.contact.phoneTel}`}
                  className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  <span dir="ltr">{siteConfig.contact.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{siteConfig.contact.email}</span>
                </a>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2">
              <SocialBtn
                href={waLink(siteConfig.contact.whatsappNumber, tw("prefilled"))}
                label={tw("label")}
              >
                <WhatsAppGlyph className="h-4 w-4" />
              </SocialBtn>
              <SocialBtn href={siteConfig.social.instagram} label="Instagram">
                <Instagram className="h-4 w-4" />
              </SocialBtn>
              <SocialBtn href={siteConfig.social.twitter} label="Twitter">
                <Twitter className="h-4 w-4" />
              </SocialBtn>
              <SocialBtn href={siteConfig.social.youtube} label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialBtn>
            </div>
          </div>
        </div>

        <div className="hairline mt-14" />

        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm({ locale }: { locale: "ar" | "en" }) {
  const t = useTranslations("Footer");
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "pending" | "success" | "error">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "pending") return;
    setState("pending");
    setError(null);
    const res = await subscribeNewsletter({ email: email.trim(), locale });
    if (!res.ok) {
      setError(t(res.error === "invalid_email" ? "subscribeInvalid" : "subscribeError"));
      setState("error");
      return;
    }
    setEmail("");
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="mt-6 flex max-w-md items-start gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground sm:mt-7">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>{t("subscribeSuccess")}</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center"
      noValidate
    >
      <label className="sr-only" htmlFor="newsletter">
        {t("newsletterTitle")}
      </label>
      <input
        id="newsletter"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("newsletterPlaceholder")}
        disabled={state === "pending"}
        autoComplete="email"
        inputMode="email"
        className="h-14 w-full flex-1 rounded-2xl border border-border bg-background px-5 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 sm:h-11 sm:rounded-full sm:px-4 sm:text-sm"
      />
      <Button
        type="submit"
        variant="default"
        size="sm"
        disabled={state === "pending" || !email.trim()}
        className="h-14 w-full justify-center rounded-2xl px-5 text-base sm:h-11 sm:w-auto sm:rounded-full sm:text-sm"
      >
        {state === "pending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("subscribing")}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t("subscribe")}
          </>
        )}
      </Button>
      {error ? (
        <div className="flex items-start gap-2 text-xs text-destructive sm:basis-full">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
    </form>
  );
}

function SocialBtn({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
    >
      {children}
    </a>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.889-9.884 2.64.001 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  );
}
