"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ProgressRail, type Step } from "./progress-rail";
import { StepService, type ServiceOption } from "./step-service";
import { StepDateTime } from "./step-datetime";
import { StepDetails, type Details } from "./step-details";
import { StepPayment, type PaymentMethod } from "./step-payment";
import { StepReview } from "./step-review";
import { createAppointment } from "@/app/actions/booking";
import { appointmentInputSchema } from "@/lib/booking";
import { siteConfig } from "@/lib/site-config";

type Stage = 0 | 1 | 2 | 3 | 4;

const DEFAULTS: Details = {
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  // Default to HOME_VISIT when the business is home-visit-only — the toggle
  // is hidden in that mode, so this is the only location customers can book.
  location: siteConfig.homeVisitOnly ? "HOME_VISIT" : "CLINIC",
  addressLine: "",
  city: "",
  mapsUrl: "",
  notes: "",
};

export function BookingWizard({
  services,
  initialServiceSlug,
  prefill,
}: {
  services: ServiceOption[];
  initialServiceSlug?: string;
  prefill?: { name: string; phone: string; email: string };
}) {
  const tb = useTranslations("Booking");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();

  const initialId =
    services.find((s) => s.slug === initialServiceSlug)?.id ?? null;

  const [stage, setStage] = React.useState<Stage>(0);
  const [serviceId, setServiceId] = React.useState<string | null>(initialId);
  const [scheduledAt, setScheduledAt] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("CASH");
  const [details, setDetails] = React.useState<Details>({
    ...DEFAULTS,
    guestName: prefill?.name ?? "",
    guestPhone: prefill?.phone ?? "",
    guestEmail: prefill?.email ?? "",
    location: siteConfig.homeVisitOnly
      ? "HOME_VISIT"
      : services.find((s) => s.id === initialId)?.homeVisit
        ? "HOME_VISIT"
        : "CLINIC",
  });
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);
  // "success" briefly stays true between server-OK and the redirect — gives
  // the user a clear "booked!" beat before the page changes, so the confirm
  // click never feels like nothing happened.
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const selectedService = services.find((s) => s.id === serviceId) ?? null;
  const homeVisitForced =
    siteConfig.homeVisitOnly || selectedService?.homeVisit === true;

  // Keep location consistent with service when service changes.
  React.useEffect(() => {
    if (siteConfig.homeVisitOnly || selectedService?.homeVisit) {
      setDetails((d) => ({ ...d, location: "HOME_VISIT" }));
    }
  }, [selectedService]);

  const steps: Step[] = [
    { key: "service", label: tb("step1.short") },
    { key: "datetime", label: tb("step2.short") },
    { key: "details", label: tb("step3.short") },
    { key: "payment", label: tb("step4.short") },
    { key: "review", label: tb("step5.short") },
  ];

  const canAdvance =
    stage === 0
      ? Boolean(serviceId)
      : stage === 1
        ? Boolean(scheduledAt)
        : stage === 2
          ? validateDetails(details, homeVisitForced).ok
          : stage === 3
            ? Boolean(paymentMethod)
            : true;

  function next() {
    setServerError(null);
    if (stage === 2) {
      const v = validateDetails(details, homeVisitForced);
      if (!v.ok) {
        setErrors(v.errors);
        return;
      }
      setErrors({});
    }
    setStage((s) => Math.min(4, s + 1) as Stage);
  }

  function back() {
    setServerError(null);
    if (stage === 0) {
      // No earlier wizard step — leave the booking page entirely. Use browser
      // history if it exists (preserves where the user came from, e.g. the
      // services section), otherwise fall back to the homepage.
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
      return;
    }
    setStage((s) => Math.max(0, s - 1) as Stage);
  }

  async function submit() {
    if (!selectedService || !scheduledAt) return;
    setSubmitting(true);
    setServerError(null);

    const payload = {
      serviceId: selectedService.id,
      scheduledAt,
      location: details.location,
      guestName: details.guestName.trim(),
      guestPhone: details.guestPhone.trim(),
      guestEmail: details.guestEmail.trim(),
      addressLine: details.addressLine.trim() || undefined,
      city: details.city.trim() || undefined,
      mapsUrl: details.mapsUrl.trim() || undefined,
      notes: details.notes.trim() || undefined,
      paymentMethod,
      locale,
    };

    const parsed = appointmentInputSchema.safeParse(payload);
    if (!parsed.success) {
      setSubmitting(false);
      setStage(2);
      const issue = parsed.error.issues[0];
      setErrors({ [issue.path[0] as string]: issue.message });
      return;
    }

    const res = await createAppointment(parsed.data);

    if (!res.ok) {
      setSubmitting(false);
      setServerError(res.error);
      if (res.field === "scheduledAt") setStage(1);
      else if (res.field === "serviceId") setStage(0);
      return;
    }

    // Server confirmed the booking. Show the "booked!" state for a beat so
    // the user gets explicit feedback, then navigate. For card payments we
    // send the customer to the Moyasar payment page; otherwise to the
    // confirmation page directly.
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      const dest = res.paymentRequired
        ? `/book/pay/${res.id}`
        : `/book/confirmed/${res.id}`;
      router.push(dest);
    }, 700);
  }

  return (
    <div className="space-y-10">
      <ProgressRail steps={steps} current={stage} />

      <div className="relative rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-10">
        <AnimatePresence>
          {submitting || success ? (
            <motion.div
              key={success ? "success" : "submitting"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-3xl bg-card/95 px-6 text-center backdrop-blur-sm"
              aria-live="polite"
              role="status"
            >
              {success ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated">
                    <CheckCircle2 className="h-7 w-7" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold sm:text-lg">{tb("successTitle")}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">{tb("successHint")}</p>
                  </div>
                </>
              ) : (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <div className="space-y-1">
                    <p className="text-base font-semibold sm:text-lg">{tb("confirmingTitle")}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">{tb("confirmingHint")}</p>
                  </div>
                </>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {stage === 0 ? (
              <StepService
                services={services}
                selectedId={serviceId}
                onSelect={setServiceId}
              />
            ) : null}
            {stage === 1 ? (
              <StepDateTime selectedIso={scheduledAt} onSelect={setScheduledAt} />
            ) : null}
            {stage === 2 ? (
              <StepDetails
                value={details}
                errors={errors}
                homeVisitForced={homeVisitForced}
                onChange={(patch) =>
                  setDetails((d) => ({ ...d, ...patch }))
                }
              />
            ) : null}
            {stage === 3 ? (
              <StepPayment
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            ) : null}
            {stage === 4 && selectedService && scheduledAt ? (
              <StepReview
                service={selectedService}
                scheduledAt={scheduledAt}
                details={details}
                paymentMethod={paymentMethod}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        {serverError ? (
          <p className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {serverError}
          </p>
        ) : null}

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={back}
            disabled={submitting}
            aria-label={stage === 0 ? tb("backToSite") : tb("back")}
            className="w-full justify-center sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {stage === 0 ? tb("backToSite") : tb("back")}
          </Button>
          {stage < 4 ? (
            <Button
              type="button"
              variant="gold"
              size="lg"
              disabled={!canAdvance}
              onClick={next}
              className="w-full justify-center sm:w-auto"
            >
              {tb("next")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="gold"
              size="lg"
              disabled={submitting || success}
              onClick={submit}
              className="w-full justify-center sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tb("confirming")}
                </>
              ) : (
                <>
                  {tb("confirm")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function validateDetails(
  d: Details,
  homeVisitForced: boolean,
): { ok: true } | { ok: false; errors: Partial<Record<keyof Details, string>> } {
  const errors: Partial<Record<keyof Details, string>> = {};
  if (d.guestName.trim().length < 2) errors.guestName = "required";
  if (!/^\+?\d[\d\s()-]{7,18}$/.test(d.guestPhone.trim()))
    errors.guestPhone = "invalid";
  if (d.guestEmail && !/^\S+@\S+\.\S+$/.test(d.guestEmail.trim()))
    errors.guestEmail = "invalid";
  if ((homeVisitForced || d.location === "HOME_VISIT") && d.addressLine.trim().length < 5)
    errors.addressLine = "required";
  return Object.keys(errors).length === 0
    ? { ok: true }
    : { ok: false, errors };
}
