import type { Conversation } from "@/lib/mock-data"

export type InternalConversationType = "dm" | "group" | "channel"
export type InternalPresence = "online" | "away" | "busy" | "offline"

export interface InternalReaction {
  emoji: string
  userIds: number[]
}

export interface InternalAttachment {
  id: number
  type: "image" | "video" | "audio" | "file"
  name: string
  url?: string
  sizeLabel?: string
}

export interface InternalMessage {
  id: number
  authorId: number
  content: string
  createdAt: string
  time: string
  replyToId?: number
  mentions?: number[]
  attachments?: InternalAttachment[]
  reactions?: InternalReaction[]
  pinned?: boolean
}

export interface TeamMember {
  id: number
  name: string
  role: string
  avatar: string
  presence: InternalPresence
  title?: string
}

export interface InternalConversation {
  id: number
  type: InternalConversationType
  name: string
  description?: string
  avatar: string
  memberIds: number[]
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  muted: boolean
  pinned: boolean
  typingMemberIds?: number[]
  relatedLeadId?: string
  relatedLeadName?: string
  relatedLeadChannel?: Conversation["channel"]
  relatedLeadAssignee?: string
  relatedLeadPipeline?: string
  messages: InternalMessage[]
}

export interface InternalChatState {
  conversations: InternalConversation[]
  selectedConversationId: number | null
}

export interface InternalLeadContextInput {
  leadId: string | number
  leadName: string
  leadChannel?: Conversation["channel"]
  leadAssignee?: string
  leadPipeline?: string
}

export const CURRENT_INTERNAL_USER_ID = 1
export const INTERNAL_CHAT_STORAGE_KEY = "getsales_internal_chat_state"

export const teamMembers: TeamMember[] = [
  { id: 1, name: "Ana Souza", role: "Operações", title: "Coordenação", avatar: "AS", presence: "online" },
  { id: 2, name: "Camila Rocha", role: "Comercial", title: "Vendas", avatar: "CR", presence: "busy" },
  { id: 3, name: "Marcos Vann", role: "Produto", title: "Growth", avatar: "MV", presence: "online" },
  { id: 4, name: "Pedro Lima", role: "Suporte", title: "Nível 2", avatar: "PL", presence: "away" },
  { id: 5, name: "Luiza Costa", role: "Customer Success", title: "CS", avatar: "LC", presence: "offline" },
  { id: 6, name: "Thiago Alves", role: "Direção", title: "Founder", avatar: "TA", presence: "online" },
]

function createReaction(emoji: string, userIds: number[]): InternalReaction {
  return { emoji, userIds }
}

function createMessage(message: InternalMessage): InternalMessage {
  return {
    ...message,
    mentions: message.mentions ? [...message.mentions] : undefined,
    attachments: message.attachments ? message.attachments.map((attachment) => ({ ...attachment })) : undefined,
    reactions: message.reactions ? message.reactions.map((reaction) => ({ ...reaction, userIds: [...reaction.userIds] })) : undefined,
  }
}

