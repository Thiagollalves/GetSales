import type { Conversation } from "@/lib/mock-data"

export type PipelineStageId = "novos" | "qualificacao" | "proposta" | "negociacao" | "fechamento"

export interface PipelineLead {
  id: string
  name: string
  company: string
  value: number
  channel: Conversation["channel"]
  lastContact: string
  score: number
  avatar: string
  sourceConversationId?: number
}

export interface PipelineStage {
  id: string
  title: string
  color: string
  bgGradient: string
  leads: PipelineLead[]
}

export interface PipelineStageOption {
  id: PipelineStageId
  label: string
}

export const PIPELINE_STORAGE_KEY = "getsales_pipeline_stages"

export const PIPELINE_STAGE_OPTIONS: PipelineStageOption[] = [
  { id: "novos", label: "Novos Leads" },
  { id: "qualificacao", label: "Qualificação" },
  { id: "proposta", label: "Proposta Enviada" },
  { id: "negociacao", label: "Negociação" },
  { id: "fechamento", label: "Fechamento" },
]

const DEFAULT_PIPELINE_STAGE_SEED: PipelineStage[] = [
  {
    id: "novos",
    title: "Novos Leads",
    color: "bg-blue-500",
    bgGradient: "from-blue-500/10",
    leads: [
      {
        id: "1",
        name: "Maria Silva",
        company: "Tech Solutions",
        value: 15000,
        channel: "whatsapp",
        lastContact: "Hoje",
        score: 85,
        avatar: "MS",
      },
      {
        id: "2",
        name: "João Santos",
        company: "Digital Corp",
        value: 8500,
        channel: "instagram",
        lastContact: "Ontem",
        score: 62,
        avatar: "JS",
      },
      {
        id: "3",
        name: "Ana Costa",
        company: "Startup XYZ",
        value: 25000,
        channel: "email",
        lastContact: "2 dias",
        score: 78,
        avatar: "AC",
      },
    ],
  },
  {
    id: "qualificacao",
    title: "Qualificação",
    color: "bg-amber-500",
    bgGradient: "from-amber-500/10",
    leads: [
      {
        id: "4",
        name: "Carlos Oliveira",
        company: "Mega Retail",
        value: 45000,
        channel: "telegram",
        lastContact: "Hoje",
        score: 90,
        avatar: "CO",
      },
      {
        id: "5",
        name: "Fernanda Lima",
        company: "Service Plus",
        value: 12000,
        channel: "whatsapp",
        lastContact: "3 dias",
        score: 55,
        avatar: "FL",
      },
    ],
  },
  {
    id: "proposta",
    title: "Proposta Enviada",
    color: "bg-purple-500",
    bgGradient: "from-purple-500/10",
    leads: [
      {
        id: "6",
        name: "Ricardo Mendes",
        company: "Global Industries",
        value: 120000,
        channel: "email",
        lastContact: "Ontem",
        score: 92,
        avatar: "RM",
      },
    ],
  },
  {
    id: "negociacao",
    title: "Negociação",
    color: "bg-orange-500",
    bgGradient: "from-orange-500/10",
    leads: [
      {
        id: "7",
        name: "Patricia Souza",
        company: "Enterprise Co",
        value: 85000,
        channel: "whatsapp",
        lastContact: "Hoje",
        score: 88,
        avatar: "PS",
      },
      {
        id: "8",
        name: "Lucas Ferreira",
        company: "Innovation Hub",
        value: 32000,
        channel: "telegram",
        lastContact: "Hoje",
        score: 75,
        avatar: "LF",
      },
    ],
  },
  {
    id: "fechamento",
    title: "Fechamento",
    color: "bg-primary",
    bgGradient: "from-primary/10",
    leads: [
      {
        id: "9",
        name: "Mariana Rocha",
        company: "Alpha Business",
        value: 95000,
        channel: "email",
        lastContact: "Hoje",
        score: 98,
        avatar: "MR",
      },
    ],
  },
]

function cloneLead(lead: PipelineLead): PipelineLead {
  return { ...lead }
}

function cloneStage(stage: PipelineStage): PipelineStage {
  return {
    ...stage,
    leads: stage.leads.map(cloneLead),
  }
}

function normalizeInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function createDefaultPipelineStages() {
  return DEFAULT_PIPELINE_STAGE_SEED.map(cloneStage)
}

export function normalizePipelineStageId(candidate: string | null | undefined): PipelineStageId | null {
  const normalized = candidate?.trim()
  if (!normalized) return null

  const matchedOption = PIPELINE_STAGE_OPTIONS.find(
    (option) =>
      option.id === normalized ||
      option.label.toLowerCase() === normalized.toLowerCase(),
  )

  return matchedOption?.id ?? null
}

