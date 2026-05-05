"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { MessagesSquare, PanelRightOpen, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/components/ui/use-mobile"
import { InternalChatList, type InternalConversationFilter } from "@/components/dashboard/internal-chat/internal-chat-list"
import { InternalChatWindow } from "@/components/dashboard/internal-chat/internal-chat-window"
import { InternalChatInspector } from "@/components/dashboard/internal-chat/internal-chat-inspector"
import { InternalChatCreateDialog, type InternalConversationDraft } from "@/components/dashboard/internal-chat/internal-chat-create-dialog"
import {
  CURRENT_INTERNAL_USER_ID,
  INTERNAL_CHAT_STORAGE_KEY,
  buildInternalChatUrl,
  createInitialInternalChatState,
  createLeadContextConversation,
  hydrateInternalConversation,
  loadInternalChatState,
  saveInternalChatState,
  teamMembers,
  type InternalConversation,
  type InternalLeadContextInput,
  type InternalMessage,
  type InternalAttachment,
} from "@/lib/internal-chat"

function getLeadContext(searchParams: ReturnType<typeof useSearchParams>): InternalLeadContextInput | null {
  const leadId = searchParams.get("leadId")
  const leadName = searchParams.get("leadName")
  if (!leadId || !leadName) return null

  return {
    leadId,
    leadName,
    leadChannel: searchParams.get("leadChannel") as InternalLeadContextInput["leadChannel"] | null ?? undefined,
    leadAssignee: searchParams.get("leadAssignee") ?? undefined,
    leadPipeline: searchParams.get("leadPipeline") ?? undefined,
  }
}

function getConversationSearchValue(conversation: InternalConversation) {
  const memberNames = conversation.memberIds
    .map((memberId) => teamMembers.find((member) => member.id === memberId)?.name)
    .filter(Boolean)
    .join(" ")

  const messageContent = conversation.messages.map((message) => message.content).join(" ")
  return [conversation.name, conversation.description ?? "", memberNames, messageContent].join(" ").toLowerCase()
}

