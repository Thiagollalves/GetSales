"use client"

import type { ReactNode } from "react"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  addFlowCondition,
  addFlowInteraction,
  type FlowCondition,
  type FlowDefinition,
  type FlowEntry,
  type FlowInteraction,
  type FlowMediaType,
} from "@/lib/chatbots-core"
import { CheckCircle2, FileText, ImageIcon, MessageSquare, Plus, Trash2 } from "lucide-react"

interface ChatbotsFlowInspectorProps {
  flow: FlowEntry
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  onUpdateDraft: (updater: (draft: FlowEntry) => FlowEntry) => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

function updateDefinition(
  definition: FlowDefinition,
  mutator: (draft: FlowDefinition) => FlowDefinition,
): FlowDefinition {
  return mutator({
    ...definition,
    nodes: definition.nodes.map((node) => ({ ...node })),
    edges: definition.edges.map((edge) => ({ ...edge })),
    settings: { ...definition.settings },
  })
}

function updateNodeById(
  definition: FlowDefinition,
  nodeId: string,
  mutator: (node: FlowDefinition["nodes"][number]) => FlowDefinition["nodes"][number],
) {
  return updateDefinition(definition, (draft) => ({
    ...draft,
    nodes: draft.nodes.map((node) => (node.id === nodeId ? mutator(node) : node)),
  }))
}

function defaultSelectedNode(flow: FlowEntry, selectedNodeId: string | null) {
  return (
    flow.definition.nodes.find((node) => node.id === selectedNodeId) ??
    flow.definition.nodes.find((node) => node.type === "step") ??
    flow.definition.nodes[0]
  )
}

export function ChatbotsFlowInspector({
  flow,
  selectedNodeId,
  onSelectNode,
  onUpdateDraft,
  mobileOpen,
  onMobileOpenChange,
}: ChatbotsFlowInspectorProps) {
  const selectedNode = useMemo(() => defaultSelectedNode(flow, selectedNodeId), [flow, selectedNodeId])

  const content = (
    <InspectorContent
      flow={flow}
      selectedNode={selectedNode}
      onSelectNode={onSelectNode}
      onUpdateDraft={onUpdateDraft}
    />
  )

  return (
    <>
      <aside className="hidden h-full min-h-0 border-l border-border/60 bg-white/88 lg:block">
        {content}
      </aside>

      <Drawer open={mobileOpen} onOpenChange={onMobileOpenChange} direction="right">
        <DrawerContent className="w-full max-w-[420px] p-0 lg:hidden">
          <DrawerTitle className="sr-only">Editar etapa</DrawerTitle>
          <DrawerDescription className="sr-only">Painel lateral do fluxo de chatbot</DrawerDescription>
          {content}
        </DrawerContent>
      </Drawer>
    </>
  )
}

function InspectorContent({
  flow,
  selectedNode,
  onSelectNode,
  onUpdateDraft,
}: {
  flow: FlowEntry
  selectedNode: FlowEntry["definition"]["nodes"][number]
  onSelectNode: (nodeId: string) => void
  onUpdateDraft: (updater: (draft: FlowEntry) => FlowEntry) => void
}) {
  const selectedNodeTypeLabel = selectedNode.type === "start" ? "Início" : "Etapa"

  const updateFlowField = (field: keyof FlowEntry, value: string | boolean) => {
    onUpdateDraft((draft) => ({
      ...draft,
      [field]: value,
    }))
  }

  const updateSettings = (key: keyof FlowEntry["definition"]["settings"], value: string) => {
    onUpdateDraft((draft) => ({
      ...draft,
      definition: {
        ...draft.definition,
        settings: {
          ...draft.definition.settings,
          [key]: value,
        },
      },
    }))
  }

  const updateSelectedNode = (mutator: (node: typeof selectedNode) => typeof selectedNode) => {
    onUpdateDraft((draft) => ({
      ...draft,
      definition: updateNodeById(draft.definition, selectedNode.id, mutator),
    }))
  }

  const addInteraction = (type: FlowInteraction["type"]) => {
    onUpdateDraft((draft) => {
      const nextDefinition =
        type === "message"
          ? addFlowInteraction(draft.definition, selectedNode.id, {
              type: "message",
              text: "Digite a mensagem do bot...",
            })
          : type === "menu"
            ? addFlowInteraction(draft.definition, selectedNode.id, {
                type: "menu",
                title: "Novo menu",
                options: ["Opção 1", "Opção 2"],
              })
            : addFlowInteraction(draft.definition, selectedNode.id, {
                type: "media",
                mediaType: "image",
                url: "/placeholder-flow.png",
                caption: "Nova mídia",
              })

      return {
        ...draft,
        definition: nextDefinition,
      }
    })
  }

  const removeInteraction = (interactionId: string) => {
    updateSelectedNode((node) => ({
      ...node,
      interactions: node.interactions.filter((item) => item.id !== interactionId),
    }))
  }

  const updateInteraction = (interactionId: string, updater: (item: FlowInteraction) => FlowInteraction) => {
    updateSelectedNode((node) => ({
      ...node,
      interactions: node.interactions.map((item) => (item.id === interactionId ? updater(item) : item)),
    }))
  }

  const addCondition = () => {
    onUpdateDraft((draft) => ({
      ...draft,
      definition: addFlowCondition(draft.definition, selectedNode.id, {
        label: "Qualquer resposta",
        kind: "response",
        targetNodeId: draft.definition.nodes.find((node) => node.id !== selectedNode.id && node.type === "step")?.id,
      }),
    }))
  }

  const removeCondition = (conditionId: string) => {
    updateSelectedNode((node) => ({
      ...node,
      conditions: node.conditions.filter((item) => item.id !== conditionId),
    }))
  }

  const updateCondition = (conditionId: string, updater: (item: FlowCondition) => FlowCondition) => {
    updateSelectedNode((node) => ({
      ...node,
      conditions: node.conditions.map((item) => (item.id === conditionId ? updater(item) : item)),
    }))
  }

  const updateNodePosition = (axis: "x" | "y", value: string) => {
    const next = Number(value)
    if (!Number.isFinite(next)) {
      return
    }

    updateSelectedNode((node) => ({
      ...node,
      position: {
        ...node.position,
        [axis]: next,
      },
    }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Editar etapa
            </p>
            <h2 className="mt-1 truncate text-lg font-semibold text-foreground">{flow.name}</h2>
          </div>
          <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            {selectedNodeTypeLabel}
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="chatbot-flow-name" className="text-xs font-medium text-muted-foreground">
            Nome do fluxo
          </Label>
          <Input
            id="chatbot-flow-name"
            value={flow.name}
            onChange={(event) => updateFlowField("name", event.target.value)}
            className="h-11 rounded-full bg-background/90 px-4 shadow-sm"
          />
        </div>
      </div>

      <Tabs defaultValue="interactions" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border/60 px-3 pt-3">
          <TabsList className="h-auto w-full justify-start rounded-[20px] bg-muted/40 p-1.5">
            <TabsTrigger value="interactions" className="rounded-[16px]">
              Interações
            </TabsTrigger>
            <TabsTrigger value="conditions" className="rounded-[16px]">
              Condições
            </TabsTrigger>
            <TabsTrigger value="config" className="rounded-[16px]">
              Config
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 px-4 py-4">
            <TabsContent value="interactions" className="m-0">
              <section className="rounded-[24px] border border-border/60 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Interações
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-foreground">
                      {selectedNode.interactions.length} item{selectedNode.interactions.length === 1 ? "" : "s"}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {selectedNode.title}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <QuickActionButton icon={<MessageSquare className="h-4 w-4" />} label="Mensagem" onClick={() => addInteraction("message")} />
                  <QuickActionButton icon={<FileText className="h-4 w-4" />} label="Menu" onClick={() => addInteraction("menu")} />
                  <QuickActionButton icon={<ImageIcon className="h-4 w-4" />} label="Mídia" onClick={() => addInteraction("media")} />
                </div>

                <div className="mt-4 space-y-3">
                  {selectedNode.interactions.length > 0 ? (
                    selectedNode.interactions.map((item) => (
                      <InteractionCard
                        key={item.id}
                        interaction={item}
                        onChange={(updater) => updateInteraction(item.id, updater)}
                        onRemove={() => removeInteraction(item.id)}
                      />
                    ))
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-border/70 bg-muted/20 p-5 text-center">
                      <p className="text-sm font-medium text-foreground">Sem interações ainda</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Adicione uma mensagem, menu ou mídia para começar.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="conditions" className="m-0">
              <section className="rounded-[24px] border border-border/60 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Condições
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-foreground">
                      {selectedNode.conditions.length} ramificação{selectedNode.conditions.length === 1 ? "" : "ões"}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                    size="sm"
                    onClick={addCondition}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Condição
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedNode.conditions.length > 0 ? (
                    selectedNode.conditions.map((condition) => (
                      <ConditionCard
                        key={condition.id}
                        condition={condition}
                        nodes={flow.definition.nodes}
                        onChange={(updater) => updateCondition(condition.id, updater)}
                        onRemove={() => removeCondition(condition.id)}
                      />
                    ))
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-border/70 bg-muted/20 p-5 text-center">
                      <p className="text-sm font-medium text-foreground">Nenhuma condição configurada</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Use condições para encaminhar respostas para outras etapas.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="config" className="m-0">
              <div className="space-y-4">
                <section className="rounded-[24px] border border-border/60 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        Configurações do fluxo
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-foreground">Mensagens padrão</h3>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div className="mt-4 space-y-3">
                    <ConfigField
                      label="Mensagem de saudação"
                      value={flow.definition.settings.greeting}
                      onChange={(value) => updateSettings("greeting", value)}
                      asTextarea
                    />
                    <ConfigField
                      label="Fallback"
                      value={flow.definition.settings.fallback}
                      onChange={(value) => updateSettings("fallback", value)}
                      asTextarea
                    />
                    <ConfigField
                      label="Ausência de resposta"
                      value={flow.definition.settings.noResponse}
                      onChange={(value) => updateSettings("noResponse", value)}
                      asTextarea
                    />
                    <ConfigField
                      label="Retorno padrão"
                      value={flow.definition.settings.returnMessage}
                      onChange={(value) => updateSettings("returnMessage", value)}
                      asTextarea
                    />
                  </div>
                </section>

                <section className="rounded-[24px] border border-border/60 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        Etapa selecionada
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-foreground">Dados do card</h3>
                    </div>
                    <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                      {selectedNode.id.slice(0, 8)}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-3">
                    <ConfigField
                      label="Título da etapa"
                      value={selectedNode.title}
                      onChange={(value) =>
                        updateSelectedNode((node) => ({
                          ...node,
                          title: value,
                        }))
                      }
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ConfigField
                        label="Posição X"
                        value={String(selectedNode.position.x)}
                        onChange={(value) => updateNodePosition("x", value)}
                      />
                      <ConfigField
                        label="Posição Y"
                        value={String(selectedNode.position.y)}
                        onChange={(value) => updateNodePosition("y", value)}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ConfigField
                        label="Departamento"
                        value={String(selectedNode.config.department ?? "")}
                        onChange={(value) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            config: {
                              ...node.config,
                              department: value,
                            },
                          }))
                        }
                      />
                      <ConfigField
                        label="Responsável"
                        value={String(selectedNode.config.assignee ?? "")}
                        onChange={(value) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            config: {
                              ...node.config,
                              assignee: value,
                            },
                          }))
                        }
                      />
                    </div>
                    <ConfigField
                      label="Observações"
                      value={String(selectedNode.config.notes ?? "")}
                      onChange={(value) =>
                        updateSelectedNode((node) => ({
                          ...node,
                          config: {
                            ...node.config,
                            notes: value,
                          },
                        }))
                      }
                      asTextarea
                    />
                  </div>
                </section>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      <div className="border-t border-border/60 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Clique em uma etapa no canvas para editar. O painel segue a etapa selecionada.
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full bg-transparent"
            onClick={() => onSelectNode(selectedNode.id)}
          >
            Focar etapa
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuickActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  )
}

