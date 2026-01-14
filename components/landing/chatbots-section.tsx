import { Card } from "@/components/ui/card"
import { FileText, UserCheck, ClipboardList } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Treinamento com documentos",
    description: "Suba PDFs, políticas e catálogos para respostas consistentes.",
  },
  {
    icon: UserCheck,
    title: "Hand-off humano",
    description: "Transferência automática para atendentes quando necessário.",
  },
  {
    icon: ClipboardList,
    title: "Coleta de dados",
    description: "Formulários conversacionais para capturar dados críticos.",
  },
]

export function ChatbotsSection() {
  return (
    <section id="chatbots" className="scroll-mt-8">
      <div className="bg-secondary/50 rounded-3xl p-8">
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Chatbots e assistentes de IA</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Construa fluxos lógicos e conecte com modelos de linguagem para suporte 24/7.
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
      </div>
    </section>
  )
}
