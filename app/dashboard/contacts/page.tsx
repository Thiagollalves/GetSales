"use client";

import { useRef, useState, type ChangeEvent, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Conversation, initialConversations } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notifyAction } from "@/lib/button-actions";
import { Download, FileSpreadsheet, Search, UserPlus } from "lucide-react";

const CHANNEL_OPTIONS = ["whatsapp", "instagram", "telegram", "email", "webchat"] as const;
const STATUS_OPTIONS = ["novo", "ativo", "resolvido"] as const;

const contactFormSchema = z.object({
  name: z.string().min(2, "Informe o nome completo do contato"),
  channel: z.enum(CHANNEL_OPTIONS),
  phone: z.string().max(32).optional(),
  email: z.union([z.string().email("Informe um e-mail válido"), z.literal("")]),
  tags: z.string().optional(),
  status: z.enum(STATUS_OPTIONS),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

type CsvField = "name" | "channel" | "phone" | "email" | "tags" | "status" | "message" | "time";

const normalizeCsvHeader = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const FIELD_ALIAS_SOURCE: Record<CsvField, string[]> = {
  name: ["nome", "name", "contato", "fullname"],
  channel: ["canal", "channel", "origem"],
  phone: ["telefone", "phone", "fone", "celular"],
  email: ["email", "e-mail"],
  tags: ["tags", "etiquetas", "segmento"],
  status: ["status", "estado", "etapa"],
  message: ["mensagem", "message", "ultima mensagem", "lastmessage"],
  time: ["hora", "time", "tempo", "data"],
};

const FIELD_ALIASES: Record<CsvField, string[]> = {
  name: FIELD_ALIAS_SOURCE.name.map(normalizeCsvHeader),
  channel: FIELD_ALIAS_SOURCE.channel.map(normalizeCsvHeader),
  phone: FIELD_ALIAS_SOURCE.phone.map(normalizeCsvHeader),
  email: FIELD_ALIAS_SOURCE.email.map(normalizeCsvHeader),
  tags: FIELD_ALIAS_SOURCE.tags.map(normalizeCsvHeader),
  status: FIELD_ALIAS_SOURCE.status.map(normalizeCsvHeader),
  message: FIELD_ALIAS_SOURCE.message.map(normalizeCsvHeader),
  time: FIELD_ALIAS_SOURCE.time.map(normalizeCsvHeader),
};

const CONTACT_FILE_HEADER = ["Nome", "Canal", "Telefone", "Email", "Tags", "Status"];

const defaultFormValues: ContactFormValues = {
  name: "",
  channel: "whatsapp",
  phone: "",
  email: "",
  tags: "",
  status: "ativo",
};

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (line[i + 1] === '"' && inQuotes) {
        current += '"';
        i += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map(value => value.trim());
};

const detectCsvField = (value: string): CsvField | undefined => {
  const normalized = normalizeCsvHeader(value);

  return (Object.keys(FIELD_ALIASES) as CsvField[]).find(field =>
    FIELD_ALIASES[field].includes(normalized),
  );
};

const getChannelValue = (value: string): Conversation["channel"] => {
  const normalized = normalizeCsvHeader(value);

  return (
    CHANNEL_OPTIONS.find(option => option === normalized) ??
    CHANNEL_OPTIONS.find(option => normalized.startsWith(option[0])) ??
    "whatsapp"
  );
};

const getStatusValue = (value: string): Conversation["status"] => {
  const normalized = normalizeCsvHeader(value);
  if (["novo", "new", "nolead"].includes(normalized)) {
    return "novo";
  }

  if (["resolvido", "resolved"].includes(normalized)) {
    return "resolvido";
  }

  return "ativo";
};

const parseTagsFromCsv = (value?: string) =>
  value
    ? value
        .split(/[,;]+/)
        .map(tag => tag.trim())
        .filter(Boolean)
    : [];

const generateAvatarInitials = (value: string) => {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 0) {
    return "??";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
};

const formatDownloadFileName = () => `contatos-${new Date().toISOString().split("T")[0]}.csv`;

const parseContactsFromCsv = (csv: string, nextId: () => number): Conversation[] => {
  const rows = csv
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (rows.length <= 1) {
    return [];
  }

  const header = parseCsvLine(rows[0]);
  const columns: Partial<Record<CsvField, number>> = {};

  header.forEach((column, index) => {
    const field = detectCsvField(column);
    if (field) {
      columns[field] = index;
    }
  });

  if (columns.name === undefined || columns.channel === undefined) {
    return [];
  }

  return rows.slice(1).reduce<Conversation[]>((acc, row) => {
    const cells = parseCsvLine(row);
    const name = cells[columns.name!];
    const channelCell = cells[columns.channel!];

    if (!name || !channelCell) {
      return acc;
    }

    const statusCell = columns.status !== undefined ? cells[columns.status] : "";
    const statusValue = getStatusValue(statusCell);

    const contact: Conversation = {
      id: nextId(),
      name,
      avatar: generateAvatarInitials(name),
      channel: getChannelValue(channelCell),
      lastMessage:
        columns.message !== undefined && cells[columns.message]?.trim()
          ? cells[columns.message].trim()
          : "Importado via planilha",
      time:
        columns.time !== undefined && cells[columns.time]?.trim()
          ? cells[columns.time].trim()
          : new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
      score: 50,
      tags: parseTagsFromCsv(columns.tags !== undefined ? cells[columns.tags] : ""),
      status: statusValue,
      unread: statusValue === "novo",
      messages: [],
      phone: columns.phone !== undefined ? cells[columns.phone]?.trim() || undefined : undefined,
      email: columns.email !== undefined ? cells[columns.email]?.trim() || undefined : undefined,
    };

    acc.push(contact);
    return acc;
  }, []);
};

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

function ContactMobileCard({
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

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Conversation[]>(initialConversations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [activeContact, setActiveContact] = useState<Conversation | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const nextIdRef = useRef(Math.max(...initialConversations.map(contact => contact.id)) + 1);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: defaultFormValues,
  });

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const openAddDialog = () => {
    form.reset(defaultFormValues);
    setDialogMode("add");
    setActiveContact(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (contact: Conversation) => {
    form.reset({
      name: contact.name,
      channel: contact.channel,
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      tags: contact.tags.join(", "),
      status: contact.status,
    });
    setDialogMode("edit");
    setActiveContact(contact);
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = (values: ContactFormValues) => {
    const tags = parseTagsFromCsv(values.tags);
    const trimmedName = values.name.trim();
    const updatedContact: Conversation = {
      id: dialogMode === "edit" && activeContact ? activeContact.id : nextIdRef.current,
      name: trimmedName,
      avatar: generateAvatarInitials(trimmedName),
      channel: values.channel,
      lastMessage:
        dialogMode === "edit" && activeContact
          ? activeContact.lastMessage
          : "Contato cadastrado manualmente",
      time:
        dialogMode === "edit" && activeContact
          ? activeContact.time
          : new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      unread: values.status === "novo",
      score: activeContact?.score ?? 50,
      tags,
      status: values.status,
      messages: activeContact?.messages ?? [],
      phone: values.phone?.trim() || undefined,
      email: values.email?.trim() || undefined,
      location: activeContact?.location,
      customerSince: activeContact?.customerSince,
    };

    if (dialogMode === "edit" && activeContact) {
      setContacts(prev =>
        prev.map(contact => (contact.id === activeContact.id ? updatedContact : contact)),
      );
      notifyAction("Contato atualizado", `${trimmedName} atualizado com sucesso.`);
    } else {
      setContacts(prev => [updatedContact, ...prev]);
      nextIdRef.current += 1;
      notifyAction("Contato criado", `${trimmedName} adicionado à base.`);
    }

    setIsDialogOpen(false);
  };

  const triggerImport = () => {
    importInputRef.current?.click();
  };

  const handleFileImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      notifyAction("Formato inválido", "Envie um arquivo CSV para importar contatos.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString() ?? "";
      const parsed = parseContactsFromCsv(text, () => {
        const nextId = nextIdRef.current;
        nextIdRef.current += 1;
        return nextId;
      });

      if (parsed.length === 0) {
        notifyAction("Importação vazia", "Nenhum contato válido encontrado no arquivo.");
      } else {
        setContacts(prev => [...parsed, ...prev]);
        notifyAction(
          "Importação concluída",
          `${parsed.length} contatos importados de ${file.name}.`,
        );
      }

      event.target.value = "";
    };

    reader.onerror = () => {
      notifyAction("Erro na importação", "Não foi possível ler o arquivo selecionado.");
      event.target.value = "";
    };

    reader.readAsText(file, "utf-8");
  };

  const handleExportContacts = () => {
    const csvRows = [
      CONTACT_FILE_HEADER,
      ...contacts.map(contact => [
        contact.name,
        contact.channel,
        contact.phone ?? "",
        contact.email ?? "",
        contact.tags.join(", "),
        contact.status,
      ]),
    ];

    const csvContent = csvRows
      .map(row =>
        row
          .map(value => {
            const escaped = value.replace(/"/g, '""');
            return escaped.includes(",") || escaped.includes("\n")
              ? `"${escaped}"`
              : escaped;
          })
          .join(","),
      )
      .join("\n");

    const filename = formatDownloadFileName();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);

    notifyAction("Exportação pronta", `${filename} foi baixado para sua pasta de downloads.`);
  };

  return (
    <div className="flex-1 space-y-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Contatos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie sua base, importe CSV e edite contatos rapidamente.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <Button variant="outline" onClick={triggerImport} className="justify-center">
            <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Importar</span>
          </Button>
          <Button variant="outline" onClick={handleExportContacts} className="justify-center">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button onClick={openAddDialog} className="justify-center">
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Novo Contato</span>
          </Button>
        </div>
      </div>
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileImport}
      />
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-none sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou tag..."
            className="h-11 pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredContacts.map(contact => (
          <ContactMobileCard key={contact.id} contact={contact} onEdit={openEditDialog} />
        ))}
        {filteredContacts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">Nenhum contato encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">Tente uma busca diferente ou adicione um novo contato.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="hidden md:block">
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
              {filteredContacts.map(contact => (
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
                      {contact.tags.map(tag => (
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
                      onClick={() => openEditDialog(contact)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "edit" ? "Editar contato" : "Novo contato"}
            </DialogTitle>
            <DialogDescription>
              Informe os dados principais para manter a base atualizada.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleDialogSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Thiago Alves" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal principal</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um canal" />
                          </SelectTrigger>
                          <SelectContent>
                            {CHANNEL_OPTIONS.map(option => (
                              <SelectItem key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status atual</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="novo">Novo Lead</SelectItem>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="resolvido">Resolvido</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+55 11 99999-9999"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Opcional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contato@email.com" {...field} />
                      </FormControl>
                      <FormDescription>Opcional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="VIP, Prospect, Suporte" {...field} />
                    </FormControl>
                    <FormDescription>Separe as tags por vírgula.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {dialogMode === "edit" ? "Atualizar contato" : "Salvar contato"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
