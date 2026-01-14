"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare, User, Clock, ArrowRight, Smartphone, Mail, Send } from "lucide-react"
import { useState } from "react"

const features = [
  {
    icon: MessageSquare,
    title: "Central de conversas",
    description: "WhatsApp oficial, Instagram, Telegram, e-mail e chat do site em uma única fila inteligente.",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-600",
  },
  {
    icon: User,
    title: "Perfil 360°",
    description: "Histórico completo, preferências, tags, anexos e campos customizados por equipe.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600",
  },
  {
    icon: Clock,
    title: "SLA e produtividade",
    description: "Alertas de tempo médio de atendimento, fila prioritária e distribuição automática.",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600",
  },
]

const channels = [
  { name: "WhatsApp", icon: Smartphone, color: "bg-green-500", messages: "2.4k" },
  { name: "Instagram", icon: Send, color: "bg-gradient-to-tr from-purple-500 to-pink-500", messages: "892" },
  { name: "E-mail", icon: Mail, color: "bg-blue-500", messages: "1.2k" },
]

export function InboxSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <section id="inbox" className="scroll-mt-8">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Title and Features */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
              <MessageSquare className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-600">Inbox Unificado</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground text-balance">
              Todas as conversas em um só lugar
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">
              Visualize toda a jornada do contato em um único cartão com histórico completo e campos personalizados.
            </p>
          </div>

          <div className="grid gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isHovered = hoveredFeature === index
              return (
                <Card
                  key={feature.title}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`
                    group p-5 border border-border/50 bg-card/50 backdrop-blur-sm
                    transition-all duration-300 cursor-pointer
                    ${isHovered ? "border-primary/30 shadow-lg shadow-primary/5 scale-[1.02]" : "hover:border-border"}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                      w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} 
                      flex items-center justify-center shrink-0
                      transition-transform duration-300 ${isHovered ? "scale-110" : ""}
                    `}
                    >
                      <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-card-foreground">{feature.title}</h3>
                        <ArrowRight
                          className={`
                          h-4 w-4 text-muted-foreground transition-all duration-300
                          ${isHovered ? "translate-x-1 text-primary" : "opacity-0"}
                        `}
                        />
                      </div>
                      <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Right: Channel Stats Preview */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full border border-border/50 bg-sidebar-bg text-sidebar-foreground">
            <h3 className="font-semibold text-sm text-sidebar-muted uppercase tracking-wide mb-5">
              Mensagens por canal
            </h3>
            <div className="space-y-4">
              {channels.map((channel, index) => {
                const Icon = channel.icon
                return (
                  <div
                    key={channel.name}
                    className="flex items-center gap-4 p-3 rounded-lg bg-sidebar-border/30 transition-colors hover:bg-sidebar-border/50"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-lg ${channel.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sidebar-foreground text-sm">{channel.name}</p>
                      <p className="text-xs text-sidebar-muted">Este mês</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sidebar-foreground">{channel.messages}</p>
                      <p className="text-xs text-primary">+12%</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mini chart placeholder */}
            <div className="mt-6 pt-6 border-t border-sidebar-border">
              <div className="flex items-end justify-between h-20 gap-1">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-sidebar-muted mt-2 text-center">Últimos 12 meses</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
