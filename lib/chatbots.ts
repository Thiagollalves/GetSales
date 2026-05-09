import { getSupabaseAdminClient } from "@/lib/supabase/server"
import {
  buildFlowTestOutcome,
  createDefaultFlowDefinition,
  deserializeFlowDefinition,
  duplicateFlowDefinition,
  type FlowCreation,
  type FlowEntry,
  type FlowPatch,
  type FlowSyncStatus,
} from "@/lib/chatbots-core"
import { sendChatbotFlowWebhook } from "@/lib/chatbots-n8n"
import { createSeedChatbotFlows } from "@/lib/chatbots-seeds"

export type AgentStatus = "Ativo" | "Em teste" | "Pausado"

export interface AgentEntry {
  id: number
  name: string
  channel: string
  focus: string
  status: AgentStatus
}

export type { FlowCreation, FlowDefinition, FlowEntry, FlowPatch, FlowSyncStatus } from "@/lib/chatbots-core"

const FLOW_TABLE = "chatbot_flows"
const AGENT_TABLE = "chatbot_agents"

interface FlowRow {
  id: number | string
  name: string
  description?: string | null
  trigger?: string | null
  active?: boolean | null
  conversations?: number | null
  test_phone?: string | null
  keywords?: string[] | string | null
  is_service_flow?: boolean | null
  definition?: unknown
  n8n_sync_status?: string | null
  last_published_at?: string | null
  last_test_score?: number | null
  last_test_status?: string | null
  created_at?: string | null
  updated_at?: string | null
}

function cloneJson<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value)) as T
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback
}

function normalizeKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean)
  }

  if (typeof value === "string") {
    return value
      .split(/[,;\n]/g)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeFlowSyncStatus(value: unknown): FlowSyncStatus {
  if (
    value === "idle" ||
    value === "testing" ||
    value === "publishing" ||
    value === "success" ||
    value === "error"
  ) {
    return value
  }

  return "idle"
}

function cloneFlowEntries(flows: FlowEntry[] = initialFlows) {
  return flows.map((flow) => cloneJson(flow))
}

function cloneAgentEntries(agents: AgentEntry[] = initialAgents) {
  return agents.map((agent) => ({ ...agent }))
}

const initialFlows: FlowEntry[] = createSeedChatbotFlows()

const initialAgents: AgentEntry[] = [
  {
    id: 1,
    name: "Assistente Comercial",
    channel: "WhatsApp",
    focus: "Qualificar leads e encaminhar para vendas",
    status: "Ativo",
  },
]

let memoryFlows: FlowEntry[] = cloneFlowEntries(initialFlows)
let memoryAgents: AgentEntry[] = cloneAgentEntries(initialAgents)
let nextFlowId = initialFlows.length + 1
let nextAgentId = initialAgents.length + 1

function normalizeFlowRow(row: Partial<FlowRow> & { id?: number | string }, flowName = ""): FlowEntry {
  const name = cleanText(row.name, flowName || "Novo Fluxo")
  const keywords = normalizeKeywords(row.keywords)
  const trigger = typeof row.trigger === "string" && row.trigger.trim() ? row.trigger.trim() : keywords[0] ?? name
  return {
    id: Number(row.id ?? 0),
    name,
    description: cleanText(row.description, ""),
    trigger,
    active: Boolean(row.active),
    conversations: Number(row.conversations ?? 0),
    testPhone: cleanText(row.test_phone, "") || undefined,
    keywords,
    isServiceFlow: Boolean(row.is_service_flow),
    definition: deserializeFlowDefinition(row.definition ?? createDefaultFlowDefinition(name), name),
    n8nSyncStatus: normalizeFlowSyncStatus(row.n8n_sync_status),
    lastPublishedAt: row.last_published_at ?? undefined,
    lastTestScore: row.last_test_score === undefined || row.last_test_score === null ? undefined : Number(row.last_test_score),
    lastTestStatus: row.last_test_status ? cleanText(row.last_test_status) : undefined,
  }
}

function normalizeAgentRow(row: Partial<AgentEntry> & { id?: number | string }): AgentEntry {
  return {
    id: Number(row.id ?? 0),
    name: cleanText(row.name, ""),
    channel: cleanText(row.channel, ""),
    focus: cleanText(row.focus, ""),
    status: (row.status as AgentStatus) ?? "Ativo",
  }
}

type FlowMutationPayload = Partial<FlowCreation> & FlowPatch & { keywords?: string[] | string }

function sanitizeFlowPayload(payload: FlowMutationPayload, flowName = "") {
  const keywords = normalizeKeywords(payload.keywords)
  const name = payload.name?.toString().trim()
  const description = payload.description?.toString().trim()
  const trigger = payload.trigger?.toString().trim() || keywords[0] || description || name || flowName
  const testPhone = payload.testPhone?.toString().trim() || undefined
  const definition = payload.definition ? deserializeFlowDefinition(payload.definition, name || flowName || "Novo Fluxo") : undefined

  return {
    name,
    description,
    trigger,
    active: typeof payload.active === "boolean" ? payload.active : undefined,
    conversations:
      typeof payload.conversations === "number" && Number.isFinite(payload.conversations)
        ? Math.max(0, Math.trunc(payload.conversations))
        : undefined,
    testPhone,
    keywords,
    keywordsProvided: payload.keywords !== undefined,
    isServiceFlow: typeof payload.isServiceFlow === "boolean" ? payload.isServiceFlow : undefined,
    definition,
    n8nSyncStatus: payload.n8nSyncStatus ? normalizeFlowSyncStatus(payload.n8nSyncStatus) : undefined,
    lastPublishedAt:
      payload.lastPublishedAt === undefined
        ? undefined
        : payload.lastPublishedAt === null
          ? null
          : payload.lastPublishedAt.toString().trim(),
    lastTestScore:
      payload.lastTestScore === undefined || payload.lastTestScore === null
        ? payload.lastTestScore
        : Math.trunc(payload.lastTestScore),
    lastTestStatus:
      payload.lastTestStatus === undefined
        ? undefined
        : payload.lastTestStatus === null
          ? null
          : payload.lastTestStatus.toString().trim(),
  }
}

function flowEntryToRow(flow: FlowEntry) {
  return {
    id: flow.id,
    name: flow.name,
    description: flow.description,
    trigger: flow.trigger,
    active: flow.active,
    conversations: flow.conversations,
    test_phone: flow.testPhone ?? null,
    keywords: flow.keywords,
    is_service_flow: flow.isServiceFlow,
    definition: flow.definition,
    n8n_sync_status: flow.n8nSyncStatus,
    last_published_at: flow.lastPublishedAt ?? null,
    last_test_score: flow.lastTestScore ?? null,
    last_test_status: flow.lastTestStatus ?? null,
    updated_at: new Date().toISOString(),
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
    return cloneFlowEntries(memoryFlows)
  }

  try {
    await ensureSeeded(client, FLOW_TABLE, initialFlows.map(flowEntryToRow))
    const { data, error } = await client.from(FLOW_TABLE).select("*").order("id", { ascending: true })
    if (error) {
      throw error
    }

    return (data ?? []).map((row) => normalizeFlowRow(row as Partial<FlowRow>))
  } catch {
    return cloneFlowEntries(memoryFlows)
  }
}

async function loadAgentRows() {
  const client = getSupabaseAdminClient()
  if (!client) {
    return cloneAgentEntries(memoryAgents)
  }

  try {
    await ensureSeeded(client, AGENT_TABLE, initialAgents)
    const { data, error } = await client.from(AGENT_TABLE).select("*").order("id", { ascending: true })
    if (error) {
      throw error
    }

    return (data ?? []).map((row) => normalizeAgentRow(row))
  } catch {
    return cloneAgentEntries(memoryAgents)
  }
}

function applyFlowPatch(flow: FlowEntry, patch: ReturnType<typeof sanitizeFlowPayload>): FlowEntry {
  return {
    ...flow,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.description !== undefined ? { description: patch.description } : {}),
    ...(patch.trigger !== undefined ? { trigger: patch.trigger } : {}),
    ...(patch.active !== undefined ? { active: patch.active } : {}),
    ...(patch.conversations !== undefined ? { conversations: patch.conversations } : {}),
    ...(patch.testPhone !== undefined ? { testPhone: patch.testPhone } : {}),
    ...(patch.keywordsProvided ? { keywords: patch.keywords } : {}),
    ...(patch.isServiceFlow !== undefined ? { isServiceFlow: patch.isServiceFlow } : {}),
    ...(patch.definition !== undefined ? { definition: patch.definition } : {}),
    ...(patch.n8nSyncStatus !== undefined ? { n8nSyncStatus: patch.n8nSyncStatus } : {}),
    ...(patch.lastPublishedAt !== undefined ? { lastPublishedAt: patch.lastPublishedAt ?? undefined } : {}),
    ...(patch.lastTestScore !== undefined ? { lastTestScore: patch.lastTestScore ?? undefined } : {}),
    ...(patch.lastTestStatus !== undefined ? { lastTestStatus: patch.lastTestStatus ?? undefined } : {}),
  }
}

