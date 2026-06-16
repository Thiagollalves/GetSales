"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Plus, X } from "lucide-react"

export interface NewChatbotFlowDraft {
  description: string
  testPhone: string
  keywords: string[]
  active: boolean
  isServiceFlow: boolean
}

interface ChatbotsNewFlowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (draft: NewChatbotFlowDraft) => Promise<void> | void
  submitting?: boolean
}

const emptyDraft: NewChatbotFlowDraft = {
  description: "",
  testPhone: "",
  keywords: [],
  active: true,
  isServiceFlow: false,
}

export function ChatbotsNewFlowDialog({
  open,
  onOpenChange,
  onCreate,
  submitting = false,
}: ChatbotsNewFlowDialogProps) {
  const [draft, setDraft] = useState<NewChatbotFlowDraft>(emptyDraft)
  const [keywordInput, setKeywordInput] = useState("")

  useEffect(() => {
    if (!open) {
      setDraft(emptyDraft)
      setKeywordInput("")
    }
  }, [open])

  const addKeyword = () => {
    const keyword = keywordInput.trim()
    if (!keyword) {
      return
    }

    setDraft((previous) =>
      previous.keywords.includes(keyword)
        ? previous
        : {
            ...previous,
            keywords: [...previous.keywords, keyword],
          },
    )
    setKeywordInput("")
  }

  const removeKeyword = (keyword: string) => {
    setDraft((previous) => ({
      ...previous,
      keywords: previous.keywords.filter((item) => item !== keyword),
    }))
  }

  const handleSubmit = async () => {
    await onCreate({
      description: draft.description.trim(),
      testPhone: draft.testPhone.trim(),
      keywords: draft.keywords,
      active: draft.active,
      isServiceFlow: draft.isServiceFlow,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] rounded-[28px] border-border/70 bg-[#fcfbf7] p-0 shadow-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <DialogTitle className="text-xl font-semibold text-foreground">Novo Fluxo</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Crie um fluxo no CRM e publique depois para o n8n executar. O desenho inicial já nasce com início,
            boas-vindas e uma etapa seguinte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Descrição *</label>
            <Input
              value={draft.description}
              onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))}
              placeholder="Fluxo de boas-vindas"
              className="h-11 rounded-full border-border/60 bg-white/90 px-4 shadow-sm"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Use a descrição para identificar o fluxo na lista e no editor.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Número para Teste</label>
            <Input
              value={draft.testPhone}
              onChange={(event) => setDraft((previous) => ({ ...previous, testPhone: event.target.value }))}
              placeholder="(85) 99999-9999"
              className="h-11 rounded-full border-border/60 bg-white/90 px-4 shadow-sm"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Se deixar vazio, o teste será executado apenas com a definição do fluxo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow
              title="Ativo"
              description="Deixa o fluxo disponível na lista principal."
              checked={draft.active}
              onCheckedChange={(checked) => setDraft((previous) => ({ ...previous, active: checked }))}
            />
            <ToggleRow
              title="Fluxo de Atendimento"
              description="Marca este fluxo como atendimento humano ou serviço."
              checked={draft.isServiceFlow}
              onCheckedChange={(checked) => setDraft((previous) => ({ ...previous, isServiceFlow: checked }))}
            />
          </div>

          <section className="rounded-[24px] border border-border/60 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">PALAVRAS-CHAVE</p>
                <p className="text-xs text-muted-foreground">Adicione palavras para localizar e acionar o fluxo.</p>
              </div>
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                {draft.keywords.length} itens
              </Badge>
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    addKeyword()
                  }
                }}
                placeholder="Digite o valor e aperte enter..."
                className="h-11 rounded-full border-border/60 bg-background/90 px-4 shadow-sm"
              />
              <Button type="button" variant="outline" className="h-11 rounded-full px-4" onClick={addKeyword}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {draft.keywords.length > 0 ? (
                draft.keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700"
                  >
                    {keyword}
                    <button
                      type="button"
                      className="ml-2 text-emerald-700/70 transition-colors hover:text-emerald-900"
                      onClick={() => removeKeyword(keyword)}
                      aria-label={`Remover palavra-chave ${keyword}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Nenhuma palavra-chave adicionada ainda.</p>
              )}
            </div>
          </section>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 border-t border-border/60 px-6 py-5">
          <Button variant="outline" type="button" className="rounded-full bg-transparent" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={submitting || !draft.description.trim()}
          >
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[22px] border border-border/60 bg-white/90 p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
