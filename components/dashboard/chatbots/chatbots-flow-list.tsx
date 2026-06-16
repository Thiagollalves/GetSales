"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FlowEntry } from "@/lib/chatbots"
import { cn } from "@/lib/utils"
import {
  Copy,
  Filter,
  Pencil,
  Plus,
  Play,
  Search,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react"

export type FlowFilter = "all" | "active" | "inactive"

interface ChatbotsFlowListProps {
  flows: FlowEntry[]
  query: string
  filter: FlowFilter
  selectedFlowId?: number | null
  onQueryChange: (value: string) => void
  onFilterChange: (value: FlowFilter) => void
  onCreate: () => void
  onOpen: (flow: FlowEntry) => void
  onToggleActive: (flow: FlowEntry) => void
  onDuplicate: (flow: FlowEntry) => void
  onTest: (flow: FlowEntry) => void
  onPublish: (flow: FlowEntry) => void
  onDelete: (flow: FlowEntry) => void
}

const filterOptions: Array<{ value: FlowFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
]

function getStatusTone(active: boolean) {
  return active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
}

function formatKeywords(keywords: string[]) {
  if (keywords.length === 0) {
    return "Sem palavras-chave"
  }

  return keywords.slice(0, 3).join(", ")
}

export function ChatbotsFlowList({
  flows,
  query,
  filter,
  selectedFlowId,
  onQueryChange,
  onFilterChange,
  onCreate,
  onOpen,
  onToggleActive,
  onDuplicate,
  onTest,
  onPublish,
  onDelete,
}: ChatbotsFlowListProps) {
  const total = flows.length
  const activeCount = flows.filter((flow) => flow.active).length
  const inactiveCount = total - activeCount
  const isEmpty = total === 0

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 pt-2 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Home</span>
            <span className="text-[11px] text-muted-foreground">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground">Chatbot</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Chatbot</h1>
            </div>
            <Badge className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              {total} registros
            </Badge>
          </div>
        </div>

        <Button onClick={onCreate} className="rounded-full bg-emerald-600 px-4 text-white hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Fluxo
        </Button>
      </div>

      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border/60 bg-white/80 px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar fluxo..."
            className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full border-border/60 bg-white/80 px-3 py-1 text-[11px] font-medium">
            {activeCount} ativos
          </Badge>
          <Badge variant="outline" className="rounded-full border-border/60 bg-white/80 px-3 py-1 text-[11px] font-medium">
            {inactiveCount} inativos
          </Badge>
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-white/80 p-1 shadow-sm">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange(option.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === option.value
                    ? "bg-emerald-600 text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] border border-border/60 bg-white/85 shadow-sm">
        {isEmpty ? (
          <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Nenhum fluxo encontrado</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Tente ajustar a busca ou os filtros. Se preferir, crie um novo fluxo para começar do zero.
            </p>
            <Button onClick={onCreate} className="mt-5 rounded-full bg-emerald-600 px-4 text-white hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Fluxo
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden h-full min-h-0 flex-col md:flex">
          <Table className="text-sm">
            <TableHeader className="sticky top-0 z-10 bg-white/95 backdrop-blur">
              <TableRow className="bg-transparent hover:bg-transparent">
                <TableHead className="pl-4">Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fluxo de Atendimento</TableHead>
                <TableHead>Celular Teste</TableHead>
                <TableHead>Palavras-chave</TableHead>
                <TableHead className="pr-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flows.map((flow) => (
                <TableRow
                  key={flow.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedFlowId === flow.id ? "bg-emerald-50/70" : "",
                  )}
                  onClick={() => onOpen(flow)}
                >
                  <TableCell className="pl-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{flow.name}</span>
                        {flow.n8nSyncStatus === "error" ? (
                          <Badge variant="outline" className="rounded-full border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700">
                            Erro
                          </Badge>
                        ) : null}
                      </div>
                      <p className="max-w-[24rem] truncate text-xs text-muted-foreground">{flow.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={flow.active}
                      onCheckedChange={() => onToggleActive(flow)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", getStatusTone(flow.isServiceFlow))}
                    >
                      {flow.isServiceFlow ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{flow.testPhone || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-1 max-w-[16rem] text-sm text-muted-foreground" title={flow.keywords.join(", ")}>
                      {formatKeywords(flow.keywords)}
                    </span>
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full text-muted-foreground hover:text-foreground"
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpen(flow)
                        }}
                        title="Abrir editor"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full text-muted-foreground hover:text-foreground"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDuplicate(flow)
                        }}
                        title="Duplicar"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full text-muted-foreground hover:text-foreground"
                        onClick={(event) => {
                          event.stopPropagation()
                          onTest(flow)
                        }}
                        title="Testar"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full text-muted-foreground hover:text-foreground"
                        onClick={(event) => {
                          event.stopPropagation()
                          onPublish(flow)
                        }}
                        title="Publicar"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full text-muted-foreground hover:text-destructive"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDelete(flow)
                        }}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" />
              <span>Linhas por página: 10</span>
            </div>
            <div className="flex items-center gap-2">
              <span>1-{Math.min(10, total)} de {total}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" className="rounded-full" disabled>
                  <span className="sr-only">Anterior</span>
                  <svg viewBox="0 0 20 20" className="h-4 w-4">
                    <path d="M11.5 5.5 7 10l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon-sm" className="rounded-full" disabled>
                  <span className="sr-only">Próximo</span>
                  <svg viewBox="0 0 20 20" className="h-4 w-4">
                    <path d="m8.5 5.5 4.5 4.5-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>

            <div className="space-y-3 p-3 md:hidden">
          {flows.map((flow) => (
            <div
              key={flow.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpen(flow)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onOpen(flow)
                }
              }}
              className={cn(
                "w-full rounded-[22px] border border-border/60 bg-white/90 p-4 text-left shadow-sm transition-colors",
                selectedFlowId === flow.id ? "border-emerald-300 bg-emerald-50/70" : "",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">{flow.name}</h3>
                    <Badge variant="outline" className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", getStatusTone(flow.active))}>
                      {flow.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{flow.description}</p>
                </div>
                <Switch
                  checked={flow.active}
                  onCheckedChange={() => onToggleActive(flow)}
                  onClick={(event) => event.stopPropagation()}
                />
              </div>

              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <div>
                  <span className="font-medium text-foreground">Teste:</span> {flow.testPhone || "—"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Atendimento:</span> {flow.isServiceFlow ? "Sim" : "Não"}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {flow.keywords.slice(0, 3).map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-medium">
                    {keyword}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={(event) => {
                    event.stopPropagation()
                    onOpen(flow)
                  }}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Abrir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDuplicate(flow)
                  }}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Duplicar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={(event) => {
                    event.stopPropagation()
                    onTest(flow)
                  }}
                >
                  <Play className="mr-2 h-3.5 w-3.5" />
                  Testar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={(event) => {
                    event.stopPropagation()
                    onPublish(flow)
                  }}
                >
                  <Send className="mr-2 h-3.5 w-3.5" />
                  Publicar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full text-destructive hover:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(flow)
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Excluir
                </Button>
              </div>
            </div>
          ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
