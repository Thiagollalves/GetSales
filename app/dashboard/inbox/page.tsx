"use client"

import { useCallback, useDeferredValue, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatWindow } from "@/components/dashboard/inbox/chat-window"
import { ContactProfile } from "@/components/dashboard/inbox/contact-profile"
import { InboxFiltersSheet, type InboxDrawerFilters } from "@/components/dashboard/inbox/inbox-filters-sheet"
import { ConversationList } from "@/components/dashboard/inbox/conversation-list"
import { NewConversationDialog, type NewConversationDraft } from "@/components/dashboard/inbox/new-conversation-dialog"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  initialConversations,
  type Attachment,
  type Conversation,
  type Message,
  type LeadTimelineItem,
} from "@/lib/mock-data"
import {
  getConversationPriority,
  getInboxTab,
  type InboxFilter,
  type InboxTab,
  matchesInboxDrawerFilters,
  matchesInboxFilter,
  matchesInboxSearch,
} from "@/lib/inbox"
import {
  syncConversationsToPipelineStorage,
  syncConversationToPipelineStorage,
} from "@/lib/pipeline-board"
import { buildInternalChatUrl } from "@/lib/internal-chat"
import { type LeadCloseTicketPayload, type LeadSchedulePayload } from "@/components/dashboard/inspector/lead-operational-modals"
import { toast } from "sonner"

export type { Conversation, Message, Attachment }

const priorityRank: Record<"low" | "medium" | "high", number> = {
  high: 0,
  medium: 1,
  low: 2,
}

function getDerivedPriority(score: number) {
  if (score >= 80) return "high"
  if (score >= 50) return "medium"
  return "low"
}

