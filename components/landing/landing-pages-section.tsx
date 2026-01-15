"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutTemplate, FileInput, MessageCircle } from "lucide-react"
import { notifyAction } from "@/lib/button-actions"

const features = [
  {
    icon: LayoutTemplate,
    title: "Templates responsivos",
    description: "Escolha entre páginas para webinars, lançamentos e captação de leads.",
    cta: "Ver modelos",
  },
  {
    icon: FileInput,
    title: "Formulários conectados",
    description: "Dados enviados direto para o inbox e funil com automações instantâneas.",
    cta: "Criar formulário",
  },
  {
    icon: MessageCircle,
    title: "CTA WhatsApp",
    description: "Botão flutuante com horários de atendimento e tracking de campanhas.",
    cta: "Ativar agora",
  },
]

export function LandingPagesSection() {
  const handleFeatureAction = (cta: string) => {
    notifyAction("Landing pages", `Ação selecionada: ${cta}.`)
  }

  return (
    <section id="landing" className="scroll-mt-8">
      <div className="bg-secondary/50 rounded-3xl p-8">
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Construtor de landing pages e formulários</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Templates personalizáveis com pop-ups, formulários inteligentes e botão de WhatsApp.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="p-5 flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed flex-1">{feature.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-fit bg-transparent"
                  onClick={() => handleFeatureAction(feature.cta)}
                >
                  {feature.cta}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
