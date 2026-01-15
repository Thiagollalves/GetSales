"use client";

import { useState } from "react";
import {
  DndContext,
  closestCorners,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  MoreHorizontal,
  DollarSign,
  Calendar,
  GripVertical,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { notifyAction } from "@/lib/button-actions";

// --- Types ---
interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  channel: "whatsapp" | "instagram" | "telegram" | "email";
  lastContact: string;
  score: number;
  avatar: string;
}

interface Stage {
  id: string;
  title: string;
  color: string;
  bgGradient: string;
  leads: Lead[];
}

const initialStages: Stage[] = [
  {
    id: "novos",
    title: "Novos Leads",
    color: "bg-blue-500",
    bgGradient: "from-blue-500/10",
    leads: [
      { id: "1", name: "Maria Silva", company: "Tech Solutions", value: 15000, channel: "whatsapp", lastContact: "Hoje", score: 85, avatar: "MS" },
      { id: "2", name: "João Santos", company: "Digital Corp", value: 8500, channel: "instagram", lastContact: "Ontem", score: 62, avatar: "JS" },
      { id: "3", name: "Ana Costa", company: "Startup XYZ", value: 25000, channel: "email", lastContact: "2 dias", score: 78, avatar: "AC" },
    ],
  },
  {
    id: "qualificacao",
    title: "Qualificação",
    color: "bg-amber-500",
    bgGradient: "from-amber-500/10",
    leads: [
      { id: "4", name: "Carlos Oliveira", company: "Mega Retail", value: 45000, channel: "telegram", lastContact: "Hoje", score: 90, avatar: "CO" },
      { id: "5", name: "Fernanda Lima", company: "Service Plus", value: 12000, channel: "whatsapp", lastContact: "3 dias", score: 55, avatar: "FL" },
    ],
  },
  {
    id: "proposta",
    title: "Proposta Enviada",
    color: "bg-purple-500",
    bgGradient: "from-purple-500/10",
    leads: [
      { id: "6", name: "Ricardo Mendes", company: "Global Industries", value: 120000, channel: "email", lastContact: "Ontem", score: 92, avatar: "RM" },
    ],
  },
  {
    id: "negociacao",
    title: "Negociação",
    color: "bg-orange-500",
    bgGradient: "from-orange-500/10",
    leads: [
      { id: "7", name: "Patricia Souza", company: "Enterprise Co", value: 85000, channel: "whatsapp", lastContact: "Hoje", score: 88, avatar: "PS" },
      { id: "8", name: "Lucas Ferreira", company: "Innovation Hub", value: 32000, channel: "telegram", lastContact: "Hoje", score: 75, avatar: "LF" },
    ],
  },
  {
    id: "fechamento",
    title: "Fechamento",
    color: "bg-primary",
    bgGradient: "from-primary/10",
    leads: [
      { id: "9", name: "Mariana Rocha", company: "Alpha Business", value: 95000, channel: "email", lastContact: "Hoje", score: 98, avatar: "MR" },
    ],
  },
];

const channelColors: Record<string, string> = {
  whatsapp: "bg-green-500",
  instagram: "bg-gradient-to-tr from-purple-500 to-pink-500",
  telegram: "bg-blue-500",
  email: "bg-gray-500",
};

