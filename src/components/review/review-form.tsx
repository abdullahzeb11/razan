"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Hourglass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { submitReview } from "@/app/actions/reviews";
import { cn } from "@/lib/utils";

type Props = {
  appointmentId: string;
  defaultName: string;
  locale: "ar" | "en";
  /** Server says: a review already exists for this appointment. */
  hasExistingReview: boolean;
  /** Server says: appointment is COMPLETED and accepting reviews. */
  isEligible: boolean;
};

export function ReviewForm({
  appointmentId,
  defaultName,
  locale,
  hasExistingReview,
  isEligible,
}: Props) {
  const t = useTranslations("Review");
  const [rating, setRating] = React.useState<number>(0);
  const [hover, setHover] = React.useState<number>(0);
  const [name, setName] = React.useState(defaultName);
  const [body, setBody] = React.useState("");
  const [pending, setPending] = React.useState(false);
  /** Client-owned: the customer just submitted in this browser session.
   *  Takes priority over the server's `hasExistingReview` so the thanks
   *  message survives the post-mutation re-render. */
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Just submitted in this session — show thanks, even if server now reports
  // the review exists.
  if (submitted) {
    return (
      <SuccessState title={t("thanksTitle")} body={t("thanksBody")} t={t} />
    );
  }

  // Server says a review already exists (return visit).
  if (hasExistingReview) {
    return (
      <InfoState
        icon={<Inbox className="h-6 w-6" />}
        title={t("alreadyTitle")}
        body={t("alreadyBody")}
        t={t}
      />
    );
  }

  // Appointment isn't ready for a review yet.
  if (!isEligible) {
    return (
      <InfoState
        icon={<Hourglass className="h-6 w-6" />}
        title={t("notEligibleTitle")}
        body={t("notEligibleBody")}
        t={t}
      />
    );
  }

  const canSubmit =
    rating > 0 && name.trim().length >= 2 && body.trim().length >= 20 && !pending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setError(null);

    const res = await submitReview({
      appointmentId,
      authorName: name.trim(),
      rating,
      body: body.trim(),
    });
    setPending(false);

    if (!res.ok) {
      const errMap: Record<string, string> = {
        not_found: t("errorNotFound"),
        not_eligible: t("errorNotEligible"),
        already_reviewed: t("errorAlreadyReviewed"),
        invalid: t("errorInvalid"),
        server_error: t("errorServer"),
      };
      setError(errMap[res.error] ?? t("errorServer"));
      return;
    }
    setSubmitted(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Star rating */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("ratingLabel")}
        </label>
        <div
          className="flex items-center gap-1.5"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = (hover || rating) >= star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                aria-label={`${star} star${star === 1 ? "" : "s"}`}
                className="rounded-md p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    filled
                      ? "fill-gold text-gold"
                      : "text-muted-foreground/30",
                  )}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
          {rating > 0 ? (
            <span className="ms-2 text-sm font-medium text-foreground">
              {rating}/5
            </span>
          ) : null}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("nameLabel")}
        </span>
        <input
          type="text"
          required
          maxLength={80}
          dir={locale === "ar" ? "rtl" : "ltr"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("bodyLabel")}
        </span>
        <textarea
          rows={6}
          required
          minLength={20}
          maxLength={1000}
          dir={locale === "ar" ? "rtl" : "ltr"}
          placeholder={t("bodyPlaceholder")}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="block w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <span className="mt-1 block text-[11px] text-muted-foreground">
          {body.trim().length} / 1000
        </span>
      </label>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <Button
        type="submit"
        variant="gold"
        size="lg"
        className="w-full justify-center"
        disabled={!canSubmit}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        {t("moderation")}
      </p>
    </form>
  );
}

function SuccessState({
  title,
  body,
  t,
}: {
  title: string;
  body: string;
  t: (k: string) => string;
}) {
  return (
    <div className="rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center sm:p-14">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {body}
      </p>
      <Button asChild variant="ghost" className="mt-6">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}

function InfoState({
  icon,
  title,
  body,
  t,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  t: (k: string) => string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {body}
      </p>
      <Button asChild variant="ghost" className="mt-6">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
