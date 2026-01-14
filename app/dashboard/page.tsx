"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Zap,
  BarChart3,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const stats = [
  {
    label: "Conversas ativas",
    value: "127",
    change: "+12%",
    trend: "up",
    icon: MessageSquare,
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-600",
  },
  {
    label: "Leads no funil",
    value: "486",
    change: "+8%",
    trend: "up",
    icon: Users,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600",
  },
  {
    label: "Taxa de conversão",
    value: "42%",
    change: "+5%",
    trend: "up",
    icon: TrendingUp,
    color: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-600",
  },
  {
    label: "Tempo médio resposta",
    value: "1m 48s",
    change: "-15%",
    trend: "down",
    icon: Clock,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600",
  },
]

const recentConversations = [
  {
    id: 1,
    name: "Maria Silva",
    message: "Gostaria de saber mais sobre o plano Growth...",
    channel: "whatsapp",
    time: "2 min",
    unread: true,
    avatar: "MS",
  },
  {
    id: 2,
    name: "João Santos",
    message: "O bot respondeu minha dúvida, obrigado!",
    channel: "instagram",
    time: "15 min",
    unread: false,
    avatar: "JS",
  },
  {
    id: 3,
    name: "Ana Costa",
    message: "Preciso de suporte técnico urgente",
    channel: "telegram",
    time: "32 min",
    unread: true,
    avatar: "AC",
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    message: "Quando posso agendar uma demonstração?",
    channel: "email",
    time: "1h",
    unread: false,
    avatar: "CO",
  },
]

const channelColors: Record<string, string> = {
  whatsapp: "bg-green-500",
  instagram: "bg-gradient-to-tr from-purple-500 to-pink-500",
  telegram: "bg-blue-500",
  email: "bg-gray-500",
}

const quickActions = [
  { href: "/dashboard/inbox", icon: MessageSquare, label: "Abrir Inbox", color: "from-green-500/10 to-emerald-500/10" },
  { href: "/dashboard/pipeline", icon: Users, label: "Ver Pipeline", color: "from-blue-500/10 to-cyan-500/10" },
  { href: "/dashboard/automation", icon: Zap, label: "Automações", color: "from-amber-500/10 to-orange-500/10" },
  { href: "/dashboard/reports", icon: BarChart3, label: "Relatórios", color: "from-purple-500/10 to-violet-500/10" },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className={`transition-all duration-500 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Bom dia!</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas métricas e conversas em tempo real.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className={`
                p-5 border border-border/50 bg-card/50 backdrop-blur-sm
                transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-border
                ${mounted ? "animate-fade-in" : "opacity-0"}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-border/50">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm text-primary font-semibold">{stat.change}</span>
                <span className="text-sm text-muted-foreground">vs mês anterior</span>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Conversations */}
        <Card
          className={`
            lg:col-span-3 p-6 border border-border/50 bg-card/50 backdrop-blur-sm
            transition-all duration-500 delay-200 ${mounted ? "animate-fade-in" : "opacity-0"}
          `}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-lg">Conversas recentes</h2>
              <p className="text-sm text-muted-foreground">Últimas interações com clientes</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
              <Link href="/dashboard/inbox">
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentConversations.map((conv, index) => (
              <Link
                key={conv.id}
                href="/dashboard/inbox"
                className={`
                  flex items-start gap-4 p-4 rounded-xl transition-all duration-200
                  hover:bg-secondary/80 group
                `}
              >
                <div className="relative">
                  <div
                    className={`
                    w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold
                    ${
                      conv.unread
                        ? "bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }
                  `}
                  >
                    {conv.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${channelColors[conv.channel]} border-2 border-card`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${conv.unread ? "text-foreground" : "text-muted-foreground"}`}>
                      {conv.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className={`text-sm truncate ${conv.unread ? "text-foreground/80" : "text-muted-foreground"}`}>
                    {conv.message}
                  </p>
                </div>
                {conv.unread && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 animate-pulse" />}
              </Link>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card
          className={`
            lg:col-span-2 p-6 border border-border/50 bg-card/50 backdrop-blur-sm
            transition-all duration-500 delay-300 ${mounted ? "animate-fade-in" : "opacity-0"}
          `}
        >
          <div className="mb-5">
            <h2 className="font-semibold text-lg">Ações rápidas</h2>
            <p className="text-sm text-muted-foreground">Acesse as principais funções</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`
                    group p-5 rounded-xl border border-border/50 
                    bg-gradient-to-br ${action.color}
                    transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02]
                    flex flex-col items-center justify-center text-center gap-3
                  `}
                >
                  <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Pro tip */}
          <div className="mt-6 p-4 rounded-xl bg-sidebar-bg text-sidebar-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Dica Pro</span>
            </div>
            <p className="text-sm text-sidebar-muted">
              Configure automações para responder leads automaticamente e aumentar sua taxa de conversão em até 40%.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
