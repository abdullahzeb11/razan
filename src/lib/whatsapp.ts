import "server-only";

/**
 * Meta WhatsApp Cloud API client.
 *
 * Two surfaces:
 *   1. sendTemplate — for unsolicited messages (booking confirmations, admin alerts).
 *      Requires an approved template in Meta Business Manager.
 *   2. sendText — replies inside the 24h customer-service window only.
 *
 * If env vars are missing (local dev without Meta access), every call is a
 * no-op that logs the payload and returns ok. This keeps the booking flow
 * fully functional in dev — only the actual WhatsApp delivery is skipped.
 */

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const GRAPH_VERSION = "v21.0";

type SendResult = { ok: true; messageId?: string } | { ok: false; error: string };

function configured() {
  return Boolean(PHONE_NUMBER_ID && ACCESS_TOKEN);
}

async function callGraph(payload: object): Promise<SendResult> {
  if (!configured()) {
    console.log("[whatsapp:stub]", JSON.stringify(payload));
    return { ok: true, messageId: "stub" };
  }
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    const data = (await res.json()) as {
      messages?: Array<{ id: string }>;
      error?: { message: string };
    };
    if (!res.ok) {
      return { ok: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Send an approved template message (works outside the 24h window). */
export async function sendTemplate(args: {
  to: string;
  template: string;
  language: "ar" | "en";
  components?: Array<{
    type: "body" | "header";
    parameters: Array<{ type: "text"; text: string }>;
  }>;
}): Promise<SendResult> {
  return callGraph({
    messaging_product: "whatsapp",
    to: args.to.replace(/^\+/, ""),
    type: "template",
    template: {
      name: args.template,
      language: { code: args.language === "ar" ? "ar_SA" : "en_US" },
      ...(args.components ? { components: args.components } : {}),
    },
  });
}

/** Send a plain text message (must be within 24h of last customer message). */
export async function sendText(args: { to: string; text: string }): Promise<SendResult> {
  return callGraph({
    messaging_product: "whatsapp",
    to: args.to.replace(/^\+/, ""),
    type: "text",
    text: { body: args.text },
  });
}
