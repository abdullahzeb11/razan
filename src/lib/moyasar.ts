import "server-only";

/**
 * Moyasar server-side helpers. The browser uses the publishable key via the
 * Moyasar.js embed; this file is only for verifying payment status after the
 * customer is redirected back from Moyasar's 3D Secure flow.
 *
 * Test vs live is implicit: keys starting with `_test_` hit Moyasar's
 * sandbox; `_live_` keys hit production. Same code path either way.
 */

const SECRET_KEY = process.env.MOYASAR_SECRET_KEY;
const API_BASE = "https://api.moyasar.com/v1";

export function moyasarConfigured(): boolean {
  return Boolean(SECRET_KEY);
}

export function moyasarIsTestMode(): boolean {
  return Boolean(SECRET_KEY?.startsWith("sk_test_"));
}

export type MoyasarPayment = {
  id: string;
  status: "initiated" | "paid" | "failed" | "authorized" | "captured" | "refunded" | "voided";
  amount: number;          // halalas
  amount_format: string;
  currency: string;
  description: string | null;
  fee: number;
  refunded: number;
  created_at: string;
  metadata: Record<string, string> | null;
  source: {
    type: string;           // "creditcard" | "stcpay" | "applepay"
    company?: string;       // "visa" | "mastercard" | "mada" | ...
    number?: string;        // masked
    name?: string;
    message?: string | null;
  } | null;
};

/**
 * Fetches a payment by its Moyasar ID. Used by the callback route after the
 * customer is redirected back from Moyasar to verify the payment really
 * succeeded (don't trust the redirect status alone — always verify server-side).
 */
export async function fetchMoyasarPayment(id: string): Promise<MoyasarPayment> {
  if (!SECRET_KEY) throw new Error("MOYASAR_SECRET_KEY not configured");

  const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${SECRET_KEY}:`).toString("base64")}`,
    },
    // Disable caching — payment status changes
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Moyasar API ${res.status}: ${body}`);
  }
  return (await res.json()) as MoyasarPayment;
}
