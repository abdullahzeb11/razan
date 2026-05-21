"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { waLink } from "@/lib/utils";

export function CTA() {
  const t = useTranslations("CTA");

  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] border border-gold/30 bg-gradient-to-br from-card to-secondary p-10 sm:p-16"
        >
          {/* gold leaf */}
          <div className="absolute -end-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-24 -start-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-display-xl balance">
              {t("title")}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/book">
                  {t("book")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href={waLink(
                    siteConfig.contact.whatsappNumber,
                    "As-salamu alaykum, I'd like to book a hijama appointment.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("whatsapp")}
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
