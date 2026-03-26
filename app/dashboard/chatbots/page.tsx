"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot, MessagesSquare, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AgentEntry, AgentStatus, FlowEntry } from "@/lib/chatbots";

const channelOptions = ["WhatsApp", "Instagram", "Webchat", "Email", "Telegram"];
const agentStatusOptions: AgentStatus[] = ["Ativo", "Em teste", "Pausado"];

export default function ChatbotsPage() {
  const [flows, setFlows] = useState<FlowEntry[]>([]);
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [flowName, setFlowName] = useState("");
  const [flowTrigger, setFlowTrigger] = useState("");
  const [flowConversations, setFlowConversations] = useState("150");
  const [flowActive, setFlowActive] = useState(true);

  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentChannel, setAgentChannel] = useState(channelOptions[0]);
  const [agentFocus, setAgentFocus] = useState("");
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("Ativo");

  useEffect(() => {
    let canceled = false;

    const load = async () => {
      try {
        const [flowsRes, agentsRes] = await Promise.all([
          fetch("/api/chatbots/flows"),
          fetch("/api/chatbots/agents"),
        ]);

        if (!flowsRes.ok || !agentsRes.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const [flowsData, agentsData] = await Promise.all([flowsRes.json(), agentsRes.json()]);
        if (canceled) return;
        setFlows(flowsData);
        setAgents(agentsData);
      } catch (error) {
        if (!canceled) {
          toast.error("Não foi possível carregar os fluxos e agentes.");
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      canceled = true;
    };
  }, []);

  const bestFlows = useMemo(() => {
    return [...flows]
      .sort((a, b) => (b.lastTestScore ?? b.conversations) - (a.lastTestScore ?? a.conversations))
      .slice(0, 2);
  }, [flows]);

  const bestFlowIds = useMemo(() => new Set(bestFlows.map(flow => flow.id)), [bestFlows]);

  const toggleFlow = async (id: number) => {
    const target = flows.find(flow => flow.id === id);
    if (!target) {
      return;
    }

    const nextActive = !target.active;
    try {
      const response = await fetch("/api/chatbots/flows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: nextActive }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.error(error?.error ?? "Não foi possível atualizar o fluxo.");
        return;
      }

      const updated = await response.json();
      setFlows(prev => prev.map(flow => (flow.id === id ? updated : flow)));
      toast.success(`${updated.name} ${updated.active ? "ativado" : "desativado"}`);
    } catch (error) {
      toast.error("Erro ao alternar o fluxo.");
    }
  };

  const runFlowTest = async (flowId: number) => {
    const target = flows.find(flow => flow.id === flowId);
    try {
      const response = await fetch(`/api/chatbots/flows/${flowId}/test`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.error(error?.error ?? "Erro ao executar o teste.");
        return;
      }

      const updated = await response.json();
      setFlows(prev => prev.map(flow => (flow.id === flowId ? updated : flow)));
      toast.success(`Teste concluído para ${updated.name ?? target?.name ?? "fluxo"}: ${updated.lastTestScore}%`);
    } catch (error) {
      toast.error("Erro ao executar o teste.");
    }
  };

  const handleFlowSave = async () => {
    const name = flowName.trim();
    const trigger = flowTrigger.trim();
    if (!name || !trigger) {
      toast.error("Informe o nome e o gatilho do fluxo.");
      return;
    }

    const conversations = Math.max(0, Number(flowConversations) || 0);
    try {
      const response = await fetch("/api/chatbots/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          trigger,
          active: flowActive,
          conversations,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.error(error?.error ?? "Não foi possível criar o fluxo.");
        return;
      }

      const created = await response.json();
      setFlows(prev => [...prev, created]);
      toast.success(`Fluxo ${created.name} criado`);
      setIsFlowDialogOpen(false);
      setFlowName("");
      setFlowTrigger("");
      setFlowConversations("150");
      setFlowActive(true);
    } catch (error) {
      toast.error("Erro ao criar o fluxo.");
    }
  };

  const handleAgentSave = async () => {
    const name = agentName.trim();
    const focus = agentFocus.trim();
    if (!name || !focus) {
      toast.error("Informe o nome e o foco do agente.");
      return;
    }

    try {
      const response = await fetch("/api/chatbots/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          channel: agentChannel,
          focus,
          status: agentStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.error(error?.error ?? "Não foi possível criar o agente.");
        return;
      }

      const created = await response.json();
      setAgents(prev => [created, ...prev]);
      toast.success(`Agente ${created.name} pronto para testes`);
      setIsAgentDialogOpen(false);
      setAgentName("");
      setAgentFocus("");
      setAgentChannel(channelOptions[0]);
      setAgentStatus("Ativo");
    } catch (error) {
      toast.error("Erro ao criar o agente.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground">
        Carregando fluxos e agentes...
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chatbots & Automação</h2>
          <p className="text-sm text-muted-foreground">Crie fluxos e agentes que respondam automaticamente ao cliente.</p>
        </div>
        <Button onClick={() => setIsAgentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Agente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flows.map(flow => (
          <Card key={flow.id} className={!flow.active ? "opacity-80" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <div>
                  <CardTitle className="text-base font-semibold">{flow.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{flow.trigger}</p>
                </div>
              </div>
              <Switch checked={flow.active} onCheckedChange={() => toggleFlow(flow.id)} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessagesSquare className="h-3 w-3" />
                  {flow.conversations} execuções
                </div>
                <Badge variant="outline" className={flow.active ? "text-green-600 border-green-200 bg-green-50" : "text-yellow-600 border-yellow-200 bg-yellow-50"}>
                  {flow.active ? "Ativo" : "Pausado"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Último teste: {flow.lastTestScore ? `${flow.lastTestScore}% (${flow.lastTestStatus})` : "Ainda não executado"}
              </p>
              {bestFlowIds.has(flow.id) && (
                <Badge variant="outline" className="text-foreground border-foreground/40">
                  Melhor fluxo
                </Badge>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 border-t pt-4 bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p>Teste em andamento</p>
                <span className="font-semibold">{flow.lastTestScore ?? "—"}%</span>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => runFlowTest(flow.id)}>
                  Executar teste
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        <Card
          className="flex cursor-pointer flex-col items-center justify-center border-dashed text-muted-foreground hover:bg-muted/50 transition-colors min-h-[170px]"
          onClick={() => setIsFlowDialogOpen(true)}
        >
          <Plus className="h-8 w-8 mb-2" />
          <p className="font-medium">Criar novo fluxo</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Testes e Melhores Fluxos</CardTitle>
            <CardDescription>Os fluxos com melhor desempenho aparecem primeiro.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bestFlows.map(flow => (
            <div key={flow.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">{flow.name}</h3>
                <p className="text-sm text-muted-foreground">{flow.trigger}</p>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <div className="text-right">
                  <p className="text-sm font-semibold">{flow.lastTestScore ?? flow.conversations}%</p>
                  <p className="text-xs text-muted-foreground">{flow.lastTestStatus ?? "Sem teste"}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Agentes</h3>
          <span className="text-xs text-muted-foreground">{agents.length} registrad{agents.length === 1 ? "o" : "os"}</span>
        </div>
        {agents.length === 0 ? (
          <Card className="border-dashed text-center text-muted-foreground">Nenhum agente cadastrado ainda.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {agents.map(agent => (
              <Card key={agent.id} className="border">
                <CardHeader className="flex items-center justify-between p-4 pb-2">
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{agent.channel}</p>
                  </div>
                  <Badge variant="outline" className="text-xs uppercase">
                    {agent.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <p className="text-sm text-muted-foreground">{agent.focus}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={isFlowDialogOpen} onOpenChange={setIsFlowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo fluxo</DialogTitle>
            <DialogDescription>Configure um gatilho e inicialize um fluxo para testar o atendimento.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={event => {
              event.preventDefault();
              handleFlowSave();
            }}
          >
            <div>
              <Label htmlFor="flow-name">Nome do fluxo</Label>
              <Input
                id="flow-name"
                placeholder="Fluxo de boas-vindas"
                value={flowName}
                onChange={event => setFlowName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="flow-trigger">Gatilho</Label>
              <Input
                id="flow-trigger"
                placeholder="Palavra-chave ou primeira mensagem"
                value={flowTrigger}
                onChange={event => setFlowTrigger(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="flow-conversations">Execuções simuladas</Label>
              <Input
                id="flow-conversations"
                type="number"
                min={0}
                value={flowConversations}
                onChange={event => setFlowConversations(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={flowActive} onCheckedChange={setFlowActive} />
              <span className="text-sm">{flowActive ? "Fluxo ativo" : "Fluxo pausado"}</span>
            </div>
            <DialogFooter className="justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsFlowDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar fluxo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo agente</DialogTitle>
            <DialogDescription>Treine um agente para apoiar o atendimento humano.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={event => {
              event.preventDefault();
              handleAgentSave();
            }}
          >
            <div>
              <Label htmlFor="agent-name">Nome do agente</Label>
              <Input
                id="agent-name"
                placeholder="Agente Comercial"
                value={agentName}
                onChange={event => setAgentName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="agent-channel">Canal</Label>
              <Input
                id="agent-channel"
                placeholder="WhatsApp, Instagram..."
                value={agentChannel}
                onChange={event => setAgentChannel(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="agent-focus">Foco principal</Label>
              <Textarea
                id="agent-focus"
                placeholder="Responder dúvidas e qualificar leads"
                value={agentFocus}
                onChange={event => setAgentFocus(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="agent-status">Status</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {agentStatusOptions.map(status => (
                  <Button
                    key={status}
                    variant={agentStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAgentStatus(status)}
                    type="button"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter className="justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsAgentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar agente</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
