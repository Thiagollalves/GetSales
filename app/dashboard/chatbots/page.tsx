"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot, Plus, MessagesSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { notifyAction } from "@/lib/button-actions";

interface Bot {
    id: number
    name: string
    trigger: string
    active: boolean
    conversations: number
}

const initialBots: Bot[] = [
    { id: 1, name: "Boas-vindas WhatsApp", trigger: "Primeira Mensagem", active: true, conversations: 1240 },
    { id: 2, name: "Triagem Suporte", trigger: "Palavra-chave: 'Suporte'", active: true, conversations: 532 },
    { id: 3, name: "Agendador de Demo", trigger: "Palavra-chave: 'Demo'", active: false, conversations: 89 },
];

export default function ChatbotsPage() {
    const [bots, setBots] = useState(initialBots);

    const toggleBot = (id: number) => {
        setBots(bots.map(b => {
            if (b.id === id) {
                const newState = !b.active;
                toast.success(`${b.name} ${newState ? 'ativado' : 'desativado'}`);
                return { ...b, active: newState };
            }
            return b;
        }));
    };

    const handleNewAgent = () => {
        notifyAction("Novo agente", "Abrindo o fluxo para criar um novo agente.");
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Chatbots & Automação</h2>
                <Button onClick={handleNewAgent}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Agente
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bots.map(bot => (
                    <Card key={bot.id} className={!bot.active ? "opacity-75" : ""}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                {bot.name}
                            </CardTitle>
                            <Switch checked={bot.active} onCheckedChange={() => toggleBot(bot.id)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground mt-2">
                                <span className="font-medium text-foreground">Gatilho:</span> {bot.trigger}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4 bg-muted/20">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MessagesSquare className="h-3 w-3" />
                                {bot.conversations} execuções
                            </div>
                            {bot.active ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Ativo</Badge>
                            ) : (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Pausado</Badge>
                            )}
                        </CardFooter>
                    </Card>
                ))}

                <Card className="flex flex-col items-center justify-center border-dashed text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer min-h-[180px]">
                    <Plus className="h-8 w-8 mb-2" />
                    <p className="font-medium">Criar novo fluxo</p>
                </Card>
            </div>
        </div>
    );
}
