"use client";

import * as React from "react";
import Script from "next/script";
import { Loader2, ShieldCheck } from "lucide-react";

/**
 * Embedded Moyasar payment form. Loads moyasar.js from the CDN, mounts a
 * card form into the .mysr-form element, and lets Moyasar handle 3D Secure
 * via redirect to the callback URL.
 *
 * Card data never touches our server — it goes straight from the browser
 * to Moyasar's PCI-compliant endpoint via their JS SDK.
 */

type Props = {
  publishableKey: string;
  amountHalalas: number;
  description: string;
  callbackUrl: string;
  locale: "ar" | "en";
  customerName: string;
  customerEmail: string;
  appointmentId: string;
};

// Minimal shape of the moyasar.js global the SDK exposes.
type MoyasarInit = {
  element: string;
  amount: number;
  currency: string;
  description: string;
  publishable_api_key: string;
  callback_url: string;
  language?: "ar" | "en";
  methods?: Array<"creditcard" | "stcpay" | "applepay">;
  metadata?: Record<string, string>;
  on_completed?: (payment: { id: string; status: string }) => void;
};

declare global {
  interface Window {
    Moyasar?: {
      init: (config: MoyasarInit) => void;
    };
  }
}

export function MoyasarForm({
  publishableKey,
  amountHalalas,
  description,
  callbackUrl,
  locale,
  customerName,
  customerEmail,
  appointmentId,
}: Props) {
  const [ready, setReady] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Initialize the Moyasar form once the script has loaded.
  React.useEffect(() => {
    if (!ready || mounted || !window.Moyasar) return;

    // Apple Pay is omitted until the merchant has: (1) an Apple Developer
    // account, (2) a Moyasar Apple Pay merchant ID, (3) the apple-developer-
    // merchantid-domain-association file uploaded to /.well-known/, and
    // (4) the domain registered in the Apple Pay dashboard. Without all four,
    // Moyasar throws "Apple Pay label is required" / "Validate Merchant URL
    // required" inline errors. Card + STC Pay are sufficient for testing.
    window.Moyasar.init({
      element: ".mysr-form",
      amount: amountHalalas,
      currency: "SAR",
      description,
      publishable_api_key: publishableKey,
      callback_url: callbackUrl,
      language: locale,
      methods: ["creditcard", "stcpay"],
      metadata: {
        appointment_id: appointmentId,
        customer_name: customerName,
        customer_email: customerEmail,
      },
    });

    setMounted(true);
  }, [
    ready,
    mounted,
    publishableKey,
    amountHalalas,
    description,
    callbackUrl,
    locale,
    appointmentId,
    customerName,
    customerEmail,
  ]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.moyasar.com/mpf/1.15.0/moyasar.css"
      />
      <Script
        src="https://cdn.moyasar.com/mpf/1.15.0/moyasar.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />

      {/* Moyasar mounts its form inside this element */}
      <div className="mysr-form min-h-[280px]" dir={locale === "ar" ? "rtl" : "ltr"} />

      {!mounted ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{locale === "ar" ? "جارٍ تحميل نموذج الدفع…" : "Loading payment form…"}</span>
        </div>
      ) : null}

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          {locale === "ar"
            ? "بيانات بطاقتك تذهب مباشرة إلى Moyasar — لا تمر عبر خوادمنا."
            : "Your card data goes straight to Moyasar — never touches our servers."}
        </p>
      </div>
    </>
  );
}