function createConversation(conversation: InternalConversation): InternalConversation {
  return {
    ...conversation,
    memberIds: [...conversation.memberIds],
    typingMemberIds: conversation.typingMemberIds ? [...conversation.typingMemberIds] : undefined,
    messages: conversation.messages.map(createMessage),
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function getTeamMember(memberId: number | undefined) {
  if (!memberId) return undefined
  return teamMembers.find((member) => member.id === memberId)
}

export function getConversationTypeLabel(type: InternalConversationType) {
  switch (type) {
    case "dm":
      return "Direto"
    case "group":
      return "Grupo"
    case "channel":
      return "Canal"
    default:
      return "Chat"
  }
}

export function getPresenceLabel(presence: InternalPresence) {
  switch (presence) {
    case "online":
      return "Online"
    case "away":
      return "Ausente"
    case "busy":
      return "Ocupado"
    default:
      return "Offline"
  }
}

export function buildInternalChatUrl(context: InternalLeadContextInput) {
  const params = new URLSearchParams()
  params.set("leadId", String(context.leadId))
  params.set("leadName", context.leadName)
  if (context.leadChannel) {
    params.set("leadChannel", context.leadChannel)
  }
  if (context.leadAssignee) {
    params.set("leadAssignee", context.leadAssignee)
  }
  if (context.leadPipeline) {
    params.set("leadPipeline", context.leadPipeline)
  }
  return `/dashboard/chat-interno?${params.toString()}`
}

export function createLeadContextConversation(context: InternalLeadContextInput) {
  const assigneeMember = teamMembers.find((member) => member.name === context.leadAssignee)
  const seedMembers = [CURRENT_INTERNAL_USER_ID, assigneeMember?.id ?? 2]

  const name = `Lead • ${context.leadName}`
  return createConversation({
    id: Number(`${Date.now()}`),
    type: "group",
    name,
    description: `Discussão interna sobre ${context.leadName}`,
    avatar: initials(name),
    memberIds: Array.from(new Set(seedMembers)),
    lastMessage: `Contexto aberto para ${context.leadName}.`,
    lastMessageAt: "Agora",
    unreadCount: 0,
    muted: false,
    pinned: true,
    relatedLeadId: String(context.leadId),
    relatedLeadName: context.leadName,
    relatedLeadChannel: context.leadChannel,
    relatedLeadAssignee: context.leadAssignee,
    relatedLeadPipeline: context.leadPipeline,
    typingMemberIds: [assigneeMember?.id ?? 2],
    messages: [
      createMessage({
        id: 1,
        authorId: CURRENT_INTERNAL_USER_ID,
        content: `Contexto carregado da lead ${context.leadName}.`,
        createdAt: new Date().toISOString(),
        time: "Agora",
        pinned: true,
      }),
      createMessage({
        id: 2,
        authorId: assigneeMember?.id ?? 2,
        content: "Vou acompanhar os próximos passos por aqui.",
        createdAt: new Date().toISOString(),
        time: "Agora",
        mentions: [CURRENT_INTERNAL_USER_ID],
        reactions: [createReaction("👍", [CURRENT_INTERNAL_USER_ID])],
      }),
    ],
  })
}

export function createDefaultInternalConversations() {
  return [
    createConversation({
      id: 901,
      type: "group",
      name: "Operação Comercial",
      description: "Sincronização diária do funil e dos leads quentes",
      avatar: "OC",
      memberIds: [1, 2, 3, 6],
      lastMessage: "Compartilhei o resumo do lead do Thiago no canal.",
      lastMessageAt: "10:42",
      unreadCount: 2,
      muted: false,
      pinned: true,
      typingMemberIds: [2],
      messages: [
        createMessage({
          id: 11,
          authorId: 2,
          content: "Vamos priorizar o lead do Thiago Alves hoje?",
          createdAt: "2026-05-05T09:40:00.000Z",
          time: "09:40",
          mentions: [1, 3],
          reactions: [createReaction("👀", [1])],
        }),
        createMessage({
          id: 12,
          authorId: 1,
          content: "Sim. Vou abrir o contexto e atualizar o funil ainda nesta manhã.",
          createdAt: "2026-05-05T09:42:00.000Z",
          time: "09:42",
          replyToId: 11,
          reactions: [createReaction("✅", [2, 3])],
        }),
        createMessage({
          id: 13,
          authorId: 3,
          content: "Perfeito, já deixei o resumo no histórico do lead.",
          createdAt: "2026-05-05T10:42:00.000Z",
          time: "10:42",
          attachments: [
            { id: 1, type: "file", name: "resumo-lead-thiago.pdf", sizeLabel: "1.2 MB" },
          ],
        }),
      ],
    }),
    createConversation({
      id: 902,
      type: "dm",
      name: "Camila Rocha",
      description: "Alinhamento rápido sobre propostas",
      avatar: "CR",
      memberIds: [1, 2],
      lastMessage: "Pode me chamar quando o follow-up estiver pronto.",
      lastMessageAt: "09:18",
      unreadCount: 0,
      muted: false,
      pinned: false,
      messages: [
        createMessage({
          id: 21,
          authorId: 2,
          content: "Fechou. Vou revisar os próximos leads antes do almoço.",
          createdAt: "2026-05-05T08:51:00.000Z",
          time: "08:51",
          reactions: [createReaction("🙏", [1])],
        }),
        createMessage({
          id: 22,
          authorId: 1,
          content: "Te aviso quando subir a versão final do roteiro.",
          createdAt: "2026-05-05T09:18:00.000Z",
          time: "09:18",
          replyToId: 21,
        }),
      ],
    }),
    createConversation({
      id: 903,
      type: "channel",
      name: "# Alertas da Operação",
      description: "Avisos do sistema e ocorrências do dia",
      avatar: "AL",
      memberIds: [1, 2, 3, 4, 5, 6],
      lastMessage: "Webhook do WhatsApp validado com sucesso.",
      lastMessageAt: "Agora",
      unreadCount: 1,
      muted: false,
      pinned: false,
      messages: [
        createMessage({
          id: 31,
          authorId: 4,
          content: "Webhook do WhatsApp validado com sucesso.",
          createdAt: "2026-05-05T10:52:00.000Z",
          time: "Agora",
          mentions: [1],
        }),
      ],
    }),
    createConversation({
      id: 904,
      type: "group",
      name: "Lead • Thiago Alves",
      description: "Contexto interno do atendimento Thiago Alves",
      avatar: "TA",
      memberIds: [1, 2, 3],
      lastMessage: "Agendamento discutido com o time.",
      lastMessageAt: "14:02",
      unreadCount: 0,
      muted: false,
      pinned: true,
      relatedLeadId: "101",
      relatedLeadName: "Thiago Alves",
      relatedLeadChannel: "whatsapp",
      relatedLeadAssignee: "Ana Souza",
      relatedLeadPipeline: "Qualificação",
      messages: [
        createMessage({
          id: 41,
          authorId: 3,
          content: "Preparei o contexto da lead e deixei o resumo na conversa interna.",
          createdAt: "2026-05-05T13:41:00.000Z",
          time: "13:41",
          pinned: true,
        }),
        createMessage({
          id: 42,
          authorId: 1,
          content: "Ótimo. Vou atualizar o time sobre a prioridade e o próximo contato.",
          createdAt: "2026-05-05T14:02:00.000Z",
          time: "14:02",
          replyToId: 41,
          reactions: [createReaction("🔥", [2])],
        }),
      ],
    }),
  ] satisfies InternalConversation[]
}

export function createInitialInternalChatState(): InternalChatState {
  const conversations = createDefaultInternalConversations()
  return {
    conversations,
    selectedConversationId: conversations[0]?.id ?? null,
  }
}

export function loadInternalChatState(fallback: InternalChatState = createInitialInternalChatState()) {
  if (typeof window === "undefined") {
    return fallback
  }

  const stored = window.localStorage.getItem(INTERNAL_CHAT_STORAGE_KEY)
  if (!stored) {
    return fallback
  }

  try {
    const parsed = JSON.parse(stored) as InternalChatState
    if (!Array.isArray(parsed.conversations)) {
      return fallback
    }

    return {
      conversations: parsed.conversations.map(createConversation),
      selectedConversationId: parsed.selectedConversationId ?? fallback.selectedConversationId ?? null,
    }
  } catch {
    return fallback
  }
}

export function saveInternalChatState(state: InternalChatState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(INTERNAL_CHAT_STORAGE_KEY, JSON.stringify(state))
}

export function hydrateInternalConversation(conversation: InternalConversation) {
  return createConversation(conversation)
}

export function conversationMatchesCurrentUserMention(conversation: InternalConversation, currentUserId = CURRENT_INTERNAL_USER_ID) {
  return conversation.messages.some((message) => message.mentions?.includes(currentUserId))
}

export function conversationHasPinnedMessages(conversation: InternalConversation) {
  return conversation.pinned || conversation.messages.some((message) => message.pinned)
}

export function conversationTypeLabel(type: InternalConversationType) {
  return getConversationTypeLabel(type)
}

export function conversationFileCount(conversation: InternalConversation) {
  return conversation.messages.reduce((count, message) => count + (message.attachments?.length ?? 0), 0)
}

