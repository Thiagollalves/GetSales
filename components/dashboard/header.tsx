"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { notifyAction } from "@/lib/button-actions"

export function DashboardHeader() {
  const router = useRouter()

  const handleNotifications = () => {
    notifyAction("Notificações", "Abrindo central de notificações.");
  }

  const handleNewConversation = () => {
    router.push("/dashboard/inbox")
    window.dispatchEvent(new CustomEvent("dashboard:new-conversation"))
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 gap-4">
      <div className="flex-1 max-w-md pl-12 lg:pl-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar contatos, conversas..." className="pl-9 bg-secondary/50 border-0" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="relative bg-transparent" onClick={handleNotifications}>
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>
        <Button size="sm" onClick={handleNewConversation}>
          <Plus className="h-4 w-4 mr-1" />
          Nova conversa
        </Button>
      </div>
    </header>
  )
}
