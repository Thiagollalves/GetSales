"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
  PanelRight,
  Play,
  Plus,
  Save,
  Send,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChatbotsFlowCanvas } from "@/components/dashboard/chatbots/chatbots-flow-canvas"
import { ChatbotsFlowInspector } from "@/components/dashboard/chatbots/chatbots-flow-inspector"
import { ChatbotsFlowList, type FlowFilter } from "@/components/dashboard/chatbots/chatbots-flow-list"
import { ChatbotsNewFlowDialog, type NewChatbotFlowDraft } from "@/components/dashboard/chatbots/chatbots-new-flow-dialog"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  addFlowStage,
  serializeFlowDefinition,
  type FlowEntry,
} from "@/lib/chatbots-core"
import { cn } from "@/lib/utils"

type ViewMode = "list" | "editor"

function cloneFlow(flow: FlowEntry) {
  if (typeof structuredClone === "function") {
    return structuredClone(flow) as FlowEntry
  }

  return JSON.parse(JSON.stringify(flow)) as FlowEntry
}

function getInitialNodeId(flow: FlowEntry) {
  return (
    flow.definition.nodes.find((node) => node.type === "step")?.id ??
    flow.definition.nodes[0]?.id ??
    null
  )
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function flowMatchesQuery(flow: FlowEntry, query: string) {
  if (!query) {
    return true
  }

  const haystack = [
    flow.name,
    flow.description,
    flow.trigger,
    flow.testPhone ?? "",
    flow.keywords.join(" "),
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

function buildFlowPayload(flow: FlowEntry) {
  return {
    name: flow.name,
    description: flow.description,
    active: flow.active,
    testPhone: flow.testPhone,
    keywords: flow.keywords,
    isServiceFlow: flow.isServiceFlow,
    trigger: flow.trigger,
    conversations: flow.conversations,
    definition: serializeFlowDefinition(flow.definition),
    n8nSyncStatus: flow.n8nSyncStatus,
    lastPublishedAt: flow.lastPublishedAt,
    lastTestScore: flow.lastTestScore,
    lastTestStatus: flow.lastTestStatus,
  }
}

function readErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "error" in body && typeof (body as { error?: unknown }).error === "string") {
    return (body as { error: string }).error
  }

  if (typeof body === "string" && body.trim()) {
    return body
  }

  return fallback
}

function syncStatusLabel(status: FlowEntry["n8nSyncStatus"]) {
  switch (status) {
    case "testing":
      return "Testando"
    case "publishing":
      return "Publicando"
    case "success":
      return "Sincronizado"
    case "error":
      return "Erro n8n"
    default:
      return "Pronto"
  }
}

function syncStatusTone(status: FlowEntry["n8nSyncStatus"]) {
  switch (status) {
    case "testing":
    case "publishing":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
}

function activeTone(active: boolean) {
  return active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
}

function toDateLabel(value?: string) {
  if (!value) {
    return "Ainda não publicado"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Ainda não publicado"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export default function ChatbotsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [flows, setFlows] = useState<FlowEntry[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FlowFilter>("all")
  const [selectedFlowId, setSelectedFlowId] = useState<number | null>(null)
  const [draftFlow, setDraftFlow] = useState<FlowEntry | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isTestingId, setIsTestingId] = useState<number | null>(null)
  const [isPublishingId, setIsPublishingId] = useState<number | null>(null)
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false)
  const [newFlowOpen, setNewFlowOpen] = useState(false)

  const draftFlowRef = useRef<FlowEntry | null>(null)
  const dirtyRef = useRef(false)
  const draftRevisionRef = useRef(0)

  useEffect(() => {
    draftFlowRef.current = draftFlow
  }, [draftFlow])

  useEffect(() => {
    dirtyRef.current = isDirty
  }, [isDirty])

  useEffect(() => {
    if (!isMobile) {
      setMobileInspectorOpen(false)
    }
  }, [isMobile])

  useEffect(() => {
    if (viewMode === "list") {
      setMobileInspectorOpen(false)
    }
  }, [viewMode])

  async function loadFlows() {
    setIsLoading(true)
    setLoadError(null)

    try {
      const response = await fetch("/api/chatbots/flows")
      const body = await response.json().catch(() => null)

      if (response.status === 401) {
        router.replace("/login?next=/dashboard/chatbots")
        return
      }

      if (!response.ok) {
        throw new Error(readErrorMessage(body, "Falha ao carregar os fluxos."))
      }

      setFlows(Array.isArray(body) ? (body as FlowEntry[]) : [])
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Falha ao carregar os fluxos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadFlows()
  }, [])

  const visibleFlows = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query)

    return flows.filter((flow) => {
      if (filter === "active" && !flow.active) {
        return false
      }

      if (filter === "inactive" && flow.active) {
        return false
      }

      return flowMatchesQuery(flow, normalizedQuery)
    })
  }, [flows, filter, query])

  const editorFlow =
    draftFlow ??
    (selectedFlowId !== null
      ? flows.find((flow) => flow.id === selectedFlowId) ?? null
      : null)

  function putDraft(next: FlowEntry | null) {
    const cloned = next ? cloneFlow(next) : null
    draftFlowRef.current = cloned
    setDraftFlow(cloned)
  }

  function mutateDraft(updater: (draft: FlowEntry) => FlowEntry) {
    const current = draftFlowRef.current
    if (!current) {
      return null
    }

    const next = updater(cloneFlow(current))
    draftRevisionRef.current += 1
    setIsDirty(true)
    putDraft(next)
    return next
  }

  function updateFlowInList(updated: FlowEntry) {
    const cloned = cloneFlow(updated)
    setFlows((previous) => {
      const exists = previous.some((flow) => flow.id === cloned.id)
      if (!exists) {
        return [...previous, cloned]
      }

      return previous.map((flow) => (flow.id === cloned.id ? cloned : flow))
    })

    if (draftFlowRef.current?.id === cloned.id && !dirtyRef.current) {
      putDraft(cloned)
    }
  }

  async function saveDraftFlow(options?: { showToast?: boolean }) {
    const current = draftFlowRef.current
    if (!current) {
      return null
    }

    if (!dirtyRef.current) {
      return current
    }

    const revisionAtStart = draftRevisionRef.current
    setIsSaving(true)

    try {
      const response = await fetch(`/api/chatbots/flows/${current.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildFlowPayload(current)),
      })
      const body = await response.json().catch(() => null)

      if (response.status === 401) {
        router.replace("/login?next=/dashboard/chatbots")
        return null
      }

      if (!response.ok) {
        throw new Error(readErrorMessage(body, "Falha ao salvar o fluxo."))
      }

      const saved = body as FlowEntry
      updateFlowInList(saved)

      if (draftRevisionRef.current === revisionAtStart && draftFlowRef.current?.id === saved.id) {
        putDraft(saved)
        draftRevisionRef.current = 0
        setIsDirty(false)
        if (selectedFlowId === saved.id) {
          setSelectedNodeId((currentNodeId) => {
            if (!currentNodeId) {
              return getInitialNodeId(saved)
            }

            return saved.definition.nodes.some((node) => node.id === currentNodeId)
              ? currentNodeId
              : getInitialNodeId(saved)
          })
        }
      }

      if (options?.showToast ?? true) {
        toast.success("Fluxo salvo com sucesso.")
      }

      return saved
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar o fluxo.")
      return null
    } finally {
      setIsSaving(false)
    }
  }

  async function openFlow(flow: FlowEntry) {
    if (viewMode === "editor" && dirtyRef.current && draftFlowRef.current?.id !== flow.id) {
      const saved = await saveDraftFlow({ showToast: false })
      if (!saved) {
        return
      }
    }

    const cloned = cloneFlow(flow)
    setSelectedFlowId(cloned.id)
    putDraft(cloned)
    draftRevisionRef.current = 0
    setIsDirty(false)
    setSelectedNodeId(getInitialNodeId(cloned))
    setViewMode("editor")
    setMobileInspectorOpen(false)
  }

  async function backToList() {
    if (viewMode === "editor" && dirtyRef.current) {
      const saved = await saveDraftFlow({ showToast: false })
      if (!saved) {
        return
      }
    }

    setViewMode("list")
    setMobileInspectorOpen(false)
  }

  async function createFlow(draft: NewChatbotFlowDraft) {
    setIsCreating(true)

    try {
      const response = await fetch("/api/chatbots/flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: draft.description,
          description: draft.description,
          active: draft.active,
          testPhone: draft.testPhone || undefined,
          keywords: draft.keywords,
          isServiceFlow: draft.isServiceFlow,
        }),
      })
      const body = await response.json().catch(() => null)

      if (response.status === 401) {
        router.replace("/login?next=/dashboard/chatbots")
        return
      }

      if (!response.ok) {
        throw new Error(readErrorMessage(body, "Falha ao criar o fluxo."))
      }

      const created = body as FlowEntry
      updateFlowInList(created)
      setSelectedFlowId(created.id)
      putDraft(created)
      draftRevisionRef.current = 0
      setIsDirty(false)
      setSelectedNodeId(getInitialNodeId(created))
      setViewMode("editor")
      setMobileInspectorOpen(false)
      setNewFlowOpen(false)
      toast.success("Fluxo criado e aberto no editor.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar o fluxo.")
    } finally {
      setIsCreating(false)
    }
  }

  async function toggleFlowActive(flow: FlowEntry) {
    if (draftFlowRef.current?.id === flow.id && dirtyRef.current) {
      const saved = await saveDraftFlow({ showToast: false })
      if (!saved) {
        return
      }
    }

    try {
      const response = await fetch(`/api/chatbots/flows/${flow.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !flow.active,
        }),
      })
      const body = await response.json().catch(() => null)

      if (response.status === 401) {
        router.replace("/login?next=/dashboard/chatbots")
        return
      }

      if (!response.ok) {
        throw new Error(readErrorMessage(body, "Falha ao atualizar o status do fluxo."))
      }

      const updated = body as FlowEntry
      updateFlowInList(updated)
      if (draftFlowRef.current?.id === updated.id) {
        putDraft(updated)
        setIsDirty(false)
        draftRevisionRef.current = 0
      }

      toast.success(updated.active ? "Fluxo ativado." : "Fluxo desativado.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar o status do fluxo.")
    }
  }

  async function duplicateFlow(flow: FlowEntry) {
    if (draftFlowRef.current?.id === flow.id && dirtyRef.current) {
      const saved = await saveDraftFlow({ showToast: false })
      if (!saved) {
        return
      }
    }

    try {
      const response = await fetch(`/api/chatbots/flows/${flow.id}/duplicate`, {
        method: "POST",
      })
      const body = await response.json().catch(() => null)

      if (response.status === 401) {
        router.replace("/login?next=/dashboard/chatbots")
        return
      }

      if (!response.ok) {
        throw new Error(readErrorMessage(body, "Falha ao duplicar o fluxo."))
      }

      const duplicated = body as FlowEntry
      updateFlowInList(duplicated)
      toast.success("Fluxo duplicado com sucesso.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao duplicar o fluxo.")
    }
  }

  async function deleteFlow(flow: FlowEntry) {
    if (!window.confirm(`Excluir o fluxo "${flow.name}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    if (draftFlowRef.current?.id === flow.id && dirtyRef.current) {
      const saved = await saveDraftFlow({ showToast: false })
      if (!saved) {
        return
      }
    }

    try {
      const response = await fetch(`/api/chatbots/flows/${flow.id}`, {
        method: "DELETE",
      })
      const body = await response.json().catch(() => null)

      if (response.status === 401) {
        router.replace("/login?next=/dashboard/chatbots")
        return
      }

      if (!response.ok) {
        throw new Error(readErrorMessage(body, "Falha ao excluir o fluxo."))
      }

      setFlows((previous) => previous.filter((item) => item.id !== flow.id))

      if (draftFlowRef.current?.id === flow.id) {
        putDraft(null)
        setSelectedFlowId(null)
        setSelectedNodeId(null)
        setViewMode("list")
        setMobileInspectorOpen(false)
        setIsDirty(false)
        draftRevisionRef.current = 0
      }

      toast.success("Fluxo excluído.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir o fluxo.")
    }
  }

  async function testFlow(flow: FlowEntry) {
    if (draftFlowRef.current?.id === flow.id && dirtyRef.current) {
      const saved = await saveDraftFlow({ showToast: false })
      if (!saved) {
        return
      }
    }

    setIsTestingId(flow.id)

    try {
      const response = await fetch(`/api/chatbots/flows/${flow.id}/test`, {
        method: "POST",
      })
      const body = await response.json().catch(() => null)

      if (response.status === 401) {
        router.replace("/login?next=/dashboard/chatbots")
        return
      }

      if (!response.ok) {
        throw new Error(readErrorMessage(body, "Falha ao testar o fluxo."))
      }

      const updated = body as FlowEntry
      updateFlowInList(updated)
      if (draftFlowRef.current?.id === updated.id) {
        putDraft(updated)
        setIsDirty(false)
        draftRevisionRef.current = 0
      }

      toast.success(`Teste concluído. Score ${updated.lastTestScore ?? 0}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao testar o fluxo.")
    } finally {
      setIsTestingId(null)
    }
  }

  async function publishFlow(flow: FlowEntry) {
    if (draftFlowRef.current?.id === flow.id && dirtyRef.current) {
      const saved = await saveDraftFlow({ showToast: false })
      if (!saved) {
        return
      }
    }

    setIsPublishingId(flow.id)

    try {
      const response = await fetch(`/api/chatbots/flows/${flow.id}/publish`, {
        method: "POST",
      })
      const body = await response.json().catch(() => null)

      if (response.status === 401) {
        router.replace("/login?next=/dashboard/chatbots")
        return
      }

      if (!response.ok) {
        throw new Error(readErrorMessage(body, "Falha ao publicar o fluxo."))
      }

      const updated = body as FlowEntry
      updateFlowInList(updated)
      if (draftFlowRef.current?.id === updated.id) {
        putDraft(updated)
        setIsDirty(false)
        draftRevisionRef.current = 0
      }

      toast.success("Fluxo publicado para o n8n.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao publicar o fluxo.")
    } finally {
      setIsPublishingId(null)
    }
  }

  function handleSelectNode(nodeId: string) {
    setSelectedNodeId(nodeId)
    if (isMobile) {
      setMobileInspectorOpen(true)
    }
  }

  function handleUpdateDraft(updater: (draft: FlowEntry) => FlowEntry) {
    mutateDraft(updater)
  }

  function handleMoveNode(nodeId: string, position: { x: number; y: number }) {
    mutateDraft((draft) => ({
      ...draft,
      definition: {
        ...draft.definition,
        nodes: draft.definition.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                position,
              }
            : node,
        ),
      },
    }))
  }

  function handleAddStage() {
    const current = draftFlowRef.current
    if (!current) {
      return
    }

    const nextDefinition = addFlowStage(current.definition, "Nova etapa")
    const next = {
      ...current,
      definition: nextDefinition,
    }

    draftRevisionRef.current += 1
    setIsDirty(true)
    putDraft(next)
    setSelectedNodeId(nextDefinition.nodes[nextDefinition.nodes.length - 1]?.id ?? getInitialNodeId(next))
  }

  const editorButtons = (
    <div className="flex flex-wrap items-center gap-2">
      {isMobile ? (
        <Button
          type="button"
          variant="outline"
          className="rounded-full bg-transparent"
          onClick={() => setMobileInspectorOpen(true)}
        >
          <PanelRight className="mr-2 h-4 w-4" />
          Painel
        </Button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="rounded-full bg-transparent"
        onClick={() => {
          if (editorFlow) {
            void toggleFlowActive(editorFlow)
          }
        }}
        disabled={!editorFlow || isSaving}
      >
        {editorFlow?.active ? (
          <ToggleLeft className="mr-2 h-4 w-4" />
        ) : (
          <ToggleRight className="mr-2 h-4 w-4" />
        )}
        {editorFlow?.active ? "Desativar" : "Ativar"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="rounded-full bg-transparent"
        onClick={() => {
          void saveDraftFlow({ showToast: true })
        }}
        disabled={!isDirty || isSaving || viewMode !== "editor"}
      >
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Salvar
      </Button>

      <Button
        type="button"
        variant="outline"
        className="rounded-full bg-transparent"
        onClick={() => {
          if (editorFlow) {
            void testFlow(editorFlow)
          }
        }}
        disabled={!editorFlow || isSaving || isTestingId === editorFlow?.id}
      >
        {isTestingId === editorFlow?.id ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        Testar
      </Button>

      <Button
        type="button"
        className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
        onClick={() => {
          if (editorFlow) {
            void publishFlow(editorFlow)
          }
        }}
        disabled={!editorFlow || isSaving || isPublishingId === editorFlow?.id}
      >
        {isPublishingId === editorFlow?.id ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Publicar
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[linear-gradient(180deg,#f8f6ef_0%,#f5f2e8_100%)] px-4">
        <div className="rounded-[28px] border border-border/60 bg-white/85 px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Carregando fluxos</p>
              <p className="text-xs text-muted-foreground">Preparando a lista e o editor do chatbot.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadError && viewMode === "list") {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[linear-gradient(180deg,#f8f6ef_0%,#f5f2e8_100%)] px-4">
        <div className="max-w-lg rounded-[28px] border border-border/60 bg-white/85 px-6 py-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">Não foi possível carregar os fluxos</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{loadError}</p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full bg-transparent"
              onClick={() => {
                void loadFlows()
              }}
            >
              Tentar novamente
            </Button>
            <Button
              type="button"
              className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setNewFlowOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Fluxo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#f8f6ef_0%,#f5f2e8_100%)] text-foreground">
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.05),transparent_30%)]" />
          <div className="relative min-h-0 flex-1">
            <ChatbotsFlowList
              flows={visibleFlows}
              query={query}
              filter={filter}
              selectedFlowId={selectedFlowId}
              onQueryChange={setQuery}
              onFilterChange={setFilter}
              onCreate={() => setNewFlowOpen(true)}
              onOpen={(flow) => {
                void openFlow(flow)
              }}
              onToggleActive={(flow) => {
                void toggleFlowActive(flow)
              }}
              onDuplicate={(flow) => {
                void duplicateFlow(flow)
              }}
              onTest={(flow) => {
                void testFlow(flow)
              }}
              onPublish={(flow) => {
                void publishFlow(flow)
              }}
              onDelete={(flow) => {
                void deleteFlow(flow)
              }}
            />
          </div>
        </div>

        <ChatbotsNewFlowDialog
          open={newFlowOpen}
          onOpenChange={setNewFlowOpen}
          onCreate={(draft) => {
            void createFlow(draft)
          }}
          submitting={isCreating}
        />
      </div>
    )
  }

  if (!editorFlow) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[linear-gradient(180deg,#f8f6ef_0%,#f5f2e8_100%)] px-4">
        <div className="rounded-[28px] border border-border/60 bg-white/85 px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Abrindo editor</p>
              <p className="text-xs text-muted-foreground">Selecionando um fluxo para edição.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#f8f6ef_0%,#f5f2e8_100%)] text-foreground">
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.05),transparent_30%)]" />

        <header className="relative border-b border-border/60 bg-white/78 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="mt-1 rounded-full"
                onClick={() => {
                  void backToList()
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Editor
                  </span>
                  <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", isDirty ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
                    {isDirty ? "Rascunho" : "Salvo"}
                  </Badge>
                  <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", activeTone(editorFlow.active))}>
                    {editorFlow.active ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", syncStatusTone(editorFlow.n8nSyncStatus))}>
                    {syncStatusLabel(editorFlow.n8nSyncStatus)}
                  </Badge>
                </div>

                <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {editorFlow.name}
                </h1>
                <p className="max-w-3xl truncate text-sm leading-6 text-muted-foreground">
                  {editorFlow.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{editorFlow.definition.nodes.length} etapas</span>
                  <span>•</span>
                  <span>{editorFlow.definition.edges.length} conexões</span>
                  <span>•</span>
                  <span>{editorFlow.keywords.length} palavras-chave</span>
                  <span>•</span>
                  <span>Publicado em {toDateLabel(editorFlow.lastPublishedAt)}</span>
                </div>
              </div>
            </div>

            {editorButtons}
          </div>
        </header>

        <div className="relative min-h-0 flex-1">
          <div className="grid min-h-0 h-full lg:grid-cols-[minmax(0,1fr)_420px]">
            <ChatbotsFlowCanvas
              definition={editorFlow.definition}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onMoveNode={handleMoveNode}
              onAddStage={handleAddStage}
            />

            <ChatbotsFlowInspector
              flow={editorFlow}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onUpdateDraft={handleUpdateDraft}
              mobileOpen={mobileInspectorOpen}
              onMobileOpenChange={setMobileInspectorOpen}
            />
          </div>

          {isSaving ? (
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur">
              <Loader2 className="mr-2 inline h-3.5 w-3.5 animate-spin" />
              Salvando alterações
            </div>
          ) : null}
        </div>
      </div>

      <ChatbotsNewFlowDialog
        open={newFlowOpen}
        onOpenChange={setNewFlowOpen}
        onCreate={(draft) => {
          void createFlow(draft)
        }}
        submitting={isCreating}
      />
    </div>
  )
}
