import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LandingHeader() {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground text-balance">
          CRM e automação completos para vendas via mensageiros
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">
          Centralize conversas, automatize follow-ups e acompanhe o funil em tempo real com um produto pensado para
          PMEs.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm">
          Português
        </Button>
        <Button variant="outline" size="sm">
          English
        </Button>
        <Button variant="outline" size="sm">
          Español
        </Button>
        <Button asChild>
          <Link href="/dashboard">Agendar demonstração</Link>
        </Button>
      </div>
    </header>
  )
}
