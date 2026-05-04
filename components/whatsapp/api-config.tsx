import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Server, ShieldCheck } from "lucide-react"

export function WhatsappApiConfig() {
  return (
    <Card className="w-full border-border/60 bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Credenciais no servidor
        </CardTitle>
        <CardDescription>
          As credenciais da Meta não ficam mais salvas no navegador. Elas são usadas apenas pelo backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
            <p className="font-semibold">Protegido</p>
            <p className="mt-1 text-muted-foreground">Nada é gravado em localStorage.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <Key className="mb-3 h-5 w-5 text-primary" />
            <p className="font-semibold">Env vars</p>
            <p className="mt-1 text-muted-foreground">META_WHATSAPP_TOKEN e META_PHONE_NUMBER_ID.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <Server className="mb-3 h-5 w-5 text-primary" />
            <p className="font-semibold">Sessão</p>
            <p className="mt-1 text-muted-foreground">O envio exige login administrativo.</p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border/70 bg-background/60 p-4">
          <p className="font-medium">Fluxo novo</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
            <li>Configure as credenciais Meta apenas no servidor.</li>
            <li>
              Entre em <code className="rounded bg-muted px-1 py-0.5 text-xs">/login</code> para abrir o dashboard.
            </li>
            <li>
              O endpoint <code className="rounded bg-muted px-1 py-0.5 text-xs">/api/whatsapp/send</code> usa os
              segredos do ambiente.
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Ir para o login</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
