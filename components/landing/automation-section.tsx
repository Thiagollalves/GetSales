const flowNodes = [
  "Gatilho: clique no e-mail",
  "Condição: score > 60",
  "Ação: enviar WhatsApp",
  "Ação: atualizar status",
  "Aguardar 24h",
  "Ação: criar tarefa",
]

export function AutomationSection() {
  return (
    <section id="automacao" className="scroll-mt-8">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">Automação no-code</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Arraste e solte gatilhos, ações e condições para criar jornadas inteligentes.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {flowNodes.map((node, i) => (
          <div
            key={i}
            className="bg-card border border-dashed border-primary px-4 py-3 rounded-full text-primary font-semibold text-sm"
          >
            {node}
          </div>
        ))}
      </div>
    </section>
  )
}
