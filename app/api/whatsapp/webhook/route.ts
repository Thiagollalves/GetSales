import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { META_WEBHOOK_SIGNATURE_HEADER, verifyMetaWebhookSignature } from "@/lib/meta-webhook";

const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN?.trim();
const META_APP_SECRET = process.env.META_APP_SECRET?.trim();

interface WhatsAppWebhookMessage {
  from?: string;
  id?: string;
  timestamp?: string;
  type?: string;
  text?: {
    body?: string;
  };
  [key: string]: unknown;
}

interface WhatsAppWebhookContact {
  profile?: {
    name?: string;
  };
  wa_id?: string;
}

interface WhatsAppWebhookValue {
  messaging_product?: string;
  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };
  contacts?: WhatsAppWebhookContact[];
  messages?: WhatsAppWebhookMessage[];
}

interface WhatsAppWebhookChange {
  value?: WhatsAppWebhookValue;
  field?: string;
}

interface WhatsAppWebhookEntry {
  id?: string;
  changes?: WhatsAppWebhookChange[];
}

interface WhatsAppWebhookPayload {
  object?: string;
  entry?: WhatsAppWebhookEntry[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!META_VERIFY_TOKEN) {
    return NextResponse.json(
      { error: "META_VERIFY_TOKEN is not configured" },
      { status: 500 },
    );
  }

  if (mode === "subscribe" && token && challenge && token === META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid verification token" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get(META_WEBHOOK_SIGNATURE_HEADER);

    if (!META_APP_SECRET) {
      return NextResponse.json(
        { error: "META_APP_SECRET is not configured" },
        { status: 500 },
      );
    }

    if (!verifyMetaWebhookSignature(rawBody, signature, META_APP_SECRET)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    let payload: WhatsAppWebhookPayload | null = null;
    try {
      payload = rawBody ? (JSON.parse(rawBody) as WhatsAppWebhookPayload) : null;
    } catch {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const entries: WhatsAppWebhookEntry[] = Array.isArray(payload?.entry) ? payload.entry : [];

    const messages = entries.flatMap((entry: WhatsAppWebhookEntry) =>
      Array.isArray(entry?.changes)
        ? entry.changes.flatMap((change: WhatsAppWebhookChange) =>
            Array.isArray(change?.value?.messages) ? change.value.messages : []
          )
        : []
    );

    const supabase = getSupabaseAdminClient();
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (supabase && messages.length > 0) {
      const inserts = entries.flatMap((entry: WhatsAppWebhookEntry) =>
        Array.isArray(entry?.changes)
          ? entry.changes.flatMap((change: WhatsAppWebhookChange) => {
              const metadata = change?.value?.metadata ?? {};
              const contacts = Array.isArray(change?.value?.contacts) ? change.value.contacts : [];
              const contact = contacts[0];

              return Array.isArray(change?.value?.messages)
                ? change.value.messages.map((message: WhatsAppWebhookMessage) => ({
                    message_id: message.id ?? null,
                    from_number: message.from ?? null,
                    message_type: message.type ?? null,
                    text_body: message.text?.body ?? null,
                    timestamp: message.timestamp ?? null,
                    contact_name: contact?.profile?.name ?? null,
                    phone_number_id: metadata.phone_number_id ?? null,
                    raw_payload: message,
                  }))
                : [];
            })
          : []
      );

      if (inserts.length > 0) {
        const { error } = await supabase.from("whatsapp_messages").insert(inserts);
        if (error) {
          console.error("Supabase insert error:", error);
        }
      }
    }

    if (n8nWebhookUrl) {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "meta-whatsapp",
          receivedAt: new Date().toISOString(),
          payload,
        }),
      });

      if (!n8nResponse.ok) {
        console.error("n8n webhook error:", await n8nResponse.text());
      }
    }

    return NextResponse.json({ received: true, messageCount: messages.length });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