async function persistFlowUpdate(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  id: number,
  patch: ReturnType<typeof sanitizeFlowPayload>,
) {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (patch.name !== undefined) updatePayload.name = patch.name
  if (patch.description !== undefined) updatePayload.description = patch.description
  if (patch.trigger !== undefined) updatePayload.trigger = patch.trigger
  if (patch.active !== undefined) updatePayload.active = patch.active
  if (patch.conversations !== undefined) updatePayload.conversations = patch.conversations
  if (patch.testPhone !== undefined) updatePayload.test_phone = patch.testPhone
  if (patch.keywordsProvided) updatePayload.keywords = patch.keywords
  if (patch.isServiceFlow !== undefined) updatePayload.is_service_flow = patch.isServiceFlow
  if (patch.definition !== undefined) updatePayload.definition = patch.definition
  if (patch.n8nSyncStatus !== undefined) updatePayload.n8n_sync_status = patch.n8nSyncStatus
  if (patch.lastPublishedAt !== undefined) updatePayload.last_published_at = patch.lastPublishedAt
  if (patch.lastTestScore !== undefined) updatePayload.last_test_score = patch.lastTestScore
  if (patch.lastTestStatus !== undefined) updatePayload.last_test_status = patch.lastTestStatus

  const { data, error } = await client.from(FLOW_TABLE).update(updatePayload).eq("id", id).select("*").maybeSingle()
  if (error) {
    throw error
  }

  return data ? normalizeFlowRow(data as Partial<FlowRow>) : undefined
}

export async function listFlows() {
  return loadFlowRows()
}

export async function getFlow(id: number) {
  const client = getSupabaseAdminClient()
  if (!client) {
    const flows = await loadFlowRows()
    return flows.find((flow) => flow.id === id)
  }

  try {
    await ensureSeeded(client, FLOW_TABLE, initialFlows.map(flowEntryToRow))
    const { data, error } = await client.from(FLOW_TABLE).select("*").eq("id", id).maybeSingle()
    if (error) {
      throw error
    }

    return data ? normalizeFlowRow(data as Partial<FlowRow>) : undefined
  } catch {
    const flows = await loadFlowRows()
    return flows.find((flow) => flow.id === id)
  }
}

export async function createFlow(payload: FlowCreation) {
  const sanitized = sanitizeFlowPayload(payload, payload.name)
  const client = getSupabaseAdminClient()
  const definition = sanitized.definition ?? createDefaultFlowDefinition(sanitized.name ?? payload.name)

  if (!client) {
    const newFlow: FlowEntry = {
      id: nextFlowId,
      name: sanitized.name ?? payload.name,
      description: sanitized.description ?? "",
      trigger: sanitized.trigger ?? payload.name,
      active: sanitized.active ?? true,
      conversations: sanitized.conversations ?? 0,
      testPhone: sanitized.testPhone,
      keywords: sanitized.keywords,
      isServiceFlow: sanitized.isServiceFlow ?? false,
      definition,
      n8nSyncStatus: sanitized.n8nSyncStatus ?? "idle",
      lastPublishedAt: sanitized.lastPublishedAt ?? undefined,
      lastTestScore: sanitized.lastTestScore ?? undefined,
      lastTestStatus: sanitized.lastTestStatus ?? undefined,
    }

    nextFlowId += 1
    memoryFlows = [...memoryFlows, cloneJson(newFlow)]
    return cloneJson(newFlow)
  }

  await ensureSeeded(client, FLOW_TABLE, initialFlows.map(flowEntryToRow))
  const id = await getNextNumericId(client, FLOW_TABLE)
  const row = flowEntryToRow({
    id,
    name: sanitized.name ?? payload.name,
    description: sanitized.description ?? "",
    trigger: sanitized.trigger ?? payload.name,
    active: sanitized.active ?? true,
    conversations: sanitized.conversations ?? 0,
    testPhone: sanitized.testPhone,
    keywords: sanitized.keywords,
    isServiceFlow: sanitized.isServiceFlow ?? false,
    definition,
    n8nSyncStatus: sanitized.n8nSyncStatus ?? "idle",
    lastPublishedAt: sanitized.lastPublishedAt ?? undefined,
    lastTestScore: sanitized.lastTestScore ?? undefined,
    lastTestStatus: sanitized.lastTestStatus ?? undefined,
  })

  const { data, error } = await client.from(FLOW_TABLE).insert(row).select("*").single()
  if (error) {
    const fallbackFlow = normalizeFlowRow(row as Partial<FlowRow>)
    memoryFlows = [...memoryFlows, cloneJson(fallbackFlow)]
    return cloneJson(fallbackFlow)
  }

  return normalizeFlowRow(data ?? row, sanitized.name ?? payload.name)
}

