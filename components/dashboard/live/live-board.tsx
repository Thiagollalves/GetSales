"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SearchX } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LiveBoardGroupBy, LiveBoardModel, LiveBoardView } from "@/lib/live-board"
import { LiveLaneColumn } from "./live-lane-column"

interface LiveBoardProps {
  model: LiveBoardModel
  groupBy: LiveBoardGroupBy
  view: LiveBoardView
  onClearSearch?: () => void
}

export function LiveBoard({ model, groupBy, view, onClearSearch }: LiveBoardProps) {
  if (model.visibleCount === 0) {
    return (
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardContent className="flex min-h-[22rem] flex-col items-center justify-center px-4 py-10 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-base font-semibold text-foreground">Nenhum atendimento encontrado</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ajuste a busca ou troque a aba para voltar a ver as colunas ao vivo.
          </p>
          {onClearSearch ? (
            <Button className="mt-4 rounded-full" variant="outline" onClick={onClearSearch}>
              Limpar busca
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn(view === "grid" ? "overflow-x-auto pb-2" : "space-y-4")}>
      <div className={cn(view === "grid" ? "flex gap-2" : "space-y-4")}>
        {model.lanes.map((lane) => (
          <LiveLaneColumn key={lane.id} lane={lane} groupBy={groupBy} view={view} />
        ))}
      </div>
    </div>
  )
}
