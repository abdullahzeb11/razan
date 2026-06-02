"use client";

import { useTranslations } from "next-intl";
import { Banknote, ArrowRightLeft, CreditCard, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "CASH" | "TRANSFER" | "ONLINE_CARD";

// ONLINE_CARD is enabled at build time only when a Moyasar publishable key is
// configured. In test mode (sk_test_*) developers/recruiters can pay with the
// Moyasar test cards. In production without a live key this stays disabled
// and shows a "Coming soon" badge.
const ONLINE_CARD_ENABLED = Boolean(process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY);

const OPTIONS: Array<{
  key: PaymentMethod;
  icon: typeof Banknote;
  enabled: boolean;
}> = [
  { key: "CASH", icon: Banknote, enabled: true },
  { key: "TRANSFER", icon: ArrowRightLeft, enabled: true },
  { key: "ONLINE_CARD", icon: CreditCard, enabled: ONLINE_CARD_ENABLED },
];

export function StepPayment({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  const t = useTranslations("Booking.step4");

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold sm:text-3xl">{t("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <div className="space-y-3">
        {OPTIONS.map(({ key, icon: Icon, enabled }) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => enabled && onChange(key)}
              disabled={!enabled}
              className={cn(
                "group relative flex w-full items-start gap-4 rounded-2xl border bg-card p-4 text-start transition-all sm:p-5",
                selected
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-border hover:border-primary/60",
                !enabled && "cursor-not-allowed opacity-60",
              )}
              aria-pressed={selected}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold sm:text-base">
                    {t(`payment.${key}.name`)}
                  </p>
                  {!enabled ? (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground dark:text-gold">
                      {t("payment.comingSoon")}
                    </span>
                  ) : null}
                  {selected ? (
                    <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {t(`payment.${key}.description`)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
        {t("payment.note")}
      </p>
    </div>
  );
}