export default function InboxPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedId, setSelectedId] = useState<number | null>(initialConversations[0]?.id ?? null)
  const [activeTab, setActiveTab] = useState<InboxTab>("ativos")
  const [activeFilter, setActiveFilter] = useState<InboxFilter>("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")
  const [showInspector, setShowInspector] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [drawerFilters, setDrawerFilters] = useState<InboxDrawerFilters>({
    departmentQuery: "",
    leadStatus: "all",
    tagQuery: "",
    onlyUnread: false,
    onlyWithNotes: false,
    onlyBotFlow: false,
  })
  const [appliedDrawerFilters, setAppliedDrawerFilters] = useState<InboxDrawerFilters>({
    departmentQuery: "",
    leadStatus: "all",
    tagQuery: "",
    onlyUnread: false,
    onlyWithNotes: false,
    onlyBotFlow: false,
  })
  const [newChatCounter, setNewChatCounter] = useState(1)
  const [hasLoadedConversations, setHasLoadedConversations] = useState(false)
  const isMobile = useIsMobile()

  const deferredSearchQuery = useDeferredValue(searchQuery)

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) || null

  useEffect(() => {
    setShowInspector(!isMobile)
  }, [isMobile])

  useEffect(() => {
    const stored = localStorage.getItem("inbox_conversations")
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Conversation[]
        if (parsed.length > 0) {
          setConversations(parsed)
          setSelectedId((currentSelectedId) => {
            const existingConversation = parsed.find((conversation) => conversation.id === currentSelectedId)
            return existingConversation?.id ?? parsed[0].id
          })
        }
      } catch (error) {
        console.warn("Failed to load conversations", error)
      }
    }

    setHasLoadedConversations(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "inbox_conversations" || !event.newValue) return

      try {
        const parsed = JSON.parse(event.newValue) as Conversation[]
        if (parsed.length === 0) return

        setConversations(parsed)
        setSelectedId((currentSelectedId) => {
          const existingConversation = parsed.find((conversation) => conversation.id === currentSelectedId)
          return existingConversation?.id ?? parsed[0].id
        })
      } catch {
        console.warn("Failed to sync conversations from storage")
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  useEffect(() => {
    const handleOpenNewConversation = () => setIsNewConversationOpen(true)

    window.addEventListener("dashboard:new-conversation", handleOpenNewConversation as EventListener)
    return () =>
      window.removeEventListener("dashboard:new-conversation", handleOpenNewConversation as EventListener)
  }, [])

  useEffect(() => {
    localStorage.setItem("inbox_conversations", JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    if (!hasLoadedConversations) {
      return
    }

    syncConversationsToPipelineStorage(conversations)
  }, [conversations, hasLoadedConversations])

  useEffect(() => {
    if (selectedConversation) {
      return
    }

    if (conversations[0]) {
      setSelectedId(conversations[0].id)
    }
  }, [conversations, selectedConversation])

  const updateConversation = useCallback(
    (conversationId: number, updater: (conversation: Conversation) => Conversation) => {
      setConversations((previous) =>
        previous.map((conversation) => (conversation.id === conversationId ? updater(conversation) : conversation)),
      )
    },
    [],
  )

  const handleCreateConversation = useCallback(() => {
    setIsNewConversationOpen(true)
  }, [])

  const handleOpenInternalChat = useCallback(() => {
    if (!selectedConversation) return

    router.push(
      buildInternalChatUrl({
        leadId: selectedConversation.id,
        leadName: selectedConversation.name,
        leadChannel: selectedConversation.channel,
        leadAssignee: selectedConversation.assignee,
        leadPipeline: selectedConversation.pipeline,
      }),
    )
  }, [router, selectedConversation])

  const handleSubmitNewConversation = useCallback(
    (draft: NewConversationDraft) => {
      const counter = newChatCounter
      const name = draft.name.trim() || `Novo contato ${counter}`
      const avatar = name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
      const nextStatus = draft.status
      const nextPipeline = nextStatus === "resolvido" ? "fechamento" : nextStatus === "ativo" ? "qualificacao" : "novos"
      const nextMessage = draft.message.trim()

      const newConversation: Conversation = {
        id: Date.now(),
        name,
        avatar,
        channel: draft.channel,
        lastMessage: nextMessage || "Nova conversa iniciada",
        time: "Agora",
        unread: false,
        score: 50,
        priority: "medium",
        pipeline: nextPipeline,
        tags: draft.tags,
        department: draft.department,
        messages: nextMessage
          ? [
              {
                id: 1,
                content: nextMessage,
                sender: "agent",
                time: "Agora",
                status: "sent",
              },
            ]
          : [],
        status: nextStatus,
        assignee: draft.department || "Atendimento",
        phone: "",
        email: "",
        location: "",
        customerSince: "Agora",
        scheduledAt: undefined,
        scheduledTime: undefined,
        scheduledBy: undefined,
        scheduledMessage: undefined,
        closedReason: undefined,
        closedAt: undefined,
        internalNotes: [],
        customFields: [],
        media: [],
        botBindings: [],
        timeline: [],
      }

      setConversations((previous) => [newConversation, ...previous])
      setSelectedId(newConversation.id)
      setActiveTab(nextStatus === "resolvido" ? "fechados" : nextStatus === "novo" ? "pendentes" : "ativos")
      setMobileView("chat")
      setShowInspector(false)
      syncConversationToPipelineStorage(newConversation)
      setNewChatCounter((previous) => previous + 1)
      toast.success("Novo atendimento iniciado.")
    },
    [newChatCounter],
  )

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedId(conversation.id)
    setMobileView("chat")
    setShowInspector(false)
    if (getInboxTab(conversation) === "fechados") {
      setActiveTab("fechados")
    }
  }, [])

  const handleSendMessage = useCallback(
    async ({ text, attachment }: { text?: string; attachment?: Attachment }) => {
      if (!selectedConversation) return
      if (!text && !attachment) return

      const messageText = text ?? attachment?.name ?? ""

      const newMessage: Message = {
        id: Date.now(),
        content: text ?? "",
        sender: "agent",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
        attachment,
      }

      updateConversation(selectedConversation.id, (conversation) => {
        const nextMessages = [...conversation.messages, newMessage]

        return {
          ...conversation,
          messages: nextMessages,
          lastMessage: messageText || conversation.lastMessage,
          time: "Agora",
          unread: false,
        }
      })
      syncConversationToPipelineStorage({
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMessage],
        lastMessage: messageText || selectedConversation.lastMessage,
        time: "Agora",
        unread: false,
      })

      if (selectedConversation.channel === "whatsapp" && text) {
        const targetPhone = selectedConversation.phone

        if (targetPhone) {
          try {
            toast.promise(
              fetch("/api/whatsapp/send", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phone: targetPhone,
                  message: text ?? "",
                }),
              }).then(async (response) => {
                const data = await response.json().catch(() => null)
                if (!response.ok) {
                  const errorMessage =
                    response.status === 401
                      ? "Sua sessão expirou. Faça login novamente."
                      : data?.error || "Falha no envio API"
                  throw new Error(errorMessage)
                }
                return data
              }),
              {
                loading: "Enviando p/ WhatsApp...",
                success: "Enviado com sucesso!",
                error: "Erro ao enviar p/ API",
              },
            )
          } catch (error) {
            console.error("Failed to send", error)
          }
        }
      }
    },
    [selectedConversation, updateConversation],
  )

  const handleUpdateTags = useCallback(
    (conversationId: number, tags: string[]) => {
      updateConversation(conversationId, (conversation) => ({ ...conversation, tags }))
      if (selectedConversation?.id === conversationId) {
        syncConversationToPipelineStorage({ ...selectedConversation, tags })
      }
    },
    [selectedConversation, updateConversation],
  )

  const handleUpdateScore = useCallback(
    (conversationId: number, score: number) => {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        score,
        priority: getDerivedPriority(score),
      }))
      if (selectedConversation?.id === conversationId) {
        syncConversationToPipelineStorage({
          ...selectedConversation,
          score,
          priority: getDerivedPriority(score),
        })
      }
    },
    [selectedConversation, updateConversation],
  )

  const handleUpdateProfile = useCallback(
    (conversationId: number, updates: Partial<Conversation>) => {
      updateConversation(conversationId, (conversation) => {
        const nextName = updates.name ?? conversation.name
        const nextAvatar = nextName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()

        return { ...conversation, ...updates, avatar: nextAvatar }
      })

      if (selectedConversation?.id === conversationId) {
        const nextName = updates.name ?? selectedConversation.name
        const nextAvatar = nextName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()

        syncConversationToPipelineStorage({
          ...selectedConversation,
          ...updates,
          avatar: nextAvatar,
          tags: updates.tags ?? selectedConversation.tags,
          customFields: updates.customFields ?? selectedConversation.customFields,
          media: updates.media ?? selectedConversation.media,
          botBindings: updates.botBindings ?? selectedConversation.botBindings,
          timeline: updates.timeline ?? selectedConversation.timeline,
          internalNotes: updates.internalNotes ?? selectedConversation.internalNotes,
        })
      }
    },
    [selectedConversation, updateConversation],
  )

  const handleScheduleMeeting = useCallback(
    (conversationId: number, nextMeeting: LeadSchedulePayload) => {
      const scheduledMessage = nextMeeting.message.trim()
      const timelineItem: LeadTimelineItem = {
        id: Date.now(),
        kind: "agendamento",
        title: "Mensagem agendada",
        description: [
          scheduledMessage || "Mensagem agendada",
          nextMeeting.assignee,
          nextMeeting.time,
        ]
          .filter(Boolean)
          .join(" • "),
        time: nextMeeting.time || "Agora",
      }

      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        nextMeeting: nextMeeting.date,
        scheduledAt: nextMeeting.date,
        scheduledTime: nextMeeting.time,
        scheduledBy: nextMeeting.assignee,
        scheduledMessage,
        timeline: [...(conversation.timeline ?? []), timelineItem],
      }))
      if (selectedConversation?.id === conversationId) {
        syncConversationToPipelineStorage({
          ...selectedConversation,
          nextMeeting: nextMeeting.date,
          scheduledAt: nextMeeting.date,
          scheduledTime: nextMeeting.time,
          scheduledBy: nextMeeting.assignee,
          scheduledMessage,
          timeline: [...(selectedConversation.timeline ?? []), timelineItem],
        })
      }
    },
    [selectedConversation, updateConversation],
  )

  const handleCloseConversation = useCallback((payload: LeadCloseTicketPayload) => {
    if (!selectedConversation) return

    const closedAt = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    const timelineItem: LeadTimelineItem = {
      id: Date.now(),
      kind: "fechamento",
      title: "Ticket fechado",
      description: [payload.reason, payload.note.trim()].filter(Boolean).join(" • "),
      time: closedAt,
    }

    updateConversation(selectedConversation.id, (conversation) => ({
      ...conversation,
      status: "resolvido",
      unread: false,
      closedReason: payload.reason,
      closedAt,
      timeline: [...(conversation.timeline ?? []), timelineItem],
    }))
    syncConversationToPipelineStorage({
      ...selectedConversation,
      status: "resolvido",
      unread: false,
      closedReason: payload.reason,
      closedAt,
      timeline: [...(selectedConversation.timeline ?? []), timelineItem],
    })
    setActiveTab("fechados")
    toast.success("Atendimento fechado.")
  }, [selectedConversation, updateConversation])

  const handleReturnConversation = useCallback(() => {
    if (!selectedConversation) return

    updateConversation(selectedConversation.id, (conversation) => ({
      ...conversation,
      status: "ativo",
      unread: false,
      closedReason: undefined,
      closedAt: undefined,
    }))
    syncConversationToPipelineStorage({
      ...selectedConversation,
      status: "ativo",
      unread: false,
      closedReason: undefined,
      closedAt: undefined,
    })
    setActiveTab("ativos")
    toast.success("Atendimento retornado para ativos.")
  }, [selectedConversation, updateConversation])

  const handleTransferConversation = useCallback(() => {
    if (!selectedConversation || typeof window === "undefined") return

    const currentAssignee = selectedConversation.assignee ?? ""
    const nextAssignee = window.prompt("Transferir atendimento para:", currentAssignee)
    const trimmedAssignee = nextAssignee?.trim()

    if (!trimmedAssignee) return

    updateConversation(selectedConversation.id, (conversation) => ({
      ...conversation,
      assignee: trimmedAssignee,
      status: "ativo",
      unread: false,
    }))
    syncConversationToPipelineStorage({
      ...selectedConversation,
      assignee: trimmedAssignee,
      status: "ativo",
      unread: false,
    })
    setActiveTab("ativos")
    toast.success(`Atendimento transferido para ${trimmedAssignee}.`)
  }, [selectedConversation, updateConversation])

  const tabCounts = {
    ativos: conversations.filter((conversation) => getInboxTab(conversation) === "ativos").length,
    pendentes: conversations.filter((conversation) => getInboxTab(conversation) === "pendentes").length,
    fechados: conversations.filter((conversation) => getInboxTab(conversation) === "fechados").length,
  }

  const visibleConversations = conversations
    .filter((conversation) => getInboxTab(conversation) === activeTab)
    .filter((conversation) => matchesInboxFilter(conversation, activeFilter))
    .filter((conversation) => matchesInboxDrawerFilters(conversation, appliedDrawerFilters))
    .filter((conversation) => matchesInboxSearch(conversation, deferredSearchQuery))
    .sort((left, right) => {
      if (left.unread !== right.unread) {
        return left.unread ? -1 : 1
      }

      const leftPriority = priorityRank[getConversationPriority(left)]
      const rightPriority = priorityRank[getConversationPriority(right)]
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority
      }

      return right.score - left.score
    })

  const desktopGridColumns = showInspector
    ? "minmax(18rem,22rem) minmax(0,1fr) minmax(24rem,28rem)"
    : "minmax(18rem,22rem) minmax(0,1fr)"

  return (
    <div className="h-[calc(100dvh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(246,242,233,0.92)_40%,_rgba(239,234,224,0.96)_100%)] px-3 py-3 sm:px-4 lg:px-6 lg:py-4">
      <div className="mx-auto flex h-full w-full max-w-[1880px] min-h-0 flex-col">
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 xl:grid"
          style={{ gridTemplateColumns: desktopGridColumns }}
        >
          <div className={`${mobileView === "list" ? "flex" : "hidden"} min-h-0 xl:flex`}>
            <ConversationList
              conversations={visibleConversations}
              selectedId={selectedId}
              onSelect={handleSelectConversation}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabCounts={tabCounts}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onOpenFilters={() => setIsFiltersOpen(true)}
              onCreateConversation={handleCreateConversation}
            />
          </div>

          <div className={`${mobileView === "chat" ? "flex" : "hidden"} min-h-0 xl:flex`}>
            <ChatWindow
              conversation={selectedConversation}
              onBackToList={() => {
                setMobileView("list")
                setShowInspector(false)
              }}
              onToggleInspector={() => setShowInspector((previous) => !previous)}
              onSendMessage={handleSendMessage}
              onCloseConversation={handleCloseConversation}
              onReturnConversation={handleReturnConversation}
              onTransferConversation={handleTransferConversation}
              onCreateConversation={handleCreateConversation}
              onSearchConversation={() => toast("Busca na conversa", { description: "Filtro rápido vindo na próxima etapa." })}
              onOpenShortcuts={() => toast("Atalhos rápidos", { description: "O painel de atalhos já está priorizado na composição." })}
              onOpenInternalChat={handleOpenInternalChat}
              isInspectorOpen={showInspector}
            />
          </div>

          <div
            className={`${showInspector && selectedConversation ? "flex xl:flex" : "hidden xl:hidden"} min-h-0`}
          >
            {selectedConversation ? (
              <ContactProfile
                conversation={selectedConversation}
                onUpdateTags={handleUpdateTags}
                onUpdateScore={handleUpdateScore}
                onUpdateProfile={handleUpdateProfile}
                onScheduleMeeting={handleScheduleMeeting}
                onOpenInternalChat={handleOpenInternalChat}
                onCloseInspector={() => setShowInspector(false)}
              />
            ) : null}
          </div>
        </div>
      </div>

      {isMobile && showInspector && selectedConversation ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-foreground/45 backdrop-blur-sm" onClick={() => setShowInspector(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-[24rem] animate-slide-in-right p-3 sm:max-w-[28rem]">
            <ContactProfile
              conversation={selectedConversation}
              onUpdateTags={handleUpdateTags}
              onUpdateScore={handleUpdateScore}
              onUpdateProfile={handleUpdateProfile}
              onScheduleMeeting={handleScheduleMeeting}
              onOpenInternalChat={handleOpenInternalChat}
              onCloseInspector={() => setShowInspector(false)}
            />
          </div>
        </div>
      ) : null}

      <InboxFiltersSheet
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        value={drawerFilters}
        onApply={(nextFilters) => {
          setDrawerFilters(nextFilters)
          setAppliedDrawerFilters(nextFilters)
        }}
        onReset={() => {
          const resetFilters: InboxDrawerFilters = {
            departmentQuery: "",
            leadStatus: "all",
            tagQuery: "",
            onlyUnread: false,
            onlyWithNotes: false,
            onlyBotFlow: false,
          }
          setDrawerFilters(resetFilters)
          setAppliedDrawerFilters(resetFilters)
          setSearchQuery("")
          setActiveFilter("todos")
        }}
      />

      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        onCreate={handleSubmitNewConversation}
      />
    </div>
  )
}