function InteractionCard({
  interaction,
  onChange,
  onRemove,
}: {
  interaction: FlowInteraction
  onChange: (updater: (item: FlowInteraction) => FlowInteraction) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-[22px] border border-border/60 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          {interaction.type === "message" ? "Mensagem" : interaction.type === "menu" ? "Menu" : "Mídia"}
        </Badge>
        <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {interaction.type === "message" ? (
        <Textarea
          value={interaction.text}
          onChange={(event) =>
            onChange((item) =>
              item.type === "message"
                ? { ...item, text: event.target.value }
                : item,
            )
          }
          className="mt-3 min-h-[104px] rounded-[18px] border-border/60 bg-background/90"
        />
      ) : null}

      {interaction.type === "menu" ? (
        <div className="mt-3 space-y-3">
          <ConfigField
            label="Título"
            value={interaction.title}
            onChange={(value) =>
              onChange((item) => (item.type === "menu" ? { ...item, title: value } : item))
            }
          />
          <ConfigField
            label="Opções"
            value={interaction.options.join(", ")}
            onChange={(value) =>
              onChange((item) =>
                item.type === "menu"
                  ? { ...item, options: value.split(",").map((option) => option.trim()).filter(Boolean) }
                  : item,
              )
            }
          />
        </div>
      ) : null}

      {interaction.type === "media" ? (
        <div className="mt-3 space-y-3">
      <Select
          value={interaction.mediaType}
          onValueChange={(value) =>
            onChange((item) =>
              item.type === "media"
                  ? { ...item, mediaType: value as FlowMediaType }
                  : item,
              )
            }
          >
            <SelectTrigger className="h-11 w-full rounded-full bg-background/90 px-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["image", "video", "audio", "file"] as const).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ConfigField
            label="URL"
            value={interaction.url}
            onChange={(value) =>
              onChange((item) =>
                item.type === "media"
                  ? { ...item, url: value }
                  : item,
              )
            }
          />
          <ConfigField
            label="Legenda"
            value={interaction.caption ?? ""}
            onChange={(value) =>
              onChange((item) =>
                item.type === "media"
                  ? { ...item, caption: value }
                  : item,
              )
            }
          />
        </div>
      ) : null}
    </div>
  )
}

