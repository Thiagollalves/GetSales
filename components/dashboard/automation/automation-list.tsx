"use client"

import type React from "react"

import type { Automation } from "./types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Play, Pause, MoreHorizontal, Zap, Clock, TrendingUp, FileText } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { notifyAction } from "@/lib/button-actions"

const triggerIcons: Record<string, React.ReactNode> = {
  inactivity: <Clock className="h-4 w-4" />,
  form_submit: <FileText className="h-4 w-4" />,
  engagement: <TrendingUp className="h-4 w-4" />,
}

interface AutomationListProps {
  automations: Automation[]
  onSelect: (automation: Automation) => void
  onCreate: () => void
}

export function AutomationList({ automations, onSelect, onCreate }: AutomationListProps) {
  const handleMenuAction = (action: string, automation: Automation) => {
    notifyAction(`Automação: ${action}`, `Ação "${action}" aplicada em ${automation.name}.`)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Automações</h1>
          <p className="text-sm text-muted-foreground mt-1">Crie jornadas inteligentes para seus leads e clientes</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{automations.filter((a) => a.status === "active").length}</p>
              <p className="text-sm text-muted-foreground">Ativas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{automations.reduce((sum, a) => sum + a.runs, 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Execuções totais</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Pause className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{automations.filter((a) => a.status === "paused").length}</p>
              <p className="text-sm text-muted-foreground">Pausadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Automation List */}
      <div className="space-y-3">
        {automations.map((automation) => (
          <Card
            key={automation.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelect(automation)}
          >
            <div className="flex items-center gap-4">
              <div
                className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${automation.status === "active" ? "bg-green-100" : "bg-yellow-100"}
              `}
              >
                {automation.status === "active" ? (
                  <Play className="h-5 w-5 text-green-600" />
                ) : (
                  <Pause className="h-5 w-5 text-yellow-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{automation.name}</h3>
                  <span
                    className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${automation.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                  `}
                  >
                    {automation.status === "active" ? "Ativa" : "Pausada"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{automation.description}</p>
              </div>

              <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {triggerIcons[automation.trigger]}
                  <span className="capitalize">{automation.trigger.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{automation.runs.toLocaleString()}</span> execuções
                </div>
                <div>
                  Última: <span className="text-foreground">{automation.lastRun}</span>
                </div>
              </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => handleMenuAction("Editar", automation)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleMenuAction("Duplicar", automation)}>Duplicar</DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleMenuAction(automation.status === "active" ? "Pausar" : "Ativar", automation)}
                    >
                      {automation.status === "active" ? "Pausar" : "Ativar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={() => handleMenuAction("Excluir", automation)}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
