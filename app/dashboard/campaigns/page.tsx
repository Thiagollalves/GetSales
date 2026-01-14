"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Plus, Users, LayoutTemplate, Loader2, CheckCircle2 } from "lucide-react";
import { initialTemplates, initialConversations, Template } from "@/lib/mock-data";

export default function CampaignsPage() {
    const [activeTab, setActiveTab] = useState("broadcast");
    const [selectedTag, setSelectedTag] = useState("all");
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState(0);

    // Template State
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateBody, setNewTemplateBody] = useState("");
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

    // Derived Audience
    const audience = selectedTag === "all"
        ? initialConversations
        : initialConversations.filter(c => c.tags.includes(selectedTag));

    const uniqueTags = Array.from(new Set(initialConversations.flatMap(c => c.tags)));

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

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        // Simulate reliable bulk sending loop
        for (let i = 0; i < audience.length; i++) {
            await delay(800); // Artificial delay to simulate processing/avoid rate limits
            setProgress(((i + 1) / audience.length) * 100);
            // Here we would call the API for each contact
            // await fetch('/api/whatsapp/send', { ... })
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
            id: Math.random().toString(),
            name: newTemplateName.toLowerCase().replace(/\s/g, '_'),
            category: "MARKETING",
            language: "pt_BR",
            status: "APPROVED", // Mock auto-approval
            components: [{ type: "BODY", text: newTemplateBody }]
        };

        setTemplates([...templates, newTemplate]);
        setNewTemplateName("");
        setNewTemplateBody("");
        setIsCreatingTemplate(false);
        toast.success("Modelo criado e enviado para aprovação (Mock).");
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Campanhas & Disparos</h2>
            </div>

            <Tabs defaultValue="broadcast" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="broadcast">Disparo em Massa</TabsTrigger>
                    <TabsTrigger value="templates">Modelos (Templates)</TabsTrigger>
                </TabsList>

                <TabsContent value="broadcast" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Definir Público
                                </CardTitle>
                                <CardDescription>Selecione quem receberá esta campanha.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Segmentação (Tags)</label>
                                    <Select value={selectedTag} onValueChange={setSelectedTag}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma tag" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os Contatos ({initialConversations.length})</SelectItem>
                                            {uniqueTags.map(tag => (
                                                <SelectItem key={tag} value={tag}>
                                                    {tag} ({initialConversations.filter(c => c.tags.includes(tag)).length})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        Público estimado: <strong className="text-foreground">{audience.length} contatos</strong>
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {audience.slice(0, 5).map(c => (
                                            <Badge key={c.id} variant="secondary" className="text-xs">{c.name}</Badge>
                                        ))}
                                        {audience.length > 5 && <span className="text-xs text-muted-foreground pt-1">+{audience.length - 5} mais...</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LayoutTemplate className="w-5 h-5" />
                                    Conteúdo da Mensagem
                                </CardTitle>
                                <CardDescription>Escolha um modelo aprovado pela Meta.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Modelo</label>
                                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um template..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name} ({t.language})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedTemplate && (
                                    <div className="p-4 border border-dashed rounded-lg bg-secondary/20 text-sm">
                                        <p className="whitespace-pre-wrap">
                                            {templates.find(t => t.id === selectedTemplate)?.components.find(c => c.type === "BODY")?.text}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleSendCampaign} disabled={isSending || !selectedTemplate}>
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Enviando {Math.round(progress)}%
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Enviar Campanha Agora
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setIsCreatingTemplate(!isCreatingTemplate)}>
                            <Plus className="w-4 h-4 mr-2" />
                            {isCreatingTemplate ? "Cancelar" : "Novo Modelo"}
                        </Button>
                    </div>

                    {isCreatingTemplate && (
                        <Card className="animate-in fade-in slide-in-from-top-5">
                            <CardHeader>
                                <CardTitle>Criar Novo Modelo</CardTitle>
                                <CardDescription>O modelo será enviado para aprovação da Meta.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label>Nome do Template</label>
                                    <Input
                                        placeholder="ex: alerta_promocao"
                                        value={newTemplateName}
                                        onChange={e => setNewTemplateName(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Apenas letras minúsculas e sublinhados.</p>
                                </div>
                                <div className="space-y-2">
                                    <label>Corpo da Mensagem (Body)</label>
                                    <Textarea
                                        placeholder="Olá {{1}}, confira nossas novidades..."
                                        value={newTemplateBody}
                                        onChange={e => setNewTemplateBody(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleCreateTemplate}>Salvar e Enviar para Aprovação</Button>
                            </CardFooter>
                        </Card>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map(template => (
                            <Card key={template.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium truncate" title={template.name}>
                                        {template.name}
                                    </CardTitle>
                                    {template.status === "APPROVED" ? (
                                        <Badge className="bg-green-500 hover:bg-green-600">Aprovado</Badge>
                                    ) : (
                                        <Badge variant="secondary">{template.status}</Badge>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground mb-4">
                                        {template.category} • {template.language}
                                    </div>
                                    <p className="text-sm text-card-foreground/80 line-clamp-3">
                                        {template.components.find(c => c.type === "BODY")?.text}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
