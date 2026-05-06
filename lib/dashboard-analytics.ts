import { format, subDays } from "date-fns"

export type DashboardAnalyticsTab = "overview" | "attendance"

export type DashboardAnalyticsSearchParams =
  | URLSearchParams
  | {
      get(name: string): string | null
    }
  | Record<string, string | string[] | undefined>

export interface DashboardAnalyticsFilters {
  startDate: string
  endDate: string
  users: string
  departments: string
  connections: string
}

export interface DashboardAnalyticsState {
  tab: DashboardAnalyticsTab
  filters: DashboardAnalyticsFilters
}

export interface DashboardAnalyticsTabItem {
  value: DashboardAnalyticsTab
  label: string
}

export interface DashboardAnalyticsOption {
  value: string
  label: string
}

export interface DashboardAnalyticsMetric {
  id: string
  label: string
  value: string
  icon: "check" | "briefcase" | "users" | "clock" | "team" | "spark" | "timer" | "flash"
  chipClass: string
  iconClass: string
}

export interface DashboardAnalyticsHourlySeriesPoint {
  hour: string
  volume: number
}

export interface DashboardAnalyticsChannelRow {
  id: string
  label: string
  total: number
  percent: number
  barClass: string
  connectionId: string
}

export interface DashboardAnalyticsDepartmentRow {
  id: string
  label: string
  total: number
  percent: number
  dotClass: string
  barClass: string
}

export interface DashboardAnalyticsUserRow {
  id: string
  label: string
  total: number
  active: number
  completed: number
  averageTime: string
  percent: number
  departmentId: string
  connectionId: string
}

export interface DashboardAnalyticsAttendanceRow {
  day: string
  sent: number
  received: number
  leads: number
  responseRate: number
  conversion: number
  ownerId: string
  departmentId: string
  connectionId: string
}

export const dashboardAnalyticsTabItems: DashboardAnalyticsTabItem[] = [
  { value: "overview", label: "Visão Geral" },
  { value: "attendance", label: "Atendimentos" },
]

export const dashboardAnalyticsUserOptions: DashboardAnalyticsOption[] = [
  { value: "all", label: "Usuários" },
  { value: "ana-souza", label: "Ana Souza" },
  { value: "mariana-andrade", label: "Mariana Andrade" },
  { value: "ysabelly-rodrigues", label: "Ysabelly Rodrigues" },
  { value: "paulo-henrique", label: "Paulo Henrique" },
  { value: "geovani-gois", label: "Geovani Gois" },
  { value: "ester-araujo", label: "Ester Araujo" },
]

export const dashboardAnalyticsDepartmentOptions: DashboardAnalyticsOption[] = [
  { value: "all", label: "Departamentos" },
  { value: "suporte-ia", label: "Suporte IA" },
  { value: "squad-delta", label: "Squad Delta" },
  { value: "squad-sigma", label: "Squad Sigma" },
  { value: "squad-gama", label: "Squad Gama" },
  { value: "squad-alta", label: "Squad Alta" },
  { value: "squad-beta", label: "Squad Beta" },
  { value: "sem-departamento", label: "Sem Departamento" },
  { value: "financeiro", label: "Financeiro" },
  { value: "comercial", label: "Comercial" },
]

export const dashboardAnalyticsConnectionOptions: DashboardAnalyticsOption[] = [
  { value: "all", label: "Conexões" },
  { value: "whatsapp-business", label: "WhatsApp Business" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "jetvoice", label: "JetVoice" },
  { value: "instagram", label: "Instagram" },
  { value: "telegram", label: "Telegram" },
  { value: "email", label: "Email" },
  { value: "webchat", label: "WebChat" },
]

