"use client"

import type { Conversation } from "@/lib/mock-data"
import type { InboxFilter, InboxTab } from "@/lib/inbox"
import {
  getConversationPriority,
  getConversationStatusLabel,
  getInboxTabLabel,
  getPriorityLabel,
  getPriorityTone,
} from "@/lib/inbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, MessageCircleMore, NotebookPen, Plus, Search } from "lucide-react"

const filterChips: Array<{ id: InboxFilter; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "com-notas", label: "Com notas" },
  { id: "alta-prioridade", label: "Alta prioridade" },
  { id: "sem-resposta", label: "Sem resposta" },
]

const channelColors: Record<string, string> = {
  whatsapp: "bg-green-500",
  instagram: "bg-gradient-to-tr from-purple-500 to-pink-500",
  telegram: "bg-blue-500",
  email: "bg-gray-500",
  webchat: "bg-primary",
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: number | null
  onSelect: (conversation: Conversation) => void
  activeTab: InboxTab
  onTabChange: (tab: InboxTab) => void
  tabCounts: Record<InboxTab, number>
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  activeFilter: InboxFilter
  onFilterChange: (filter: InboxFilter) => void
  onCreateConversation: () => void
  onResetFilters: () => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  activeTab,
  onTabChange,
  tabCounts,
  searchQuery,
  onSearchQueryChange,
  activeFilter,
  onFilterChange,
  onCreateConversation,
  onResetFilters,
}: ConversationListProps) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,246,239,0.9))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="border-b border-border/60 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Fila</p>
            <h2 className="text-lg font-semibold text-foreground">Atendimentos</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onResetFilters}
              title="Limpar filtros"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9 rounded-full shadow-sm shadow-primary/10"
              onClick={onCreateConversation}
              title="Nova conversa"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-[20px] bg-muted/40 p-1.5">
          {(Object.keys(tabCounts) as InboxTab[]).map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={`rounded-[16px] px-3 py-2 text-left transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                }`}
              >
                <span className="block text-[10px] font-semibold uppercase tracking-[0.28em]">
                  {getInboxTabLabel(tab)}
                </span>
                <span className="mt-1 flex items-center gap-2 text-sm">
                  <span className="text-lg font-semibold">{tabCounts[tab]}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Buscar contato, tag ou responsável"
              className="h-11 rounded-2xl border-border/70 bg-background/80 pl-10 pr-3 text-sm shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterChips.map((chip) => {
              const isActive = activeFilter === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onFilterChange(chip.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/60 bg-background/70 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex h-full min-h-[20rem] flex-col items-center justify-center rounded-[24px] border border-dashed border-border/70 bg-background/60 px-6 text-center">
            <MessageCircleMore className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm font-semibold text-foreground">Nenhuma conversa encontrada</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Ajuste a busca ou os filtros para voltar a enxergar a fila.
            </p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={onResetFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isSelected = selectedId === conversation.id
              const priority = getConversationPriority(conversation)
              const noteCount = conversation.internalNotes?.length ?? 0

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation)}
                  className={`group relative flex w-full items-start gap-3 rounded-[22px] border p-3 text-left transition-all ${
                    isSelected
                      ? "border-primary/25 bg-primary/6 shadow-[0_12px_30px_-24px_rgba(16,185,129,0.7)]"
                      : "border-transparent bg-transparent hover:border-border/60 hover:bg-background/80"
                  }`}
                >
                  {isSelected ? <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-primary" /> : null}

                  <div className="relative shrink-0 pt-0.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-foreground">
                      {conversation.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ${channelColors[conversation.channel]} border-2 border-background`}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">{conversation.name}</span>
                          {conversation.unread ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-sm shadow-primary/30" />
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {conversation.assignee ?? "Sem responsável"} • {conversation.time}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getPriorityTone(priority)} className="rounded-full px-2 py-0.5 text-[11px]">
                          {getPriorityLabel(priority)}
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px]">
                          {getConversationStatusLabel(conversation)}
                        </Badge>
                      </div>
                    </div>

                    <p className={`line-clamp-2 text-sm leading-5 ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                      {conversation.lastMessage}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px] font-medium">
                        Score {conversation.score}
                      </Badge>
                      {noteCount > 0 ? (
                        <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px] font-medium">
                          <NotebookPen className="mr-1 h-3 w-3" />
                          {noteCount} nota{noteCount > 1 ? "s" : ""}
                        </Badge>
                      ) : null}
                      {conversation.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full px-2 py-0.5 text-[11px] font-medium">
                          {tag}
                        </Badge>
                      ))}
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
