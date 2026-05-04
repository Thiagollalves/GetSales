"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import type { Conversation } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Edit3,
  Mail,
  MapPin,
  MessageSquareText,
  PanelRightClose,
  Phone,
  Plus,
  ShieldAlert,
  Tag,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react"
import { notifyAction } from "@/lib/button-actions"
import {
  getConversationPriority,
  getConversationStatusLabel,
  getPriorityLabel,
  getPriorityTone,
} from "@/lib/inbox"

interface ContactProfileProps {
  conversation: Conversation
  onUpdateTags: (conversationId: number, tags: string[]) => void
  onUpdateScore: (conversationId: number, score: number) => void
  onUpdateProfile: (conversationId: number, updates: Partial<Conversation>) => void
  onScheduleMeeting: (conversationId: number, nextMeeting: string) => void
  onCloseInspector: () => void
}

const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "E-mail",
  webchat: "Chat do site",
}

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

export function ContactProfile({
  conversation,
  onUpdateTags,
  onUpdateScore,
  onUpdateProfile,
  onScheduleMeeting,
  onCloseInspector,
}: ContactProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [draftProfile, setDraftProfile] = useState({
    name: conversation.name,
    phone: conversation.phone ?? "",
    email: conversation.email ?? "",
    location: conversation.location ?? "",
    customerSince: conversation.customerSince ?? "",
    assignee: conversation.assignee ?? "",
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
      status: conversation.status,
    })
    setSelectedDate(conversation.nextMeeting ? parseMeetingDate(conversation.nextMeeting) : undefined)
    setIsEditing(false)
    setTagInput("")
  }, [conversation])

  const priority = getConversationPriority(conversation)
  const priorityLabel = getPriorityLabel(priority)
  const priorityTone = getPriorityTone(priority)
  const noteCount = conversation.internalNotes?.length ?? 0
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  const nextMeetingLabel = useMemo(() => {
    if (selectedDate) {
      return formatMeetingDate(selectedDate)
    }

    return conversation.nextMeeting ?? "Agendar reunião"
  }, [conversation.nextMeeting, selectedDate])

  const handleSaveProfile = () => {
    onUpdateProfile(conversation.id, {
      name: draftProfile.name,
      phone: draftProfile.phone,
      email: draftProfile.email,
      location: draftProfile.location,
      customerSince: draftProfile.customerSince,
      assignee: draftProfile.assignee,
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

  const handleScheduleMeeting = (date: Date | undefined) => {
    if (!date) return

    const formatted = formatMeetingDate(date)
    setSelectedDate(date)
    onScheduleMeeting(conversation.id, formatted)
    notifyAction("Reunião agendada", `Próxima reunião em ${formatted}.`)
  }

  const handleCall = () => {
    notifyAction("Ligar", `Iniciando chamada para ${conversation.name}.`)
  }

  const handleBlock = () => {
    notifyAction("Bloquear contato", `${conversation.name} será bloqueado após confirmação.`)
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,246,239,0.94))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="border-b border-border/60 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Inspector do contato
            </p>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-base font-semibold text-foreground">
                {conversation.avatar}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-foreground">{conversation.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {channelLabels[conversation.channel]} • {conversation.assignee || "Sem responsável"}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            onClick={onCloseInspector}
            title="Recolher inspector"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
            {getConversationStatusLabel(conversation)}
          </Badge>
          <Badge variant={priorityTone} className="rounded-full px-2.5 py-1 text-[11px] font-medium">
            {priorityLabel}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
            Score {conversation.score}
          </Badge>
          {noteCount > 0 ? (
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
              {noteCount} nota{noteCount === 1 ? "" : "s"}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  Última interação
                </p>
                <p className="text-sm leading-6 text-foreground">
                  {lastMessage?.content || conversation.lastMessage}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                <span className="text-sm font-semibold text-foreground">{conversation.time}</span>
                <span className="text-xs text-muted-foreground">{conversation.lastMessage}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">Dados do contato</h4>
              </div>
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Nome</label>
                    <Input
                      value={draftProfile.name}
                      onChange={(event) => setDraftProfile((previous) => ({ ...previous, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Responsável</label>
                    <Input
                      value={draftProfile.assignee}
                      onChange={(event) =>
                        setDraftProfile((previous) => ({ ...previous, assignee: event.target.value }))
                      }
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
                      onChange={(event) =>
                        setDraftProfile((previous) => ({ ...previous, location: event.target.value }))
                      }
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
          </section>

          <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Tags</h4>
            </div>

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

            <div className="mt-4 flex gap-2">
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
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Lead score</p>
                  <p className="mt-1 text-3xl font-semibold text-foreground">{conversation.score}</p>
                </div>
                <div className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                  {getConversationStatusLabel(conversation)}
                </div>
              </div>

              <Slider
                value={[conversation.score]}
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

          <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Agendamento</h4>
            </div>

            <div className="space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-between rounded-full bg-transparent px-4"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      {nextMeetingLabel}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto rounded-[20px] border-border/60 p-2 shadow-xl" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={handleScheduleMeeting} initialFocus />
                </PopoverContent>
              </Popover>
              <p className="text-xs leading-5 text-muted-foreground">
                Use este bloco para organizar retorno, reunião ou follow-up do atendimento.
              </p>

            </div>
          </section>

          <section className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Ações rápidas</h4>
            </div>

            <div className="grid gap-2">
              <Button variant="outline" className="w-full justify-start rounded-full bg-transparent" onClick={handleCall}>
                <Phone className="mr-2 h-4 w-4" />
                Ligar
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-full bg-transparent"
                onClick={() => notifyAction("Resumo", conversation.lastMessage)}
              >
                <Target className="mr-2 h-4 w-4" />
                Ver resumo
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-full bg-transparent text-destructive hover:text-destructive"
                onClick={handleBlock}
              >
                Bloquear contato
              </Button>
            </div>
          </section>
        </div>
      </div>
    </section>
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