export default function InternalChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState(createInitialInternalChatState())
  const [activeFilter, setActiveFilter] = useState<InternalConversationFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")
  const [showInspector, setShowInspector] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [leadContextConversationId, setLeadContextConversationId] = useState<number | null>(null)

  const deferredSearch = useDeferredValue(searchQuery)
  const isMobile = useIsMobile()
  const leadContext = useMemo(() => getLeadContext(searchParams), [searchParams])
  const appliedLeadContextRef = useRef<string | null>(null)

  useEffect(() => {
    const stored = loadInternalChatState()
    setState(stored)
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    saveInternalChatState(state)
  }, [hasHydrated, state])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== INTERNAL_CHAT_STORAGE_KEY || !event.newValue) return

      try {
        const parsed = JSON.parse(event.newValue) as typeof state
        if (!Array.isArray(parsed.conversations)) return

        setState({
          conversations: parsed.conversations.map(hydrateInternalConversation),
          selectedConversationId: parsed.selectedConversationId ?? null,
        })
      } catch {
        console.warn("Failed to sync internal chat state")
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  useEffect(() => {
    if (!hasHydrated || !leadContext) return

    const contextKey = JSON.stringify(leadContext)
    if (appliedLeadContextRef.current === contextKey) return
    appliedLeadContextRef.current = contextKey

    let nextConversationId: number | null = null
    let wasExisting = false

    setState((previous) => {
      const existing = previous.conversations.find((conversation) => conversation.relatedLeadId === String(leadContext.leadId))
      if (existing) {
        nextConversationId = existing.id
        wasExisting = true
        return { ...previous, selectedConversationId: existing.id }
      }

      const conversation = createLeadContextConversation(leadContext)
      nextConversationId = conversation.id
      return {
        conversations: [conversation, ...previous.conversations],
        selectedConversationId: conversation.id,
      }
    })

    if (nextConversationId !== null) {
      setLeadContextConversationId(nextConversationId)
      setMobileView("chat")
      if (isMobile) {
        setShowInspector(false)
      }
      if (!wasExisting) {
        toast.success("Contexto do lead carregado no chat interno.")
      }
    }
  }, [hasHydrated, leadContext])

  useEffect(() => {
    setShowInspector(!isMobile)
  }, [isMobile])

  const selectedConversation = useMemo(
    () => state.conversations.find((conversation) => conversation.id === state.selectedConversationId) ?? null,
    [state.conversations, state.selectedConversationId],
  )

  useEffect(() => {
    if (selectedConversation) {
      return
    }

    if (state.conversations[0]) {
      setState((previous) => ({ ...previous, selectedConversationId: previous.conversations[0].id }))
    }
  }, [selectedConversation, state.conversations])

  const filteredConversations = useMemo(() => {
    const search = deferredSearch.trim().toLowerCase()

    return state.conversations.filter((conversation) => {
      const matchesSearch = !search || getConversationSearchValue(conversation).includes(search)
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "mentions"
            ? conversation.messages.some((message) => message.mentions?.includes(CURRENT_INTERNAL_USER_ID))
            : activeFilter === "pinned"
              ? conversation.pinned || conversation.messages.some((message) => message.pinned)
              : activeFilter === "direct"
                ? conversation.type === "dm"
                : conversation.type === "group" || conversation.type === "channel"

      return matchesSearch && matchesFilter
    })
  }, [activeFilter, deferredSearch, state.conversations])

  const tabCounts = useMemo(() => {
    const mentions = state.conversations.filter((conversation) =>
      conversation.messages.some((message) => message.mentions?.includes(CURRENT_INTERNAL_USER_ID)),
    ).length
    const pinned = state.conversations.filter((conversation) => conversation.pinned || conversation.messages.some((message) => message.pinned)).length
    const direct = state.conversations.filter((conversation) => conversation.type === "dm").length
    const groups = state.conversations.filter((conversation) => conversation.type === "group" || conversation.type === "channel").length

    return {
      all: state.conversations.length,
      direct,
      groups,
      mentions,
      pinned,
    }
  }, [state.conversations])

  const updateConversation = useCallback(
    (conversationId: number, updater: (conversation: InternalConversation) => InternalConversation) => {
      setState((previous) => ({
        ...previous,
        conversations: previous.conversations.map((conversation) =>
          conversation.id === conversationId ? updater(conversation) : conversation,
        ),
      }))
    },
    [],
  )

  const handleSelectConversation = useCallback((conversation: InternalConversation) => {
    setState((previous) => ({
      ...previous,
      selectedConversationId: conversation.id,
      conversations: previous.conversations.map((item) =>
        item.id === conversation.id ? { ...item, unreadCount: 0 } : item,
      ),
    }))
    setMobileView("chat")
    setShowInspector(false)
  }, [])

  const handleCreateConversation = useCallback((draft: InternalConversationDraft) => {
    setState((previous) => {
      const name = draft.name.trim() || `${draft.type === "dm" ? "Direto" : draft.type === "channel" ? "Canal" : "Grupo"} ${previous.conversations.length + 1}`
      const avatar = name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
      const nextConversation: InternalConversation = {
        id: Date.now(),
        type: draft.type,
        name,
        description: draft.description.trim() || "Conversa interna",
        avatar,
        memberIds: draft.memberIds.length > 0 ? draft.memberIds : [CURRENT_INTERNAL_USER_ID],
        lastMessage: draft.message.trim() || "Nova conversa criada",
        lastMessageAt: "Agora",
        unreadCount: 0,
        muted: false,
        pinned: false,
        messages: draft.message.trim()
          ? [
              {
                id: Date.now() + 1,
                authorId: CURRENT_INTERNAL_USER_ID,
                content: draft.message.trim(),
                createdAt: new Date().toISOString(),
                time: "Agora",
              },
            ]
          : [],
      }

      toast.success("Conversa interna criada.")
      setMobileView("chat")
      return {
        conversations: [nextConversation, ...previous.conversations],
        selectedConversationId: nextConversation.id,
      }
    })
  }, [])

  const handleSendMessage = useCallback(
    ({ text, replyToId, attachment, mentionIds }: { text: string; replyToId?: number; attachment?: InternalAttachment; mentionIds?: number[] }) => {
      if (!selectedConversation) return

      const nextMessage: InternalMessage = {
        id: Date.now(),
        authorId: CURRENT_INTERNAL_USER_ID,
        content: text || attachment?.name || "Mensagem",
        createdAt: new Date().toISOString(),
        time: "Agora",
        replyToId,
        mentions: mentionIds,
        attachments: attachment ? [attachment] : undefined,
      }

      updateConversation(selectedConversation.id, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, nextMessage],
        lastMessage: nextMessage.content,
        lastMessageAt: "Agora",
        unreadCount: 0,
        typingMemberIds: [],
      }))
    },
    [selectedConversation, updateConversation],
  )

  const handleTogglePinConversation = useCallback(() => {
    if (!selectedConversation) return
    updateConversation(selectedConversation.id, (conversation) => ({ ...conversation, pinned: !conversation.pinned }))
  }, [selectedConversation, updateConversation])

  const handleToggleMuteConversation = useCallback(() => {
    if (!selectedConversation) return
    updateConversation(selectedConversation.id, (conversation) => ({ ...conversation, muted: !conversation.muted }))
  }, [selectedConversation, updateConversation])

  const handlePinMessage = useCallback(
    (messageId: number) => {
      if (!selectedConversation) return
      updateConversation(selectedConversation.id, (conversation) => {
        const nextMessages = conversation.messages.map((message) =>
          message.id === messageId ? { ...message, pinned: !message.pinned } : message,
        )
        return {
          ...conversation,
          messages: nextMessages,
          pinned: nextMessages.some((message) => message.pinned),
        }
      })
    },
    [selectedConversation, updateConversation],
  )

  const handleReactToMessage = useCallback(
    (messageId: number, emoji: string) => {
      if (!selectedConversation) return
      updateConversation(selectedConversation.id, (conversation) => {
        const nextMessages = conversation.messages.map((message) => {
          if (message.id !== messageId) return message
          const reactions = [...(message.reactions ?? [])]
          const existing = reactions.find((reaction) => reaction.emoji === emoji)

          if (existing) {
            const hasReaction = existing.userIds.includes(CURRENT_INTERNAL_USER_ID)
            return {
              ...message,
              reactions: reactions
                .map((reaction) =>
                  reaction.emoji === emoji
                    ? {
                        ...reaction,
                        userIds: hasReaction
                          ? reaction.userIds.filter((userId) => userId !== CURRENT_INTERNAL_USER_ID)
                          : [...reaction.userIds, CURRENT_INTERNAL_USER_ID],
                      }
                    : reaction,
                )
                .filter((reaction) => reaction.userIds.length > 0),
            }
          }

          return {
            ...message,
            reactions: [...reactions, { emoji, userIds: [CURRENT_INTERNAL_USER_ID] }],
          }
        })

        return { ...conversation, messages: nextMessages }
      })
    },
    [selectedConversation, updateConversation],
  )

  useEffect(() => {
    if (!state.conversations.length) return
    if (!state.selectedConversationId) {
      setState((previous) => ({ ...previous, selectedConversationId: previous.conversations[0]?.id ?? null }))
    }
  }, [state.conversations.length, state.selectedConversationId])

  useEffect(() => {
    if (!leadContextConversationId || isMobile) return
    if (state.selectedConversationId !== leadContextConversationId) return
    setShowInspector(true)
  }, [isMobile, leadContextConversationId, state.selectedConversationId])

  const openLeadContext = useCallback(() => {
    if (!selectedConversation?.relatedLeadId) return
    router.push(buildInternalChatUrl({
      leadId: selectedConversation.relatedLeadId,
      leadName: selectedConversation.relatedLeadName ?? selectedConversation.name,
      leadChannel: selectedConversation.relatedLeadChannel,
      leadAssignee: selectedConversation.relatedLeadAssignee,
      leadPipeline: selectedConversation.relatedLeadPipeline,
    }))
  }, [router, selectedConversation])

  const pageHeading = "Chat interno"
  const pageSubtitle = "Mensagens, menções, arquivos e contexto do time em uma única superfície."

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1800px] flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Comunicação da equipe</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{pageHeading}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full bg-transparent" onClick={() => setIsCreateOpen(true)}>
            <MessagesSquare className="mr-2 h-4 w-4" />
            Nova conversa
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-transparent lg:hidden" onClick={() => setShowInspector((value) => !value)}>
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)_minmax(21rem,24rem)]">
        <div className={`${mobileView === "list" ? "block" : "hidden"} min-h-0 xl:block`}>
          <InternalChatList
            conversations={filteredConversations}
            selectedId={state.selectedConversationId}
            onSelect={handleSelectConversation}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onCreateConversation={() => setIsCreateOpen(true)}
            onOpenFilters={() =>
              toast("Filtros do chat interno", {
                description: "Busca, abas e menções já funcionam na fila principal.",
              })
            }
            counts={tabCounts}
          />
        </div>

        <div className={`${mobileView === "chat" ? "block" : "hidden"} min-h-0 xl:block`}>
          <InternalChatWindow
            conversation={selectedConversation}
            members={teamMembers}
            currentUserId={CURRENT_INTERNAL_USER_ID}
            onBackToList={() => setMobileView("list")}
            onToggleInspector={() => setShowInspector((value) => !value)}
            onSendMessage={handleSendMessage}
            onTogglePinConversation={handleTogglePinConversation}
            onToggleMuteConversation={handleToggleMuteConversation}
            onOpenLeadContext={selectedConversation?.relatedLeadId ? openLeadContext : undefined}
            onPinMessage={handlePinMessage}
            onReactToMessage={handleReactToMessage}
            isInspectorOpen={showInspector}
          />
        </div>

        <div className={`hidden min-h-0 xl:block ${showInspector ? "block" : "hidden"}`}>
          <InternalChatInspector conversation={selectedConversation} members={teamMembers} onOpenLeadContext={selectedConversation?.relatedLeadId ? openLeadContext : undefined} />
        </div>
      </div>

      <Drawer open={showInspector && Boolean(selectedConversation) && isMobile} onOpenChange={setShowInspector}>
        <DrawerContent className="max-h-[90vh] rounded-t-[28px] border-border/60 bg-background p-0">
          <DrawerHeader className="border-b border-border/60 px-4 py-4">
            <DrawerTitle>Inspector interno</DrawerTitle>
            <DrawerDescription>Contexto da conversa, membros, arquivos e threads.</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <InternalChatInspector conversation={selectedConversation} members={teamMembers} onOpenLeadContext={selectedConversation?.relatedLeadId ? openLeadContext : undefined} />
          </div>
        </DrawerContent>
      </Drawer>

      <InternalChatCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        members={teamMembers}
        currentUserId={CURRENT_INTERNAL_USER_ID}
        onCreate={handleCreateConversation}
      />
    </div>
  )
}
