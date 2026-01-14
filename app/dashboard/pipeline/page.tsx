"use client"

import type React from "react"
import { useState, useCallback, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Plus,
  MoreHorizontal,
  DollarSign,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  GripVertical,
  Search,
  Filter,
  Sparkles,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface Lead {
  id: string
  name: string
  company: string
  value: number
  channel: "whatsapp" | "instagram" | "telegram" | "email"
  lastContact: string
  score: number
  avatar: string
}

interface Stage {
  id: string
  title: string
  color: string
  bgGradient: string
  leads: Lead[]
}

const initialStages: Stage[] = [
  {
    id: "novos",
    title: "Novos Leads",
    color: "bg-blue-500",
    bgGradient: "from-blue-500/10",
    leads: [
      {
        id: "1",
        name: "Maria Silva",
        company: "Tech Solutions",
        value: 15000,
        channel: "whatsapp",
        lastContact: "Hoje",
        score: 85,
        avatar: "MS",
      },
      {
        id: "2",
        name: "João Santos",
        company: "Digital Corp",
        value: 8500,
        channel: "instagram",
        lastContact: "Ontem",
        score: 62,
        avatar: "JS",
      },
      {
        id: "3",
        name: "Ana Costa",
        company: "Startup XYZ",
        value: 25000,
        channel: "email",
        lastContact: "2 dias",
        score: 78,
        avatar: "AC",
      },
    ],
  },
  {
    id: "qualificacao",
    title: "Qualificação",
    color: "bg-amber-500",
    bgGradient: "from-amber-500/10",
    leads: [
      {
        id: "4",
        name: "Carlos Oliveira",
        company: "Mega Retail",
        value: 45000,
        channel: "telegram",
        lastContact: "Hoje",
        score: 90,
        avatar: "CO",
      },
      {
        id: "5",
        name: "Fernanda Lima",
        company: "Service Plus",
        value: 12000,
        channel: "whatsapp",
        lastContact: "3 dias",
        score: 55,
        avatar: "FL",
      },
    ],
  },
  {
    id: "proposta",
    title: "Proposta Enviada",
    color: "bg-purple-500",
    bgGradient: "from-purple-500/10",
    leads: [
      {
        id: "6",
        name: "Ricardo Mendes",
        company: "Global Industries",
        value: 120000,
        channel: "email",
        lastContact: "Ontem",
        score: 92,
        avatar: "RM",
      },
    ],
  },
  {
    id: "negociacao",
    title: "Negociação",
    color: "bg-orange-500",
    bgGradient: "from-orange-500/10",
    leads: [
      {
        id: "7",
        name: "Patricia Souza",
        company: "Enterprise Co",
        value: 85000,
        channel: "whatsapp",
        lastContact: "Hoje",
        score: 88,
        avatar: "PS",
      },
      {
        id: "8",
        name: "Lucas Ferreira",
        company: "Innovation Hub",
        value: 32000,
        channel: "telegram",
        lastContact: "Hoje",
        score: 75,
        avatar: "LF",
      },
    ],
  },
  {
    id: "fechamento",
    title: "Fechamento",
    color: "bg-primary",
    bgGradient: "from-primary/10",
    leads: [
      {
        id: "9",
        name: "Mariana Rocha",
        company: "Alpha Business",
        value: 95000,
        channel: "email",
        lastContact: "Hoje",
        score: 98,
        avatar: "MR",
      },
    ],
  },
]

const channelColors: Record<string, string> = {
  whatsapp: "bg-green-500",
  instagram: "bg-gradient-to-tr from-purple-500 to-pink-500",
  telegram: "bg-blue-500",
  email: "bg-gray-500",
}

function PipelineContent() {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [draggingLead, setDraggingLead] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  const handleDragStart = (leadId: string) => {
    setDraggingLead(leadId)
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDropTarget(stageId)
  }

  const handleDrop = useCallback(
    (targetStageId: string) => {
      if (!draggingLead) return

      setStages((prev) => {
        let leadToMove: Lead | null = null
        const newStages = prev.map((stage) => {
          const leadIndex = stage.leads.findIndex((l) => l.id === draggingLead)
          if (leadIndex !== -1) {
            leadToMove = stage.leads[leadIndex]
            return { ...stage, leads: stage.leads.filter((l) => l.id !== draggingLead) }
          }
          return stage
        })

        if (leadToMove) {
          return newStages.map((stage) => {
            if (stage.id === targetStageId) {
              return { ...stage, leads: [...stage.leads, leadToMove!] }
            }
            return stage
          })
        }
        return prev
      })

      setDraggingLead(null)
      setDropTarget(null)
    },
    [draggingLead],
  )

  const handleDragEnd = () => {
    setDraggingLead(null)
    setDropTarget(null)
  }

  const getTotalValue = (leads: Lead[]) => leads.reduce((sum, lead) => sum + lead.value, 0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value)

  const totalLeads = stages.reduce((sum, s) => sum + s.leads.length, 0)
  const totalValue = stages.reduce((sum, s) => sum + getTotalValue(s.leads), 0)

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border bg-card/50 backdrop-blur-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wide">Pipeline</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold">Pipeline de Vendas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalLeads} leads • {formatCurrency(totalValue)} em potencial
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar lead..." className="pl-9 w-64 bg-secondary/50" />
          </div>
          <Button variant="outline" size="icon" className="bg-secondary/50">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4 lg:p-6">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map((stage) => (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={() => handleDrop(stage.id)}
              onDragLeave={() => setDropTarget(null)}
              className={`
                w-80 flex flex-col rounded-xl transition-all duration-300
                bg-gradient-to-b ${stage.bgGradient} to-transparent
                ${dropTarget === stage.id ? "ring-2 ring-primary scale-[1.02]" : ""}
              `}
            >
              {/* Stage Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${stage.color} shadow-lg`} />
                  <h3 className="font-semibold text-sm">{stage.title}</h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-medium">
                    {stage.leads.length}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Editar etapa</DropdownMenuItem>
                    <DropdownMenuItem>Adicionar lead</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Excluir etapa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Stage Value */}
              <div className="px-4 pb-3">
                <p className="text-xs text-muted-foreground">
                  Total:{" "}
                  <span className="font-semibold text-foreground">{formatCurrency(getTotalValue(stage.leads))}</span>
                </p>
              </div>

              {/* Leads */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                {stage.leads.map((lead) => (
                  <Card
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      p-4 cursor-grab active:cursor-grabbing transition-all duration-200
                      border border-border/50 bg-card/80 backdrop-blur-sm
                      hover:shadow-lg hover:shadow-primary/5 hover:border-border
                      ${draggingLead === lead.id ? "opacity-50 scale-95 rotate-2 shadow-xl" : ""}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center text-xs font-semibold text-primary">
                            {lead.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${channelColors[lead.channel]}`} />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(lead.value)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {lead.lastContact}
                          </span>
                        </div>

                        {/* Score bar */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full transition-all"
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-primary">{lead.score}</span>
                        </div>

                        {/* Quick actions */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Add Lead Button */}
                <Button
                  variant="ghost"
                  className="w-full border border-dashed border-border h-10 text-muted-foreground hover:text-primary hover:border-primary/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar lead
                </Button>
              </div>
            </div>
          ))}

          {/* Add Stage */}
          <div className="w-80 shrink-0">
            <Button
              variant="outline"
              className="w-full h-12 border-dashed bg-transparent hover:bg-secondary/50 hover:border-primary/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova etapa
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  return (
    <Suspense fallback={null}>
      <PipelineContent />
    </Suspense>
  )
}
