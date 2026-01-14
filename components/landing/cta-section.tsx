import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="bg-primary rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-primary-foreground">
          Integre com suas ferramentas favoritas
        </h2>
        <p className="text-primary-foreground/80 mt-2">
          API aberta, webhooks e conectores com CRM, ERP e plataformas de mídia paga.
        </p>
      </div>
      <Button asChild variant="secondary" size="lg">
        <Link href="/dashboard">Falar com especialistas</Link>
      </Button>
    </section>
  )
}
