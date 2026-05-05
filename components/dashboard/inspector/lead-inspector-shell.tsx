"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  Clock3,
  GitBranch,
  ImageIcon,
  LayoutGrid,
  PanelRightClose,
  UserRound,
} from "lucide-react"
import type { VariantProps } from "class-variance-authority"

type BadgeVariant = VariantProps<typeof Badge>["variant"]

export interface LeadInspectorShellBadge {
  label: string
  variant?: BadgeVariant
}

interface LeadInspectorShellProps {
  title: string
  subtitle: string
  avatar: string
  badges: LeadInspectorShellBadge[]
  actions?: ReactNode
  onClose: () => void
  closeLabel?: string
  contactTab: ReactNode
  mediaTab: ReactNode
  fieldsTab: ReactNode
  funnelTab: ReactNode
  chatbotTab: ReactNode
  historyTab: ReactNode
}

const tabItems = [
  { value: "contato", label: "Contato", icon: UserRound },
  { value: "midia", label: "Mídia", icon: ImageIcon },
  { value: "campos", label: "Campos", icon: LayoutGrid },
  { value: "funil", label: "Funil", icon: GitBranch },
  { value: "chatbot", label: "ChatBot", icon: Bot },
  { value: "historico", label: "Histórico", icon: Clock3 },
] as const

export function LeadInspectorShell({
  title,
  subtitle,
  avatar,
  badges,
  actions,
  onClose,
  closeLabel = "Recolher inspector",
  contactTab,
  mediaTab,
  fieldsTab,
  funnelTab,
  chatbotTab,
  historyTab,
}: LeadInspectorShellProps) {
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
                {avatar}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-foreground">{title}</h3>
                <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title={closeLabel}
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge key={badge.label} variant={badge.variant ?? "outline"} className="rounded-full px-2.5 py-1 text-[11px] font-medium">
              {badge.label}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="contato" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border/60 px-3 py-3">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-[18px] bg-muted/40 p-1.5">
            {tabItems.map((tab) => {
              const Icon = tab.icon

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex min-w-[6.5rem] flex-1 rounded-[14px] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] sm:min-w-[7.25rem]"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <TabsContent value="contato" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {contactTab}
        </TabsContent>

        <TabsContent value="midia" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {mediaTab}
        </TabsContent>

        <TabsContent value="campos" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {fieldsTab}
        </TabsContent>

        <TabsContent value="funil" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {funnelTab}
        </TabsContent>

        <TabsContent value="chatbot" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {chatbotTab}
        </TabsContent>

        <TabsContent value="historico" className="m-0 min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {historyTab}
        </TabsContent>
      </Tabs>
    </section>
  )
}
