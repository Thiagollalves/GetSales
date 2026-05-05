export type AgentStatus = "Ativo" | "Em teste" | "Pausado"

export interface FlowEntry {
  id: number
  name: string
  trigger: string
  active: boolean
  conversations: number
  lastTestScore?: number
  lastTestStatus?: string
}

export interface FlowCreation {
  name: string
  trigger: string
  active: boolean
  conversations: number
}

export interface FlowPatch {
  name?: string
  trigger?: string
  active?: boolean
  conversations?: number
  lastTestScore?: number
  lastTestStatus?: string
}

export interface AgentEntry {
  id: number
  name: string
  channel: string
  focus: string
  status: AgentStatus
}

export const initialFlows: FlowEntry[] = [
  {
    id: 1,
    name: "Boas-vindas WhatsApp",
    trigger: "Primeira Mensagem",
    active: true,
    conversations: 1240,
    lastTestScore: 92,
    lastTestStatus: "Excelente",
  },
  {
    id: 2,
    name: "Triagem Suporte",
    trigger: "Palavra-chave: 'Suporte'",
    active: true,
    conversations: 532,
    lastTestScore: 78,
    lastTestStatus: "Satisfatório",
  },
  {
    id: 3,
    name: "Agendador de Demo",
    trigger: "Palavra-chave: 'Demo'",
    active: false,
    conversations: 89,
    lastTestScore: 65,
    lastTestStatus: "Precisa melhorar",
  },
]

export const initialAgents: AgentEntry[] = [
  {
    id: 1,
    name: "Assistente Comercial",
    channel: "WhatsApp",
    focus: "Qualificar leads e encaminhar para vendas",
    status: "Ativo",
  },
]

export const cloneFlows = (flows: FlowEntry[] = initialFlows) => flows.map((flow) => ({ ...flow }))

export const cloneAgents = (agents: AgentEntry[] = initialAgents) => agents.map((agent) => ({ ...agent }))

export function buildFlowTestOutcome(id: number) {
  const normalizedId = Math.abs(Math.trunc(id))
  const score = 60 + ((normalizedId * 13) % 40)
  const status = score >= 85 ? "Excelente" : score >= 70 ? "Satisfatório" : "Precisa melhorar"

  return {
    score,
    status,
  }
}
