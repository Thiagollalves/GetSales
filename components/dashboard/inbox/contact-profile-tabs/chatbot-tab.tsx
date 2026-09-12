"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { Conversation, LeadBotBinding } from "@/lib/mock-data"

const defaultBotBindings: LeadBotBinding[] = [
  { id: 1, label: "NYM oficial", enabled: false },
  { id: 2, label: "Vini", enabled: false },
  { id: 3, label: "teste jestsales", enabled: false },
  { id: 4, label: "Atendimento inicial teste", enabled: false },
]

interface ChatbotTabProps {
  conversation: Conversation
  onUpdateProfile: (conversationId: number, updates: Partial<Conversation>) => void
}

export function ChatbotTab({ conversation, onUpdateProfile }: ChatbotTabProps) {
  const [botBindings, setBotBindings] = useState<LeadBotBinding[]>(
    (conversation.botBindings?.length ? conversation.botBindings : defaultBotBindings).map((binding) => ({ ...binding })),
  )
  const [botSearch, setBotSearch] = useState("")

  useEffect(() => {
    setBotBindings(
      (conversation.botBindings?.length ? conversation.botBindings : defaultBotBindings).map((binding) => ({
        ...binding,
      })),
    )
    setBotSearch("")
  }, [conversation])

  const handleToggleBotBinding = (bindingId: number, enabled: boolean) => {
    const nextBindings = botBindings.map((binding) =>
      binding.id === bindingId ? { ...binding, enabled } : binding,
    )
    setBotBindings(nextBindings)
    onUpdateProfile(conversation.id, { botBindings: nextBindings })
  }

  const botBindingsVisible = botBindings.filter((binding) =>
    binding.label.toLowerCase().includes(botSearch.trim().toLowerCase()),
  )

  return (
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
}
