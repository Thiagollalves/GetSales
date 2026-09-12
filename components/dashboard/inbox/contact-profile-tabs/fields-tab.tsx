"use client"

import { useEffect, useState } from "react"
import { History, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Conversation, LeadCustomField } from "@/lib/mock-data"

interface FieldsTabProps {
  conversation: Conversation
  onUpdateProfile: (conversationId: number, updates: Partial<Conversation>) => void
}

export function FieldsTab({ conversation, onUpdateProfile }: FieldsTabProps) {
  const [customFields, setCustomFields] = useState<LeadCustomField[]>(conversation.customFields ?? [])
  const [customFieldDraft, setCustomFieldDraft] = useState({ label: "", value: "" })

  useEffect(() => {
    setCustomFields(conversation.customFields ? conversation.customFields.map((field) => ({ ...field })) : [])
    setCustomFieldDraft({ label: "", value: "" })
  }, [conversation])

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

  return (
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
}
