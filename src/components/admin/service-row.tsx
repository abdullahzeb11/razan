"use client";

import * as React from "react";
import { Save, Loader2 } from "lucide-react";
import { updateService } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  priceSar: number;
  durationMinutes: number;
  active: boolean;
  featured: boolean;
  homeVisit: boolean;
};

export function ServiceRow(initial: Props) {
  const [price, setPrice] = React.useState(initial.priceSar);
  const [duration, setDuration] = React.useState(initial.durationMinutes);
  const [active, setActive] = React.useState(initial.active);
  const [featured, setFeatured] = React.useState(initial.featured);
  const [homeVisit, setHomeVisit] = React.useState(initial.homeVisit);
  const [pending, startTransition] = React.useTransition();
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  const dirty =
    price !== initial.priceSar ||
    duration !== initial.durationMinutes ||
    active !== initial.active ||
    featured !== initial.featured ||
    homeVisit !== initial.homeVisit;

  function save() {
    startTransition(async () => {
      await updateService({
        id: initial.id,
        priceSar: price,
        durationMinutes: duration,
        active,
        featured,
        homeVisit,
      });
      setSavedAt(Date.now());
    });
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {initial.slug}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{initial.nameEn}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground" dir="rtl">
            {initial.nameAr}
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all",
            dirty
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {pending
            ? "Saving"
            : savedAt && !dirty
              ? "Saved"
              : "Save"}
        </button>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NumField label="Price (SAR)" value={price} step={10} onChange={setPrice} />
        <NumField
          label="Duration (minutes)"
          value={duration}
          step={5}
          onChange={setDuration}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Toggle label="Active" checked={active} onChange={setActive} hint="Visible on site" />
        <Toggle
          label="Featured"
          checked={featured}
          onChange={setFeatured}
          hint='Show "Most booked" badge'
        />
        <Toggle
          label="Home visit"
          checked={homeVisit}
          onChange={setHomeVisit}
          hint="Force home-visit location"
        />
      </div>
    </article>
  );
}

function NumField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (n: number) => void;
}) {
  // Track raw string so the user can backspace through the whole field
  // and retype freely — otherwise an empty value coerces to 0 and the
  // leading 0 becomes impossible to clear.
  const [raw, setRaw] = React.useState(String(value));

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        step={step}
        value={raw}
        onChange={(e) => {
          const v = e.target.value;
          setRaw(v);
          if (v === "") return;
          const parsed = Number(v);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        onBlur={() => {
          if (raw === "" || Number.isNaN(Number(raw))) setRaw(String(value));
        }}
        className="block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-start transition-colors",
        checked ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
            checked ? "translate-x-4 rtl:-translate-x-4" : "translate-x-0.5 rtl:-translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