export function getPipelineStageLabel(candidate: string | null | undefined) {
  const stageId = normalizePipelineStageId(candidate)
  if (!stageId) return candidate?.trim() ?? ""

  return PIPELINE_STAGE_OPTIONS.find((option) => option.id === stageId)?.label ?? candidate?.trim() ?? ""
}

export function buildPipelineLeadFromConversation(conversation: Conversation): PipelineLead {
  return {
    id: `conversation-${conversation.id}`,
    name: conversation.name,
    company: conversation.assignee || "Contato da inbox",
    value: Math.max(1000, conversation.score * 1000),
    channel: conversation.channel,
    lastContact: conversation.time || "Agora",
    score: conversation.score,
    avatar: conversation.avatar || normalizeInitials(conversation.name),
    sourceConversationId: conversation.id,
  }
}

export function syncConversationIntoPipelineStages(
  stages: PipelineStage[],
  conversation: Conversation,
) {
  const normalizedStageId = normalizePipelineStageId(conversation.pipeline)
  const withoutConversation = stages.map((stage) => ({
    ...stage,
    leads: stage.leads.filter((lead) => lead.sourceConversationId !== conversation.id),
  }))

  if (!normalizedStageId) {
    return withoutConversation
  }

  const targetIndex = withoutConversation.findIndex((stage) => stage.id === normalizedStageId)
  if (targetIndex === -1) {
    return withoutConversation
  }

  const nextLead = buildPipelineLeadFromConversation(conversation)

  return withoutConversation.map((stage, index) =>
    index === targetIndex
      ? {
          ...stage,
          leads: [nextLead, ...stage.leads],
        }
      : stage,
  )
}

export function syncConversationsToPipelineStorage(conversations: Conversation[]) {
  if (typeof window === "undefined") return

  const currentStages = loadPipelineStagesFromStorage()
  const nextStages = conversations.reduce((stages, conversation) => {
    return syncConversationIntoPipelineStages(stages, conversation)
  }, currentStages)

  savePipelineStagesToStorage(nextStages)
}

export function syncConversationToPipelineStorage(conversation: Conversation) {
  if (typeof window === "undefined") return

  const currentStages = loadPipelineStagesFromStorage()
  const nextStages = syncConversationIntoPipelineStages(currentStages, conversation)

  savePipelineStagesToStorage(nextStages)
}

export function updateInboxConversationPipeline(conversationId: number, pipeline: string | null | undefined) {
  if (typeof window === "undefined") return

  const stored = window.localStorage.getItem("inbox_conversations")
  if (!stored) return

  try {
    const conversations = JSON.parse(stored) as Conversation[]
    const normalizedStageId = normalizePipelineStageId(pipeline)

    const nextConversations = conversations.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            pipeline: normalizedStageId ?? undefined,
          }
        : conversation,
    )

    window.localStorage.setItem("inbox_conversations", JSON.stringify(nextConversations))
  } catch {
    // Ignore malformed storage content.
  }
}

function getDerivedPriorityFromScore(score: number) {
  if (score >= 80) return "high"
  if (score >= 50) return "medium"
  return "low"
}

export function syncInboxConversationFromPipelineLead(
  lead: PipelineLead,
  pipeline: string | null | undefined,
) {
  if (typeof window === "undefined" || lead.sourceConversationId == null) return

  const stored = window.localStorage.getItem("inbox_conversations")
  if (!stored) return

  try {
    const conversations = JSON.parse(stored) as Conversation[]
    const normalizedStageId = normalizePipelineStageId(pipeline)

    const nextConversations = conversations.map((conversation) =>
      conversation.id === lead.sourceConversationId
        ? {
            ...conversation,
            name: lead.name,
            avatar: lead.avatar,
            channel: lead.channel,
            score: lead.score,
            priority: getDerivedPriorityFromScore(lead.score),
            time: lead.lastContact,
            pipeline: normalizedStageId ?? pipeline ?? undefined,
          }
        : conversation,
    )

    window.localStorage.setItem("inbox_conversations", JSON.stringify(nextConversations))
  } catch {
    // Ignore malformed storage content.
  }
}

export function loadPipelineStagesFromStorage(fallback: PipelineStage[] = createDefaultPipelineStages()) {
  if (typeof window === "undefined") {
    return fallback.map(cloneStage)
  }

  const stored = window.localStorage.getItem(PIPELINE_STORAGE_KEY)
  if (!stored) {
    return fallback.map(cloneStage)
  }

  try {
    const parsed = JSON.parse(stored) as PipelineStage[]
    if (!Array.isArray(parsed)) {
      return fallback.map(cloneStage)
    }

    return parsed.map(cloneStage)
  } catch {
    return fallback.map(cloneStage)
  }
}

export function savePipelineStagesToStorage(stages: PipelineStage[]) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(stages))
}
