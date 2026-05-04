"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
  ChevronsLeft,
  ChevronsRight,
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
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return pathname.startsWith("/dashboard/inbox")
    }

    const stored = window.localStorage.getItem("dashboard-sidebar-collapsed")
    if (stored !== null) {
      try {
        return JSON.parse(stored) as boolean
      } catch {
        return false
      }
    }

    return pathname.startsWith("/dashboard/inbox")
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = window.localStorage.getItem("dashboard-sidebar-collapsed")
    if (stored === null && pathname.startsWith("/dashboard/inbox")) {
      setCollapsed(true)
    }
  }, [pathname])

  useEffect(() => {
    window.localStorage.setItem("dashboard-sidebar-collapsed", JSON.stringify(collapsed))
  }, [collapsed])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 rounded-xl bg-sidebar-bg p-2.5 text-sidebar-foreground shadow-lg lg:hidden"
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
          h-dvh w-[min(86vw,18rem)] overflow-hidden bg-sidebar-bg text-sidebar-foreground shrink-0
          flex flex-col border-r border-sidebar-border
          transform transition-[width,transform] duration-300 ease-out
          ${collapsed ? "lg:w-[88px]" : "lg:w-[260px]"}
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
        <div className="border-b border-sidebar-border p-3">
          <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-3`}>
            <Link
              href="/"
              className={`flex items-center gap-3 rounded-xl transition-colors hover:bg-sidebar-border/40 ${
                collapsed ? "justify-center px-2 py-1.5" : "px-2 py-1.5"
              }`}
              title="ConectaCRM"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 shadow-lg shadow-primary/20">
                <span className="text-base font-bold text-primary-foreground">C</span>
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                    ConectaCRM
                  </strong>
                  <small className="text-xs text-sidebar-muted">Dashboard</small>
                </div>
              ) : null}
            </Link>

            <button
              onClick={() => setCollapsed((value) => !value)}
              className="hidden rounded-xl p-2 text-sidebar-muted transition-colors hover:bg-sidebar-border/50 hover:text-sidebar-foreground lg:inline-flex"
              aria-label={collapsed ? "Expandir menu lateral" : "Minimizar menu lateral"}
              title={collapsed ? "Expandir" : "Minimizar"}
              type="button"
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto p-3 ${collapsed ? "space-y-2" : "space-y-1"}`}>
          {!collapsed ? (
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-muted">Menu</p>
          ) : null}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  group flex items-center rounded-xl text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-sidebar-muted hover:bg-sidebar-border/50 hover:text-sidebar-foreground"
                  }
                  ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                `}
                title={item.label}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`}
                />
                {!collapsed ? (
                  <>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`
                          rounded-full px-1.5 py-0.5 text-xs font-medium
                          ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/20 text-primary"}
                        `}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                  </>
                ) : null}
              </Link>
            )
          })}

          <div className={`mt-4 border-t border-sidebar-border pt-4 ${collapsed ? "space-y-2" : ""}`}>
            {!collapsed ? (
              <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-muted">Sistema</p>
            ) : null}
            {bottomNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    group flex items-center rounded-xl text-sm transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-border/50 hover:text-sidebar-foreground"
                    }
                    ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                  `}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed ? <span className="font-medium">{item.label}</span> : null}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={`flex items-center rounded-lg transition-colors hover:bg-sidebar-border/50 ${collapsed ? "justify-center p-2" : "gap-3 p-2"}`}>
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-chart-2/30">
                <span className="text-sm font-semibold text-primary">U</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar-bg bg-primary" />
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">Usuário</p>
                <p className="truncate text-xs text-sidebar-muted">usuario@empresa.com</p>
              </div>
            ) : null}
            <button
              className="rounded-lg p-1.5 text-sidebar-muted transition-colors hover:bg-sidebar-border/50 hover:text-sidebar-foreground"
              onClick={handleLogout}
              type="button"
              title="Sair"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
