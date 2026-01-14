import { Card } from "@/components/ui/card"

const features = [
  "Perfis e permissões avançadas",
  "Playbooks personalizados por canal",
  "Distribuição automática de leads",
]

const plans = [
  { name: "Start", price: "R$ 299/mês", description: "até 5 usuários" },
  { name: "Growth", price: "R$ 699/mês", description: "usuários ilimitados", highlight: true },
  { name: "Scale", price: "R$ 1.499/mês", description: "departamentos ilimitados" },
]

export function ScalabilitySection() {
  return (
    <section id="escalabilidade" className="scroll-mt-8">
      <div className="bg-secondary/50 rounded-3xl p-8">
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Escalabilidade e governança</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Usuários ilimitados, múltiplos departamentos e fluxos específicos por canal.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Gestão multi-times</h3>
            <p className="text-muted-foreground mb-4">
              Crie squads por região, produto ou canal com relatórios dedicados.
            </p>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-5">
            <h3 className="font-semibold text-card-foreground mb-4">Planos mensais</h3>
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`
                    p-4 rounded-lg border
                    ${plan.highlight ? "bg-primary/5 border-primary" : "border-border"}
                  `}
                >
                  <h4 className="font-semibold text-card-foreground">{plan.name}</h4>
                  <p className="text-lg font-bold text-foreground">{plan.price}</p>
                  <span className="text-xs text-muted-foreground">{plan.description}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Teste gratuito de 14 dias • API pública para integrações externas
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
