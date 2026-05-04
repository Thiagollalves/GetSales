"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function getSafeNextPath(candidate: string | null) {
  if (candidate && candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate
  }

  return "/dashboard"
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextPath = getSafeNextPath(searchParams.get("next"))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!username.trim()) {
      setError("Digite o usuário de acesso.")
      return
    }

    if (!password.trim()) {
      setError("Digite a senha de acesso.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.error ?? "Não foi possível autenticar.")
        return
      }

      router.replace(nextPath)
      router.refresh()
    } catch {
      setError("Não foi possível conectar ao servidor.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/90 shadow-2xl shadow-black/10 backdrop-blur-md">
      <CardHeader className="space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">Acesso restrito</CardTitle>
          <CardDescription>
            Entre com o usuário e a senha definidos em{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">ADMIN_ACCESS_USERNAME</code> e{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">ADMIN_ACCESS_TOKEN</code> para abrir o dashboard e
            as rotas administrativas.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Digite o usuário"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Digite a senha"
                className="pl-9"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
            {!isSubmitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
