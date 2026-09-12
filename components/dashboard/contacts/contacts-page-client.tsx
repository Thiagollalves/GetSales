"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Conversation, initialConversations } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { notifyAction } from "@/lib/button-actions";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";
import { Download, FileSpreadsheet, Search, UserPlus } from "lucide-react";
import { ContactDialog } from "./contact-dialog";
import { ContactTable } from "./contact-table";
import { ContactMobileList } from "./contact-mobile-list";
import {
  CHANNEL_OPTIONS,
  contactFormSchema,
  ContactFormValues,
  defaultFormValues,
} from "./contact-schema";

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
    <WorkspaceShell
      title="Contatos"
      description="Gerencie sua base, importe CSV e edite contatos rapidamente."
      actions={
        <>
          <Button variant="outline" onClick={triggerImport} className="justify-center rounded-full">
            <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Importar</span>
          </Button>
          <Button variant="outline" onClick={handleExportContacts} className="justify-center rounded-full">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button onClick={openAddDialog} className="justify-center rounded-full">
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Novo Contato</span>
          </Button>
        </>
      }
      toolbar={
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full min-w-0 max-w-none sm:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou tag..."
              className="h-11 rounded-full pl-10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
              {contacts.length} contatos
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-medium">
              {filteredContacts.length} visíveis
            </Badge>
          </div>
        </div>
      }
    >
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileImport}
      />

      <ContactMobileList contacts={filteredContacts} onEdit={openEditDialog} />
      <ContactTable contacts={filteredContacts} onEdit={openEditDialog} />

      <ContactDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        form={form}
        onSubmit={handleDialogSubmit}
      />
    </WorkspaceShell>
  );
}