export const dashboardAnalyticsMetrics: DashboardAnalyticsMetric[] = [
  {
    id: "total-attendances",
    label: "Total de atendimentos",
    value: "2008",
    icon: "check",
    chipClass: "bg-emerald-100 text-emerald-700",
    iconClass: "text-emerald-600",
  },
  {
    id: "receptive",
    label: "Receptivos",
    value: "1543",
    icon: "briefcase",
    chipClass: "bg-amber-100 text-amber-700",
    iconClass: "text-amber-600",
  },
  {
    id: "active",
    label: "Ativos",
    value: "465",
    icon: "users",
    chipClass: "bg-violet-100 text-violet-700",
    iconClass: "text-violet-600",
  },
  {
    id: "pending",
    label: "Pendentes",
    value: "99",
    icon: "clock",
    chipClass: "bg-orange-100 text-orange-700",
    iconClass: "text-orange-600",
  },
  {
    id: "online",
    label: "Atendentes online",
    value: "34",
    icon: "team",
    chipClass: "bg-blue-100 text-blue-700",
    iconClass: "text-blue-600",
  },
  {
    id: "new-contacts",
    label: "Novos contatos",
    value: "109",
    icon: "spark",
    chipClass: "bg-cyan-100 text-cyan-700",
    iconClass: "text-cyan-600",
  },
  {
    id: "tma",
    label: "TMA",
    value: "00:00:00",
    icon: "timer",
    chipClass: "bg-indigo-100 text-indigo-700",
    iconClass: "text-indigo-600",
  },
  {
    id: "first-response",
    label: "1ª resposta",
    value: "00:00:00",
    icon: "flash",
    chipClass: "bg-rose-100 text-rose-700",
    iconClass: "text-rose-600",
  },
]

export const dashboardAnalyticsHourlySeries: DashboardAnalyticsHourlySeriesPoint[] = [
  { hour: "5:00", volume: 0 },
  { hour: "7:00", volume: 5 },
  { hour: "8:00", volume: 36 },
  { hour: "9:00", volume: 68 },
  { hour: "10:00", volume: 52 },
  { hour: "11:00", volume: 36 },
  { hour: "12:00", volume: 24 },
  { hour: "13:00", volume: 45 },
  { hour: "14:00", volume: 32 },
  { hour: "15:00", volume: 10 },
  { hour: "16:00", volume: 12 },
  { hour: "17:00", volume: 13 },
  { hour: "18:00", volume: 4 },
  { hour: "19:00", volume: 0 },
  { hour: "20:00", volume: 0 },
  { hour: "22:00", volume: 0 },
]

export const dashboardAnalyticsChannelRows: DashboardAnalyticsChannelRow[] = [
  {
    id: "whatsapp-business",
    label: "WhatsApp Business",
    total: 1262,
    percent: 62.9,
    barClass: "bg-[#14857c]",
    connectionId: "whatsapp-business",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    total: 746,
    percent: 37.1,
    barClass: "bg-emerald-500",
    connectionId: "whatsapp",
  },
]

export const dashboardAnalyticsDepartmentRows: DashboardAnalyticsDepartmentRow[] = [
  { id: "suporte-ia", label: "Suporte IA", total: 617, percent: 30.7, dotClass: "bg-violet-500", barClass: "bg-violet-500" },
  { id: "squad-delta", label: "Squad Delta", total: 234, percent: 11.7, dotClass: "bg-blue-500", barClass: "bg-blue-500" },
  { id: "squad-sigma", label: "Squad Sigma", total: 225, percent: 11.2, dotClass: "bg-amber-500", barClass: "bg-amber-500" },
  { id: "squad-gama", label: "Squad Gama", total: 204, percent: 10.2, dotClass: "bg-red-500", barClass: "bg-red-500" },
  { id: "squad-alta", label: "Squad Alta", total: 155, percent: 7.7, dotClass: "bg-green-500", barClass: "bg-green-500" },
  { id: "squad-beta", label: "Squad Beta", total: 139, percent: 6.9, dotClass: "bg-purple-500", barClass: "bg-purple-500" },
  { id: "sem-departamento", label: "Sem Departamento", total: 100, percent: 5.0, dotClass: "bg-slate-500", barClass: "bg-slate-500" },
  { id: "financeiro", label: "Financeiro", total: 93, percent: 4.6, dotClass: "bg-teal-500", barClass: "bg-teal-500" },
]

