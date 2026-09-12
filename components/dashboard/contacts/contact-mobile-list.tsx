import { ComponentProps } from "react";
import { Conversation } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export function ContactMobileCard({
  contact,
  onEdit,
}: {
  contact: Conversation
  onEdit: (contact: Conversation) => void
}) {
  const noteCount = contact.internalNotes?.length ?? 0

  return (
    <article className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {contact.avatar}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{contact.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{contact.phone || "Sem telefone"}</p>
            <p className="truncate text-xs text-muted-foreground">{contact.email || "Sem e-mail"}</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs" onClick={() => onEdit(contact)}>
          Editar
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={getStatusBadgeVariant(contact.status)} className="rounded-full px-2.5 py-1 text-[11px]">
          {getStatusLabel(contact.status)}
        </Badge>
        <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] capitalize">
          {contact.channel}
        </Badge>
        <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
          Score {contact.score}
        </Badge>
        {noteCount > 0 ? (
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
            {noteCount} nota{noteCount > 1 ? "s" : ""}
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {contact.tags.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
            {tag}
          </Badge>
        ))}
      </div>
    </article>
  )
}

interface ContactMobileListProps {
  contacts: Conversation[];
  onEdit: (contact: Conversation) => void;
}

export function ContactMobileList({ contacts, onEdit }: ContactMobileListProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {contacts.map((contact) => (
        <ContactMobileCard key={contact.id} contact={contact} onEdit={onEdit} />
      ))}
      {contacts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">Nenhum contato encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente uma busca diferente ou adicione um novo contato.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
