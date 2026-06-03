"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, UserRound } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { LogoWordmark } from "@/components/brand/logo";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Navbar({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const t = useTranslations("Nav");
  const locale = useLocale() as "ar" | "en";
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();
  const onHome = pathname === "/";

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="container-wide flex h-[72px] items-center justify-between gap-4">
        <Link
          href="/"
          aria-label={siteConfig.brand.shortEn}
          onClick={(e) => {
            // Next.js skips navigation when href matches the current route, which
            // makes the logo feel "dead" on the homepage. When we're already on
            // home, intercept the click and smooth-scroll to top instead.
            if (onHome) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <LogoWordmark locale={locale} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => {
            const cls =
              "rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
            // Route link (e.g. /blog) — always render as Link.
            if (item.href.startsWith("/")) {
              return (
                <Link key={item.key} href={item.href} className={cls}>
                  {t(item.key)}
                </Link>
              );
            }
            // Hash link (e.g. #sunnah) — if visitor is on the homepage, plain
            // anchor scrolls within page. If they're elsewhere, route home
            // first then scroll to the hash.
            if (onHome) {
              return (
                <a key={item.key} href={item.href} className={cls}>
                  {t(item.key)}
                </a>
              );
            }
            return (
              <Link key={item.key} href={`/${item.href}`} className={cls}>
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          {isSignedIn ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex rounded-full"
              aria-label={t("account")}
            >
              <Link href="/account">
                <UserRound className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
            >
              <Link href="/account/login">{t("signIn")}</Link>
            </Button>
          )}
          <Button
            asChild
            variant="gold"
            size="sm"
            className="hidden md:inline-flex"
          >
            <Link href="/book">{t("book")}</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={t("openMenu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={locale === "ar" ? "left" : "right"} className="w-[88%] max-w-sm">
              <SheetHeader>
                <SheetTitle>
                  <LogoWordmark locale={locale} />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-1">
                {siteConfig.nav.map((item) => {
                  const cls =
                    "rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent";
                  const isRoute = item.href.startsWith("/");
                  const isHashOnHome = !isRoute && onHome;
                  return (
                    <SheetClose asChild key={item.key}>
                      {isRoute ? (
                        <Link href={item.href} className={cls}>
                          {t(item.key)}
                        </Link>
                      ) : isHashOnHome ? (
                        <a href={item.href} className={cls}>
                          {t(item.key)}
                        </a>
                      ) : (
                        <Link href={`/${item.href}`} className={cls}>
                          {t(item.key)}
                        </Link>
                      )}
                    </SheetClose>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <SheetClose asChild>
                  <Button asChild variant="gold" size="lg">
                    <Link href="/book">{t("book")}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" size="lg">
                    <Link href={isSignedIn ? "/account" : "/account/login"}>
                      <UserRound className="h-4 w-4" />
                      {isSignedIn ? t("account") : t("signIn")}
                    </Link>
                  </Button>
                </SheetClose>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-2">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
