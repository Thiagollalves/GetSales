"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";

const data = [
  { name: "Seg", sent: 120, received: 85, leads: 5 },
  { name: "Ter", sent: 230, received: 120, leads: 8 },
  { name: "Qua", sent: 180, received: 90, leads: 6 },
  { name: "Qui", sent: 340, received: 150, leads: 12 },
  { name: "Sex", sent: 290, received: 110, leads: 9 },
  { name: "Sab", sent: 100, received: 40, leads: 2 },
  { name: "Dom", sent: 50, received: 20, leads: 1 },
];

const periodOptions = ["Hoje", "7 dias", "30 dias", "Personalizado"];

const reportRows = data.map((entry) => ({
  ...entry,
  responseRate: Math.round((entry.received / Math.max(entry.sent, 1)) * 100),
  conversion: Math.round((entry.leads / Math.max(entry.received, 1)) * 100),
}));

export default function ReportsPage() {
  return (
    <WorkspaceShell
      title="Relatórios"
      description="Acompanhe volume, conversão e desempenho operacional em um único painel."
      actions={
        <>
          <Button variant="outline" className="rounded-full">
            Exportar
          </Button>
          <Button className="rounded-full">Atualizar</Button>
        </>
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          {periodOptions.map((period, index) => (
            <Badge
              key={period}
              variant={index === 1 ? "default" : "outline"}
              className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                index === 1 ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {period}
            </Badge>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+180.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <p className="text-xs text-muted-foreground">+5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas (Pipeline)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231</div>
            <p className="text-xs text-muted-foreground">+19% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="rounded-full bg-muted/40 p-1">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="attendance">Atendimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card className="border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Fluxo de Mensagens</CardTitle>
                <CardDescription>Enviadas vs Recebidas (Semanal)</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ color: "black" }} />
                    <Bar dataKey="sent" name="Enviadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="received" name="Recebidas" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Leads Gerados</CardTitle>
                <CardDescription>Conversão por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={data}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ color: "black" }} />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      stroke="hsl(var(--chart-2))"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Detalhamento diário</CardTitle>
              <CardDescription>Leitura operacional das entregas e respostas por dia.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="[&>th]:px-4 [&>th]:pb-3 [&>th]:font-medium">
                    <th>Dia</th>
                    <th>Enviadas</th>
                    <th>Recebidas</th>
                    <th>Leads</th>
                    <th>Resposta</th>
                    <th>Conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row) => (
                    <tr key={row.name} className="border-t border-border/60 [&>td]:px-4 [&>td]:py-3">
                      <td className="font-medium">{row.name}</td>
                      <td>{row.sent}</td>
                      <td>{row.received}</td>
                      <td>{row.leads}</td>
                      <td>{row.responseRate}%</td>
                      <td>{row.conversion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="rounded-[24px] border border-dashed border-border/60 bg-card/70 p-10 text-center text-muted-foreground shadow-sm">
            Em desenvolvimento...
          </div>
        </TabsContent>
      </Tabs>
    </WorkspaceShell>
  );
}
