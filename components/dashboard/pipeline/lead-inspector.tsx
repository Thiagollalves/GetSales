"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import {
  GitBranch,
  TrendingUp,
  UserRound,
  Clock3,
} from "lucide-react"
import { getPriorityLabel, getPriorityTone } from "@/lib/inbox"
import {
  PIPELINE_STAGE_OPTIONS,
  getPipelineStageLabel,
  normalizePipelineStageId,
  type PipelineLead,
  type PipelineStage,
} from "@/lib/pipeline-board"

export interface LeadInspectorDraft {
  name: string
  company: string
  value: string
  lastContact: string
  score: string
  channel: PipelineLead["channel"]
  stageId: string
}

interface LeadInspectorSheetProps {
  lead: PipelineLead | null
  stageId: string | null
  stages: PipelineStage[]
  onSave: (draft: LeadInspectorDraft) => void
  onCancel: () => void
}

const channelLabels: Record<PipelineLead["channel"], string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "E-mail",
  webchat: "Chat do site",
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value)

function getLeadPriority(score: number) {
  if (score >= 80) return "high"
  if (score >= 50) return "medium"
  return "low"
}

function getLeadAvatar(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function LeadInspectorSheet({ lead, stageId, stages, onSave, onCancel }: LeadInspectorSheetProps) {
  const fallbackStageId = stageId ?? stages[0]?.id ?? PIPELINE_STAGE_OPTIONS[0]?.id ?? ""
  const [draft, setDraft] = useState<LeadInspectorDraft>({
    name: "",
    company: "",
    value: "0",
    lastContact: "",
    score: "0",
    channel: "whatsapp",
    stageId: fallbackStageId,
  })

  useEffect(() => {
    if (!lead) return

    setDraft({
      name: lead.name,
      company: lead.company,
      value: lead.value.toString(),
      lastContact: lead.lastContact,
      score: lead.score.toString(),
      channel: lead.channel,
      stageId: fallbackStageId,
    })
  }, [fallbackStageId, lead])

  const stageOptions = useMemo(() => {
    const knownIds = new Set<string>(PIPELINE_STAGE_OPTIONS.map((option) => option.id))
    const options = [
      ...PIPELINE_STAGE_OPTIONS,
      ...stages
        .filter((stage) => !knownIds.has(normalizePipelineStageId(stage.id) ?? stage.id))
        .map((stage) => ({ id: stage.id, label: stage.title })),
    ]

    if (draft.stageId && !options.some((option) => option.id === draft.stageId)) {
      const stageLabel = stages.find((stage) => stage.id === draft.stageId)?.title ?? draft.stageId
      return [{ id: draft.stageId, label: stageLabel }, ...options]
    }

    return options
  }, [draft.stageId, stages])

  const currentStageLabel =
    stageOptions.find((option) => option.id === draft.stageId)?.label ||
    getPipelineStageLabel(draft.stageId) ||
    "Sem etapa"

  const currentScore = Number(draft.score)
  const normalizedScore = Number.isFinite(currentScore) ? currentScore : 0
  const priority = getLeadPriority(normalizedScore)
  const priorityLabel = getPriorityLabel(priority)
  const priorityTone = getPriorityTone(priority)
  const valueLabel = formatCurrency(Number.isFinite(Number(draft.value)) ? Number(draft.value) : 0)
  const leadAvatar = getLeadAvatar(draft.name || lead?.name || "Lead")
  const stageValue = normalizePipelineStageId(draft.stageId) ?? draft.stageId

  const handleScoreChange = (value: number[]) => {
    setDraft((previous) => ({ ...previous, score: String(value[0] ?? 0) }))
  }

  const handleSave = () => {
    onSave({
      ...draft,
      value: draft.value.trim() || "0",
      lastContact: draft.lastContact.trim(),
      score: draft.score.trim() || "0",
      stageId: stageValue,
    })
  }

  if (!lead) {
    return null
  }

  return (
    <Sheet open={Boolean(lead)} onOpenChange={(open) => !open && onCancel()}>
      <SheetContent side="right" className="w-full max-w-none p-0 sm:max-w-[460px]">
        <SheetTitle className="sr-only">
          {draft.name ? `Editar lead ${draft.name}` : "Editar lead"}
        </SheetTitle>
        <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,246,239,0.94))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
          <div className="border-b border-border/60 px-4 py-4 pr-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Inspector do contato
            </p>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-base font-semibold text-foreground">
                {leadAvatar}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-foreground">
                  {draft.name || "Novo lead"}
                </h3>
                <p className="truncate text-sm text-muted-foreground">
                  Etapa: {currentStageLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                {channelLabels[draft.channel]}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                {valueLabel}
              </Badge>
              <Badge variant={priorityTone} className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                {priorityLabel}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                Score {normalizedScore}
              </Badge>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Última interação</h4>
                </div>

                <Input
                  value={draft.lastContact}
                  onChange={(event) => setDraft((previous) => ({ ...previous, lastContact: event.target.value }))}
                  placeholder="Hoje, 17:40"
                  className="h-11 rounded-full bg-background/90 px-4"
                />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Atualize quando o contato foi realizado ou visto pela última vez.
                </p>
              </section>

              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-foreground">Dados do contato</h4>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {lead.sourceConversationId ? "Vindo da inbox" : "Contato avulso"}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Nome</label>
                    <Input
                      value={draft.name}
                      onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
                      placeholder="Nome completo"
                      className="h-11 rounded-full bg-background/90 px-4"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Empresa</label>
                    <Input
                      value={draft.company}
                      onChange={(event) => setDraft((previous) => ({ ...previous, company: event.target.value }))}
                      placeholder="Empresa"
                      className="h-11 rounded-full bg-background/90 px-4"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Canal</label>
                    <Select
                      value={draft.channel}
                      onValueChange={(value) =>
                        setDraft((previous) => ({ ...previous, channel: value as LeadInspectorDraft["channel"] }))
                      }
                    >
                      <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(channelLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Valor (BRL)</label>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.value}
                      onChange={(event) => setDraft((previous) => ({ ...previous, value: event.target.value }))}
                      placeholder="Ex: 15000"
                      className="h-11 rounded-full bg-background/90 px-4"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-foreground">Pipeline</h4>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {currentStageLabel}
                  </Badge>
                </div>

                <Select
                  value={draft.stageId}
                  onValueChange={(value) => setDraft((previous) => ({ ...previous, stageId: value }))}
                >
                  <SelectTrigger className="h-11 w-full rounded-full bg-background/90 px-4">
                    <SelectValue placeholder="Atribuir contato a uma etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {stageOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Essa edição unifica a leitura do contato com a etapa comercial da pipeline.
                </p>
              </section>

              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-foreground">Score e prioridade</h4>
                  </div>
                  <Badge variant={priorityTone} className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {priorityLabel}
                  </Badge>
                </div>

                <div className="rounded-[20px] border border-border/60 bg-muted/30 p-4">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
                        Lead score
                      </p>
                      <p className="mt-1 text-3xl font-semibold text-foreground">{normalizedScore}</p>
                    </div>
                    <div className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                      {priorityLabel}
                    </div>
                  </div>

                  <Slider
                    value={[normalizedScore]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={handleScoreChange}
                    className="py-2"
                  />

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Frio</span>
                    <span>Quente</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-border/60 px-4 py-4">
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" className="rounded-full bg-transparent" onClick={onCancel}>
                Cancelar
              </Button>
              <Button className="rounded-full" onClick={handleSave}>
                Salvar alterações
              </Button>
            </div>
          </div>
        </section>
      </SheetContent>
    </Sheet>
  )
}
