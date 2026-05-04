import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { ADMIN_COOKIE_NAME, isValidAdminSessionToken } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "Entrar | ConectaCRM",
  description: "Acesso restrito ao dashboard e às rotas administrativas.",
}

export default async function LoginPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value

  if (isValidAdminSessionToken(sessionToken)) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_32%),linear-gradient(180deg,_#08111b_0%,_#0b1220_45%,_#0f172a_100%)] px-6 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="flex flex-col justify-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur-sm">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-primary-foreground">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/60">ConectaCRM</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Acesso administrativo protegido.</h1>
              <p className="max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                O dashboard, as automações e o envio de WhatsApp agora exigem autenticação com usuário e senha. As
                credenciais de API deixam de circular no navegador e ficam restritas ao servidor.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-white/75 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Dashboard</p>
                <p className="mt-1">Protegido por cookie HTTP-only.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">WhatsApp</p>
                <p className="mt-1">Tokens usados só no servidor.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Webhook</p>
                <p className="mt-1">Assinatura da Meta validada no POST.</p>
              </div>
            </div>
            <p className="text-xs text-white/50">
              Campos esperados: <code className="rounded bg-white/10 px-1 py-0.5">ADMIN_ACCESS_USERNAME</code> e{" "}
              <code className="rounded bg-white/10 px-1 py-0.5">ADMIN_ACCESS_TOKEN</code>.
            </p>
          </section>

          <div className="flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  )
}
