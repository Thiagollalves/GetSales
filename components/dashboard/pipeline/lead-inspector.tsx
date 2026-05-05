"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Bot,
  CalendarDays,
  FileText,
  GitBranch,
  History,
  ImageIcon,
  Music2,
  MessagesSquare,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  Tag,
  TrendingUp,
  Video,
} from "lucide-react"
import type { LeadBotBinding } from "@/lib/mock-data"
import { getPriorityLabel, getPriorityTone } from "@/lib/inbox"
import {
  PIPELINE_STAGE_OPTIONS,
  getPipelineStageLabel,
  normalizePipelineStageId,
  type PipelineLead,
  type PipelineStage,
} from "@/lib/pipeline-board"
import { LeadInspectorShell } from "@/components/dashboard/inspector/lead-inspector-shell"

export interface LeadInspectorDraft {
  name: string
  company: string
  value: string
  lastContact: string
  score: string
  channel: PipelineLead["channel"]
  stageId: string
  assignee: string
  department: string
  tags: string[]
  botBindings: LeadBotBinding[]
}

interface LeadInspectorSheetProps {
  lead: PipelineLead | null
  stageId: string | null
  stages: PipelineStage[]
  onSave: (draft: LeadInspectorDraft) => void
  onCancel: () => void
  onOpenInternalChat?: () => void
}

const channelLabels: Record<PipelineLead["channel"], string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "E-mail",
  webchat: "Chat do site",
}

const defaultBotBindings: LeadBotBinding[] = [
  { id: 1, label: "NYM oficial", enabled: false },
  { id: 2, label: "Vini", enabled: false },
  { id: 3, label: "teste paulo h", enabled: false },
  { id: 4, label: "Atendimento inicial teste", enabled: false },
]

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

function getMediaIcon(type: "image" | "video" | "audio" | "file") {
  switch (type) {
    case "audio":
      return Music2
    case "video":
      return Video
    case "file":
      return FileText
    default:
      return ImageIcon
  }
}

function buildHistoryEntries(lead: PipelineLead) {
  const fromTimeline = (lead.timeline ?? []).map((item) => ({
    id: item.id,
    kind: item.kind,
    title: item.title,
    description: item.description ?? "",
    time: item.time,
  }))

  const fromNotes = (lead.internalNotes ?? []).map((note) => ({
    id: 1000 + note.id,
    kind: "nota" as const,
    title: "Nota interna",
    description: note.content,
    time: note.time,
  }))

  return [...fromTimeline, ...fromNotes]
}

