"use client"

import { useEffect, useMemo, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { InternalConversationType, TeamMember } from "@/lib/internal-chat"

export interface InternalConversationDraft {
  name: string
  type: InternalConversationType
  memberIds: number[]
  description: string
  message: string
}

interface InternalChatCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: TeamMember[]
  currentUserId: number
  onCreate: (draft: InternalConversationDraft) => void
}

const typeOptions: Array<{ value: InternalConversationType; label: string; description: string }> = [
  { value: "dm", label: "Direto", description: "Conversa 1:1 entre duas pessoas." },
  { value: "group", label: "Grupo", description: "Conversa com mais de dois participantes." },
  { value: "channel", label: "Canal", description: "Espaço recorrente de operação e avisos." },
]

export function InternalChatCreateDialog({
  open,
  onOpenChange,
  members,
  currentUserId,
  onCreate,
}: InternalChatCreateDialogProps) {
  const availableMembers = useMemo(
    () => members.filter((member) => member.id !== currentUserId),
    [currentUserId, members],
  )
  const [draft, setDraft] = useState<InternalConversationDraft>({
    name: "",
    type: "group",
    memberIds: availableMembers.slice(0, 2).map((member) => member.id),
    description: "",
    message: "",
  })

  useEffect(() => {
    if (!open) return

    setDraft({
      name: "",
      type: "group",
      memberIds: availableMembers.slice(0, 2).map((member) => member.id),
      description: "",
      message: "",
    })
  }, [availableMembers, open])

  useEffect(() => {
    setDraft((previous) => {
      if (previous.type === "dm") {
        const nextMemberId = previous.memberIds[0] ?? availableMembers[0]?.id
        return {
          ...previous,
          memberIds: nextMemberId ? [nextMemberId] : [],
        }
      }

      if (previous.type === "channel" && previous.memberIds.length === 0) {
        return {
          ...previous,
          memberIds: availableMembers.map((member) => member.id),
        }
      }

      return previous
    })
  }, [availableMembers, draft.type])

  const toggleMember = (memberId: number) => {
    setDraft((previous) => {
      if (previous.type === "dm") {
        return { ...previous, memberIds: [memberId] }
      }

      const hasMember = previous.memberIds.includes(memberId)
      return {
        ...previous,
        memberIds: hasMember
          ? previous.memberIds.filter((id) => id !== memberId)
          : [...previous.memberIds, memberId],
      }
    })
  }

  const handleCreate = () => {
    const name = draft.name.trim()
    const description = draft.description.trim()
    const nextMembers =
      draft.type === "channel" && draft.memberIds.length === 0
        ? availableMembers.map((member) => member.id)
        : draft.memberIds

    onCreate({
      name,
      type: draft.type,
      memberIds: Array.from(new Set([currentUserId, ...nextMembers])),
      description,
      message: draft.message.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[28px] border-border/60 p-0" showCloseButton={false}>
        <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
          <DialogTitle className="text-base font-semibold">Nova conversa interna</DialogTitle>
          <DialogDescription>Crie uma DM, grupo ou canal para a equipe alinhar contexto sem sair da plataforma.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="internal-chat-name">Nome da conversa</Label>
              <Input
                id="internal-chat-name"
                value={draft.name}
                onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
                placeholder="Ex.: Operação Comercial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal-chat-type">Tipo</Label>
              <Select
                value={draft.type}
                onValueChange={(value) =>
                  setDraft((previous) => ({
                    ...previous,
                    type: value as InternalConversationType,
                    memberIds:
                      value === "dm"
                        ? previous.memberIds.slice(0, 1)
                        : value === "channel"
                          ? availableMembers.map((member) => member.id)
                          : previous.memberIds,
                  }))
                }
              >
                <SelectTrigger id="internal-chat-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {typeOptions.find((option) => option.value === draft.type)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal-chat-description">Descrição</Label>
              <Textarea
                id="internal-chat-description"
                value={draft.description}
                onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))}
                placeholder="Contexto rápido da conversa"
                className="min-h-24 rounded-[20px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal-chat-message">Mensagem inicial</Label>
              <Textarea
                id="internal-chat-message"
                value={draft.message}
                onChange={(event) => setDraft((previous) => ({ ...previous, message: event.target.value }))}
                placeholder="Digite a primeira mensagem..."
                className="min-h-28 rounded-[20px]"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-[24px] border border-border/60 bg-muted/25 p-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Participantes</p>
              <p className="text-sm text-muted-foreground">Selecione as pessoas que entrarão na conversa.</p>
            </div>

            <div className="space-y-2">
              {availableMembers.map((member) => {
                const checked = draft.memberIds.includes(member.id)
                return (
                  <button
                    key={member.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[18px] border border-border/60 bg-background/90 px-3 py-2.5 text-left transition-colors hover:border-border"
                    onClick={() => toggleMember(member.id)}
                  >
                    <Checkbox checked={checked} className="pointer-events-none" />
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-semibold text-foreground">
                      {member.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="rounded-full bg-transparent" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="rounded-full" onClick={handleCreate} disabled={!draft.name.trim()}>
            Criar conversa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
