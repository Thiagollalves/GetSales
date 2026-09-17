import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { canCancelCampaign, type CampaignDraftInput, type CampaignRecord, validateCampaignDraft } from "@/lib/campaigns-core"

const CAMPAIGN_TABLE = "campaigns"

interface CampaignRow {
  id: number | string
  name: string
  kind: CampaignRecord["kind"]
  connection_id: string
  connection_kind: CampaignRecord["connectionKind"]
  audience_tag: string
  audience_count: number
  template_id?: string | null
  schedule_at?: string | null
  status: CampaignRecord["status"]
  created_at?: string | null
  updated_at?: string | null
}

let memoryCampaigns: CampaignRecord[] = []
let nextCampaignId = 1

function cloneCampaign(campaign: CampaignRecord): CampaignRecord {
  return { ...campaign }
}

function toRecord(row: CampaignRow): CampaignRecord {
  return {
    id: Number(row.id),
    name: row.name,
    kind: row.kind,
    connectionId: row.connection_id,
    connectionKind: row.connection_kind,
    audienceTag: row.audience_tag,
    audienceCount: Number(row.audience_count),
    templateId: row.template_id ?? undefined,
    scheduleAt: row.schedule_at ?? undefined,
    status: row.status,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  }
}

export async function listCampaigns() {
  const client = getSupabaseAdminClient()
  if (!client) return memoryCampaigns.map(cloneCampaign)

  try {
    const { data, error } = await client.from(CAMPAIGN_TABLE).select("*").order("created_at", { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => toRecord(row as CampaignRow))
  } catch {
    return memoryCampaigns.map(cloneCampaign)
  }
}

export async function getCampaign(id: number) {
  const client = getSupabaseAdminClient()
  if (!client) {
    const campaign = memoryCampaigns.find((entry) => entry.id === id)
    return campaign ? cloneCampaign(campaign) : undefined
  }

  try {
    const { data, error } = await client.from(CAMPAIGN_TABLE).select("*").eq("id", id).maybeSingle()
    if (error) throw error
    return data ? toRecord(data as CampaignRow) : undefined
  } catch {
    const campaign = memoryCampaigns.find((entry) => entry.id === id)
    return campaign ? cloneCampaign(campaign) : undefined
  }
}

export async function createCampaign(input: Partial<CampaignDraftInput>) {
  const validation = validateCampaignDraft(input)
  if (!validation.ok) return validation

  const timestamp = new Date().toISOString()
  const client = getSupabaseAdminClient()
  const localCampaign: CampaignRecord = {
    id: nextCampaignId,
    ...validation.value,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  if (!client) {
    nextCampaignId += 1
    memoryCampaigns = [cloneCampaign(localCampaign), ...memoryCampaigns]
    return { ok: true as const, value: cloneCampaign(localCampaign) }
  }

  try {
    const { data, error } = await client
      .from(CAMPAIGN_TABLE)
      .insert({
        name: localCampaign.name,
        kind: localCampaign.kind,
        connection_id: localCampaign.connectionId,
        connection_kind: localCampaign.connectionKind,
        audience_tag: localCampaign.audienceTag,
        audience_count: localCampaign.audienceCount,
        template_id: localCampaign.templateId ?? null,
        schedule_at: localCampaign.scheduleAt ?? null,
        status: localCampaign.status,
      })
      .select("*")
      .single()
    if (error) throw error
    return { ok: true as const, value: toRecord(data as CampaignRow) }
  } catch {
    nextCampaignId += 1
    memoryCampaigns = [cloneCampaign(localCampaign), ...memoryCampaigns]
    return { ok: true as const, value: cloneCampaign(localCampaign) }
  }
}

export async function cancelCampaign(id: number) {
  const existing = await getCampaign(id)
  if (!existing || !canCancelCampaign(existing.status)) return undefined

  const updatedAt = new Date().toISOString()
  const client = getSupabaseAdminClient()
  if (!client) {
    const cancelled = { ...existing, status: "CANCELLED" as const, updatedAt }
    memoryCampaigns = memoryCampaigns.map((campaign) => (campaign.id === id ? cancelled : campaign))
    return cancelled
  }

  try {
    const { data, error } = await client
      .from(CAMPAIGN_TABLE)
      .update({ status: "CANCELLED", updated_at: updatedAt })
      .eq("id", id)
      .select("*")
      .maybeSingle()
    if (error) throw error
    return data ? toRecord(data as CampaignRow) : undefined
  } catch {
    const cancelled = { ...existing, status: "CANCELLED" as const, updatedAt }
    memoryCampaigns = memoryCampaigns.map((campaign) => (campaign.id === id ? cancelled : campaign))
    return cancelled
  }
}

export function resetCampaignStoreForTests() {
  memoryCampaigns = []
  nextCampaignId = 1
}
