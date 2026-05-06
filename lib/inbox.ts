import type { Conversation, ConversationPriority } from "@/lib/mock-data"

export type InboxTab = "ativos" | "grupos" | "pendentes" | "fechados"

export type InboxTabCountTone = "neutral" | "success" | "warning" | "danger"

export type InboxFilter = "todos" | "com-notas" | "alta-prioridade" | "sem-resposta"

export interface InboxDrawerFilters {
  departmentQuery: string
  leadStatus: "all" | Conversation["status"]
  tagQuery: string
  onlyUnread: boolean
  onlyWithNotes: boolean
  onlyBotFlow: boolean
}

export function getInboxTabCountTone(count: number): InboxTabCountTone {
  if (count <= 0) {
    return "neutral"
  }

  if (count < 10) {
    return "success"
  }

  if (count < 50) {
    return "warning"
  }

  return "danger"
}

export function getInboxTab(conversation: Conversation): InboxTab {
  if (conversation.channel === "whatsapp" && conversation.isGroup) {
    return "grupos"
  }

  switch (conversation.status) {
    case "resolvido":
      return "fechados"
    case "novo":
      return "pendentes"
    default:
      return "ativos"
  }
}

export function getConversationPriority(conversation: Conversation): ConversationPriority {
  if (conversation.priority) {
    return conversation.priority
  }

  if (conversation.score >= 80) {
    return "high"
  }

  if (conversation.score >= 50) {
    return "medium"
  }

  return "low"
}

export function getPriorityLabel(priority: ConversationPriority) {
  switch (priority) {
    case "high":
      return "Alta prioridade"
    case "medium":
      return "Prioridade média"
    default:
      return "Prioridade baixa"
  }
}

export function getPriorityTone(priority: ConversationPriority) {
  switch (priority) {
    case "high":
      return "destructive"
    case "medium":
      return "secondary"
    default:
      return "outline"
  }
}

export function getInboxTabLabel(tab: InboxTab) {
  switch (tab) {
    case "ativos":
      return "Ativos"
    case "grupos":
      return "Grupos"
    case "pendentes":
      return "Pendentes"
    case "fechados":
      return "Fechados"
  }
}

export function getConversationStatusLabel(conversation: Conversation) {
  switch (conversation.status) {
    case "resolvido":
      return "Fechado"
    case "novo":
      return "Pendente"
    default:
      return "Ativo"
  }
}

export function matchesInboxSearch(conversation: Conversation, searchQuery: string) {
  const query = searchQuery.trim().toLowerCase()
  if (!query) {
    return true
  }

  const haystack = [
    conversation.name,
    conversation.lastMessage,
    conversation.assignee ?? "",
    conversation.department ?? "",
    conversation.email ?? "",
    conversation.location ?? "",
    conversation.customerSince ?? "",
    conversation.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

export function matchesInboxFilter(conversation: Conversation, filter: InboxFilter) {
  switch (filter) {
    case "com-notas":
      return (conversation.internalNotes?.length ?? 0) > 0
    case "alta-prioridade":
      return getConversationPriority(conversation) === "high"
    case "sem-resposta":
      return conversation.unread
    default:
      return true
  }
}

export function matchesInboxDrawerFilters(conversation: Conversation, filters: InboxDrawerFilters) {
  const departmentQuery = filters.departmentQuery.trim().toLowerCase()
  const tagQuery = filters.tagQuery.trim().toLowerCase()

  if (filters.leadStatus !== "all" && conversation.status !== filters.leadStatus) {
    return false
  }

  if (departmentQuery && !(conversation.department ?? conversation.assignee ?? "").toLowerCase().includes(departmentQuery)) {
    return false
  }

  if (tagQuery && !conversation.tags.some((tag) => tag.toLowerCase().includes(tagQuery))) {
    return false
  }

  if (filters.onlyUnread && !conversation.unread) {
    return false
  }

  if (filters.onlyWithNotes && (conversation.internalNotes?.length ?? 0) === 0) {
    return false
  }

  if (filters.onlyBotFlow) {
    const hasBotMessage = conversation.messages.some((message) => message.sender === "bot")
    if (!hasBotMessage && conversation.channel !== "webchat") {
      return false
    }
  }

  return true
}
