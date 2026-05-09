import { buildFlowTestOutcome, type FlowEntry } from "@/lib/chatbots-core"

export type ChatbotFlowWebhookMode = "test" | "publish"

export interface ChatbotFlowWebhookPayload {
  event: "chatbot.flow.test" | "chatbot.flow.publish"
  flowId: number
  flowName: string
  mode: ChatbotFlowWebhookMode
  definition: FlowEntry["definition"]
  testPhone?: string
  triggeredAt: string
}

export interface ChatbotFlowWebhookResult {
  ok: boolean
  payload: ChatbotFlowWebhookPayload
  data?: unknown
  status?: number
  error?: string
  local?: boolean
}

export function buildChatbotFlowWebhookPayload(
  flow: FlowEntry,
  mode: ChatbotFlowWebhookMode,
  triggeredAt = new Date().toISOString(),
  testPhoneOverride?: string,
): ChatbotFlowWebhookPayload {
  return {
    event: mode === "test" ? "chatbot.flow.test" : "chatbot.flow.publish",
    flowId: flow.id,
    flowName: flow.name,
    mode,
    definition: flow.definition,
    ...(testPhoneOverride ?? flow.testPhone ? { testPhone: testPhoneOverride ?? flow.testPhone } : {}),
    triggeredAt,
  }
}

async function readJsonSafely(response: Response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function getWebhookUrl() {
  return process.env.N8N_CHATBOT_FLOW_WEBHOOK_URL?.trim() ?? ""
}

export async function sendChatbotFlowWebhook(
  flow: FlowEntry,
  mode: ChatbotFlowWebhookMode,
  options?: { testPhone?: string; triggeredAt?: string },
): Promise<ChatbotFlowWebhookResult> {
  const payload = buildChatbotFlowWebhookPayload(
    flow,
    mode,
    options?.triggeredAt,
    options?.testPhone,
  )

  const webhookUrl = getWebhookUrl()
  if (!webhookUrl) {
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        payload,
        error: "N8N_CHATBOT_FLOW_WEBHOOK_URL is not configured.",
      }
    }

    if (mode === "test") {
      const outcome = buildFlowTestOutcome(flow.id)
      return {
        ok: true,
        payload,
        data: {
          score: outcome.score,
          status: outcome.status,
          mode: "local",
        },
        local: true,
      }
    }

    return {
      ok: true,
      payload,
      data: {
        publishedAt: new Date().toISOString(),
        mode: "local",
      },
      local: true,
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await readJsonSafely(response)

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : undefined) ?? response.statusText ?? "Falha ao acionar o webhook do n8n."

      return {
        ok: false,
        payload,
        data,
        status: response.status,
        error: errorMessage,
      }
    }

    return {
      ok: true,
      payload,
      data,
      status: response.status,
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      if (mode === "test") {
        const outcome = buildFlowTestOutcome(flow.id)
        return {
          ok: true,
          payload,
          data: {
            score: outcome.score,
            status: outcome.status,
            mode: "local",
          },
          local: true,
        }
      }

      return {
        ok: true,
        payload,
        data: {
          publishedAt: new Date().toISOString(),
          mode: "local",
        },
        local: true,
      }
    }

    return {
      ok: false,
      payload,
      error: error instanceof Error ? error.message : "Falha ao acionar o webhook do n8n.",
    }
  }
}
