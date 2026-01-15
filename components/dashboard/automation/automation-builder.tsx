"use client"

import type React from "react"
import type { Automation, AutomationNode } from "./types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  GripVertical,
  Clock,
  Mail,
  MessageSquare,
  GitBranch,
  Filter,
  Tag,
  UserPlus,
  TrendingUp,
  FileText,
  Trash2,
  Sparkles,
  Zap,
} from "lucide-react"
import { notifyAction } from "@/lib/button-actions"

const nodeIcons: Record<string, React.ReactNode> = {
  clock: <Clock className="h-4 w-4" />,
  mail: <Mail className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  "git-branch": <GitBranch className="h-4 w-4" />,
  filter: <Filter className="h-4 w-4" />,
  tag: <Tag className="h-4 w-4" />,
  "user-plus": <UserPlus className="h-4 w-4" />,
  "trending-up": <TrendingUp className="h-4 w-4" />,
  form: <FileText className="h-4 w-4" />,
}

const nodeColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  trigger: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", gradient: "from-blue-500/20" },
  action: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", gradient: "from-green-500/20" },
  condition: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", gradient: "from-amber-500/20" },
  delay: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", gradient: "from-purple-500/20" },
}

const availableNodes = [
  {
    type: "trigger",
    label: "Gatilho",
    items: [
      { icon: "clock", label: "Tempo de inatividade" },
      { icon: "form", label: "Formulário enviado" },
      { icon: "mail", label: "E-mail aberto" },
      { icon: "message", label: "Mensagem recebida" },
    ],
  },
  {
    type: "action",
    label: "Ação",
    items: [
      { icon: "message", label: "Enviar WhatsApp" },
      { icon: "mail", label: "Enviar e-mail" },
      { icon: "tag", label: "Atualizar status" },
      { icon: "user-plus", label: "Criar lead" },
      { icon: "trending-up", label: "Alterar score" },
      { icon: "git-branch", label: "Mover no funil" },
    ],
  },
  {
    type: "condition",
    label: "Condição",
    items: [
      { icon: "filter", label: "Verificar score" },
      { icon: "filter", label: "Verificar tag" },
      { icon: "filter", label: "Verificar etapa" },
    ],
  },
  {
    type: "delay",
    label: "Aguardar",
    items: [
      { icon: "clock", label: "Aguardar 1h" },
      { icon: "clock", label: "Aguardar 24h" },
      { icon: "clock", label: "Aguardar 3 dias" },
    ],
  },
]

interface AutomationBuilderProps {
  automation: Automation | null
  onBack: () => void
}

export function AutomationBuilder({ automation, onBack }: AutomationBuilderProps) {
  const [name, setName] = useState(automation?.name ?? "Nova Automação")
  const [nodes, setNodes] = useState<AutomationNode[]>(automation?.nodes ?? [])
  const [draggingNode, setDraggingNode] = useState<string | null>(null)

  const handleDragStart = (nodeId: string) => {
    setDraggingNode(nodeId)
  }

  const handleDragEnd = () => {
    setDraggingNode(null)
  }

  const addNode = (type: string, icon: string, label: string) => {
    const newNode: AutomationNode = {
      id: `node-${Date.now()}`,
      type: type as AutomationNode["type"],
      data: { label, icon },
      position: { x: 100, y: nodes.length * 100 + 50 },
    }
    setNodes([...nodes, newNode])
  }

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId))
  }

  const moveNode = (fromIndex: number, toIndex: number) => {
    const newNodes = [...nodes]
    const [removed] = newNodes.splice(fromIndex, 1)
    newNodes.splice(toIndex, 0, removed)
    setNodes(newNodes)
  }

  const handleTestAutomation = () => {
    notifyAction("Testar automação", `Executando um teste para "${name}".`)
  }

  const handleSaveAutomation = () => {
    notifyAction("Salvar automação", `Automação "${name}" salva com sucesso.`)
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs font-semibold border-0 bg-transparent px-0 text-lg focus-visible:ring-0 h-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Arraste componentes para criar seu fluxo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-secondary/50" onClick={handleTestAutomation}>
            <Play className="h-4 w-4" />
            Testar
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20" onClick={handleSaveAutomation}>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Node Palette */}
        <div className="w-72 border-r border-border bg-card/50 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Componentes</h3>
          </div>
          <div className="space-y-5">
            {availableNodes.map((category) => (
              <div key={category.type}>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {category.label}
                </h4>
                <div className="space-y-1.5">
                  {category.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => addNode(category.type, item.icon, item.label)}
                      className={`
                        w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                        bg-gradient-to-r ${nodeColors[category.type].gradient} to-transparent
                        border ${nodeColors[category.type].border}
                        hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                      `}
                    >
                      <span className={nodeColors[category.type].text}>{nodeIcons[item.icon]}</span>
                      <span className={`font-medium ${nodeColors[category.type].text}`}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-secondary/20 p-6 overflow-auto">
          {nodes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-chart-2/10 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary/50" />
              </div>
              <p className="text-lg font-semibold text-foreground">Comece adicionando um gatilho</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Clique em um componente na barra lateral para adicionar ao seu fluxo de automação
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-3">
              {nodes.map((node, index) => (
                <div key={node.id}>
                  <Card
                    draggable
                    onDragStart={() => handleDragStart(node.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggingNode && draggingNode !== node.id) {
                        const fromIndex = nodes.findIndex((n) => n.id === draggingNode)
                        moveNode(fromIndex, index)
                      }
                    }}
                    className={`
                      p-4 cursor-grab active:cursor-grabbing transition-all duration-200
                      bg-gradient-to-r ${nodeColors[node.type].gradient} to-card
                      border-2 ${nodeColors[node.type].border}
                      hover:shadow-lg
                      ${draggingNode === node.id ? "opacity-50 rotate-1 shadow-xl scale-[1.02]" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                      <div
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          ${nodeColors[node.type].bg} ${nodeColors[node.type].text}
                        `}
                      >
                        {nodeIcons[node.data.icon]}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${nodeColors[node.type].text}`}>{node.data.label}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {node.type === "trigger"
                            ? "Gatilho"
                            : node.type === "action"
                              ? "Ação"
                              : node.type === "condition"
                                ? "Condição"
                                : "Aguardar"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeNode(node.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                  {index < nodes.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-border to-transparent rounded-full" />
                    </div>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full border-dashed bg-transparent mt-4 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => addNode("action", "tag", "Nova ação")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar etapa
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
