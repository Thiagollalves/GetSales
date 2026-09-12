"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { CalendarDays, Edit3, GitBranch, Mail, MapPin, MessageSquareText, Phone, Plus, UserRound } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { notifyAction } from "@/lib/button-actions"
import { getConversationPriority, getConversationStatusLabel, getPriorityLabel, getPriorityTone } from "@/lib/inbox"
import { getPipelineStageLabel, normalizePipelineStageId, PIPELINE_STAGE_OPTIONS } from "@/lib/pipeline-board"
import { LeadScheduleModal, type LeadSchedulePayload } from "@/components/dashboard/inspector/lead-operational-modals"
import type { Conversation } from "@/lib/mock-data"

const statusOptions: Array<{ value: Conversation["status"]; label: string }> = [
  { value: "novo", label: "Pendente" },
  { value: "ativo", label: "Ativo" },
  { value: "resolvido", label: "Fechado" },
]

const departmentOptions = ["Comercial", "Onboarding", "Suporte", "Operações", "Automação"]
const assigneeOptions = ["Ana Souza", "Camila Rocha", "Time Comercial", "Equipe Bot", "Suporte", "Onboarding"]

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

interface ContactTabProps {
  conversation: Conversation
  onUpdateTags: (conversationId: number, tags: string[]) => void
  onUpdateScore: (conversationId: number, score: number) => void
  onUpdateProfile: (conversationId: number, updates: Partial<Conversation>) => void
  onScheduleMeeting: (conversationId: number, nextMeeting: LeadSchedulePayload) => void
}

export function ContactTab({
  conversation,
  onUpdateTags,
  onUpdateScore,
  onUpdateProfile,
  onScheduleMeeting,
}: ContactTabProps) {
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
    setIsEditing(false)
    setTagInput("")
    setNoteDraft("")
    setScheduleOpen(false)
  }, [conversation])

  const priority = getConversationPriority(conversation)
  const priorityLabel = getPriorityLabel(priority)
  const priorityTone = getPriorityTone(priority)
  const noteCount = conversation.internalNotes?.length ?? 0

  const currentPipelineId = normalizePipelineStageId(conversation.pipeline) ?? conversation.pipeline?.trim() ?? ""
  const currentPipelineLabel =
    PIPELINE_STAGE_OPTIONS.find((option) => option.id === currentPipelineId)?.label ||
    getPipelineStageLabel(conversation.pipeline) ||
    "Sem etapa"

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

  const handleUpdatePipeline = (stageId: string) => {
    onUpdateProfile(conversation.id, { pipeline: stageId })
  }

  return (
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
