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
import {
  CheckCircle2,
  CircleHelp,
  Filter,
  MessageCircleMore,
  NotebookPen,
  Plus,
  Search,
} from "lucide-react"

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

const tabMeta: Record<
  InboxTab,
  {
    icon: typeof MessageCircleMore
  }
> = {
  ativos: { icon: MessageCircleMore },
  pendentes: { icon: CircleHelp },
  fechados: { icon: CheckCircle2 },
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
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,246,239,0.9))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur sm:rounded-[28px]">
      <div className="border-b border-border/60 p-2.5 sm:p-4">
        <div className="mb-4 hidden items-start justify-between gap-3 md:flex">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Fila</p>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">Atendimentos</h2>
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

        <div className="grid grid-cols-3 gap-2 rounded-[18px] bg-muted/35 p-1.5 shadow-sm ring-1 ring-border/60 sm:gap-2 sm:rounded-[20px]">
          {(Object.keys(tabCounts) as InboxTab[]).map((tab) => {
            const isActive = activeTab === tab
            const Icon = tabMeta[tab].icon
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={`relative flex min-h-[4.5rem] flex-col items-center justify-center rounded-[16px] px-2 py-2.5 text-center transition-all sm:min-h-[5rem] sm:px-3 ${
                  isActive
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                }`}
              >
                <span
                  className={`absolute right-2 top-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white ${
                    isActive ? "bg-primary" : "bg-destructive"
                  }`}
                >
                  {tabCounts[tab]}
                </span>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? "text-primary" : ""}`} />
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-[11px] sm:tracking-[0.28em]">
                  {getInboxTabLabel(tab)}
                </span>
                <span className={`mt-0.5 h-0.5 w-12 rounded-full ${isActive ? "bg-primary" : "bg-transparent"}`} />
              </button>
            )
          })}
        </div>

        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
              onClick={onResetFilters}
              title="Limpar filtros"
            >
              <Filter className="h-4 w-4" />
            </Button>

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Buscar contato, tag ou responsável"
                className="h-10 rounded-2xl border-border/70 bg-background/80 pl-10 pr-3 text-sm shadow-sm sm:h-11"
              />
            </div>

            <Button
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full shadow-sm shadow-primary/10"
              onClick={onCreateConversation}
              title="Nova conversa"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {filterChips.map((chip) => {
              const isActive = activeFilter === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onFilterChange(chip.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
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

      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-2.5">
        {conversations.length === 0 ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center rounded-[22px] border border-dashed border-border/70 bg-background/60 px-4 text-center sm:min-h-[20rem] sm:px-6">
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
                  className={`group relative flex w-full items-start gap-3 rounded-[20px] border p-2.5 text-left transition-all sm:rounded-[22px] sm:p-3 ${
                    isSelected
                      ? "border-primary/25 bg-primary/6 shadow-[0_12px_30px_-24px_rgba(16,185,129,0.7)]"
                      : "border-transparent bg-transparent hover:border-border/60 hover:bg-background/80"
                  }`}
                >
                  {isSelected ? <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-primary" /> : null}

                  <div className="relative shrink-0 pt-0.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-foreground sm:h-11 sm:w-11">
                      {conversation.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ${channelColors[conversation.channel]} border-2 border-background`}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">{conversation.name}</span>
                          {conversation.unread ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-sm shadow-primary/30" />
                          ) : null}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:line-clamp-2">
                          {conversation.assignee ?? "Sem responsável"} • {conversation.time}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 text-right sm:hidden">
                        <span className="text-[11px] font-semibold text-foreground">{conversation.time}</span>
                        <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[10px] text-muted-foreground">
                          #{conversation.id}
                        </span>
                      </div>

                      <div className="hidden flex-col items-end gap-1 sm:flex">
                        <Badge variant={getPriorityTone(priority)} className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px]">
                          {getPriorityLabel(priority)}
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px]">
                          {getConversationStatusLabel(conversation)}
                        </Badge>
                      </div>
                    </div>

                    <p className={`line-clamp-1 text-[13px] leading-5 sm:line-clamp-2 sm:text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                      {conversation.lastMessage}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-flex sm:text-[11px]"
                      >
                        Score {conversation.score}
                      </Badge>
                      {noteCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-flex sm:text-[11px]"
                        >
                          <NotebookPen className="mr-1 h-3 w-3" />
                          {noteCount} nota{noteCount > 1 ? "s" : ""}
                        </Badge>
                      ) : null}
                      {conversation.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-[11px]"
                        >
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
