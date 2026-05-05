"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import type {
  Conversation,
  LeadBotBinding,
  LeadCustomField,
  LeadMediaItem,
  LeadTimelineItem,
} from "@/lib/mock-data"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  CalendarDays,
  Edit3,
  FileText,
  GitBranch,
  History,
  ImageIcon,
  Mail,
  MapPin,
  MessageSquareText,
  MessagesSquare,
  Music2,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  UserRound,
  Video,
} from "lucide-react"
import { notifyAction } from "@/lib/button-actions"
import {
  getConversationPriority,
  getConversationStatusLabel,
  getPriorityLabel,
  getPriorityTone,
} from "@/lib/inbox"
import {
  getPipelineStageLabel,
  loadPipelineStagesFromStorage,
  normalizePipelineStageId,
  PIPELINE_STAGE_OPTIONS,
  PIPELINE_STORAGE_KEY,
  type PipelineStage,
} from "@/lib/pipeline-board"
import { LeadInspectorShell } from "@/components/dashboard/inspector/lead-inspector-shell"
import { LeadScheduleModal, type LeadSchedulePayload } from "@/components/dashboard/inspector/lead-operational-modals"

interface ContactProfileProps {
  conversation: Conversation
  onUpdateTags: (conversationId: number, tags: string[]) => void
  onUpdateScore: (conversationId: number, score: number) => void
  onUpdateProfile: (conversationId: number, updates: Partial<Conversation>) => void
  onScheduleMeeting: (conversationId: number, nextMeeting: LeadSchedulePayload) => void
  onOpenInternalChat?: () => void
  onCloseInspector: () => void
}

const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "E-mail",
  webchat: "Chat do site",
}

const mediaFilters = [
  { id: "midia", label: "Mídia" },
  { id: "audio", label: "Áudio" },
  { id: "docs", label: "Docs" },
  { id: "outros", label: "Outros" },
] as const

const historyFilters = [
  { id: "all", label: "Tudo" },
  { id: "ticket", label: "Ticket" },
  { id: "bloqueio", label: "Bloqueios" },
  { id: "ligacao", label: "Ligações" },
] as const

const statusOptions: Array<{ value: Conversation["status"]; label: string }> = [
  { value: "novo", label: "Pendente" },
  { value: "ativo", label: "Ativo" },
  { value: "resolvido", label: "Fechado" },
]

const departmentOptions = ["Comercial", "Onboarding", "Suporte", "Operações", "Automação"]
const assigneeOptions = ["Ana Souza", "Camila Rocha", "Time Comercial", "Equipe Bot", "Suporte", "Onboarding"]

const defaultBotBindings: LeadBotBinding[] = [
  { id: 1, label: "NYM oficial", enabled: false },
  { id: 2, label: "Vini", enabled: false },
  { id: 3, label: "teste jestsales", enabled: false },
  { id: 4, label: "Atendimento inicial teste", enabled: false },
]