export const dashboardAnalyticsUserRows: DashboardAnalyticsUserRow[] = [
  {
    id: "matheus-andrade",
    label: "Matheus Andrade",
    total: 31,
    active: 9,
    completed: 22,
    averageTime: "14m",
    percent: 100,
    departmentId: "suporte-ia",
    connectionId: "whatsapp-business",
  },
  {
    id: "mariana-andrade",
    label: "Mariana Andrade",
    total: 29,
    active: 8,
    completed: 21,
    averageTime: "15m",
    percent: 94,
    departmentId: "squad-delta",
    connectionId: "whatsapp",
  },
  {
    id: "ysabelly-rodrigues",
    label: "Ysabelly Rodrigues",
    total: 27,
    active: 7,
    completed: 20,
    averageTime: "17m",
    percent: 87,
    departmentId: "squad-sigma",
    connectionId: "whatsapp-business",
  },
  {
    id: "paulo-henrique",
    label: "Paulo Henrique",
    total: 23,
    active: 6,
    completed: 17,
    averageTime: "19m",
    percent: 74,
    departmentId: "squad-gama",
    connectionId: "whatsapp",
  },
  {
    id: "geovani-gois",
    label: "Geovani Gois",
    total: 21,
    active: 5,
    completed: 16,
    averageTime: "21m",
    percent: 68,
    departmentId: "squad-alta",
    connectionId: "whatsapp-business",
  },
  {
    id: "ester-araujo",
    label: "Ester Araujo",
    total: 18,
    active: 4,
    completed: 14,
    averageTime: "23m",
    percent: 58,
    departmentId: "squad-beta",
    connectionId: "whatsapp",
  },
]

export const dashboardAnalyticsAttendanceRows: DashboardAnalyticsAttendanceRow[] = [
  {
    day: "Seg",
    sent: 120,
    received: 85,
    leads: 5,
    responseRate: 71,
    conversion: 6,
    ownerId: "ana-souza",
    departmentId: "suporte-ia",
    connectionId: "whatsapp-business",
  },
  {
    day: "Ter",
    sent: 230,
    received: 120,
    leads: 8,
    responseRate: 52,
    conversion: 7,
    ownerId: "mariana-andrade",
    departmentId: "squad-delta",
    connectionId: "whatsapp",
  },
  {
    day: "Qua",
    sent: 180,
    received: 90,
    leads: 6,
    responseRate: 50,
    conversion: 7,
    ownerId: "ysabelly-rodrigues",
    departmentId: "squad-sigma",
    connectionId: "whatsapp-business",
  },
  {
    day: "Qui",
    sent: 340,
    received: 150,
    leads: 12,
    responseRate: 44,
    conversion: 8,
    ownerId: "paulo-henrique",
    departmentId: "squad-gama",
    connectionId: "whatsapp-business",
  },
  {
    day: "Sex",
    sent: 290,
    received: 110,
    leads: 9,
    responseRate: 38,
    conversion: 8,
    ownerId: "geovani-gois",
    departmentId: "squad-alta",
    connectionId: "whatsapp",
  },
  {
    day: "Sab",
    sent: 100,
    received: 40,
    leads: 2,
    responseRate: 40,
    conversion: 5,
    ownerId: "ester-araujo",
    departmentId: "squad-beta",
    connectionId: "whatsapp",
  },
  {
    day: "Dom",
    sent: 50,
    received: 20,
    leads: 1,
    responseRate: 40,
    conversion: 5,
    ownerId: "ana-souza",
    departmentId: "sem-departamento",
    connectionId: "whatsapp-business",
  },
]

