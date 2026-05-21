import { cn } from "@/lib/utils";

/**
 * Al-Shifa mark: an eight-fold Islamic star fused with a drop motif,
 * referencing both the sunnah aesthetic and the medical/hijama practice.
 * Pure SVG so it scales infinitely and adapts to color via currentColor.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="alshifa-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary-deep))" />
        </linearGradient>
        <linearGradient id="alshifa-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--gold-soft))" />
          <stop offset="100%" stopColor="hsl(var(--gold))" />
        </linearGradient>
      </defs>
      {/* Eight-fold star */}
      <g transform="translate(24 24)">
        <g fill="url(#alshifa-grad)">
          <rect x="-16" y="-16" width="32" height="32" rx="3" />
          <rect
            x="-16"
            y="-16"
            width="32"
            height="32"
            rx="3"
            transform="rotate(45)"
            opacity="0.55"
          />
        </g>
        {/* Inner drop / shifa motif */}
        <path
          d="M0 -10 C5 -4 8 0 8 5 A8 8 0 0 1 -8 5 C-8 0 -5 -4 0 -10 Z"
          fill="url(#alshifa-gold)"
        />
        <circle cx="0" cy="3" r="2" fill="hsl(var(--primary-deep))" />
      </g>
    </svg>
  );
}

export function LogoWordmark({
  className,
  locale,
}: {
  className?: string;
  locale: "ar" | "en";
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[15px] font-semibold tracking-tight text-foreground",
            locale === "ar" ? "font-kufi" : "font-display",
          )}
        >
          {locale === "ar" ? "الشفاء" : "Al-Shifa"}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {locale === "ar" ? "للحجامة" : "Hijama Center"}
        </span>
      </div>
    </div>
  );
}
