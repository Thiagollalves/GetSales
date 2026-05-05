"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import type { InboxDrawerFilters } from "@/lib/inbox"
import { Filter, Tag, Users, ShieldAlert, MessageCircleOff, Bot } from "lucide-react"

export type { InboxDrawerFilters } from "@/lib/inbox"

interface InboxFiltersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: InboxDrawerFilters
  onApply: (value: InboxDrawerFilters) => void
  onReset: () => void
}

const statusOptions: Array<{ value: InboxDrawerFilters["leadStatus"]; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "novo", label: "Pendente" },
  { value: "ativo", label: "Ativo" },
  { value: "resolvido", label: "Fechado" },
]

export function InboxFiltersSheet({ open, onOpenChange, value, onApply, onReset }: InboxFiltersSheetProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (open) {
      setDraft(value)
    }
  }, [open, value])

  const handleApply = () => {
    onApply(draft)
    onOpenChange(false)
  }

  const handleReset = () => {
    onReset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-[440px] p-0">
        <SheetTitle className="sr-only">Filtros da inbox</SheetTitle>
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b border-border/60 px-4 py-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Refine a fila por departamento, status, tags e sinais de atendimento.
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              <section className="rounded-[22px] border border-border/60 bg-background/90 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Departamento</h4>
                </div>
                <Input
                  value={draft.departmentQuery}
                  onChange={(event) => setDraft((previous) => ({ ...previous, departmentQuery: event.target.value }))}
                  placeholder="Ana Souza, Time Comercial..."
                  className="h-11 rounded-full bg-background/90 px-4"
                />
              </section>

              <section className="rounded-[22px] border border-border/60 bg-background/90 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Status do lead</h4>
                </div>
                <Select
                  value={draft.leadStatus}
                  onValueChange={(value) =>
                    setDraft((previous) => ({ ...previous, leadStatus: value as InboxDrawerFilters["leadStatus"] }))
                  }
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
              </section>

              <section className="rounded-[22px] border border-border/60 bg-background/90 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Etiquetas</h4>
                </div>
                <Input
                  value={draft.tagQuery}
                  onChange={(event) => setDraft((previous) => ({ ...previous, tagQuery: event.target.value }))}
                  placeholder="VIP, Prospect, Suporte..."
                  className="h-11 rounded-full bg-background/90 px-4"
                />
              </section>

              <section className="space-y-3 rounded-[22px] border border-border/60 bg-background/90 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Sinais rápidos</h4>
                    <p className="text-xs text-muted-foreground">Ative os filtros rápidos mais usados.</p>
                  </div>
                </div>

                <ToggleRow
                  icon={<MessageCircleOff className="h-4 w-4 text-muted-foreground" />}
                  title="Não respondidos"
                  description="Mostra apenas conversas que ainda exigem resposta."
                  checked={draft.onlyUnread}
                  onCheckedChange={(checked) => setDraft((previous) => ({ ...previous, onlyUnread: checked }))}
                />
                <ToggleRow
                  icon={<Bot className="h-4 w-4 text-muted-foreground" />}
                  title="Fluxo de bot"
                  description="Mostra conversas já tocadas por automação."
                  checked={draft.onlyBotFlow}
                  onCheckedChange={(checked) => setDraft((previous) => ({ ...previous, onlyBotFlow: checked }))}
                />
                <ToggleRow
                  icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                  title="Com notas"
                  description="Filtra contatos com observações internas."
                  checked={draft.onlyWithNotes}
                  onCheckedChange={(checked) => setDraft((previous) => ({ ...previous, onlyWithNotes: checked }))}
                />
              </section>
            </div>
          </div>

          <div className="border-t border-border/60 px-4 py-4">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full bg-transparent" onClick={handleReset}>
                Remover filtros
              </Button>
              <Button className="flex-1 rounded-full" onClick={handleApply}>
                Filtrar
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: ReactNode
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[18px] border border-border/60 bg-background/80 p-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
