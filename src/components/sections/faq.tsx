"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "./section";

const IDS = ["0", "1", "2", "3", "4", "5"] as const;

export function FAQ() {
  const t = useTranslations("FAQ");

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="container-narrow">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

        <div className="mt-12">
          <Accordion type="single" collapsible defaultValue="0" className="w-full">
            {IDS.map((id) => (
              <AccordionItem key={id} value={id}>
                <AccordionTrigger>{t(`items.${id}.q`)}</AccordionTrigger>
                <AccordionContent>{t(`items.${id}.a`)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
