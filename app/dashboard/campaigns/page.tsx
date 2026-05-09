"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Plus, Users, LayoutTemplate, Loader2 } from "lucide-react";
import { initialTemplates, Template } from "@/lib/mock-data";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";
import { useContactsStore } from "@/components/dashboard/contacts/use-contacts-store";
import { buildCampaignTagOptions, selectCampaignAudience } from "@/lib/campaigns";

const createTemplateId = () => globalThis.crypto?.randomUUID?.() ?? `template-${Date.now()}`

export default function CampaignsPage() {
  const { contacts } = useContactsStore()
  const [activeTab, setActiveTab] = useState("broadcast");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateBody, setNewTemplateBody] = useState("");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  const audience = useMemo(() => selectCampaignAudience(contacts, selectedTag), [contacts, selectedTag]);
  const tagOptions = useMemo(() => buildCampaignTagOptions(contacts), [contacts]);

  const handleSendCampaign = async () => {
    if (!selectedTemplate) {
      toast.error("Selecione um modelo para enviar.");
      return;
    }
    if (audience.length === 0) {
      toast.error("Nenhum contato encontrado para esta tag.");
      return;
    }

    setIsSending(true);
    setProgress(0);
    toast.info(`Iniciando disparo para ${audience.length} contatos...`);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let index = 0; index < audience.length; index += 1) {
      await delay(650);
      setProgress(((index + 1) / audience.length) * 100);
    }

    setIsSending(false);
    toast.success("Campanha enviada com sucesso!");
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName || !newTemplateBody) {
      toast.error("Preencha o nome e o corpo do modelo.");
      return;
    }

    const newTemplate: Template = {
      id: createTemplateId(),
      name: newTemplateName.toLowerCase().replace(/\s/g, "_"),
      category: "MARKETING",
      language: "pt_BR",
      status: "APPROVED",
      components: [{ type: "BODY", text: newTemplateBody }],
    };

    setTemplates([...templates, newTemplate]);
    setNewTemplateName("");
    setNewTemplateBody("");
    setIsCreatingTemplate(false);
    toast.success("Modelo criado e enviado para aprovação (Mock).");
  };

  return (
    <WorkspaceShell
      title="Campanhas & Disparos"
      description="Organize públicos, use modelos aprovados e acompanhe o envio em massa."
      actions={
        <Button onClick={() => setIsCreatingTemplate((previous) => !previous)} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          {isCreatingTemplate ? "Cancelar" : "Novo Modelo"}
        </Button>
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
            {audience.length} contatos
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-medium">
            {templates.length} modelos
          </Badge>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="rounded-full bg-muted/40 p-1">
          <TabsTrigger value="broadcast">Disparo em Massa</TabsTrigger>
          <TabsTrigger value="templates">Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card className="border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Definir Público
                </CardTitle>
                <CardDescription>Selecione quem receberá esta campanha.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Segmentação (Tags)</label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Selecione uma tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tagOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ({option.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-[22px] border border-border/60 bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    Público estimado: <strong className="text-foreground">{audience.length} contatos</strong>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {audience.slice(0, 5).map((contact) => (
                      <Badge key={contact.id} variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                        {contact.name}
                      </Badge>
                    ))}
                    {audience.length > 5 ? (
                      <span className="pt-1 text-xs text-muted-foreground">+{audience.length - 5} mais...</span>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5" />
                  Conteúdo da Mensagem
                </CardTitle>
                <CardDescription>Escolha um modelo aprovado pela Meta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modelo</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Selecione um template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.language})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate ? (
                  <div className="rounded-[22px] border border-dashed border-border/70 bg-muted/20 p-4 text-sm">
                    <p className="whitespace-pre-wrap">
                      {templates.find((template) => template.id === selectedTemplate)?.components.find((component) => component.type === "BODY")?.text}
                    </p>
                  </div>
                ) : null}
              </CardContent>
              <CardFooter>
                <Button className="w-full rounded-full" onClick={handleSendCampaign} disabled={isSending || !selectedTemplate}>
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando {Math.round(progress)}%
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar campanha agora
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {isCreatingTemplate ? (
            <Card className="border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Criar novo modelo</CardTitle>
                <CardDescription>O modelo será enviado para aprovação da Meta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do template</label>
                  <Input
                    placeholder="ex: alerta_promocao"
                    value={newTemplateName}
                    onChange={(event) => setNewTemplateName(event.target.value)}
                    className="rounded-full"
                  />
                  <p className="text-xs text-muted-foreground">Apenas letras minúsculas e sublinhados.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Corpo da mensagem</label>
                  <Textarea
                    placeholder="Olá {{1}}, confira nossas novidades..."
                    value={newTemplateBody}
                    onChange={(event) => setNewTemplateBody(event.target.value)}
                    className="min-h-32 rounded-[22px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreateTemplate} className="rounded-full">
                  Salvar e enviar para aprovação
                </Button>
              </CardFooter>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="border-border/60 bg-card/90 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="truncate text-sm font-medium" title={template.name}>
                    {template.name}
                  </CardTitle>
                  <Badge className="bg-green-500 hover:bg-green-600">Aprovado</Badge>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-xs text-muted-foreground">
                    {template.category} • {template.language}
                  </div>
                  <p className="line-clamp-3 text-sm text-card-foreground/80">
                    {template.components.find((component) => component.type === "BODY")?.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </WorkspaceShell>
  );
}
