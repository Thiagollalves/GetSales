"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { GitBranch, ArrowRight } from "lucide-react"

interface KanbanCard {
  id: string
  text: string
  value?: string
  trend?: string
}

interface KanbanColumn {
  id: string
  title: string
  color: string
  bgColor: string
  cards: KanbanCard[]
}

const initialColumns: KanbanColumn[] = [
  {
    id: "novos",
    title: "Novos leads",
    color: "bg-blue-500",
    bgColor: "from-blue-500/10 to-blue-500/5",
    cards: [
      { id: "1", text: "Campanha Instagram", value: "42 leads", trend: "+18%" },
      { id: "2", text: "Landing Ebook", value: "18 leads", trend: "+5%" },
    ],
  },
  {
    id: "qualificacao",
    title: "Qualificação",
    color: "bg-amber-500",
    bgColor: "from-amber-500/10 to-amber-500/5",
    cards: [
      { id: "3", text: "Score > 70", value: "12 leads", trend: "+22%" },
      { id: "4", text: "Bot qualificador", value: "Ativo" },
    ],
  },
  {
    id: "proposta",
    title: "Proposta enviada",
    color: "bg-purple-500",
    bgColor: "from-purple-500/10 to-purple-500/5",
    cards: [
      { id: "5", text: "Tempo médio", value: "2h 15m", trend: "-30%" },
      { id: "6", text: "Conversão", value: "38%" },
    ],
  },
  {
    id: "fechamento",
    title: "Fechamento",
    color: "bg-primary",
    bgColor: "from-primary/10 to-primary/5",
    cards: [
      { id: "7", text: "Receita projetada", value: "R$ 210k", trend: "+45%" },
      { id: "8", text: "Equipe 03", value: "92% SLA" },
    ],
  },
]

export function FunnelSection() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)
  const [draggingCard, setDraggingCard] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  const handleDragStart = (cardId: string) => {
    setDraggingCard(cardId)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDropTarget(columnId)
  }

  const handleDrop = (columnId: string) => {
    if (!draggingCard) return

    setColumns((prev) => {
      const newColumns = prev.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== draggingCard),
      }))

      const originalCard = prev.flatMap((col) => col.cards).find((card) => card.id === draggingCard)

      if (originalCard) {
        const targetColumnIndex = newColumns.findIndex((col) => col.id === columnId)
        if (targetColumnIndex !== -1) {
          newColumns[targetColumnIndex].cards.push(originalCard)
        }
      }

      return newColumns
    })

    setDraggingCard(null)
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    setDraggingCard(null)
    setDropTarget(null)
  }

  return (
    <section id="funil" className="scroll-mt-8">
      <Card className="p-8 border-0 bg-sidebar-bg text-sidebar-foreground overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <GitBranch className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Pipeline Visual</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-sidebar-foreground text-balance">
                Funil de vendas inteligente
              </h2>
              <p className="text-sidebar-muted mt-2 max-w-xl">
                Kanban drag-and-drop com métricas de conversão, TMA e produtividade por etapa.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-sidebar-foreground">486</p>
                <p className="text-xs text-sidebar-muted">Total de leads</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">R$ 210k</p>
                <p className="text-xs text-sidebar-muted">Receita projetada</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sidebar-foreground">38%</p>
                <p className="text-xs text-sidebar-muted">Conversão</p>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column, colIndex) => (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={() => handleDrop(column.id)}
                onDragLeave={() => setDropTarget(null)}
                className={`
                  rounded-xl p-4 transition-all duration-300 bg-gradient-to-b ${column.bgColor}
                  ${dropTarget === column.id ? "ring-2 ring-primary scale-[1.02]" : ""}
                `}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                  <h4 className="font-semibold text-sidebar-foreground text-sm">{column.title}</h4>
                  <span className="ml-auto text-xs text-sidebar-muted bg-sidebar-border/50 px-2 py-0.5 rounded-full">
                    {column.cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {column.cards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      onDragEnd={handleDragEnd}
                      className={`
                        bg-sidebar-bg/80 backdrop-blur-sm rounded-lg p-3 cursor-grab active:cursor-grabbing
                        border border-sidebar-border/50 transition-all duration-200
                        hover:border-sidebar-border hover:shadow-lg hover:shadow-black/10
                        ${draggingCard === card.id ? "opacity-50 scale-95 rotate-2" : ""}
                      `}
                    >
                      <p className="text-xs text-sidebar-muted mb-1">{card.text}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sidebar-foreground text-sm">{card.value}</span>
                        {card.trend && (
                          <span
                            className={`text-xs font-medium ${card.trend.startsWith("+") ? "text-primary" : "text-amber-500"}`}
                          >
                            {card.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Connection arrow */}
                {colIndex < columns.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10">
                    <ArrowRight className="h-5 w-5 text-sidebar-muted/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  )
}
