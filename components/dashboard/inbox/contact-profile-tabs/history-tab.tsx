"use client"

import { useMemo, useState } from "react"
import { CalendarDays, FileText, History, MessageSquareText, Phone, ShieldAlert } from "lucide-react"
import type { Conversation, LeadTimelineItem } from "@/lib/mock-data"

const historyFilters = [
  { id: "all", label: "Tudo" },
  { id: "ticket", label: "Ticket" },
  { id: "bloqueio", label: "Bloqueios" },
  { id: "ligacao", label: "Ligações" },
] as const

interface HistoryTabProps {
  conversation: Conversation
}

export function HistoryTab({ conversation }: HistoryTabProps) {
  const [historyFilter, setHistoryFilter] = useState<(typeof historyFilters)[number]["id"]>("all")

  const historyItems = useMemo(() => {
    const fromTimeline = (conversation.timeline ?? []).map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      description: item.description ?? "",
      time: item.time,
    }))

    const fromNotes = (conversation.internalNotes ?? []).map((note) => ({
      id: 1000 + note.id,
      kind: "nota" as const,
      title: "Nota interna",
      description: note.content,
      time: note.time,
    }))

    const fromMessages = conversation.messages.map((message, index) => ({
      id: 2000 + message.id + index,
      kind: "mensagem" as const,
      title:
        message.sender === "contact"
          ? "Mensagem do contato"
          : message.sender === "bot"
            ? "Resposta do bot"
            : "Mensagem do time",
      description: message.content,
      time: message.time,
    }))

    const items = [...fromTimeline, ...fromNotes, ...fromMessages]
    if (historyFilter === "all") {
      return items
    }

    return items.filter((item) => item.kind === historyFilter)
  }, [conversation.internalNotes, conversation.messages, conversation.timeline, historyFilter])

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Histórico</p>
            <h4 className="text-sm font-semibold text-foreground">Linha do tempo do atendimento</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {historyFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setHistoryFilter(filter.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  historyFilter === filter.id
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {historyItems.length > 0 ? (
            historyItems.map((item) => (
              <HistoryRow key={item.id} kind={item.kind} title={item.title} description={item.description} time={item.time} />
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-border/70 bg-background/60 p-6 text-center">
              <p className="text-sm font-medium text-foreground">Nada neste filtro</p>
              <p className="mt-1 text-sm text-muted-foreground">Selecione outro filtro para ver eventos do contato.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function HistoryRow({
  kind,
  title,
  description,
  time,
}: {
  kind: LeadTimelineItem["kind"] | "nota" | "mensagem"
  title: string
  description?: string
  time: string
}) {
  const Icon =
    kind === "ticket"
      ? FileText
      : kind === "bloqueio"
        ? ShieldAlert
        : kind === "ligacao"
          ? Phone
          : kind === "agendamento"
            ? CalendarDays
            : kind === "fechamento"
              ? ShieldAlert
          : kind === "nota"
            ? History
            : MessageSquareText

  return (
    <div className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
          </div>
          {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
      </div>
    </div>
  )
}
