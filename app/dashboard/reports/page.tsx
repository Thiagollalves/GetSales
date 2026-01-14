"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const data = [
    { name: "Seg", sent: 120, received: 85, leads: 5 },
    { name: "Ter", sent: 230, received: 120, leads: 8 },
    { name: "Qua", sent: 180, received: 90, leads: 6 },
    { name: "Qui", sent: 340, received: 150, leads: 12 },
    { name: "Sex", sent: 290, received: 110, leads: 9 },
    { name: "Sab", sent: 100, received: 40, leads: 2 },
    { name: "Dom", sent: 50, received: 20, leads: 1 },
];

export default function ReportsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,345</div>
                        <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">+180.1% em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42%</div>
                        <p className="text-xs text-muted-foreground">+5% em relação ao mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
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
                <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="attendance">Atendimentos</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Fluxo de Mensagens</CardTitle>
                                <CardDescription>Enviadas vs Recebidas (Semanal)</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={data}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ color: 'black' }} />
                                        <Bar dataKey="sent" name="Enviadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="received" name="Recebidas" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Leads Gerados</CardTitle>
                                <CardDescription>Conversão por dia</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={data}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ color: 'black' }} />
                                        <Line type="monotone" dataKey="leads" strokeWidth={2} activeDot={{ r: 8 }} stroke="hsl(var(--chart-2))" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="attendance">
                    <div className="p-10 text-center text-muted-foreground">
                        Em desenvolvimento...
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
