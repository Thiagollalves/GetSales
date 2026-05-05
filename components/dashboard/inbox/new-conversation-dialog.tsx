"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"
import type { Conversation } from "@/lib/mock-data"

export interface NewConversationDraft {
  name: string
  channel: Conversation["channel"]
  department: string
  status: Conversation["status"]
  tags: string[]
  message: string
}

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (draft: NewConversationDraft) => void
}

const channelOptions: Array<{ value: Conversation["channel"]; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "telegram", label: "Telegram" },
  { value: "email", label: "E-mail" },
  { value: "webchat", label: "Chat do site" },
]

const statusOptions: Array<{ value: Conversation["status"]; label: string }> = [
  { value: "novo", label: "Pendente" },
  { value: "ativo", label: "Ativo" },
  { value: "resolvido", label: "Fechado" },
]

const departmentOptions = ["Ana Souza", "Time Comercial", "Equipe Bot", "Suporte", "Onboarding"]

const defaultDraft: NewConversationDraft = {
  name: "",
  channel: "whatsapp",
  department: "Ana Souza",
  status: "novo",
  tags: [],
  message: "",
}

export function NewConversationDialog({ open, onOpenChange, onCreate }: NewConversationDialogProps) {
  const [draft, setDraft] = useState<NewConversationDraft>(defaultDraft)
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (open) {
      setDraft(defaultDraft)
      setTagInput("")
    }
  }, [open])

  const handleAddTag = () => {
    const nextTag = tagInput.trim()
    if (!nextTag) return

    setDraft((previous) =>
      previous.tags.includes(nextTag) ? previous : { ...previous, tags: [...previous.tags, nextTag] },
    )
    setTagInput("")
  }

  const handleSubmit = () => {
    onCreate(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-full max-w-[760px] overflow-hidden p-0">
        <div className="flex h-full max-h-[92dvh] flex-col">
          <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="text-base font-semibold">Iniciar atendimento</DialogTitle>
            <DialogDescription>
              Localize o contato, escolha a conexão e prepare a primeira mensagem antes de abrir a conversa.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-[24px] border border-border/60 bg-background/90 p-4 shadow-sm lg:col-span-2">
                <div className="mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Contato</h4>
                </div>
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="Nome ou número do contato"
                  className="h-11 rounded-full bg-background/90 px-4"
                />
              </section>

              <section className="rounded-[24px] border border-border/60 bg-background/90 p-4 shadow-sm">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Configurações</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Conexão</label>
                    <Select
                      value={draft.channel}
                      onValueChange={(value) =>
                        setDraft((previous) => ({ ...previous, channel: value as Conversation["channel"] }))
                      }
                    >
                      <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {channelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Departamento</label>
                    <Select
                      value={draft.department}
                      onValueChange={(value) => setDraft((previous) => ({ ...previous, department: value }))}
                    >
                      <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Status do lead</label>
                    <Select
                      value={draft.status}
                      onValueChange={(value) => setDraft((previous) => ({ ...previous, status: value as Conversation["status"] }))}
                    >
                      <SelectTrigger className="h-11 rounded-full bg-background/90 px-4">
                        <SelectValue placeholder="Selecionar" />
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
                </div>
              </section>

              <section className="rounded-[24px] border border-border/60 bg-background/90 p-4 shadow-sm">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Mensagem</h4>
                </div>

                <Textarea
                  value={draft.message}
                  onChange={(event) => setDraft((previous) => ({ ...previous, message: event.target.value }))}
                  placeholder="Digite uma mensagem..."
                  className="min-h-32 rounded-[20px] bg-background/90"
                />
              </section>

              <section className="rounded-[24px] border border-border/60 bg-background/90 p-4 shadow-sm lg:col-span-2">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground">Tags</h4>
                  <span className="text-xs text-muted-foreground">{draft.tags.length} tags</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {draft.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() =>
                          setDraft((previous) => ({ ...previous, tags: previous.tags.filter((item) => item !== tag) }))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    placeholder="Adicionar tag"
                    className="h-11 rounded-full bg-background/90 px-4"
                  />
                  <Button className="h-11 rounded-full px-4" onClick={handleAddTag}>
                    Adicionar
                  </Button>
                </div>
              </section>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button className="flex-1 rounded-full" onClick={handleSubmit}>
                Iniciar
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
