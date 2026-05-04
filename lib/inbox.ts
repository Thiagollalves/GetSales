import type { Conversation, ConversationPriority } from "@/lib/mock-data"

export type InboxTab = "ativos" | "pendentes" | "fechados"

export type InboxFilter = "todos" | "com-notas" | "alta-prioridade" | "sem-resposta"

export function getInboxTab(conversation: Conversation): InboxTab {
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
