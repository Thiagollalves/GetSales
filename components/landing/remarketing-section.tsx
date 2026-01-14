import { Card } from "@/components/ui/card"
import { MessageSquare, GitBranch, RefreshCw } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "WhatsApp oficial",
    description: "Baixa chance de banimento com templates aprovados e opt-in válido.",
  },
  {
    icon: GitBranch,
    title: "Sequências inteligentes",
    description: "Follow-ups por e-mail e mensageiro baseados em inatividade.",
  },
  {
    icon: RefreshCw,
    title: "Funil de remarketing",
    description: "Detecta leads frios e reativa com ofertas e conteúdo relevante.",
  },
]

export function RemarketingSection() {
  return (
    <section id="remarketing" className="scroll-mt-8">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">Disparo em massa e remarketing</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Envios seguros e segmentados com follow-ups agendados e reengajamento automático.
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
