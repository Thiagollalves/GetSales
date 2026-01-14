import { Card } from "@/components/ui/card"
import { CheckCircle2, Lock, Server } from "lucide-react"

const features = [
  {
    icon: CheckCircle2,
    title: "Duplo opt-in",
    description: "Registro de consentimento com prova de origem e auditoria completa.",
  },
  {
    icon: Lock,
    title: "Controles de privacidade",
    description: "Anonimização, exclusão sob demanda e políticas por departamento.",
  },
  {
    icon: Server,
    title: "Infra escalável",
    description: "Cluster multi-região com 99,9% uptime e monitoramento 24/7.",
  },
]

export function SecuritySection() {
  return (
    <section id="seguranca" className="scroll-mt-8">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">Conformidade, segurança e disponibilidade</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          LGPD/GDPR, consentimento registrado e alta disponibilidade para times em crescimento.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="p-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{feature.description}</p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
