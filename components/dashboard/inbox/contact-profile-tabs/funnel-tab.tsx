"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { notifyAction } from "@/lib/button-actions"
import {
  getPipelineStageLabel,
  loadPipelineStagesFromStorage,
  normalizePipelineStageId,
  PIPELINE_STAGE_OPTIONS,
  PIPELINE_STORAGE_KEY,
  type PipelineStage,
} from "@/lib/pipeline-board"
import type { Conversation } from "@/lib/mock-data"

interface FunnelTabProps {
  conversation: Conversation
  onUpdateProfile: (conversationId: number, updates: Partial<Conversation>) => void
}

export function FunnelTab({ conversation, onUpdateProfile }: FunnelTabProps) {
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([])
  const [funnelSearch, setFunnelSearch] = useState("")

  useEffect(() => {
    setFunnelSearch("")
  }, [conversation])

  useEffect(() => {
    setPipelineStages(loadPipelineStagesFromStorage())
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PIPELINE_STORAGE_KEY) return
      setPipelineStages(loadPipelineStagesFromStorage())
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const currentPipelineId = normalizePipelineStageId(conversation.pipeline) ?? conversation.pipeline?.trim() ?? ""

  const currentPipelineLabel =
    PIPELINE_STAGE_OPTIONS.find((option) => option.id === currentPipelineId)?.label ||
    getPipelineStageLabel(conversation.pipeline) ||
    "Sem etapa"

  const pipelineOptions = useMemo(() => {
    const knownIds = new Set<string>(PIPELINE_STAGE_OPTIONS.map((option) => option.id))
    const options = [
      ...PIPELINE_STAGE_OPTIONS,
      ...pipelineStages.filter((stage) => !knownIds.has(stage.id)).map((stage) => ({
        id: stage.id,
        label: stage.title,
      })),
    ]

    if (currentPipelineId && !options.some((option) => option.id === currentPipelineId)) {
      return [
        {
          id: currentPipelineId,
          label: conversation.pipeline?.trim() ?? currentPipelineId,
        },
        ...options,
      ]
    }

    return options
  }, [conversation.pipeline, currentPipelineId, pipelineStages])

  const funnelStagesVisible = pipelineOptions.filter((stage) =>
    stage.label.toLowerCase().includes(funnelSearch.trim().toLowerCase()),
  )

  const handleUpdatePipeline = (stageId: string) => {
    onUpdateProfile(conversation.id, { pipeline: stageId })
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Funil</p>
            <h4 className="text-sm font-semibold text-foreground">Conectar contato à pipeline</h4>
          </div>
          {currentPipelineId ? (
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
              {currentPipelineLabel}
            </Badge>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 rounded-[18px] border border-border/60 bg-background/90 px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={funnelSearch}
              onChange={(event) => setFunnelSearch(event.target.value)}
              placeholder="Buscar etapa do funil"
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {funnelStagesVisible.map((stage) => {
            const normalizedStageId = normalizePipelineStageId(stage.id) ?? stage.id
            const active = currentPipelineId === normalizedStageId

            return (
              <div key={stage.id} className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{stage.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {active ? "Contato vinculado a esta etapa" : "Ative para mover este contato"}
                    </p>
                  </div>
                  <Switch
                    checked={active}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleUpdatePipeline(normalizedStageId)
                        return
                      }

                      if (active) {
                        notifyAction("Etapa ativa", "Escolha outra etapa antes de desligar esta associação.")
                      }
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
