import { Card } from "@/components/ui/card"

const segments = [
  "Gestores de vendas com mais de 5 atendentes",
  "Leads que interagiram com 3 campanhas no mês",
  "Clientes com NPS > 8 e ticket médio alto",
]

export function SegmentationSection() {
  return (
    <section id="segmentacao" className="scroll-mt-8">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">Segmentação avançada e lead scoring</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Combine dados demográficos, comportamento e engajamento para priorizar oportunidades.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="font-semibold text-foreground mb-4">Segmentos dinâmicos</h3>
          <ul className="space-y-3">
            {segments.map((segment, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {segment}
              </li>
            ))}
          </ul>
        </div>
        <Card className="p-6 text-center">
          <h4 className="font-semibold text-card-foreground mb-2">Lead Score</h4>
          <p className="text-muted-foreground text-sm mb-4">
            Atualizado automaticamente com base em ações, visitas e respostas.
          </p>
          <div className="text-5xl font-bold text-primary mb-2">82</div>
          <small className="text-muted-foreground">Prioridade: alta</small>
        </Card>
      </div>
    </section>
  )
}
