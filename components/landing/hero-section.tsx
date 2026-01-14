"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react"
import { useEffect, useState } from "react"

const tags = [
  { icon: Shield, label: "API oficial do WhatsApp" },
  { icon: Zap, label: "LGPD/GDPR pronto" },
  { icon: Globe, label: "API aberta" },
  { icon: Sparkles, label: "IA integrada" },
]

const actions = [
  { text: "Lead inativo há 3 dias → enviar WhatsApp com oferta.", delay: 0 },
  { text: "Formulário de orçamento → criar oportunidade no funil.", delay: 100 },
  { text: "Cliente VIP → direcionar para equipe premium.", delay: 200 },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section id="visao-geral" className="scroll-mt-8">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Main Hero Card - spans 3 columns */}
        <Card
          className={`
            lg:col-span-3 p-8 lg:p-10 border-0 bg-sidebar-bg text-sidebar-foreground
            relative overflow-hidden transition-all duration-500
            ${mounted ? "animate-fade-in" : "opacity-0"}
          `}
        >
          {/* Gradient orb decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-chart-2/20 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Powered by AI</span>
            </div>

            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-balance leading-tight">
              Transforme cada conversa em <span className="gradient-text">receita previsível</span>
            </h1>

            <p className="text-sidebar-muted mt-6 text-lg leading-relaxed max-w-xl">
              ConectaCRM combina inbox multicanal, automações no-code, bots com IA e análises unificadas para acelerar
              suas vendas.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Button asChild size="lg" className="rounded-full px-6 gap-2 group">
                <Link href="/dashboard">
                  Começar agora
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-6 bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-border/50"
              >
                <Link href="#demo">Ver demonstração</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Cards - right column */}
        <div className="lg:col-span-2 grid grid-rows-2 gap-6">
          {/* Smart Actions Card */}
          <Card
            className={`
              p-6 border border-border/50 bg-card/50 backdrop-blur-sm
              transition-all duration-500 delay-100
              ${mounted ? "animate-fade-in" : "opacity-0"}
            `}
          >
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              Próximas ações inteligentes
            </h3>
            <ul className="space-y-3">
              {actions.map((action, i) => (
                <li
                  key={i}
                  className={`
                    text-sm text-foreground/80 leading-relaxed pl-4 border-l-2 border-primary/30
                    transition-all duration-300 hover:border-primary hover:text-foreground
                  `}
                  style={{ transitionDelay: `${action.delay}ms` }}
                >
                  {action.text}
                </li>
              ))}
            </ul>
          </Card>

          {/* Features Tags Card */}
          <Card
            className={`
              p-6 border border-border/50 bg-card/50 backdrop-blur-sm
              transition-all duration-500 delay-200
              ${mounted ? "animate-fade-in" : "opacity-0"}
            `}
          >
            <div className="grid grid-cols-2 gap-3 h-full">
              {tags.map((tag, i) => (
                <div
                  key={tag.label}
                  className={`
                    flex items-center gap-2.5 p-3 rounded-lg bg-secondary/50 
                    transition-all hover:bg-secondary hover:scale-[1.02]
                  `}
                >
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <tag.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium leading-tight">{tag.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