export function LeadInspectorSheet({ lead, stageId, stages, onSave, onCancel, onOpenInternalChat }: LeadInspectorSheetProps) {
  const fallbackStageId = stageId ?? stages[0]?.id ?? PIPELINE_STAGE_OPTIONS[0]?.id ?? ""
  const [draft, setDraft] = useState<LeadInspectorDraft>({
    name: "",
    company: "",
    value: "0",
    lastContact: "",
    score: "0",
    channel: "whatsapp",
    stageId: fallbackStageId,
    assignee: "",
    department: "",
    tags: [],
    botBindings: defaultBotBindings,
  })
  const [tagInput, setTagInput] = useState("")
  const [searchMedia, setSearchMedia] = useState("")
  const [searchBot, setSearchBot] = useState("")
  const [searchStage, setSearchStage] = useState("")
  const [historyFilter, setHistoryFilter] = useState<"all" | "ticket" | "bloqueio" | "ligacao">("all")
  const [botBindings, setBotBindings] = useState<LeadBotBinding[]>(
    (lead?.botBindings?.length ? lead.botBindings : defaultBotBindings).map((binding) => ({ ...binding })),
  )

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
      assignee: lead.assignee ?? "",
      department: lead.department ?? "",
      tags: lead.tags ? [...lead.tags] : [],
      botBindings: lead.botBindings ? lead.botBindings.map((binding) => ({ ...binding })) : defaultBotBindings,
    })
    setTagInput("")
    setSearchMedia("")
    setSearchBot("")
    setSearchStage("")
    setBotBindings(
      (lead.botBindings?.length ? lead.botBindings : defaultBotBindings).map((binding) => ({ ...binding })),
    )
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
  const historyEntries = useMemo(() => {
    const entries = lead ? buildHistoryEntries(lead) : []
    if (historyFilter === "all") {
      return entries
    }

    return entries.filter((item) => item.kind === historyFilter)
  }, [historyFilter, lead])
  const mediaEntries = (lead?.media ?? []).filter((item) =>
    item.name.toLowerCase().includes(searchMedia.trim().toLowerCase()),
  )
  const visibleBotBindings = botBindings.filter((binding) =>
    binding.label.toLowerCase().includes(searchBot.trim().toLowerCase()),
  )
  const stageEntries = stageOptions.filter((option) =>
    option.label.toLowerCase().includes(searchStage.trim().toLowerCase()),
  )

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
      assignee: draft.assignee.trim(),
      department: draft.department.trim(),
      tags: draft.tags.filter(Boolean),
      botBindings: botBindings.map((binding) => ({ ...binding })),
    })
  }

  const addTag = () => {
    const nextTag = tagInput.trim()
    if (!nextTag) return

    if (!draft.tags.includes(nextTag)) {
      setDraft((previous) => ({ ...previous, tags: [...previous.tags, nextTag] }))
    }

    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    setDraft((previous) => ({ ...previous, tags: previous.tags.filter((tag) => tag !== tagToRemove) }))
  }

  if (!lead) {
    return null
  }

  return (
    <Sheet open={Boolean(lead)} onOpenChange={(open) => !open && onCancel()}>
      <SheetContent side="right" className="w-full max-w-none p-0 sm:max-w-[460px]">
        <SheetTitle className="sr-only">{draft.name ? `Editar lead ${draft.name}` : "Editar lead"}</SheetTitle>
        <LeadInspectorShell
          title={draft.name || "Novo lead"}
          subtitle={`Etapa: ${currentStageLabel}`}
          avatar={leadAvatar}
          badges={[
            { label: channelLabels[draft.channel], variant: "outline" },
            { label: valueLabel, variant: "secondary" },
            { label: priorityLabel, variant: priorityTone },
            { label: `Score ${normalizedScore}`, variant: "secondary" },
          ]}
          actions={
            onOpenInternalChat ? (
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-full border-border/60 bg-background px-3 text-xs font-medium shadow-sm"
                onClick={onOpenInternalChat}
              >
                <MessagesSquare className="mr-2 h-4 w-4" />
                Chat interno
              </Button>
            ) : undefined
          }
          onClose={onCancel}
          contactTab={
            <div className="space-y-4">
              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                      Editando lead
                    </p>
                    <h4 className="text-sm font-semibold text-foreground">{draft.name || "Novo lead"}</h4>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {lead.sourceConversationId ? "Vindo da inbox" : "Lead avulso"}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Nome</label>
                    <Input
                      value={draft.name}
                      onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
                      className="h-11 rounded-full bg-background/90 px-4"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Empresa</label>
                    <Input
                      value={draft.company}
                      onChange={(event) => setDraft((previous) => ({ ...previous, company: event.target.value }))}
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
                      className="h-11 rounded-full bg-background/90 px-4"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Responsável</label>
                    <Input
                      value={draft.assignee}
                      onChange={(event) => setDraft((previous) => ({ ...previous, assignee: event.target.value }))}
                      className="h-11 rounded-full bg-background/90 px-4"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Departamento</label>
                    <Input
                      value={draft.department}
                      onChange={(event) => setDraft((previous) => ({ ...previous, department: event.target.value }))}
                      className="h-11 rounded-full bg-background/90 px-4"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Último contato</label>
                    <Input
                      value={draft.lastContact}
                      onChange={(event) => setDraft((previous) => ({ ...previous, lastContact: event.target.value }))}
                      className="h-11 rounded-full bg-background/90 px-4"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Tags</h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {draft.tags.length > 0 ? (
                    draft.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                        {tag}
                        <button
                          type="button"
                          className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remover tag ${tag}`}
                        >
                          <Plus className="h-3 w-3 rotate-45" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Ainda não existem tags para este lead.</p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    placeholder="Adicionar tag"
                    className="h-10 rounded-full bg-background/90"
                  />
                  <Button className="h-10 rounded-full px-4" onClick={addTag}>
                    Salvar
                  </Button>
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

                <div className="space-y-2">
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
                  <p className="text-xs leading-5 text-muted-foreground">
                    Essa edição unifica a leitura do lead com a etapa comercial da pipeline.
                  </p>
                </div>
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
          }
          mediaTab={
            <div className="space-y-4">
              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Mídia</p>
                    <h4 className="text-sm font-semibold text-foreground">
                      {mediaEntries.length} item{mediaEntries.length === 1 ? "" : "s"}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSearchMedia("")}
                      className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-border hover:text-foreground"
                    >
                      Tudo
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchMedia("a")}
                      className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-border hover:text-foreground"
                    >
                      Mídia
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-border/60 bg-background/90 px-3 py-2 shadow-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchMedia}
                    onChange={(event) => setSearchMedia(event.target.value)}
                    placeholder="Buscar mídia"
                    className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>

                {mediaEntries.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {mediaEntries.map((item) => {
                      const Icon = getMediaIcon(item.type)
                      return (
                        <div key={item.id} className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.time}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[20px] border border-dashed border-border/70 bg-background/60 p-6 text-center">
                    <p className="text-sm font-medium text-foreground">Sem itens nessa busca</p>
                    <p className="mt-1 text-sm text-muted-foreground">Use outro termo para localizar anexos do lead.</p>
                  </div>
                )}
              </section>
            </div>
          }
          fieldsTab={
            <div className="space-y-4">
              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-foreground">Campos customizados</h4>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {lead.customFields?.length ?? 0} campos
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {(lead.customFields ?? []).length > 0 ? (
                    lead.customFields!.map((field) => (
                      <div key={field.id} className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          {field.label}
                        </p>
                        <p className="mt-2 text-sm text-foreground">{field.value}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-border/70 bg-background/60 p-6 text-center">
                      <p className="text-sm font-medium text-foreground">Nenhum campo customizado</p>
                      <p className="mt-1 text-sm text-muted-foreground">O lead ainda não recebeu campos extras.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          }
          funnelTab={
            <div className="space-y-4">
              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Funil</p>
                    <h4 className="text-sm font-semibold text-foreground">Etapas e associação comercial</h4>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {currentStageLabel}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-border/60 bg-background/90 px-3 py-2 shadow-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchStage}
                    onChange={(event) => setSearchStage(event.target.value)}
                    placeholder="Buscar etapa do funil"
                    className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  {stageEntries.map((stage) => {
                    const normalizedStageId = normalizePipelineStageId(stage.id) ?? stage.id
                    const active = draft.stageId === normalizedStageId

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
                                setDraft((previous) => ({ ...previous, stageId: normalizedStageId }))
                                return
                              }

                              if (active) {
                                return
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
          }
          chatbotTab={
            <div className="space-y-4">
              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">ChatBot</p>
                    <h4 className="text-sm font-semibold text-foreground">Bots ligados ao lead</h4>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {visibleBotBindings.filter((binding) => binding.enabled).length} ativos
                  </Badge>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-border/60 bg-background/90 px-3 py-2 shadow-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchBot}
                    onChange={(event) => setSearchBot(event.target.value)}
                    placeholder="Buscar chatbot"
                    className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  {visibleBotBindings.length > 0 ? (
                    visibleBotBindings.map((binding) => (
                      <div key={binding.id} className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{binding.label}</p>
                            <p className="text-xs text-muted-foreground">{binding.description || "Não adicionado"}</p>
                          </div>
                          <Switch
                            checked={binding.enabled}
                            onCheckedChange={(checked) => {
                              setBotBindings((previous) =>
                                previous.map((item) =>
                                  item.id === binding.id ? { ...item, enabled: checked } : item,
                                ),
                              )
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-border/70 bg-background/60 p-6 text-center">
                      <p className="text-sm font-medium text-foreground">Nenhum chatbot vinculado</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Use o chatbot da inbox para associar automações.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          }
          historyTab={
            <div className="space-y-4">
              <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                      Histórico
                    </p>
                    <h4 className="text-sm font-semibold text-foreground">Linha do tempo do lead</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "Tudo" },
                      { id: "ticket", label: "Ticket" },
                      { id: "bloqueio", label: "Bloqueios" },
                      { id: "ligacao", label: "Ligações" },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setHistoryFilter(filter.id as typeof historyFilter)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          historyFilter === filter.id
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border/60 bg-background/70 text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {historyEntries.length > 0 ? (
                    historyEntries.map((item) => {
                      const Icon =
                        item.kind === "ticket"
                          ? FileText
                          : item.kind === "bloqueio"
                            ? ShieldAlert
                            : item.kind === "ligacao"
                              ? Phone
                              : item.kind === "agendamento"
                                ? CalendarDays
                                : item.kind === "fechamento"
                                  ? ShieldAlert
                              : item.kind === "nota"
                                ? History
                                : Bot

                      return (
                        <div key={item.id} className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                              </div>
                              {item.description ? (
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-border/70 bg-background/60 p-6 text-center">
                      <p className="text-sm font-medium text-foreground">Sem eventos registrados</p>
                      <p className="mt-1 text-sm text-muted-foreground">O histórico aparece aqui quando houver atividade.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          }
        />

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
      </SheetContent>
    </Sheet>
  )
}
