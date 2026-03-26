export type AgentStatus = "Ativo" | "Em teste" | "Pausado";

export interface FlowEntry {
  id: number;
  name: string;
  trigger: string;
  active: boolean;
  conversations: number;
  lastTestScore?: number;
  lastTestStatus?: string;
}

export interface FlowCreation {
  name: string;
  trigger: string;
  active: boolean;
  conversations: number;
}

export interface FlowPatch {
  name?: string;
  trigger?: string;
  active?: boolean;
  conversations?: number;
  lastTestScore?: number;
  lastTestStatus?: string;
}

export interface AgentEntry {
  id: number;
  name: string;
  channel: string;
  focus: string;
  status: AgentStatus;
}

const initialFlows: FlowEntry[] = [
  {
    id: 1,
    name: "Boas-vindas WhatsApp",
    trigger: "Primeira Mensagem",
    active: true,
    conversations: 1240,
    lastTestScore: 92,
    lastTestStatus: "Excelente",
  },
  {
    id: 2,
    name: "Triagem Suporte",
    trigger: "Palavra-chave: 'Suporte'",
    active: true,
    conversations: 532,
    lastTestScore: 78,
    lastTestStatus: "Satisfatório",
  },
  {
    id: 3,
    name: "Agendador de Demo",
    trigger: "Palavra-chave: 'Demo'",
    active: false,
    conversations: 89,
    lastTestScore: 65,
    lastTestStatus: "Precisa melhorar",
  },
];

const initialAgents: AgentEntry[] = [
  {
    id: 1,
    name: "Assistente Comercial",
    channel: "WhatsApp",
    focus: "Qualificar leads e encaminhar para vendas",
    status: "Ativo",
  },
];

let flowsStore: FlowEntry[] = [...initialFlows];
let agentsStore: AgentEntry[] = [...initialAgents];
let nextFlowId = initialFlows.length + 1;
let nextAgentId = initialAgents.length + 1;

const cloneFlows = () => flowsStore.map(flow => ({ ...flow }));
const cloneAgents = () => agentsStore.map(agent => ({ ...agent }));

export function listFlows() {
  return cloneFlows();
}

export function createFlow(payload: FlowCreation) {
  const newFlow: FlowEntry = {
    id: nextFlowId,
    name: payload.name,
    trigger: payload.trigger,
    active: payload.active,
    conversations: payload.conversations,
  };

  nextFlowId += 1;
  flowsStore = [...flowsStore, newFlow];
  return { ...newFlow };
}

export function updateFlow(id: number, patch: FlowPatch) {
  let updatedFlow: FlowEntry | undefined;
  flowsStore = flowsStore.map(flow => {
    if (flow.id !== id) {
      return flow;
    }

    updatedFlow = { ...flow, ...patch };
    return updatedFlow;
  });

  return updatedFlow ? { ...updatedFlow } : undefined;
}

export function runFlowTest(id: number) {
  const score = 60 + Math.floor(Math.random() * 40);
  const status = score >= 85 ? "Excelente" : score >= 70 ? "Satisfatório" : "Precisa melhorar";

  const updated = updateFlow(id, {
    lastTestScore: score,
    lastTestStatus: status,
  });

  return updated;
}

export function listAgents() {
  return cloneAgents();
}

export function createAgent(agent: Omit<AgentEntry, "id">) {
  const newAgent: AgentEntry = {
    id: nextAgentId,
    ...agent,
  };

  nextAgentId += 1;
  agentsStore = [newAgent, ...agentsStore];
  return { ...newAgent };
}
