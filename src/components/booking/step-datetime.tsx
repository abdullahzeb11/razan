"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sunrise, Sun, Sunset, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { nextDates } from "@/lib/booking";
import { isSunnahDay, formatHijriShort } from "@/lib/hijri";

type Slot = {
  iso: string;
  label: string;
  period: "morning" | "afternoon" | "evening";
  available: boolean;
};

const PERIODS = [
  { key: "morning", icon: Sunrise },
  { key: "afternoon", icon: Sun },
  { key: "evening", icon: Sunset },
] as const;

export function StepDateTime({
  selectedIso,
  onSelect,
}: {
  selectedIso: string | null;
  onSelect: (iso: string) => void;
}) {
  const tb = useTranslations("Booking.step2");
  const locale = useLocale() as "ar" | "en";

  const dates = React.useMemo(() => nextDates(14), []);
  const [activeDate, setActiveDate] = React.useState<string>(() => dates[0]);
  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancel = false;
    setLoading(true);
    fetch(`/api/availability?date=${activeDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancel) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancel) setSlots([]);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [activeDate]);

  // If user previously picked a slot, surface its date so the grid scrolls there.
  React.useEffect(() => {
    if (!selectedIso) return;
    const d = new Date(selectedIso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setActiveDate(`${yyyy}-${mm}-${dd}`);
  }, [selectedIso]);

  return (
    <div className="space-y-7">
      <header>
        <h2 className="text-2xl font-semibold sm:text-3xl">{tb("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {tb("subtitle")}
        </p>
      </header>

      {/* Date strip */}
      <div className="-mx-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-2 px-1">
          {dates.map((iso) => {
            const date = new Date(`${iso}T00:00:00`);
            const day = date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
              weekday: "short",
            });
            const num = date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
              day: "numeric",
            });
            const sunnah = isSunnahDay(date);
            const active = activeDate === iso;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setActiveDate(iso)}
                className={cn(
                  "relative flex w-[78px] shrink-0 flex-col items-center gap-1 rounded-2xl border bg-card px-3 py-3 transition-all hover:-translate-y-0.5",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-elevated"
                    : "border-border",
                  sunnah && !active && "border-gold/50 bg-gold/5",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    active ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {day}
                </span>
                <span className="text-2xl font-semibold leading-none">{num}</span>
                <span
                  className={cn(
                    "text-[10px] leading-tight",
                    active ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {formatHijriShort(date, locale)}
                </span>
                {sunnah ? (
                  <span
                    className={cn(
                      "absolute -top-1.5 end-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                      active
                        ? "bg-gold text-gold-foreground"
                        : "bg-gold text-gold-foreground",
                    )}
                    aria-label="Sunnah day"
                  >
                    <Moon className="h-2.5 w-2.5" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold text-gold-foreground">
            <Moon className="h-2.5 w-2.5" />
          </span>
          {tb("sunnahLegend")}
        </span>
      </div>

      {/* Slot grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          PERIODS.map(({ key, icon: Icon }) => {
            const list = slots.filter((s) => s.period === key);
            if (list.length === 0) return null;
            return (
              <div key={key}>
                <h3 className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {tb(`periods.${key}`)}
                </h3>
                <AnimatePresence mode="popLayout">
                  <motion.div
                    layout
                    className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6"
                  >
                    {list.map((slot) => {
                      const active = selectedIso === slot.iso;
                      return (
                        <button
                          key={slot.iso}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => onSelect(slot.iso)}
                          className={cn(
                            "h-11 rounded-xl border text-sm font-medium transition-all",
                            !slot.available &&
                              "cursor-not-allowed border-dashed border-border bg-muted/40 text-muted-foreground/50 line-through",
                            slot.available &&
                              !active &&
                              "border-border bg-card hover:border-primary hover:text-primary",
                            active &&
                              "border-primary bg-primary text-primary-foreground shadow-soft",
                          )}
                        >
                          <span dir="ltr">{slot.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })
        )}
        {!loading && slots.every((s) => !s.available) ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            {tb("noSlots")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
