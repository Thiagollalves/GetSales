import { Card } from "@/components/ui/card"

const metrics = [
  { label: "TMA", value: "1m 48s", subtext: "Meta: 2m" },
  { label: "Conversão", value: "42%", subtext: "+8% vs mês anterior" },
  { label: "ROI campanhas", value: "6,2x", subtext: "Campanhas de remarketing" },
  { label: "Produtividade", value: "32 atd/dia", subtext: "Equipe Atendimento 2" },
]

export function ReportsSection() {
  return (
    <section id="relatorios" className="scroll-mt-8">
      <div className="bg-secondary/50 rounded-3xl p-8">
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Relatórios e BI unificados</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Métricas operacionais e de campanhas em dashboards personalizáveis.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{metric.label}</h4>
              <div className="text-xl lg:text-2xl font-bold text-card-foreground mt-1">{metric.value}</div>
              <span className="text-xs text-muted-foreground">{metric.subtext}</span>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
