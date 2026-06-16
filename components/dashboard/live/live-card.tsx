"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getConversationPriority,
  getConversationStatusLabel,
  getPriorityLabel,
  getPriorityTone,
} from "@/lib/inbox"
import type { Conversation } from "@/lib/mock-data"
import type { LiveBoardGroupBy, LiveBoardLaneTone, LiveBoardView } from "@/lib/live-board"

const channelLabels: Record<Conversation["channel"], string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "E-mail",
  webchat: "WebChat",
}

const channelAvatarClasses: Record<Conversation["channel"], string> = {
  whatsapp: "bg-emerald-500 text-white",
  instagram: "bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white",
  telegram: "bg-sky-500 text-white",
  email: "bg-slate-500 text-white",
  webchat: "bg-primary text-primary-foreground",
}

const laneToneBorderClasses: Record<LiveBoardLaneTone, string> = {
  amber: "border-amber-400/80",
  emerald: "border-emerald-500/80",
  sky: "border-sky-500/80",
  violet: "border-violet-500/80",
  rose: "border-rose-500/80",
  teal: "border-teal-500/80",
  slate: "border-slate-500/80",
}

const laneToneBarClasses: Record<LiveBoardLaneTone, string> = {
  amber: "bg-amber-400",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
  slate: "bg-slate-500",
}

function getSecondaryMeta(conversation: Conversation, groupBy: LiveBoardGroupBy) {
  const primaryMeta = groupBy === "department" ? conversation.assignee ?? "Sem responsável" : conversation.department ?? "Sem departamento"
  return `${primaryMeta} • ${channelLabels[conversation.channel]}`
}

interface LiveCardProps {
  conversation: Conversation
  groupBy: LiveBoardGroupBy
  tone: LiveBoardLaneTone
  view: LiveBoardView
}

export function LiveCard({ conversation, groupBy, tone, view }: LiveCardProps) {
  const priority = getConversationPriority(conversation)
  const priorityLabel = getPriorityLabel(priority)
  const priorityTone = getPriorityTone(priority)
  const secondaryMeta = getSecondaryMeta(conversation, groupBy)
  const chipLimit = view === "list" ? 1 : 2

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[18px] border border-border/60 bg-background/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        laneToneBorderClasses[tone],
        view === "list" ? "p-2.5" : "p-3",
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1 rounded-r-full", laneToneBarClasses[tone])} />

      <div className={cn("flex min-w-0 gap-3", view === "list" ? "items-start" : "items-start")}>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl text-xs font-semibold shadow-sm",
            view === "list" ? "h-9 w-9" : "h-10 w-10",
            channelAvatarClasses[conversation.channel],
          )}
        >
          {conversation.avatar}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn("truncate font-semibold text-foreground", view === "list" ? "text-[13px]" : "text-sm")}>
                  {conversation.name}
                </p>
                {conversation.unread ? <span className="h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/30" /> : null}
              </div>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{secondaryMeta}</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[11px] font-medium text-muted-foreground">{conversation.time}</p>
              <p className="text-[11px] text-muted-foreground/80">#{conversation.id}</p>
            </div>
          </div>

          <p
            className={cn(
              "break-words text-[13px] leading-5 text-muted-foreground",
              view === "grid" ? "line-clamp-2" : "line-clamp-1",
            )}
          >
            {conversation.lastMessage}
          </p>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-medium">
              Score {conversation.score}
            </Badge>
            <Badge variant={priorityTone} className="rounded-full px-2 py-0.5 text-[10px] font-medium">
              {priorityLabel}
            </Badge>
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] font-medium">
              {getConversationStatusLabel(conversation)}
            </Badge>
            {conversation.tags.slice(0, chipLimit).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
