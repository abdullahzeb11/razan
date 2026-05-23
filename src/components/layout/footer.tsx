"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { LogoWordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const t = useTranslations("Footer");
  const tn = useTranslations("Nav");
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

            <form className="mt-6 flex max-w-md flex-col gap-2 sm:mt-7 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="newsletter">
                {t("newsletterTitle")}
              </label>
              <input
                id="newsletter"
                type="email"
                placeholder={t("newsletterTitle")}
                className="h-11 w-full flex-1 rounded-full border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="h-11 w-full justify-center px-5 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                {t("subscribe")}
              </Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("newsletterBody")}
            </p>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("navTitle")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {siteConfig.nav.map((n) => (
                <li key={n.key}>
                  <a
                    href={n.href}
                    className="text-foreground/80 transition-colors hover:text-primary"
                  >
                    {tn(n.key)}
                  </a>
                </li>
              ))}
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
                    ? siteConfig.contact.addressAr
                    : siteConfig.contact.addressEn}
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
