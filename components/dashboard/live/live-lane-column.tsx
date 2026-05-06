"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LiveBoardGroupBy, LiveBoardLane, LiveBoardLaneTone, LiveBoardView } from "@/lib/live-board"
import { LiveCard } from "./live-card"

const laneToneUiClasses: Record<
  LiveBoardLaneTone,
  {
    dot: string
    badge: string
    border: string
  }
> = {
  amber: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-400/80",
  },
  emerald: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-500/80",
  },
  sky: {
    dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
    border: "border-sky-500/80",
  },
  violet: {
    dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700",
    border: "border-violet-500/80",
  },
  rose: {
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
    border: "border-rose-500/80",
  },
  teal: {
    dot: "bg-teal-500",
    badge: "bg-teal-100 text-teal-700",
    border: "border-teal-500/80",
  },
  slate: {
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700",
    border: "border-slate-500/80",
  },
}

interface LiveLaneColumnProps {
  lane: LiveBoardLane
  groupBy: LiveBoardGroupBy
  view: LiveBoardView
}

export function LiveLaneColumn({ lane, groupBy, view }: LiveLaneColumnProps) {
  const tone = laneToneUiClasses[lane.tone]
  const cardsLayoutClass = "space-y-2"

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 bg-card/90 shadow-sm",
        view === "grid" ? "w-[16rem] shrink-0 lg:w-[16rem]" : "w-full",
      )}
    >
      <CardHeader className={cn("space-y-0 border-t-4 px-3 py-3 sm:px-4", tone.border)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", tone.dot)} />
            <CardTitle className="truncate text-sm font-semibold text-foreground">{lane.label}</CardTitle>
          </div>
          <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", tone.badge)}>
            {lane.count}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 px-3 pb-3">
        {lane.items.length === 0 ? (
          <div className="flex min-h-[9rem] flex-col items-center justify-center rounded-[18px] border border-dashed border-border/70 bg-background/65 px-4 text-center">
            <p className="text-sm font-semibold text-foreground">Sem tickets</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {groupBy === "assignee"
                ? "Tente mudar para Departamentos ou limpar a busca."
                : "Tente mudar para Atendentes ou limpar a busca."}
            </p>
          </div>
        ) : (
          <div className={cardsLayoutClass}>
            {lane.items.map((conversation) => (
              <LiveCard key={conversation.id} conversation={conversation} groupBy={groupBy} tone={lane.tone} view={view} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
