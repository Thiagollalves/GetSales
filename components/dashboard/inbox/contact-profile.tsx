"use client"

import type { Conversation } from "@/app/dashboard/inbox/page"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Phone, Mail, MapPin, Calendar as CalendarIcon, UserCircle2, Tag, TrendingUp, Edit } from "lucide-react"
import { notifyAction } from "@/lib/button-actions"

interface ContactProfileProps {
  conversation: Conversation
  onUpdateTags: (conversationId: number, tags: string[]) => void
  onUpdateScore: (conversationId: number, score: number) => void
  onUpdateProfile: (conversationId: number, updates: Partial<Conversation>) => void
  onScheduleMeeting: (conversationId: number, nextMeeting: string) => void
}

export function ContactProfile({
  conversation,
  onUpdateTags,
  onUpdateScore,
  onUpdateProfile,
  onScheduleMeeting,
}: ContactProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [showTagInput, setShowTagInput] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [draftProfile, setDraftProfile] = useState({
    name: conversation.name,
    phone: conversation.phone ?? "",
    email: conversation.email ?? "",
    location: conversation.location ?? "",
    customerSince: conversation.customerSince ?? "",
    status: conversation.status,
    assignee: conversation.assignee ?? "",
  })

  useEffect(() => {
    setDraftProfile({
      name: conversation.name,
      phone: conversation.phone ?? "",
      email: conversation.email ?? "",
      location: conversation.location ?? "",
      customerSince: conversation.customerSince ?? "",
      status: conversation.status,
      assignee: conversation.assignee ?? "",
    })
    if (conversation.nextMeeting) {
      const parsedDate = new Date(conversation.nextMeeting.split("/").reverse().join("-"))
      if (!Number.isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate)
      }
    } else {
      setSelectedDate(undefined)
    }
  }, [conversation])

  const scoreColorClass =
    conversation.score >= 80 ? "bg-emerald-500" : conversation.score >= 50 ? "bg-amber-500" : "bg-rose-500"

  const handleEditProfile = () => {
    setDraftProfile({
      name: conversation.name,
      phone: conversation.phone ?? "",
      email: conversation.email ?? "",
      location: conversation.location ?? "",
      customerSince: conversation.customerSince ?? "",
      status: conversation.status,
      assignee: conversation.assignee ?? "",
    })
    setIsEditing(true)
  }

  const handleAddTag = () => {
    setShowTagInput(true)
  }

  const handleConfirmTag = () => {
    const nextTag = tagInput.trim()
    if (!nextTag) return
    if (conversation.tags.includes(nextTag)) {
      setTagInput("")
      setShowTagInput(false)
      return
    }
    onUpdateTags(conversation.id, [...conversation.tags, nextTag])
    setTagInput("")
    setShowTagInput(false)
  }

  const handleCall = () => {
    notifyAction("Ligar", `Iniciando chamada para ${conversation.name}.`)
  }

  const handleBlock = () => {
    notifyAction("Bloquear contato", `${conversation.name} será bloqueado após confirmação.`)
  }

  const handleScoreChange = (value: number) => {
    onUpdateScore(conversation.id, value)
  }

  const handleSaveProfile = () => {
    onUpdateProfile(conversation.id, {
      name: draftProfile.name,
      phone: draftProfile.phone,
      email: draftProfile.email,
      location: draftProfile.location,
      customerSince: draftProfile.customerSince,
      status: draftProfile.status,
      assignee: draftProfile.assignee,
    })
    setIsEditing(false)
  }

  const handleScheduleMeeting = (date: Date | undefined) => {
    if (!date) return
    const formatted = date.toLocaleDateString("pt-BR")
    onScheduleMeeting(conversation.id, formatted)
    setSelectedDate(date)
    notifyAction("Reunião agendada", `Próxima reunião em ${formatted}.`)
  }

  return (
    <div className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
      {/* Profile Header */}
      <div className="text-center pb-4 border-b border-border">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-medium mx-auto">
          {conversation.avatar}
        </div>
        <h3 className="font-semibold mt-3">{conversation.name}</h3>
        <div className="flex justify-center gap-2 mt-2">
          {conversation.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Lead Score */}
      <div className="py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Lead Score
          </span>
          <span className="text-lg font-bold text-primary">{conversation.score}</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full ${scoreColorClass} rounded-full`} style={{ width: `${conversation.score}%` }} />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={conversation.score}
          onChange={(event) => handleScoreChange(Number(event.target.value))}
          className="mt-3 w-full"
        />
      </div>

      {/* Contact Info */}
      <div className="py-4 border-b border-border space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          Informações
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={handleEditProfile}>
            <Edit className="h-3 w-3" />
          </Button>
        </h4>
        {isEditing ? (
          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Status do atendimento</label>
              <Select
                value={draftProfile.status}
                onValueChange={(value) =>
                  setDraftProfile((prev) => ({ ...prev, status: value as Conversation["status"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="ativo">Em atendimento</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Responsável</label>
              <Input
                value={draftProfile.assignee}
                onChange={(event) => setDraftProfile((prev) => ({ ...prev, assignee: event.target.value }))}
                placeholder="Nome do agente"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nome</label>
              <Input
                value={draftProfile.name}
                onChange={(event) => setDraftProfile((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Telefone</label>
              <Input
                value={draftProfile.phone}
                onChange={(event) => setDraftProfile((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">E-mail</label>
              <Input
                value={draftProfile.email}
                onChange={(event) => setDraftProfile((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Localização</label>
              <Input
                value={draftProfile.location}
                onChange={(event) => setDraftProfile((prev) => ({ ...prev, location: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Cliente desde</label>
              <Input
                value={draftProfile.customerSince}
                onChange={(event) => setDraftProfile((prev) => ({ ...prev, customerSince: event.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleSaveProfile}>
                Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserCircle2 className="h-4 w-4" />
              <span>
                Status:{" "}
                {conversation.status === "novo"
                  ? "Novo"
                  : conversation.status === "ativo"
                    ? "Em atendimento"
                    : "Resolvido"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserCircle2 className="h-4 w-4" />
              <span>Responsável: {conversation.assignee || "Não atribuído"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{conversation.phone || "Sem telefone"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{conversation.email || "Sem e-mail"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{conversation.location || "Sem localização"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>Cliente desde {conversation.customerSince || "agora"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="py-4 border-b border-border">
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4" />
          Tags
        </h4>
        <div className="flex flex-wrap gap-2">
          {conversation.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
              {tag}
            </span>
          ))}
          {showTagInput ? (
            <div className="flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="Nova tag"
                className="h-7 text-xs"
              />
              <Button size="sm" onClick={handleConfirmTag}>
                Salvar
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent" onClick={handleAddTag}>
              + Adicionar
            </Button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="py-4 space-y-2">
        <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleCall}>
          <Phone className="h-4 w-4 mr-2" />
          Ligar
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {conversation.nextMeeting ? `Reunião: ${conversation.nextMeeting}` : "Agendar reunião"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleScheduleMeeting}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
          onClick={handleBlock}
        >
          Bloquear contato
        </Button>
      </div>
    </div>
  )
}
