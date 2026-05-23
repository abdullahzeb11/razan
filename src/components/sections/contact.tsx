"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  phone: z
    .string()
    .min(8, "Phone number is too short")
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Phone number looks invalid"),
  email: z
    .string()
    .email("Email looks invalid")
    .optional()
    .or(z.literal("")),
  message: z.string().min(8, "Message is too short").max(1000),
});
type FormValues = z.infer<typeof schema>;

export function Contact() {
  const t = useTranslations("Contact");
  const [state, setState] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  async function onSubmit(values: FormValues) {
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      setState("success");
      reset();
    } catch {
      setState("error");
    }
  }

  return (
    <section className="relative py-16 sm:py-24 lg:py-28">
      <div className="container-narrow">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-soft sm:mt-12 sm:rounded-3xl sm:p-10"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t("form.name")}
              error={errors.name?.message}
              registration={register("name")}
            />
            <Field
              label={t("form.phone")}
              error={errors.phone?.message}
              registration={register("phone")}
              type="tel"
              dir="ltr"
            />
            <Field
              label={t("form.email")}
              error={errors.email?.message}
              registration={register("email")}
              type="email"
              dir="ltr"
              className="sm:col-span-2"
            />
            <Field
              label={t("form.message")}
              error={errors.message?.message}
              registration={register("message")}
              textarea
              className="sm:col-span-2"
            />
          </div>

          <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:mt-7 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="text-sm">
              {state === "success" && (
                <span className="inline-flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("form.success")}
                </span>
              )}
              {state === "error" && (
                <span className="inline-flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {t("form.error")}
                </span>
              )}
            </div>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={state === "loading"}
              className="w-full justify-center sm:w-auto"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("form.submitting")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t("form.submit")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  registration,
  type = "text",
  textarea,
  className,
  dir,
}: {
  label: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
  type?: string;
  textarea?: boolean;
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  const inputClasses =
    "block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {textarea ? (
        <textarea
          rows={4}
          dir={dir}
          className={inputClasses}
          {...(registration as React.ComponentProps<"textarea">)}
        />
      ) : (
        <input
          type={type}
          dir={dir}
          className={inputClasses}
          {...(registration as React.ComponentProps<"input">)}
        />
      )}
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