const stagePalette = [
  { color: "bg-sky-500", bgGradient: "from-sky-500/10" },
  { color: "bg-emerald-500", bgGradient: "from-emerald-500/10" },
  { color: "bg-fuchsia-500", bgGradient: "from-fuchsia-500/10" },
  { color: "bg-rose-500", bgGradient: "from-rose-500/10" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);

// --- Sortable Lead Component ---
function SortableLead({ lead }: { lead: Lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id, data: { ...lead, type: 'Lead' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        p-4 cursor-grab active:cursor-grabbing transition-all duration-200
        border border-border/50 bg-card/80 backdrop-blur-sm
        hover:shadow-lg hover:shadow-primary/5 hover:border-border
        mb-2 touch-none
      `}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center text-xs font-semibold text-primary">
              {lead.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${channelColors[lead.channel]}`} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(lead.value)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {lead.lastContact}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full transition-all"
                style={{ width: `${lead.score}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-primary">{lead.score}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// --- Main Pipeline Logic ---
export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const findStage = (id: string) => {
    return stages.find(s => s.id === id || s.leads.some(l => l.id === id));
  };

  const createLead = (stageId: string): Lead => {
    const leadNumber = stages.reduce((sum, stage) => sum + stage.leads.length, 0) + 1;
    return {
      id: `${stageId}-${Date.now()}`,
      name: `Novo Lead ${leadNumber}`,
      company: "Nova Empresa",
      value: 12000,
      channel: "whatsapp",
      lastContact: "Agora",
      score: 50,
      avatar: "NL",
    };
  };

  const handleFilterClick = () => {
    notifyAction("Filtros do pipeline", "Abra o painel de filtros para segmentar seus leads.");
  };

  const handleAddLead = (stageId?: string) => {
    if (!stageId) {
      notifyAction("Nenhuma etapa disponível", "Crie uma etapa antes de adicionar um lead.");
      return;
    }

    const stage = stages.find((s) => s.id === stageId);
    if (!stage) {
      notifyAction("Etapa não encontrada", "Selecione outra etapa para adicionar o lead.");
      return;
    }

    const newLead = createLead(stageId);
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, leads: [newLead, ...s.leads] } : s))
    );
    notifyAction("Lead adicionado", `Lead criado na etapa ${stage.title}.`);
  };

  const handleAddStage = () => {
    const palette = stagePalette[stages.length % stagePalette.length];
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      title: `Nova Etapa ${stages.length + 1}`,
      color: palette.color,
      bgGradient: palette.bgGradient,
      leads: [],
    };

    setStages((prev) => [...prev, newStage]);
    notifyAction("Etapa criada", "Nova etapa adicionada ao pipeline.");
  };

  const handleStageOptions = (title: string) => {
    notifyAction("Opções da etapa", `Abrindo opções de ${title}.`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const stage = findStage(active.id as string);
    const lead = stage?.leads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeStage = findStage(activeId as string);
    const overStage = findStage(overId as string);

    if (!activeStage || !overStage || activeStage === overStage) return;

    setStages((prev) => {
      const activeItems = activeStage.leads;
      const overItems = overStage.leads;
      const activeIndex = activeItems.findIndex(l => l.id === activeId);
      const overIndex = overItems.findIndex(l => l.id === overId);

      let newIndex;
      if (overId in initialStages.map(s => s.id)) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return prev.map(s => {
        if (s.id === activeStage.id) {
          return { ...s, leads: activeItems.filter(l => l.id !== activeId) };
        }
        if (s.id === overStage.id) {
          return {
            ...s,
            leads: [
              ...overItems.slice(0, newIndex),
              activeItems[activeIndex],
              ...overItems.slice(newIndex, overItems.length)
            ]
          };
        }
        return s;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over ? over.id : null;

    const activeStage = findStage(activeId as string);
    const overStage = findStage(overId as string);

    if (activeStage && overStage && activeStage.id === overStage.id && overId) {
      const activeIndex = activeStage.leads.findIndex(l => l.id === activeId);
      const overIndex = activeStage.leads.findIndex(l => l.id === overId);

      if (activeIndex !== overIndex) {
        setStages(prev => prev.map(s => {
          if (s.id === activeStage.id) {
            return { ...s, leads: arrayMove(s.leads, activeIndex, overIndex) };
          }
          return s;
        }));
      }
    }
    setActiveLead(null);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  const totalLeads = stages.reduce((sum, s) => sum + s.leads.length, 0);
  const totalValue = stages.reduce((sum, s) => sum + s.leads.reduce((val, l) => val + l.value, 0), 0);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border bg-card/50 backdrop-blur-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wide">Pipeline</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold">Pipeline de Vendas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalLeads} leads • {formatCurrency(totalValue)} em potencial
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar lead..." className="pl-9 w-64 bg-secondary/50" />
          </div>
          <Button variant="outline" size="icon" className="bg-secondary/50" onClick={handleFilterClick}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => handleAddLead(stages[0]?.id)}>
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-4 lg:p-6">
          <div className="flex gap-4 h-full min-w-max">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`
                   w-80 flex flex-col rounded-xl transition-all duration-300
                   bg-gradient-to-b ${stage.bgGradient} to-transparent
                `}
              >
                {/* Stage Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${stage.color} shadow-lg`} />
                    <h3 className="font-semibold text-sm">{stage.title}</h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-medium">
                      {stage.leads.length}
                    </span>
                  </div>
                  {/* Simplified Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => handleStageOptions(stage.title)}>Opções</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground">
                    Total: <span className="font-semibold text-foreground">{formatCurrency(stage.leads.reduce((sum, l) => sum + l.value, 0))}</span>
                  </p>
                </div>

                {/* Stage Body - Sortable Context */}
                <div className="flex-1 overflow-y-auto px-3 pb-3">
                  <SortableContext
                    id={stage.id}
                    items={stage.leads.map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {stage.leads.map(lead => (
                      <SortableLead key={lead.id} lead={lead} />
                    ))}
                  </SortableContext>
                  {/* Button New Lead */}
                  <Button
                    variant="ghost"
                    className="w-full mt-2 border border-dashed border-border h-10"
                    onClick={() => handleAddLead(stage.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Lead
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Stage Column Placeholder */}
            <div className="w-80 shrink-0 opacity-50 hover:opacity-100 transition-opacity">
              <Button variant="outline" className="w-full h-12 border-dashed" onClick={handleAddStage}>
                <Plus className="h-4 w-4 mr-2" /> Nova Etapa
              </Button>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeLead ? (
            <div className="p-4 rounded-lg bg-card border shadow-2xl rotate-2 opacity-90 cursor-grabbing w-80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {activeLead.avatar}
                </div>
                <div className="font-semibold text-sm">{activeLead.name}</div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
