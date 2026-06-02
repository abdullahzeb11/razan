/**
 * Shown while /book/confirmed/[id] is fetching the appointment from the DB.
 * Visually matches the wizard's success overlay so the transition from
 * "Booking confirmed" → confirmation page feels continuous, not jarring.
 */
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ConfirmedLoading() {
  return (
    <div className="relative pb-24 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.14),transparent_60%)]" />

      <div className="container-wide max-w-3xl">
        <header className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated">
            <CheckCircle2 className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <div className="mx-auto mt-6 h-9 w-64 animate-pulse rounded-md bg-muted/60" />
          <div className="mx-auto mt-3 h-5 w-80 animate-pulse rounded-md bg-muted/40" />
          <div className="mx-auto mt-2 h-3 w-32 animate-pulse rounded-md bg-muted/30" />
        </header>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border bg-primary-gradient p-6 text-primary-foreground">
            <div className="h-3 w-16 animate-pulse rounded bg-primary-foreground/30" />
            <div className="mt-3 h-6 w-48 animate-pulse rounded bg-primary-foreground/30" />
            <div className="mt-4 flex items-end justify-between">
              <div className="h-9 w-24 animate-pulse rounded bg-primary-foreground/30" />
              <div className="h-3 w-16 animate-pulse rounded bg-primary-foreground/30" />
            </div>
          </div>

          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-muted/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
                  <div className="h-4 w-48 animate-pulse rounded bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading your confirmation…</span>
        </div>
      </div>
    </div>
  );
}
