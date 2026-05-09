"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Building2, LayoutGrid, Monitor, Rows3, Search, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  buildLiveBoardModel,
  buildLiveBoardUrl,
  liveBoardGroupByOptions,
  resolveLiveBoardState,
  type LiveBoardState,
} from "@/lib/live-board"
import { initialConversations } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { LiveBoard } from "./live-board"

export function LiveWorkspace() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  const state = useMemo(() => resolveLiveBoardState(pathname, searchParams), [pathname, queryString])

  const assigneeState = useMemo<LiveBoardState>(() => ({ ...state, groupBy: "assignee" }), [state.groupBy, state.view, state.q])
  const departmentState = useMemo<LiveBoardState>(
    () => ({ ...state, groupBy: "department" }),
    [state.groupBy, state.view, state.q],
  )

  const assigneeModel = useMemo(() => buildLiveBoardModel(initialConversations, assigneeState), [assigneeState])
  const departmentModel = useMemo(() => buildLiveBoardModel(initialConversations, departmentState), [departmentState])
  const model = state.groupBy === "assignee" ? assigneeModel : departmentModel

  const pushState = (nextState: LiveBoardState) => {
    router.replace(buildLiveBoardUrl(pathname, nextState), { scroll: false })
  }

  const updateState = (patch: Partial<LiveBoardState>) => {
    pushState({ ...state, ...patch })
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1700px] flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-[30px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,246,239,0.94))] px-4 py-4 shadow-sm backdrop-blur sm:px-6 sm:py-5">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Ao Vivo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-emerald-600" />
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Ao Vivo</h1>
                </div>
                <Badge className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-none hover:bg-emerald-500/15">
                  {model.onlineCount} online
                </Badge>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Operação em tempo real organizada por atendente ou departamento.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:min-w-[31rem] lg:justify-end">
              <div className="relative w-full sm:flex-1 lg:w-[18rem]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={state.q}
                  onChange={(event) => updateState({ q: event.target.value })}
                  placeholder="Buscar atendente ou cliente..."
                  className="h-11 rounded-2xl border-border/70 bg-background/90 pl-10 pr-4 shadow-sm"
                />
              </div>

              <div className="inline-flex items-center gap-1 rounded-2xl border border-border/70 bg-background/80 p-1 shadow-sm">
                <Button
                  type="button"
                  variant={state.view === "grid" ? "default" : "ghost"}
                  className={cn(
                    "h-9 rounded-xl px-3",
                    state.view === "grid"
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => updateState({ view: "grid" })}
                  aria-pressed={state.view === "grid"}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Grade
                </Button>
                <Button
                  type="button"
                  variant={state.view === "list" ? "default" : "ghost"}
                  className={cn(
                    "h-9 rounded-xl px-3",
                    state.view === "list"
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => updateState({ view: "list" })}
                  aria-pressed={state.view === "list"}
                >
                  <Rows3 className="mr-2 h-4 w-4" />
                  Lista
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {liveBoardGroupByOptions.map((option) => {
              const isActive = state.groupBy === option.value
              const Icon = option.value === "assignee" ? Users : Building2

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateState({ groupBy: option.value })}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-[16px] border px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-transparent bg-muted/30 text-muted-foreground hover:border-border/60 hover:bg-background/80 hover:text-foreground",
                  )}
                  >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <LiveBoard
        model={model}
        groupBy={state.groupBy}
        view={state.view}
        onClearSearch={state.q ? () => updateState({ q: "" }) : undefined}
      />
    </div>
  )
}
