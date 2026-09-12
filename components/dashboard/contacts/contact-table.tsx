import { ComponentProps } from "react";
import { Conversation } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const getStatusBadgeVariant = (status: Conversation["status"]): ComponentProps<typeof Badge>["variant"] => {
  switch (status) {
    case "novo":
      return "default";
    case "resolvido":
      return "outline";
    default:
      return "secondary";
  }
};

const getStatusLabel = (status: Conversation["status"]) => {
  if (status === "novo") {
    return "Novo Lead";
  }

  if (status === "resolvido") {
    return "Resolvido";
  }

  return "Ativo";
};

interface ContactTableProps {
  contacts: Conversation[];
  onEdit: (contact: Conversation) => void;
}

export function ContactTable({ contacts, onEdit }: ContactTableProps) {
  return (
    <Card className="hidden border-border/60 bg-card/90 shadow-sm md:block">
      <CardHeader>
        <CardTitle>Base de Contatos ({contacts.length})</CardTitle>
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
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {contact.avatar}
                    </div>
                    <div className="flex flex-col">
                      <span>{contact.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {contact.phone || "Sem telefone"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{contact.channel}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(contact.status)}>
                    {getStatusLabel(contact.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {contact.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(contact)}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
