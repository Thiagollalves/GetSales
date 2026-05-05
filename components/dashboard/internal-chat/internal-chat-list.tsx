"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Hash, MessageSquareMore, Pin, Plus, Search } from "lucide-react"
import type { InternalConversation, InternalConversationType } from "@/lib/internal-chat"
import {
  conversationHasPinnedMessages,
  conversationMatchesCurrentUserMention,
  getConversationTypeLabel,
  getTeamMember,
} from "@/lib/internal-chat"

export type InternalConversationFilter = "all" | "direct" | "groups" | "mentions" | "pinned"

export interface InternalConversationCounts {
  all: number
  direct: number
  groups: number
  mentions: number
  pinned: number
}

interface InternalChatListProps {
  conversations: InternalConversation[] 
  selectedId: number | null
  onSelect: (conversation: InternalConversation) => void
  activeFilter: InternalConversationFilter
  onFilterChange: (filter: InternalConversationFilter) => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onOpenFilters?: () => void
  onCreateConversation: () => void
  counts: InternalConversationCounts
}

const filterTabs: Array<{ id: InternalConversationFilter; label: string }> = [
  { id: "all", label: "Tudo" },
  { id: "direct", label: "Diretos" },
  { id: "groups", label: "Grupos" },
  { id: "mentions", label: "Menções" },
  { id: "pinned", label: "Fixados" },
]

const typeColor: Record<InternalConversationType, string> = {
  dm: "bg-sky-500",
  group: "bg-violet-500",
  channel: "bg-emerald-500",
}

export function InternalChatList({
  conversations,
  selectedId,
  onSelect,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchQueryChange,
  onOpenFilters,
  onCreateConversation,
  counts,
}: InternalChatListProps) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,246,239,0.92))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur sm:rounded-[30px]">
      <div className="border-b border-border/60 px-3 py-3.5 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Comunicação interna</p>
            <h2 className="mt-1 text-base font-semibold text-foreground sm:text-lg">Equipe</h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenFilters ? (
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={onOpenFilters}>
                <Filter className="h-4 w-4" />
              </Button>
            ) : null}
            <Button size="icon" className="h-9 w-9 rounded-full shadow-sm shadow-primary/10" onClick={onCreateConversation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id
            const countValue = counts[tab.id]
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {countValue}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Buscar pessoas, canais ou mensagens"
              className="h-10 rounded-2xl border-border/70 bg-background/80 pl-10 pr-3 text-sm shadow-sm sm:h-11"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-background/80" onClick={onCreateConversation}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-2.5">
        {conversations.length === 0 ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center rounded-[24px] border border-dashed border-border/70 bg-background/60 px-4 text-center">
            <MessageSquareMore className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm font-semibold text-foreground">Nenhuma conversa interna encontrada</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Ajuste a busca ou crie uma nova conversa para organizar o time.
            </p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={onCreateConversation}>
              Nova conversa
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isSelected = selectedId === conversation.id
              const pinned = conversationHasPinnedMessages(conversation)
              const mention = conversationMatchesCurrentUserMention(conversation)
              const memberNames = conversation.memberIds
                .map((memberId) => getTeamMember(memberId)?.name)
                .filter(Boolean)
                .slice(0, 3)
              const typeLabel = getConversationTypeLabel(conversation.type)

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation)}
                  className={`group relative flex w-full items-start gap-3 rounded-[22px] border p-3 text-left transition-all ${
                    isSelected
                      ? "border-primary/30 bg-primary/8 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] ring-1 ring-primary/15"
                      : "border-border/60 bg-background/90 hover:border-border hover:bg-background"
                  }`}
                >
                  <span className={`absolute left-0 top-0 h-full w-1.5 rounded-l-[22px] ${typeColor[conversation.type]}`} />
                  <div className="relative ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-foreground">
                    {conversation.avatar}
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ${typeColor[conversation.type]} border-2 border-background`} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{conversation.name}</p>
                          {conversation.unreadCount > 0 ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                              {conversation.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{conversation.description ?? "Conversa sem descrição"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        <span className="text-[11px] text-muted-foreground">{conversation.lastMessageAt}</span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          {typeLabel}
                        </div>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-sm text-muted-foreground">{conversation.lastMessage}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge variant="outline" className="rounded-full px-2 py-1 text-[10px] font-medium">
                        {conversation.type === "dm" ? "1:1" : typeLabel}
                      </Badge>
                      {memberNames.length > 0 ? (
                        <Badge variant="secondary" className="rounded-full px-2 py-1 text-[10px] font-medium">
                          {memberNames.join(", ")}
                        </Badge>
                      ) : null}
                      {pinned ? (
                        <Badge variant="secondary" className="rounded-full px-2 py-1 text-[10px] font-medium">
                          <Pin className="mr-1 h-3 w-3" />
                          Fixado
                        </Badge>
                      ) : null}
                      {mention ? (
                        <Badge variant="secondary" className="rounded-full px-2 py-1 text-[10px] font-medium">
                          Menção
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
