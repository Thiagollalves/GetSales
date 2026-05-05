import { getSupabaseAdminClient } from "@/lib/supabase/server"
import {
  AgentStatus,
  buildFlowTestOutcome,
  cloneAgents,
  cloneFlows,
  FlowCreation,
  FlowEntry,
  FlowPatch,
  initialAgents,
  initialFlows,
} from "@/lib/chatbots-core"

export type { AgentStatus, AgentEntry, FlowCreation, FlowEntry, FlowPatch } from "@/lib/chatbots-core"

const FLOW_TABLE = "chatbot_flows"
const AGENT_TABLE = "chatbot_agents"

let memoryFlows: FlowEntry[] = cloneFlows(initialFlows)
let memoryAgents: (typeof initialAgents)[number][] = cloneAgents(initialAgents)
let nextFlowId = initialFlows.length + 1
let nextAgentId = initialAgents.length + 1

function isProductionEnvironment() {
  return process.env.NODE_ENV === "production"
}

function normalizeFlowRow(row: Partial<FlowEntry> & { id?: number | string }) {
  return {
    id: Number(row.id ?? 0),
    name: String(row.name ?? ""),
    trigger: String(row.trigger ?? ""),
    active: Boolean(row.active),
    conversations: Number(row.conversations ?? 0),
    lastTestScore: row.lastTestScore === undefined || row.lastTestScore === null ? undefined : Number(row.lastTestScore),
    lastTestStatus: row.lastTestStatus ? String(row.lastTestStatus) : undefined,
  } satisfies FlowEntry
}

function normalizeAgentRow(row: Partial<(typeof initialAgents)[number]> & { id?: number | string }) {
  return {
    id: Number(row.id ?? 0),
    name: String(row.name ?? ""),
    channel: String(row.channel ?? ""),
    focus: String(row.focus ?? ""),
    status: (row.status as AgentStatus) ?? "Ativo",
  }
}

type FlowMutationPayload = Partial<FlowCreation> & FlowPatch

function sanitizeFlowPayload(payload: FlowMutationPayload) {
  return {
    name: payload.name?.toString().trim(),
    trigger: payload.trigger?.toString().trim(),
    active: typeof payload.active === "boolean" ? payload.active : undefined,
    conversations:
      typeof payload.conversations === "number" && Number.isFinite(payload.conversations)
        ? Math.max(0, Math.trunc(payload.conversations))
        : undefined,
    lastTestScore:
      typeof payload.lastTestScore === "number" && Number.isFinite(payload.lastTestScore)
        ? Math.trunc(payload.lastTestScore)
        : undefined,
    lastTestStatus: payload.lastTestStatus?.toString().trim(),
  }
}

async function ensureSeeded<T extends { id: number }>(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  table: string,
  seeds: T[],
) {
  const { data, error } = await client.from(table).select("id").limit(1)
  if (error) {
    throw error
  }

  if (Array.isArray(data) && data.length > 0) {
    return
  }

  const { error: seedError } = await client.from(table).upsert(seeds, { onConflict: "id" })
  if (seedError) {
    throw seedError
  }
}

async function getNextNumericId(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  table: string,
) {
  const { data, error } = await client.from(table).select("id").order("id", { ascending: false }).limit(1)
  if (error) {
    throw error
  }

  const maxId = Array.isArray(data) && data[0]?.id ? Number(data[0].id) : 0
  return Number.isFinite(maxId) ? maxId + 1 : 1
}

async function loadFlowRows() {
  const client = getSupabaseAdminClient()
  if (!client) {
    if (isProductionEnvironment()) {
      throw new Error("Chatbot storage is not configured.")
    }

    return cloneFlows(memoryFlows)
  }

  try {
    await ensureSeeded(client, FLOW_TABLE, initialFlows)
    const { data, error } = await client.from(FLOW_TABLE).select("*").order("id", { ascending: true })
    if (error) {
      throw error
    }

    return (data ?? []).map(normalizeFlowRow)
  } catch (error) {
    if (!isProductionEnvironment()) {
      return cloneFlows(memoryFlows)
    }

    throw error
  }
}

async function loadAgentRows() {
  const client = getSupabaseAdminClient()
  if (!client) {
    if (isProductionEnvironment()) {
      throw new Error("Chatbot storage is not configured.")
    }

    return cloneAgents(memoryAgents)
  }

  try {
    await ensureSeeded(client, AGENT_TABLE, initialAgents)
    const { data, error } = await client.from(AGENT_TABLE).select("*").order("id", { ascending: true })
    if (error) {
      throw error
    }

    return (data ?? []).map(normalizeAgentRow)
  } catch (error) {
    if (!isProductionEnvironment()) {
      return cloneAgents(memoryAgents)
    }

    throw error
  }
}

export async function listFlows() {
  return loadFlowRows()
}

