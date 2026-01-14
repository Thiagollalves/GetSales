"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Inbox,
  GitBranch,
  Zap,
  BarChart3,
  Settings,
  Menu,
  X,
  Users,
  Bot,
  Send,
  ChevronRight,
  LogOut,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox, badge: "12" },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/dashboard/contacts", label: "Contatos", icon: Users },
  { href: "/dashboard/automation", label: "Automações", icon: Zap },
  { href: "/dashboard/chatbots", label: "Chatbots", icon: Bot },
  { href: "/dashboard/campaigns", label: "Campanhas", icon: Send },
  { href: "/dashboard/reports", label: "Relatórios", icon: BarChart3 },
]

const bottomNavItems = [{ href: "/dashboard/settings", label: "Configurações", icon: Settings }]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-sidebar-bg text-sidebar-foreground shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          w-[260px] h-screen bg-sidebar-bg text-sidebar-foreground
          flex flex-col border-r border-sidebar-border
          transform transition-transform duration-300 ease-out
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
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-chart-2 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-base">C</span>
            </div>
            <div>
              <strong className="block text-sidebar-foreground text-sm font-semibold tracking-tight">ConectaCRM</strong>
              <small className="text-sidebar-muted text-xs">Dashboard</small>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-medium text-sidebar-muted uppercase tracking-wider">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-sidebar-muted hover:bg-sidebar-border/50 hover:text-sidebar-foreground"
                  }
                `}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`}
                />
                <span className="font-medium flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`
                    text-xs px-1.5 py-0.5 rounded-full font-medium
                    ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/20 text-primary"}
                  `}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <p className="px-3 py-2 text-xs font-medium text-sidebar-muted uppercase tracking-wider">Sistema</p>
            {bottomNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-border/50 hover:text-sidebar-foreground"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-border/50 transition-colors cursor-pointer">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-chart-2/30 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">U</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-sidebar-bg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Usuário</p>
              <p className="text-xs text-sidebar-muted truncate">usuario@empresa.com</p>
            </div>
            <button className="p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/50 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