export async function updateFlow(id: number, patch: FlowPatch) {
  const existing = await getFlow(id)
  if (!existing) {
    return undefined
  }

  const sanitized = sanitizeFlowPayload(patch, existing.name)
  const nextFlow = applyFlowPatch(existing, sanitized)
  const client = getSupabaseAdminClient()

  if (!client) {
    memoryFlows = memoryFlows.map((flow) => (flow.id === id ? cloneJson(nextFlow) : flow))
    return cloneJson(nextFlow)
  }

  try {
    const updated = await persistFlowUpdate(client, id, sanitized)
    if (!updated) {
      return undefined
    }

    return updated
  } catch {
    memoryFlows = memoryFlows.map((flow) => (flow.id === id ? cloneJson(nextFlow) : flow))
    return cloneJson(nextFlow)
  }
}

export async function deleteFlow(id: number) {
  const existing = await getFlow(id)
  if (!existing) {
    return undefined
  }

  const client = getSupabaseAdminClient()
  if (!client) {
    memoryFlows = memoryFlows.filter((flow) => flow.id !== id)
    return cloneJson(existing)
  }

  try {
    const { data, error } = await client.from(FLOW_TABLE).delete().eq("id", id).select("*").maybeSingle()
    if (error) {
      throw error
    }

    if (!data) {
      return existing
    }

    return normalizeFlowRow(data as Partial<FlowRow>)
  } catch {
    memoryFlows = memoryFlows.filter((flow) => flow.id !== id)
    return cloneJson(existing)
  }
}

export async function duplicateFlow(id: number) {
  const existing = await getFlow(id)
  if (!existing) {
    return undefined
  }

  return createFlow({
    name: `${existing.name} - Cópia`,
    description: existing.description,
    active: existing.active,
    testPhone: existing.testPhone,
    keywords: existing.keywords,
    isServiceFlow: existing.isServiceFlow,
    trigger: existing.trigger,
    conversations: existing.conversations,
    definition: duplicateFlowDefinition(existing.definition),
  })
}

function buildTestPatch(flow: FlowEntry, resultData: unknown) {
  const data = resultData as {
    score?: number
    lastTestScore?: number
    status?: string
    lastTestStatus?: string
  } | null

  const fallback = buildFlowTestOutcome(flow.id)
  const score =
    typeof data?.score === "number"
      ? data.score
      : typeof data?.lastTestScore === "number"
        ? data.lastTestScore
        : fallback.score
  const status =
    typeof data?.status === "string"
      ? data.status
      : typeof data?.lastTestStatus === "string"
        ? data.lastTestStatus
        : fallback.status

  return {
    n8nSyncStatus: "success" as const,
    lastTestScore: score,
    lastTestStatus: status,
  }
}

function buildPublishPatch(resultData: unknown) {
  const data = resultData as {
    publishedAt?: string
    lastPublishedAt?: string
  } | null

  return {
    n8nSyncStatus: "success" as const,
    lastPublishedAt: data?.publishedAt ?? data?.lastPublishedAt ?? new Date().toISOString(),
  }
}

async function runWebhookSync(id: number, mode: "test" | "publish") {
  const flow = await getFlow(id)
  if (!flow) {
    return undefined
  }

  const result = await sendChatbotFlowWebhook(flow, mode)
  if (!result.ok) {
    await updateFlow(id, { n8nSyncStatus: "error" })
    throw new Error(result.error ?? "Falha ao acionar o webhook do n8n.")
  }

  const patch = mode === "test" ? buildTestPatch(flow, result.data) : buildPublishPatch(result.data)
  return updateFlow(id, patch)
}

export async function runFlowTest(id: number) {
  return runWebhookSync(id, "test")
}

export async function publishFlow(id: number) {
  return runWebhookSync(id, "publish")
}

export async function listAgents() {
  return loadAgentRows()
}

export async function createAgent(agent: Omit<AgentEntry, "id">) {
  const client = getSupabaseAdminClient()

  if (!client) {
    const newAgent = {
      id: nextAgentId,
      ...agent,
    }

    nextAgentId += 1
    memoryAgents = [cloneJson(newAgent), ...memoryAgents]
    return cloneJson(newAgent)
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
    const fallbackAgent = { ...row }
    memoryAgents = [fallbackAgent, ...memoryAgents]
    return fallbackAgent
  }

  return normalizeAgentRow(data ?? row)
}