function ConditionCard({
  condition,
  nodes,
  onChange,
  onRemove,
}: {
  condition: FlowCondition
  nodes: FlowDefinition["nodes"]
  onChange: (updater: (item: FlowCondition) => FlowCondition) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-[22px] border border-border/60 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="outline" className="rounded-full border-fuchsia-200 bg-fuchsia-50 px-2.5 py-1 text-[11px] font-medium text-fuchsia-700">
          {condition.kind}
        </Badge>
        <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        <ConfigField
          label="Rótulo"
          value={condition.label}
          onChange={(value) => onChange((item) => ({ ...item, label: value }))}
        />

        <Select
          value={condition.kind}
          onValueChange={(value) =>
            onChange((item) => ({ ...item, kind: value as FlowCondition["kind"] }))
          }
        >
          <SelectTrigger className="h-11 w-full rounded-full bg-background/90 px-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["response", "department", "user", "api", "fallback"] as const).map((kind) => (
              <SelectItem key={kind} value={kind}>
                {kind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={condition.targetNodeId ?? "__none__"}
          onValueChange={(value) =>
            onChange((item) => ({
              ...item,
              targetNodeId: value === "__none__" ? undefined : value,
            }))
          }
        >
          <SelectTrigger className="h-11 w-full rounded-full bg-background/90 px-4">
            <SelectValue placeholder="Escolha a etapa de destino" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sem destino</SelectItem>
            {nodes
              .filter((node) => node.id !== condition.targetNodeId)
              .map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function ConfigField({
  label,
  value,
  onChange,
  asTextarea = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  asTextarea?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {asTextarea ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[96px] rounded-[18px] border-border/60 bg-background/90 shadow-sm"
        />
      ) : (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 rounded-full border-border/60 bg-background/90 px-4 shadow-sm"
        />
      )}
    </div>
  )
}
