"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, LogOut, Search, Plus } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { notifyAction } from "@/lib/button-actions"

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname.startsWith("/dashboard/inbox")) {
    return null
  }

  const handleNotifications = () => {
    notifyAction("Notificações", "Abrindo central de notificações.");
  }

  const handleNewConversation = () => {
    router.push("/dashboard/inbox")
    window.dispatchEvent(new CustomEvent("dashboard:new-conversation"))
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex-1 pl-12 md:max-w-md md:pl-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar contatos, conversas..."
              className="h-11 border-0 bg-secondary/50 pl-9 text-sm shadow-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 md:flex md:items-center">
          <Button variant="outline" size="icon" className="relative bg-transparent" onClick={handleNotifications}>
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              3
            </span>
          </Button>
          <Button size="sm" onClick={handleNewConversation} className="justify-center">
            <Plus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Nova conversa</span>
          </Button>
          <Button variant="outline" size="sm" className="justify-center bg-transparent" onClick={handleLogout}>
            <LogOut className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
