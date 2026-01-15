"use client";

import { useState } from "react";
import { initialConversations } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, FileSpreadsheet } from "lucide-react";
import { notifyAction } from "@/lib/button-actions";

export default function ContactsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const handleImportContacts = () => {
        notifyAction("Importar contatos", "Abra o fluxo para importar contatos via planilha.");
    };

    const handleAddContact = () => {
        notifyAction("Novo contato", "Inicie o cadastro manual de um novo contato.");
    };

    const handleEditContact = (name: string) => {
        notifyAction("Editar contato", `Abrindo cadastro de ${name}.`);
    };

    const filteredContacts = initialConversations.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Contatos</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleImportContacts}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Importar
                    </Button>
                    <Button onClick={handleAddContact}>
                        <UserPlus className="mr-2 h-4 w-4" /> Novo Contato
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou tag..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Base de Contatos ({filteredContacts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Canal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {contact.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span>{contact.name}</span>
                                                <span className="text-xs text-muted-foreground">{contact.phone || "Sem telefone"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{contact.channel}</TableCell>
                                    <TableCell>
                                        <Badge variant={contact.unread ? "default" : "secondary"}>
                                            {contact.unread ? "Novo Lead" : "Ativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {contact.tags.map(tag => (
                                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditContact(contact.name)}>
                                            Editar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