function parseMeetingDate(value: string) {
  const parts = value.split("/")
  if (parts.length !== 3) return undefined

  const [day, month, year] = parts
  const parsed = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function formatMeetingDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function normalizeMediaGroup(group?: LeadMediaItem["group"]) {
  return group ?? "midia"
}

function getMediaIcon(type: LeadMediaItem["type"]) {
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

export function ContactProfile({
  conversation,
  onUpdateTags,
  onUpdateScore,
  onUpdateProfile,
  onScheduleMeeting,
  onOpenInternalChat,
  onCloseInspector,
}: ContactProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleDraft, setScheduleDraft] = useState<LeadSchedulePayload>({
    date: "",
    time: "10:30",
    assignee: "",
    message: "",
  })
  const [noteDraft, setNoteDraft] = useState("")
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([])
  const [mediaFilter, setMediaFilter] = useState<(typeof mediaFilters)[number]["id"]>("midia")
  const [historyFilter, setHistoryFilter] = useState<(typeof historyFilters)[number]["id"]>("all")
  const [customFields, setCustomFields] = useState<LeadCustomField[]>(conversation.customFields ?? [])
  const [customFieldDraft, setCustomFieldDraft] = useState({ label: "", value: "" })
  const [botBindings, setBotBindings] = useState<LeadBotBinding[]>(
    (conversation.botBindings?.length ? conversation.botBindings : defaultBotBindings).map((binding) => ({ ...binding })),
  )
  const [botSearch, setBotSearch] = useState("")
  const [funnelSearch, setFunnelSearch] = useState("")
  const [draftProfile, setDraftProfile] = useState({
    name: conversation.name,
    phone: conversation.phone ?? "",
    email: conversation.email ?? "",
    location: conversation.location ?? "",
    customerSince: conversation.customerSince ?? "",
    assignee: conversation.assignee ?? "",
    department: conversation.department ?? "Comercial",
    status: conversation.status,
  })

  useEffect(() => {
    setDraftProfile({
      name: conversation.name,
      phone: conversation.phone ?? "",
      email: conversation.email ?? "",
      location: conversation.location ?? "",
      customerSince: conversation.customerSince ?? "",
      assignee: conversation.assignee ?? "",
      department: conversation.department ?? "Comercial",
      status: conversation.status,
    })
    setSelectedDate(
      conversation.scheduledAt
        ? parseMeetingDate(conversation.scheduledAt)
        : conversation.nextMeeting
          ? parseMeetingDate(conversation.nextMeeting)
          : undefined,
    )
    setScheduleDraft({
      date: conversation.scheduledAt ?? conversation.nextMeeting ?? "",
      time: conversation.scheduledTime ?? "10:30",
      assignee: conversation.scheduledBy ?? conversation.assignee ?? "",
      message: conversation.scheduledMessage ?? "",
    })
    setCustomFields(conversation.customFields ? conversation.customFields.map((field) => ({ ...field })) : [])
    setBotBindings(
      (conversation.botBindings?.length ? conversation.botBindings : defaultBotBindings).map((binding) => ({
        ...binding,
      })),
    )
    setIsEditing(false)
    setTagInput("")
    setCustomFieldDraft({ label: "", value: "" })
    setBotSearch("")
    setFunnelSearch("")
    setHistoryFilter("all")
    setMediaFilter("midia")
    setNoteDraft("")
    setScheduleOpen(false)
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

  const priority = getConversationPriority(conversation)
  const priorityLabel = getPriorityLabel(priority)
  const priorityTone = getPriorityTone(priority)
  const noteCount = conversation.internalNotes?.length ?? 0
  const mediaItems = useMemo(() => {
    const items = [...(conversation.media ?? [])]
    return items.sort((left, right) => left.time.localeCompare(right.time))
  }, [conversation.media])
  const filteredMedia = mediaItems.filter((item) => normalizeMediaGroup(item.group) === mediaFilter)
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
  const nextMeetingLabel = useMemo(() => {
    if (selectedDate) {
      return formatMeetingDate(selectedDate)
    }

    if (conversation.scheduledAt) {
      return conversation.scheduledTime
        ? `${conversation.scheduledAt} • ${conversation.scheduledTime}`
        : conversation.scheduledAt
    }

    return conversation.nextMeeting ?? "Agendar mensagem"
  }, [conversation.nextMeeting, conversation.scheduledAt, conversation.scheduledTime, selectedDate])
  const historyItems = useMemo(() => {
    const fromTimeline = (conversation.timeline ?? []).map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      description: item.description ?? "",
      time: item.time,
    }))

    const fromNotes = (conversation.internalNotes ?? []).map((note) => ({
      id: 1000 + note.id,
      kind: "nota" as const,
      title: "Nota interna",
      description: note.content,
      time: note.time,
    }))

    const fromMessages = conversation.messages.map((message, index) => ({
      id: 2000 + message.id + index,
      kind: "mensagem" as const,
      title:
        message.sender === "contact"
          ? "Mensagem do contato"
          : message.sender === "bot"
            ? "Resposta do bot"
            : "Mensagem do time",
      description: message.content,
      time: message.time,
    }))

    const items = [...fromTimeline, ...fromNotes, ...fromMessages]
    if (historyFilter === "all") {
      return items
    }

    return items.filter((item) => item.kind === historyFilter)
  }, [conversation.internalNotes, conversation.messages, conversation.timeline, historyFilter])
  const botBindingsVisible = botBindings.filter((binding) =>
    binding.label.toLowerCase().includes(botSearch.trim().toLowerCase()),
  )
  const funnelStagesVisible = pipelineOptions.filter((stage) =>
    stage.label.toLowerCase().includes(funnelSearch.trim().toLowerCase()),
  )

  const handleSaveProfile = () => {
    onUpdateProfile(conversation.id, {
      name: draftProfile.name,
      phone: draftProfile.phone,
      email: draftProfile.email,
      location: draftProfile.location,
      customerSince: draftProfile.customerSince,
      assignee: draftProfile.assignee,
      department: draftProfile.department,
      status: draftProfile.status,
    })
    setIsEditing(false)
  }

  const handleAddTag = () => {
    const nextTag = tagInput.trim()
    if (!nextTag) return

    if (!conversation.tags.includes(nextTag)) {
      onUpdateTags(conversation.id, [...conversation.tags, nextTag])
    }

    setTagInput("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(
      conversation.id,
      conversation.tags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleScoreChange = (value: number[]) => {
    onUpdateScore(conversation.id, value[0] ?? 0)
  }

  const handleScheduleMeeting = (payload: LeadSchedulePayload) => {
    if (!payload.date) return

    const parsed = parseMeetingDate(payload.date)
    if (parsed) {
      setSelectedDate(parsed)
    }

    setScheduleDraft(payload)
    onScheduleMeeting(conversation.id, payload)
    notifyAction("Mensagem agendada", `${payload.date}${payload.time ? ` às ${payload.time}` : ""}.`)
  }

  const handleAddCustomField = () => {
    const nextLabel = customFieldDraft.label.trim()
    const nextValue = customFieldDraft.value.trim()
    if (!nextLabel || !nextValue) return

    const nextField: LeadCustomField = {
      id: Date.now(),
      label: nextLabel,
      value: nextValue,
    }

    const nextFields = [...customFields, nextField]
    setCustomFields(nextFields)
    onUpdateProfile(conversation.id, { customFields: nextFields })
    setCustomFieldDraft({ label: "", value: "" })
  }

  const handleRemoveCustomField = (fieldId: number) => {
    const nextFields = customFields.filter((field) => field.id !== fieldId)
    setCustomFields(nextFields)
    onUpdateProfile(conversation.id, { customFields: nextFields })
  }

  const handleChangeCustomField = (fieldId: number, value: string) => {
    const nextFields = customFields.map((field) => (field.id === fieldId ? { ...field, value } : field))
    setCustomFields(nextFields)
    onUpdateProfile(conversation.id, { customFields: nextFields })
  }

  const handleAddNote = () => {
    const content = noteDraft.trim()
    if (!content) return

    const nextNotes = [
      ...(conversation.internalNotes ?? []),
      {
        id: Date.now(),
        content,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]

    onUpdateProfile(conversation.id, { internalNotes: nextNotes })
    setNoteDraft("")
  }

  const handleToggleBotBinding = (bindingId: number, enabled: boolean) => {
    const nextBindings = botBindings.map((binding) =>
      binding.id === bindingId ? { ...binding, enabled } : binding,
    )
    setBotBindings(nextBindings)
    onUpdateProfile(conversation.id, { botBindings: nextBindings })
  }

  const handleUpdatePipeline = (stageId: string) => {
    onUpdateProfile(conversation.id, { pipeline: stageId })
  }

  const contactTab = (
    <div className="space-y-3">
      <Accordion type="multiple" defaultValue={["status", "tags", "schedule", "owners", "notes", "details"]} className="space-y-3">
        <AccordionItem value="status" className="overflow-hidden rounded-[24px] border border-border/60 bg-background/80 shadow-sm">
          <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Status do lead</p>
                <p className="text-sm font-semibold text-foreground">Situação, pipeline e score</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {getConversationStatusLabel(conversation)}
                </Badge>
                <Badge variant={priorityTone} className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {priorityLabel}
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Status do lead</label>
                  <Select
                    value={draftProfile.status}
                    onValueChange={(value) => {
                      const status = value as Conversation["status"]
                      setDraftProfile((previous) => ({ ...previous, status }))
                      onUpdateProfile(conversation.id, { status })
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Pipeline</label>
                  <Select value={currentPipelineId} onValueChange={handleUpdatePipeline}>
                    <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
                      <SelectValue placeholder="Atribuir etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-[20px] border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Lead score</p>
                    <p className="mt-1 text-3xl font-semibold text-foreground">{conversation.score}</p>
                  </div>
                  <div className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                    {currentPipelineLabel || "Sem etapa"}
                  </div>
                </div>
                <Slider value={[conversation.score]} min={0} max={100} step={1} onValueChange={handleScoreChange} className="py-2" />
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Frio</span>
                  <span>Quente</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tags" className="overflow-hidden rounded-[24px] border border-border/60 bg-background/80 shadow-sm">
          <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Etiquetas</p>
                <p className="text-sm font-semibold text-foreground">Organização e segmentação do lead</p>
              </div>
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                {conversation.tags.length} tags
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {conversation.tags.length > 0 ? (
                  conversation.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remover tag ${tag}`}
                      >
                        <Plus className="h-3 w-3 rotate-45" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Ainda não existem tags para este contato.</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="Adicionar tag"
                  className="h-10 rounded-full bg-background/90"
                />
                <Button className="h-10 rounded-full px-4" onClick={handleAddTag}>
                  Salvar
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="schedule" className="overflow-hidden rounded-[24px] border border-border/60 bg-background/80 shadow-sm">
          <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Agendar mensagem</p>
                <p className="text-sm font-semibold text-foreground">Retorno, follow-up ou lembrete</p>
              </div>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                {nextMeetingLabel}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              <div className="rounded-[20px] border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Próximo agendamento</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {conversation.scheduledAt ? conversation.scheduledAt : "Nenhum agendamento definido"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {conversation.scheduledTime ? `${conversation.scheduledTime} • ` : ""}
                      {conversation.scheduledBy || conversation.assignee || "Sem responsável"}
                    </p>
                  </div>
                  <Button className="rounded-full" onClick={() => setScheduleOpen(true)}>
                    Agendar mensagem
                  </Button>
                </div>
                {conversation.scheduledMessage ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{conversation.scheduledMessage}</p>
                ) : null}
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Use este bloco para organizar retorno, reunião ou follow-up do atendimento.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="owners" className="overflow-hidden rounded-[24px] border border-border/60 bg-background/80 shadow-sm">
          <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Atendente padrão</p>
                <p className="text-sm font-semibold text-foreground">{draftProfile.assignee || "Sem responsável"}</p>
              </div>
              <UserRound className="h-4 w-4 text-muted-foreground" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2">
              <Select
                value={draftProfile.assignee}
                onValueChange={(value) => {
                  setDraftProfile((previous) => ({ ...previous, assignee: value }))
                  onUpdateProfile(conversation.id, { assignee: value })
                }}
              >
                <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  {assigneeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-muted-foreground">
                Ajuste quem deve aparecer como responsável padrão da conversa.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="department" className="overflow-hidden rounded-[24px] border border-border/60 bg-background/80 shadow-sm">
          <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Departamento padrão</p>
                <p className="text-sm font-semibold text-foreground">{draftProfile.department}</p>
              </div>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2">
              <Select
                value={draftProfile.department}
                onValueChange={(value) => {
                  setDraftProfile((previous) => ({ ...previous, department: value }))
                  onUpdateProfile(conversation.id, { department: value })
                }}
              >
                <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
                  <SelectValue placeholder="Selecionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-muted-foreground">
                O departamento ajuda a filtrar e organizar a fila principal.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notes" className="overflow-hidden rounded-[24px] border border-border/60 bg-background/80 shadow-sm">
          <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Observações</p>
                <p className="text-sm font-semibold text-foreground">{noteCount} nota{noteCount === 1 ? "" : "s"}</p>
              </div>
              <MessageSquareText className="h-4 w-4 text-muted-foreground" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              {conversation.internalNotes?.length ? (
                <div className="space-y-2">
                  {conversation.internalNotes.map((note) => (
                    <div key={note.id} className="rounded-[18px] border border-border/60 bg-background/90 p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm leading-6 text-foreground">{note.content}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{note.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-border/70 bg-background/60 p-5 text-center">
                  <p className="text-sm font-medium text-foreground">Nenhuma observação interna</p>
                  <p className="mt-1 text-sm text-muted-foreground">Escreva uma nota rápida para o time.</p>
                </div>
              )}

              <Textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Escreva uma nota interna para o time..."
                className="min-h-28 rounded-[20px] bg-background/90"
              />

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" className="rounded-full bg-transparent" onClick={() => setNoteDraft("")}>
                  Limpar
                </Button>
                <Button className="rounded-full" onClick={handleAddNote}>
                  Salvar nota
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="details" className="overflow-hidden rounded-[24px] border border-border/60 bg-background/80 shadow-sm">
          <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Outras informações</p>
                <p className="text-sm font-semibold text-foreground">Dados do contato e edição rápida</p>
              </div>
              <Edit3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="mb-3 flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing((previous) => !previous)}
              >
                <Edit3 className="mr-2 h-3.5 w-3.5" />
                {isEditing ? "Fechar edição" : "Editar"}
              </Button>
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Nome</label>
                    <Input
                      value={draftProfile.name}
                      onChange={(event) => setDraftProfile((previous) => ({ ...previous, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Telefone</label>
                    <Input
                      value={draftProfile.phone}
                      onChange={(event) => setDraftProfile((previous) => ({ ...previous, phone: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">E-mail</label>
                    <Input
                      value={draftProfile.email}
                      onChange={(event) => setDraftProfile((previous) => ({ ...previous, email: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Localização</label>
                    <Input
                      value={draftProfile.location}
                      onChange={(event) => setDraftProfile((previous) => ({ ...previous, location: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Cliente desde</label>
                    <Input
                      value={draftProfile.customerSince}
                      onChange={(event) =>
                        setDraftProfile((previous) => ({ ...previous, customerSince: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" className="rounded-full" onClick={handleSaveProfile}>
                    Salvar alterações
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-transparent"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Telefone" value={conversation.phone || "Sem telefone"} />
                <InfoRow icon={<Mail className="h-4 w-4" />} label="E-mail" value={conversation.email || "Sem e-mail"} />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Localização"
                  value={conversation.location || "Sem localização"}
                />
                <InfoRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Cliente desde"
                  value={conversation.customerSince || "Agora"}
                />
                <InfoRow
                  icon={<MessageSquareText className="h-4 w-4" />}
                  label="Responsável"
                  value={conversation.assignee || "Não atribuído"}
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <LeadScheduleModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        initialDate={scheduleDraft.date}
        initialTime={scheduleDraft.time}
        initialAssignee={scheduleDraft.assignee}
        initialMessage={scheduleDraft.message}
        onConfirm={handleScheduleMeeting}
      />
    </div>
  )

  const mediaTab = (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Mídia</p>
            <h4 className="text-sm font-semibold text-foreground">{mediaItems.length} itens anexados</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {mediaFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setMediaFilter(filter.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  mediaFilter === filter.id
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredMedia.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredMedia.map((item) => {
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
            <p className="text-sm font-medium text-foreground">Sem itens nessa categoria</p>
            <p className="mt-1 text-sm text-muted-foreground">A mídia do contato aparece aqui quando houver anexos.</p>
          </div>
        )}
      </section>
    </div>
  )

  const fieldsTab = (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Campos customizados</h4>
          </div>
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
            {customFields.length} campos
          </Badge>
        </div>

        <div className="mt-4 space-y-3">
          {customFields.length > 0 ? (
            customFields.map((field) => (
              <div key={field.id} className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {field.label}
                    </p>
                    <Input
                      value={field.value}
                      onChange={(event) => handleChangeCustomField(field.id, event.target.value)}
                      className="h-10 rounded-full bg-background/90"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-5 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveCustomField(field.id)}
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-border/70 bg-background/60 p-6 text-center">
              <p className="text-sm font-medium text-foreground">Nenhum campo customizado</p>
              <p className="mt-1 text-sm text-muted-foreground">Adicione campos para manter contexto operacional.</p>
            </div>
          )}

          <div className="grid gap-2 rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
            <Input
              value={customFieldDraft.label}
              onChange={(event) =>
                setCustomFieldDraft((previous) => ({ ...previous, label: event.target.value }))
              }
              placeholder="Nome do campo"
              className="h-10 rounded-full bg-background/90"
            />
            <Input
              value={customFieldDraft.value}
              onChange={(event) =>
                setCustomFieldDraft((previous) => ({ ...previous, value: event.target.value }))
              }
              placeholder="Valor"
              className="h-10 rounded-full bg-background/90"
            />
            <Button className="h-10 rounded-full px-4" onClick={handleAddCustomField}>
              Salvar
            </Button>
          </div>
        </div>
      </section>
    </div>
  )

  const funnelTab = (
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

  const chatbotTab = (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">ChatBot</p>
            <h4 className="text-sm font-semibold text-foreground">Bots e fluxos ligados ao contato</h4>
          </div>
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
            {botBindingsVisible.filter((binding) => binding.enabled).length} ativos
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-border/60 bg-background/90 px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={botSearch}
            onChange={(event) => setBotSearch(event.target.value)}
            placeholder="Buscar chatbot"
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="mt-4 space-y-3">
          {botBindingsVisible.map((binding) => (
            <div key={binding.id} className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{binding.label}</p>
                  <p className="text-xs text-muted-foreground">{binding.description || "Não adicionado"}</p>
                </div>
                <Switch
                  checked={binding.enabled}
                  onCheckedChange={(checked) => handleToggleBotBinding(binding.id, checked)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  const historyTab = (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Histórico</p>
            <h4 className="text-sm font-semibold text-foreground">Linha do tempo do atendimento</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {historyFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setHistoryFilter(filter.id)}
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
          {historyItems.length > 0 ? (
            historyItems.map((item) => (
              <HistoryRow key={item.id} kind={item.kind} title={item.title} description={item.description} time={item.time} />
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-border/70 bg-background/60 p-6 text-center">
              <p className="text-sm font-medium text-foreground">Nada neste filtro</p>
              <p className="mt-1 text-sm text-muted-foreground">Selecione outro filtro para ver eventos do contato.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )

  return (
    <LeadInspectorShell
      title={conversation.name}
      subtitle={`${channelLabels[conversation.channel]} • ${conversation.assignee || "Sem responsável"}`}
      avatar={conversation.avatar}
      badges={[
        { label: getConversationStatusLabel(conversation), variant: "outline" },
        { label: priorityLabel, variant: priorityTone },
        { label: `Score ${conversation.score}`, variant: "secondary" },
        { label: `${noteCount} nota${noteCount === 1 ? "" : "s"}`, variant: "secondary" },
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
      onClose={onCloseInspector}
      contactTab={contactTab}
      mediaTab={mediaTab}
      fieldsTab={fieldsTab}
      funnelTab={funnelTab}
      chatbotTab={chatbotTab}
      historyTab={historyTab}
    />
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}

function HistoryRow({
  kind,
  title,
  description,
  time,
}: {
  kind: LeadTimelineItem["kind"]
  title: string
  description?: string
  time: string
}) {
  const Icon =
    kind === "ticket"
      ? FileText
      : kind === "bloqueio"
        ? ShieldAlert
        : kind === "ligacao"
          ? Phone
          : kind === "agendamento"
            ? CalendarDays
            : kind === "fechamento"
              ? ShieldAlert
          : kind === "nota"
            ? History
            : MessageSquareText

  return (
    <div className="rounded-[20px] border border-border/60 bg-background/90 p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
          </div>
          {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
      </div>
    </div>
  )
}
