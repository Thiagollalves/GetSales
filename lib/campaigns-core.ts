export type CampaignKind = "official" | "personalized"
export type CampaignConnectionKind = "official" | "whatsmeow"
export type CampaignStatus = "DRAFT" | "SCHEDULED" | "CANCELLED"

export interface CampaignDraftInput {
  name: string
  kind: CampaignKind
  connectionId: string
  connectionKind: CampaignConnectionKind
  audienceTag: string
  audienceCount: number
  templateId?: string
  scheduleAt?: string
}

export interface CampaignRecord {
  id: number
  name: string
  kind: CampaignKind
  connectionId: string
  connectionKind: CampaignConnectionKind
  audienceTag: string
  audienceCount: number
  templateId?: string
  scheduleAt?: string
  status: CampaignStatus
  createdAt: string
  updatedAt: string
}

export interface CampaignValidationFailure {
  ok: false
  errors: string[]
}

export interface CampaignValidationSuccess {
  ok: true
  value: Omit<CampaignRecord, "id" | "createdAt" | "updatedAt">
}

export type CampaignValidationResult = CampaignValidationFailure | CampaignValidationSuccess

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseSchedule(value: unknown) {
  const scheduleAt = cleanText(value)
  if (!scheduleAt) return undefined

  const parsed = new Date(scheduleAt)
  if (Number.isNaN(parsed.valueOf())) return null
  return parsed.toISOString()
}

function isCampaignKind(value: unknown): value is CampaignKind {
  return value === "official" || value === "personalized"
}

function isConnectionKind(value: unknown): value is CampaignConnectionKind {
  return value === "official" || value === "whatsmeow"
}

/**
 * Validates the campaign before it reaches persistence. Deliberately no sending
 * transition exists in this MVP: creation produces only a draft or schedule.
 */
export function validateCampaignDraft(input: Partial<CampaignDraftInput>): CampaignValidationResult {
  const name = cleanText(input.name)
  const connectionId = cleanText(input.connectionId)
  const audienceTag = cleanText(input.audienceTag) || "all"
  const templateId = cleanText(input.templateId) || undefined
  const audienceCount = Number(input.audienceCount)
  const scheduleAt = parseSchedule(input.scheduleAt)
  const errors: string[] = []

  if (name.length < 3 || name.length > 120) {
    errors.push("O nome da campanha deve ter entre 3 e 120 caracteres.")
  }
  if (!isCampaignKind(input.kind)) {
    errors.push("Tipo de campanha inválido.")
  }
  if (!connectionId || !isConnectionKind(input.connectionKind)) {
    errors.push("Selecione uma conexão válida.")
  }
  const connectionMatchesCampaign =
    (input.kind === "official" && input.connectionKind === "official") ||
    (input.kind === "personalized" && input.connectionKind === "whatsmeow")
  if (isCampaignKind(input.kind) && isConnectionKind(input.connectionKind) && !connectionMatchesCampaign) {
    errors.push("A conexão selecionada não é compatível com o tipo da campanha.")
  }
  if (!Number.isInteger(audienceCount) || audienceCount < 1) {
    errors.push("A campanha precisa ter pelo menos um contato no público.")
  }
  if (input.kind === "official" && !templateId) {
    errors.push("Campanhas oficiais exigem um template aprovado.")
  }
  if (scheduleAt === null) {
    errors.push("Data de agendamento inválida.")
  }

  if (errors.length > 0 || !isCampaignKind(input.kind) || !isConnectionKind(input.connectionKind)) {
    return { ok: false, errors }
  }

  const scheduledForFuture = scheduleAt && new Date(scheduleAt).valueOf() > Date.now()
  return {
    ok: true,
    value: {
      name,
      kind: input.kind,
      connectionId,
      connectionKind: input.connectionKind,
      audienceTag,
      audienceCount,
      templateId,
      scheduleAt: scheduleAt ?? undefined,
      status: scheduledForFuture ? "SCHEDULED" : "DRAFT",
    },
  }
}

export function canCancelCampaign(status: CampaignStatus) {
  return status === "DRAFT" || status === "SCHEDULED"
}
