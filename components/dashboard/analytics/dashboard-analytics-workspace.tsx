"use client"

import type { ReactNode } from "react"
import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { CalendarDays } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  buildDashboardAnalyticsUrl,
  dashboardAnalyticsAttendanceRows,
  dashboardAnalyticsChannelRows,
  dashboardAnalyticsConnectionOptions,
  dashboardAnalyticsDepartmentOptions,
  dashboardAnalyticsDepartmentRows,
  dashboardAnalyticsHourlySeries,
  dashboardAnalyticsMetrics,
  dashboardAnalyticsTabItems,
  dashboardAnalyticsUserOptions,
  dashboardAnalyticsUserRows,
  filterDashboardAnalyticsAttendanceRows,
  filterDashboardAnalyticsChannelRows,
  filterDashboardAnalyticsDepartmentRows,
  filterDashboardAnalyticsUserRows,
  resolveDashboardAnalyticsState,
  type DashboardAnalyticsState,
} from "@/lib/dashboard-analytics"
import {
  DashboardAnalyticsAttendancePanel,
  DashboardAnalyticsOverviewPanel,
  MetricGrid,
} from "./dashboard-analytics-panels"

function formatDateLabel(value: string) {
  return format(parseISO(value), "dd/MM/yyyy")
}

function DashboardFieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
      {children}
    </span>
  )
}

export function DashboardAnalyticsWorkspace() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  const state = useMemo(() => resolveDashboardAnalyticsState(pathname, searchParams), [pathname, queryString])

  const pushState = (nextState: DashboardAnalyticsState) => {
    router.replace(buildDashboardAnalyticsUrl(pathname, nextState), { scroll: false })
  }

  const updateFilters = (patch: Partial<DashboardAnalyticsState["filters"]>) => {
    const nextFilters = { ...state.filters, ...patch }

    if (nextFilters.startDate > nextFilters.endDate) {
      const startDate = nextFilters.endDate
      const endDate = nextFilters.startDate
      nextFilters.startDate = startDate
      nextFilters.endDate = endDate
    }

    pushState({ ...state, filters: nextFilters })
  }

  const updateDateFilter = (field: "startDate" | "endDate", date?: Date) => {
    const nextValue = date ? format(date, "yyyy-MM-dd") : state.filters[field]
    updateFilters({ [field]: nextValue })
  }

  const visibleChannelRows = filterDashboardAnalyticsChannelRows(dashboardAnalyticsChannelRows, state.filters)
  const visibleDepartmentRows = filterDashboardAnalyticsDepartmentRows(dashboardAnalyticsDepartmentRows, state.filters)
  const visibleUserRows = filterDashboardAnalyticsUserRows(dashboardAnalyticsUserRows, state.filters)
  const visibleAttendanceRows = filterDashboardAnalyticsAttendanceRows(dashboardAnalyticsAttendanceRows, state.filters)

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-[30px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,246,239,0.93))] px-4 py-4 shadow-sm backdrop-blur sm:px-6 sm:py-5">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Dashboard</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Visão consolidada de volume, canais e desempenho operacional.
            </p>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.15fr_1.15fr_1fr_1fr_1fr]">
            <div className="space-y-1.5">
              <DashboardFieldLabel>Data início</DashboardFieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-between rounded-2xl border-border/70 bg-background/90 px-4 font-normal shadow-sm"
                  >
                    <span>{formatDateLabel(state.filters.startDate)}</span>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={parseISO(state.filters.startDate)}
                    onSelect={(date) => updateDateFilter("startDate", date ?? undefined)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <DashboardFieldLabel>Data fim</DashboardFieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-between rounded-2xl border-border/70 bg-background/90 px-4 font-normal shadow-sm"
                  >
                    <span>{formatDateLabel(state.filters.endDate)}</span>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={parseISO(state.filters.endDate)}
                    onSelect={(date) => updateDateFilter("endDate", date ?? undefined)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <DashboardFieldLabel>Usuários</DashboardFieldLabel>
              <Select value={state.filters.users} onValueChange={(value) => updateFilters({ users: value })}>
                <SelectTrigger className="h-11 w-full rounded-2xl border-border/70 bg-background/90 px-4 shadow-sm">
                  <SelectValue placeholder="Usuários" />
                </SelectTrigger>
                <SelectContent>
                  {dashboardAnalyticsUserOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <DashboardFieldLabel>Departamentos</DashboardFieldLabel>
              <Select value={state.filters.departments} onValueChange={(value) => updateFilters({ departments: value })}>
                <SelectTrigger className="h-11 w-full rounded-2xl border-border/70 bg-background/90 px-4 shadow-sm">
                  <SelectValue placeholder="Departamentos" />
                </SelectTrigger>
                <SelectContent>
                  {dashboardAnalyticsDepartmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <DashboardFieldLabel>Conexões</DashboardFieldLabel>
              <Select value={state.filters.connections} onValueChange={(value) => updateFilters({ connections: value })}>
                <SelectTrigger className="h-11 w-full rounded-2xl border-border/70 bg-background/90 px-4 shadow-sm">
                  <SelectValue placeholder="Conexões" />
                </SelectTrigger>
                <SelectContent>
                  {dashboardAnalyticsConnectionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <MetricGrid metrics={dashboardAnalyticsMetrics} />

      <Tabs value={state.tab} onValueChange={(value) => pushState({ ...state, tab: value as DashboardAnalyticsState["tab"] })}>
        <TabsList className="h-auto w-full justify-start gap-1 rounded-[18px] bg-muted/40 p-1.5">
          {dashboardAnalyticsTabItems.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="min-w-[8.5rem] rounded-[14px] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.24em]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="m-0 mt-4">
          <DashboardAnalyticsOverviewPanel
            channelRows={visibleChannelRows}
            departmentRows={visibleDepartmentRows}
            userRows={visibleUserRows}
          />
        </TabsContent>

        <TabsContent value="attendance" className="m-0 mt-4">
          <DashboardAnalyticsAttendancePanel
            hourlySeries={dashboardAnalyticsHourlySeries}
            attendanceRows={visibleAttendanceRows}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