export async function createFlow(payload: FlowCreation) {
  const sanitized = sanitizeFlowPayload(payload)
  const client = getSupabaseAdminClient()

  if (!client) {
    if (isProductionEnvironment()) {
      throw new Error("Chatbot storage is not configured.")
    }

    const newFlow: FlowEntry = {
      id: nextFlowId,
      name: sanitized.name ?? "",
      trigger: sanitized.trigger ?? "",
      active: sanitized.active ?? true,
      conversations: sanitized.conversations ?? 0,
    }

    nextFlowId += 1
    memoryFlows = [...memoryFlows, newFlow]
    return { ...newFlow }
  }

  await ensureSeeded(client, FLOW_TABLE, initialFlows)
  const id = await getNextNumericId(client, FLOW_TABLE)
  const row: FlowEntry = {
    id,
    name: sanitized.name ?? "",
    trigger: sanitized.trigger ?? "",
    active: sanitized.active ?? true,
    conversations: sanitized.conversations ?? 0,
  }

  const { data, error } = await client.from(FLOW_TABLE).insert(row).select("*").single()
  if (error) {
    if (!isProductionEnvironment()) {
      const fallbackFlow = { ...row }
      memoryFlows = [...memoryFlows, fallbackFlow]
      return fallbackFlow
    }

    throw error
  }

  return normalizeFlowRow(data ?? row)
}

export async function updateFlow(id: number, patch: FlowPatch) {
  const sanitized = sanitizeFlowPayload(patch)
  const client = getSupabaseAdminClient()

  if (!client) {
    if (isProductionEnvironment()) {
      throw new Error("Chatbot storage is not configured.")
    }

    let updatedFlow: FlowEntry | undefined
    memoryFlows = memoryFlows.map((flow) => {
      if (flow.id !== id) {
        return flow
      }

      updatedFlow = {
        ...flow,
        ...(sanitized.name ? { name: sanitized.name } : {}),
        ...(sanitized.trigger ? { trigger: sanitized.trigger } : {}),
        ...(sanitized.active === undefined ? {} : { active: sanitized.active }),
        ...(sanitized.conversations === undefined ? {} : { conversations: sanitized.conversations }),
        ...(sanitized.lastTestScore === undefined ? {} : { lastTestScore: sanitized.lastTestScore }),
        ...(sanitized.lastTestStatus ? { lastTestStatus: sanitized.lastTestStatus } : {}),
      }

      return updatedFlow
    })

    return updatedFlow ? { ...updatedFlow } : undefined
  }

  const updatePayload: Partial<FlowEntry> = {}
  if (sanitized.name) updatePayload.name = sanitized.name
  if (sanitized.trigger) updatePayload.trigger = sanitized.trigger
  if (sanitized.active !== undefined) updatePayload.active = sanitized.active
  if (sanitized.conversations !== undefined) updatePayload.conversations = sanitized.conversations
  if (sanitized.lastTestScore !== undefined) updatePayload.lastTestScore = sanitized.lastTestScore
  if (sanitized.lastTestStatus) updatePayload.lastTestStatus = sanitized.lastTestStatus

  const { data, error } = await client.from(FLOW_TABLE).update(updatePayload).eq("id", id).select("*").maybeSingle()
  if (error) {
    if (!isProductionEnvironment()) {
      let updatedFlow: FlowEntry | undefined
      memoryFlows = memoryFlows.map((flow) => {
        if (flow.id !== id) {
          return flow
        }

        updatedFlow = {
          ...flow,
          ...updatePayload,
        }

        return updatedFlow
      })

      return updatedFlow ? { ...updatedFlow } : undefined
    }

    throw error
  }

  return data ? normalizeFlowRow(data) : undefined
}

export async function runFlowTest(id: number) {
  const { score, status } = buildFlowTestOutcome(id)
  return updateFlow(id, {
    lastTestScore: score,
    lastTestStatus: status,
  })
}

export async function listAgents() {
  return loadAgentRows()
}

export async function createAgent(agent: Omit<(typeof initialAgents)[number], "id">) {
  const client = getSupabaseAdminClient()

  if (!client) {
    if (isProductionEnvironment()) {
      throw new Error("Chatbot storage is not configured.")
    }

    const newAgent = {
      id: nextAgentId,
      ...agent,
    }

    nextAgentId += 1
    memoryAgents = [newAgent, ...memoryAgents]
    return { ...newAgent }
  }

  await ensureSeeded(client, AGENT_TABLE, initialAgents)
  const { data: lastRow, error: nextIdError } = await client
    .from(AGENT_TABLE)
    .select("id")
    .order("id", { ascending: false })
    .limit(1)

  if (nextIdError) {
    throw nextIdError
  }

  const nextId = Array.isArray(lastRow) && lastRow[0]?.id ? Number(lastRow[0].id) + 1 : 1
  const row = {
    id: nextId,
    name: agent.name,
    channel: agent.channel,
    focus: agent.focus,
    status: agent.status,
  }

  const { data, error } = await client.from(AGENT_TABLE).insert(row).select("*").single()
  if (error) {
    if (!isProductionEnvironment()) {
      const fallbackAgent = { ...row }
      memoryAgents = [fallbackAgent, ...memoryAgents]
      return fallbackAgent
    }

    throw error
  }

  return normalizeAgentRow(data ?? row)
}
