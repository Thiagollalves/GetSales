"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Inbox,
  GitBranch,
  Zap,
  FileText,
  Users,
  Bot,
  Send,
  BarChart3,
  Shield,
  Layers,
  Menu,
  X,
  Sparkles,
} from "lucide-react"

const navItems = [
  { id: "visao-geral", label: "Visão geral", icon: LayoutDashboard },
  { id: "inbox", label: "Inbox multicanal", icon: Inbox },
  { id: "funil", label: "Funil visual", icon: GitBranch },
  { id: "automacao", label: "Automação no-code", icon: Zap },
  { id: "landing", label: "Landing pages", icon: FileText },
  { id: "segmentacao", label: "Segmentação & scoring", icon: Users },
  { id: "chatbots", label: "Chatbots IA", icon: Bot },
  { id: "remarketing", label: "Disparo & remarketing", icon: Send },
  { id: "relatorios", label: "Relatórios & BI", icon: BarChart3 },
  { id: "seguranca", label: "Segurança & LGPD", icon: Shield },
  { id: "escalabilidade", label: "Escalabilidade", icon: Layers },
]

export function LandingSidebar() {
  const [activeItem, setActiveItem] = useState("visao-geral")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-sidebar-bg text-sidebar-foreground shadow-lg backdrop-blur-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          w-[280px] h-screen bg-sidebar-bg text-sidebar-foreground
          flex flex-col gap-6 p-5
          transform transition-all duration-300 ease-out
          border-r border-sidebar-border
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 lg:hidden p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/50 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-2 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <div>
            <strong className="block text-sidebar-foreground font-semibold tracking-tight">ConectaCRM</strong>
            <small className="text-sidebar-muted text-xs">Mensageiros + Automação</small>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto -mx-2 px-2">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => {
                  setActiveItem(item.id)
                  setMobileOpen(false)
                }}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-sidebar-muted hover:bg-sidebar-border/50 hover:text-sidebar-foreground"
                  }
                `}
                style={{
                  transitionDelay: mounted ? `${index * 20}ms` : "0ms",
                }}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}
                />
                <span className="font-medium">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />}
              </a>
            )
          })}
        </nav>

        {/* CTA Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20 p-4 border border-primary/20">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Trial Gratuito</span>
            </div>
            <p className="text-sm text-sidebar-foreground mb-3">14 dias para testar todas as funcionalidades</p>
            <Button asChild className="w-full rounded-lg shadow-md shadow-primary/25">
              <Link href="/dashboard">Começar agora</Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
