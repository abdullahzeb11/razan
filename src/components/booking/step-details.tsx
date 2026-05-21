"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Details = {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  location: "CLINIC" | "HOME_VISIT";
  addressLine: string;
  city: string;
  notes: string;
};

type Errors = Partial<Record<keyof Details, string>>;

export function StepDetails({
  value,
  errors,
  onChange,
  homeVisitForced,
}: {
  value: Details;
  errors: Errors;
  onChange: (patch: Partial<Details>) => void;
  /** True when selected service is home-only — locks the location toggle. */
  homeVisitForced: boolean;
}) {
  const tb = useTranslations("Booking.step3");

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold sm:text-3xl">{tb("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {tb("subtitle")}
        </p>
      </header>

      {/* Location switcher */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-2">
        {(
          [
            { key: "CLINIC", icon: Building2, labelKey: "clinic" },
            { key: "HOME_VISIT", icon: Home, labelKey: "home" },
          ] as const
        ).map(({ key, icon: Icon, labelKey }) => {
          const active = value.location === key;
          const disabled = homeVisitForced && key === "CLINIC";
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ location: key })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-accent",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              <Icon className="h-4 w-4" />
              {tb(`location.${labelKey}`)}
            </button>
          );
        })}
      </div>

      {/* Personal */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={tb("name")}
          value={value.guestName}
          error={errors.guestName}
          onChange={(v) => onChange({ guestName: v })}
          autoComplete="name"
        />
        <Field
          label={tb("phone")}
          value={value.guestPhone}
          error={errors.guestPhone}
          onChange={(v) => onChange({ guestPhone: v })}
          type="tel"
          dir="ltr"
          placeholder="+966 5X XXX XXXX"
          autoComplete="tel"
        />
        <Field
          label={tb("email")}
          value={value.guestEmail}
          error={errors.guestEmail}
          onChange={(v) => onChange({ guestEmail: v })}
          type="email"
          dir="ltr"
          autoComplete="email"
          className="sm:col-span-2"
          optional
        />
      </div>

      {/* Home visit conditional fields */}
      <AnimatePresence initial={false}>
        {value.location === "HOME_VISIT" ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 rounded-2xl border border-gold/30 bg-gold/5 p-4 sm:grid-cols-3">
              <Field
                label={tb("address")}
                value={value.addressLine}
                error={errors.addressLine}
                onChange={(v) => onChange({ addressLine: v })}
                className="sm:col-span-2"
                autoComplete="street-address"
              />
              <Field
                label={tb("city")}
                value={value.city}
                error={errors.city}
                onChange={(v) => onChange({ city: v })}
                autoComplete="address-level2"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Field
        label={tb("notes")}
        value={value.notes}
        error={errors.notes}
        onChange={(v) => onChange({ notes: v })}
        textarea
        optional
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  textarea,
  className,
  dir,
  placeholder,
  optional,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  textarea?: boolean;
  className?: string;
  dir?: "ltr" | "rtl";
  placeholder?: string;
  optional?: boolean;
  autoComplete?: string;
}) {
  const base =
    "block w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors";
  const border = error
    ? "border-destructive focus:border-destructive focus:ring-destructive/20"
    : "border-border focus:border-primary focus:ring-primary/20";
  return (
    <label className={className}>
      <span className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        {optional ? <span className="normal-case tracking-normal">·</span> : null}
      </span>
      {textarea ? (
        <textarea
          rows={3}
          dir={dir}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(base, border)}
        />
      ) : (
        <input
          type={type}
          dir={dir}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={cn(base, border)}
        />
      )}
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
