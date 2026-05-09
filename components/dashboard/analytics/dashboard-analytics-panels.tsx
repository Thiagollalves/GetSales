"use client"

import type { ReactNode } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Briefcase,
  CheckCircle2,
  Clock3,
  type LucideIcon,
  Sparkles,
  Timer,
  Users,
  UserRound,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  DashboardAnalyticsAttendanceRow,
  DashboardAnalyticsChannelRow,
  DashboardAnalyticsDepartmentRow,
  DashboardAnalyticsHourlySeriesPoint,
  DashboardAnalyticsMetric,
  DashboardAnalyticsUserRow,
} from "@/lib/dashboard-analytics"

type MetricIconName = DashboardAnalyticsMetric["icon"]

const metricIcons: Record<MetricIconName, LucideIcon> = {
  check: CheckCircle2,
  briefcase: Briefcase,
  users: Users,
  clock: Clock3,
  team: UserRound,
  spark: Sparkles,
  timer: Timer,
  flash: Zap,
}

interface DashboardAnalyticsOverviewPanelProps {
  channelRows: DashboardAnalyticsChannelRow[]
  departmentRows: DashboardAnalyticsDepartmentRow[]
  userRows: DashboardAnalyticsUserRow[]
}

interface DashboardAnalyticsAttendancePanelProps {
  hourlySeries: DashboardAnalyticsHourlySeriesPoint[]
  attendanceRows: DashboardAnalyticsAttendanceRow[]
}

interface MetricGridProps {
  metrics: DashboardAnalyticsMetric[]
}

function SectionCard({
  title,
  description,
  children,
  badge,
}: {
  title: string
  description: string
  children: ReactNode
  badge?: string
}) {
  return (
    <Card className="border-border/60 bg-card/90 shadow-sm">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground sm:text-base">{title}</CardTitle>
            <CardDescription className="text-xs leading-5 text-muted-foreground sm:text-sm">{description}</CardDescription>
          </div>
          {badge ? (
            <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
              {badge}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.icon]

        return (
          <Card
            key={metric.id}
            className="border-border/60 bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${metric.chipClass}`}>
                    <Icon className={`h-4 w-4 ${metric.iconClass}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight text-foreground">{metric.value}</div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-[22px] border border-dashed border-border/70 bg-background/60 px-4 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}

export function DashboardAnalyticsOverviewPanel({
  channelRows,
  departmentRows,
  userRows,
}: DashboardAnalyticsOverviewPanelProps) {
  const channelTotal = channelRows.reduce((sum, row) => sum + row.total, 0)
  const departmentTotal = departmentRows.reduce((sum, row) => sum + row.total, 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Atendimento por canal"
          description="Distribuição de volume por conexão principal."
          badge={`${channelTotal} total`}
        >
          {channelRows.length === 0 ? (
            <EmptyState title="Nenhum canal encontrado" description="Ajuste os filtros para voltar a ver os canais." />
          ) : (
            <div className="space-y-4">
              {channelRows.map((row) => (
                <div key={row.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{row.label}</span>
                    <span className="text-muted-foreground">
                      {row.percent.toFixed(1)}% <span className="ml-1 font-semibold text-foreground">{row.total}</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                    <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Atendimento por departamento"
          description="Quais squads concentram mais volume no período."
          badge={`${departmentTotal} total`}
        >
          {departmentRows.length === 0 ? (
            <EmptyState
              title="Nenhum departamento encontrado"
              description="Troque o filtro de departamento para ver a distribuição novamente."
            />
          ) : (
            <div className="space-y-3">
              {departmentRows.map((row) => (
                <div key={row.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${row.dotClass}`} />
                      <span className="font-medium text-foreground">{row.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {row.percent.toFixed(1)}% <span className="ml-1 font-semibold text-foreground">{row.total}</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                    <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Desempenho por usuário"
        description="Volume, fechamento e tempo médio por operador."
        badge={`${userRows.length} usuários`}
      >
        {userRows.length === 0 ? (
          <EmptyState title="Nenhum usuário encontrado" description="Ajuste os filtros para recuperar a tabela." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Em atendimento</TableHead>
                <TableHead>Finalizados</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Tempo médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/70 text-xs font-semibold text-foreground">
                        {getInitials(row.label)}
                      </div>
                      <span className="font-medium text-foreground">{row.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>{row.active}</TableCell>
                  <TableCell>{row.completed}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>{row.averageTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  )
}

export function DashboardAnalyticsAttendancePanel({
  hourlySeries,
  attendanceRows,
}: DashboardAnalyticsAttendancePanelProps) {
  const totalSent = attendanceRows.reduce((sum, row) => sum + row.sent, 0)
  const totalReceived = attendanceRows.reduce((sum, row) => sum + row.received, 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Volume por hora"
          description="Janela de maior tráfego ao longo do dia."
          badge={`${hourlySeries.length} pontos`}
        >
          {hourlySeries.length === 0 ? (
            <EmptyState title="Sem séries para exibir" description="Ajuste os filtros para recuperar o gráfico." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="volume" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard
          title="Resumo operacional"
          description="Leitura rápida de envio, resposta e conversão diária."
          badge={`${totalReceived}/${totalSent}`}
        >
          {attendanceRows.length === 0 ? (
            <EmptyState title="Sem linhas para exibir" description="Troque os filtros para recuperar o resumo diário." />
          ) : (
            <div className="space-y-3">
              {attendanceRows.slice(0, 4).map((row) => (
                <div key={row.day} className="rounded-[18px] border border-border/60 bg-background/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">{row.day}</span>
                    <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
                      {row.responseRate}% resposta
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">{row.sent}</p>
                      <p>Enviadas</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{row.received}</p>
                      <p>Recebidas</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{row.leads}</p>
                      <p>Leads</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Detalhamento diário"
        description="Leitura operacional das entregas e respostas por dia."
        badge={`${attendanceRows.length} dias`}
      >
        {attendanceRows.length === 0 ? (
          <EmptyState title="Nenhum dia encontrado" description="Ajuste os filtros para recuperar o detalhamento." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Enviadas</TableHead>
                <TableHead>Recebidas</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Resposta</TableHead>
                <TableHead>Conversão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRows.map((row) => (
                <TableRow key={row.day}>
                  <TableCell className="font-medium">{row.day}</TableCell>
                  <TableCell>{row.sent}</TableCell>
                  <TableCell>{row.received}</TableCell>
                  <TableCell>{row.leads}</TableCell>
                  <TableCell>{row.responseRate}%</TableCell>
                  <TableCell>{row.conversion}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  )
}

export { MetricGrid }