function getSearchParamValue(searchParams: DashboardAnalyticsSearchParams, key: string) {
  if ("get" in searchParams && typeof searchParams.get === "function") {
    return searchParams.get(key)
  }

  const value = searchParams[key]
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function normalizeOptionValue(value: string | null, allowedValues: readonly string[]) {
  if (!value) {
    return allowedValues[0] ?? "all"
  }

  return allowedValues.includes(value) ? value : allowedValues[0] ?? "all"
}

function getDefaultDateRange(referenceDate: Date) {
  return {
    startDate: format(subDays(referenceDate, 6), "yyyy-MM-dd"),
    endDate: format(referenceDate, "yyyy-MM-dd"),
  }
}

function getDefaultTabForPathname(pathname: string): DashboardAnalyticsTab {
  return pathname.startsWith("/dashboard/reports") ? "attendance" : "overview"
}

export function resolveDashboardAnalyticsState(
  searchParams: DashboardAnalyticsSearchParams,
  referenceDate?: Date,
): DashboardAnalyticsState

export function resolveDashboardAnalyticsState(
  pathname: string,
  searchParams: DashboardAnalyticsSearchParams,
  referenceDate?: Date,
): DashboardAnalyticsState

export function resolveDashboardAnalyticsState(
  pathnameOrSearchParams: string | DashboardAnalyticsSearchParams,
  searchParamsOrReferenceDate?: DashboardAnalyticsSearchParams | Date,
  referenceDate = new Date(),
): DashboardAnalyticsState {
  const resolvedPathname = typeof pathnameOrSearchParams === "string" ? pathnameOrSearchParams : "/dashboard"
  const searchParams =
    typeof pathnameOrSearchParams === "string"
      ? (searchParamsOrReferenceDate as DashboardAnalyticsSearchParams)
      : pathnameOrSearchParams
  const resolvedReferenceDate =
    typeof pathnameOrSearchParams === "string"
      ? referenceDate
      : (searchParamsOrReferenceDate as Date | undefined) ?? referenceDate
  const defaultDateRange = getDefaultDateRange(resolvedReferenceDate)
  const defaultTab = getDefaultTabForPathname(resolvedPathname)

  const tab = getSearchParamValue(searchParams, "tab")
  const startDate = getSearchParamValue(searchParams, "start")
  const endDate = getSearchParamValue(searchParams, "end")
  const users = getSearchParamValue(searchParams, "users")
  const departments = getSearchParamValue(searchParams, "departments")
  const connections = getSearchParamValue(searchParams, "connections")

  return {
    tab: tab === "attendance" || tab === "overview" ? tab : defaultTab,
    filters: {
      startDate: startDate ?? defaultDateRange.startDate,
      endDate: endDate ?? defaultDateRange.endDate,
      users: normalizeOptionValue(users, dashboardAnalyticsUserOptions.map((option) => option.value)),
      departments: normalizeOptionValue(departments, dashboardAnalyticsDepartmentOptions.map((option) => option.value)),
      connections: normalizeOptionValue(
        connections,
        dashboardAnalyticsConnectionOptions.map((option) => option.value),
      ),
    },
  }
}

export function buildDashboardAnalyticsUrl(pathname: string, state: DashboardAnalyticsState) {
  const params = new URLSearchParams()

  params.set("tab", state.tab)
  params.set("start", state.filters.startDate)
  params.set("end", state.filters.endDate)
  params.set("users", state.filters.users)
  params.set("departments", state.filters.departments)
  params.set("connections", state.filters.connections)

  return `${pathname}?${params.toString()}`
}

export function isDashboardAnalyticsRowVisible(
  row:
    | DashboardAnalyticsChannelRow
    | DashboardAnalyticsDepartmentRow
    | DashboardAnalyticsUserRow
    | DashboardAnalyticsAttendanceRow,
  filters: DashboardAnalyticsFilters,
) {
  const matchesUser =
    "connectionId" in row &&
    (filters.connections === "all" || row.connectionId === filters.connections)

  const matchesDepartment =
    "departmentId" in row &&
    (filters.departments === "all" || row.departmentId === filters.departments)

  const matchesOwner =
    "id" in row
      ? true
      : "ownerId" in row
        ? filters.users === "all" || row.ownerId === filters.users
        : true

  return matchesUser && matchesDepartment && matchesOwner
}

export function filterDashboardAnalyticsChannelRows(
  rows: DashboardAnalyticsChannelRow[],
  filters: DashboardAnalyticsFilters,
) {
  if (filters.connections === "all") {
    return rows
  }

  return rows.filter((row) => row.connectionId === filters.connections)
}

export function filterDashboardAnalyticsDepartmentRows(
  rows: DashboardAnalyticsDepartmentRow[],
  filters: DashboardAnalyticsFilters,
) {
  if (filters.departments === "all") {
    return rows
  }

  return rows.filter((row) => row.id === filters.departments)
}

export function filterDashboardAnalyticsUserRows(
  rows: DashboardAnalyticsUserRow[],
  filters: DashboardAnalyticsFilters,
) {
  return rows.filter((row) => {
    if (filters.users !== "all" && row.id !== filters.users) {
      return false
    }

    if (filters.departments !== "all" && row.departmentId !== filters.departments) {
      return false
    }

    if (filters.connections !== "all" && row.connectionId !== filters.connections) {
      return false
    }

    return true
  })
}

export function filterDashboardAnalyticsAttendanceRows(
  rows: DashboardAnalyticsAttendanceRow[],
  filters: DashboardAnalyticsFilters,
) {
  return rows.filter((row) => {
    if (filters.users !== "all" && row.ownerId !== filters.users) {
      return false
    }

    if (filters.departments !== "all" && row.departmentId !== filters.departments) {
      return false
    }

    if (filters.connections !== "all" && row.connectionId !== filters.connections) {
      return false
    }

    return true
  })
}
