import type { Conversation } from "@/lib/mock-data"
import { initialConversations } from "@/lib/mock-data"

export const CONTACTS_TOTAL_COUNT = 25036
export const CONTACTS_STORAGE_KEY = "getsales_contacts"

export type ContactsListState = {
  q: string
  tag: string
  owner: string
}

export type ContactsDetailTab = "tickets" | "media" | "fields" | "engagement" | "history"

export interface ContactsDetailState {
  tab: ContactsDetailTab
}

export interface ContactsFilterOption {
  value: string
  label: string
}

export interface ContactsFilterOptions {
  tags: ContactsFilterOption[]
  owners: ContactsFilterOption[]
}

export interface ContactsSearchParams {
  get(name: string): string | null
}

export const contactsDetailTabItems: Array<{ value: ContactsDetailTab; label: string }> = [
  { value: "tickets", label: "Tickets" },
  { value: "media", label: "Mídia" },
  { value: "fields", label: "Campos personalizados" },
  { value: "engagement", label: "Engajamento" },
  { value: "history", label: "Histórico" },
]

export const contactsListDefaultState: ContactsListState = {
  q: "",
  tag: "all",
  owner: "all",
}

export const contactsDetailDefaultState: ContactsDetailState = {
  tab: "tickets",
}

export const contactsCsvHeader = [
  "Nome",
  "Canal",
  "Telefone",
  "Email",
  "Tags",
  "Status",
  "Responsável",
  "Departamento",
  "Mensagem",
  "Horário",
]

const csvFieldAliases: Record<string, readonly string[]> = {
  name: ["nome", "name", "contato", "fullname"],
  channel: ["canal", "channel", "origem"],
  phone: ["telefone", "phone", "fone", "celular"],
  email: ["email", "e-mail"],
  tags: ["tags", "etiquetas", "segmento"],
  status: ["status", "estado", "etapa"],
  owner: ["responsavel", "responsável", "owner", "assignee", "responsável comercial"],
  department: ["departamento", "department", "time"],
  message: ["mensagem", "message", "ultima mensagem", "lastmessage"],
  time: ["hora", "time", "tempo", "data"],
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function normalizeSearchText(value: string | undefined | null) {
  return normalizeText(value ?? "")
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"'
        index += 1
        continue
      }

      inQuotes = !inQuotes
      continue
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function escapeCsvValue(value: string) {
  const escaped = value.replace(/"/g, '""')
  return escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')
    ? `"${escaped}"`
    : escaped
}

function getSearchParamValue(searchParams: ContactsSearchParams, key: string) {
  return searchParams.get(key)
}

function normalizeListFilter(value: string | null) {
  const trimmed = value?.trim()
  if (!trimmed || normalizeText(trimmed) === "all") {
    return "all"
  }

  return trimmed
}

function normalizeDetailTab(value: string | null): ContactsDetailTab {
  const trimmed = value?.trim()
  if (!trimmed) {
    return contactsDetailDefaultState.tab
  }

  const matched = contactsDetailTabItems.find(
    (item) => item.value === trimmed || normalizeText(item.label) === normalizeText(trimmed),
  )

  return matched?.value ?? contactsDetailDefaultState.tab
}

function parseTagsFromCsv(value?: string) {
  return value
    ? value
        .split(/[,;]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []
}

function cloneMessage(message: Conversation["messages"][number]) {
  return { ...message }
}

function cloneNote(note: NonNullable<Conversation["internalNotes"]>[number]) {
  return { ...note }
}

function cloneLeadMediaItem(item: NonNullable<Conversation["media"]>[number]) {
  return { ...item }
}

function cloneLeadBotBinding(item: NonNullable<Conversation["botBindings"]>[number]) {
  return { ...item }
}

function cloneLeadTimelineItem(item: NonNullable<Conversation["timeline"]>[number]) {
  return { ...item }
}

export function cloneContact(contact: Conversation): Conversation {
  return {
    ...contact,
    tags: [...contact.tags],
    messages: contact.messages.map(cloneMessage),
    internalNotes: contact.internalNotes ? contact.internalNotes.map(cloneNote) : undefined,
    customFields: contact.customFields ? contact.customFields.map((field) => ({ ...field })) : undefined,
    media: contact.media ? contact.media.map(cloneLeadMediaItem) : undefined,
    botBindings: contact.botBindings ? contact.botBindings.map(cloneLeadBotBinding) : undefined,
    timeline: contact.timeline ? contact.timeline.map(cloneLeadTimelineItem) : undefined,
  }
}

export function cloneContacts(contacts: Conversation[]) {
  return contacts.map(cloneContact)
}

export function loadContactsFromStorage(fallback: Conversation[] = initialConversations) {
  if (typeof window === "undefined") {
    return cloneContacts(fallback)
  }

  const stored = window.localStorage.getItem(CONTACTS_STORAGE_KEY)
  if (!stored) {
    return cloneContacts(fallback)
  }

  try {
    const parsed = JSON.parse(stored) as Conversation[]
    if (!Array.isArray(parsed)) {
      return cloneContacts(fallback)
    }

    return cloneContacts(parsed)
  } catch {
    return cloneContacts(fallback)
  }
}

export function saveContactsToStorage(contacts: Conversation[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts))
}

export function generateContactInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "??"
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
}

export function getContactStatusLabel(status: Conversation["status"]) {
  switch (status) {
    case "novo":
      return "Novo Lead"
    case "resolvido":
      return "Resolvido"
    default:
      return "Ativo"
  }
}

export function getContactStatusBadgeVariant(status: Conversation["status"]) {
  switch (status) {
    case "novo":
      return "default"
    case "resolvido":
      return "outline"
    default:
      return "secondary"
  }
}

export function getContactsFilterOptions(contacts: Conversation[]): ContactsFilterOptions {
  const tagSet = new Set<string>()
  const ownerSet = new Set<string>()
  let hasMissingOwner = false

  contacts.forEach((contact) => {
    contact.tags.forEach((tag) => tagSet.add(tag))

    if (contact.assignee) {
      ownerSet.add(contact.assignee)
    } else {
      hasMissingOwner = true
    }
  })

  const collator = new Intl.Collator("pt-BR", { sensitivity: "base" })

  const tags = [
    { value: "all", label: "Filtrar por Tags" },
    ...Array.from(tagSet)
      .sort((left, right) => collator.compare(left, right))
      .map((tag) => ({ value: tag, label: tag })),
  ]

  const owners = [
    { value: "all", label: "Responsável" },
    ...Array.from(ownerSet)
      .sort((left, right) => collator.compare(left, right))
      .map((owner) => ({ value: owner, label: owner })),
  ]

  if (hasMissingOwner) {
    owners.push({ value: "Sem responsável", label: "Sem responsável" })
  }

  return { tags, owners }
}

export function findContactById(contacts: Conversation[], contactId: string | number) {
  const normalizedId = String(contactId)

  return contacts.find((contact) => String(contact.id) === normalizedId)
}

export function filterContacts(contacts: Conversation[], state: ContactsListState) {
  const query = normalizeSearchText(state.q)
  const normalizedTag = state.tag === "all" ? "all" : normalizeSearchText(state.tag)
  const normalizedOwner = state.owner === "all" ? "all" : normalizeSearchText(state.owner)

  return contacts.filter((contact) => {
    if (normalizedTag !== "all") {
      const hasTag = contact.tags.some((tag) => normalizeSearchText(tag) === normalizedTag)
      if (!hasTag) {
        return false
      }
    }

    if (normalizedOwner !== "all") {
      const ownerValue = contact.assignee ? normalizeSearchText(contact.assignee) : normalizeSearchText("Sem responsável")
      if (ownerValue !== normalizedOwner) {
        return false
      }
    }

    if (!query) {
      return true
    }

    const haystack = [
      contact.name,
      contact.phone ?? "",
      contact.email ?? "",
      contact.lastMessage ?? "",
      contact.assignee ?? "",
      contact.department ?? "",
      contact.location ?? "",
      contact.customerSince ?? "",
      contact.status,
      contact.channel,
      ...contact.tags,
    ]
      .map(normalizeSearchText)
      .join(" ")

    return haystack.includes(query)
  })
}

export function resolveContactsListState(
  pathnameOrSearchParams: string | ContactsSearchParams,
  searchParams?: ContactsSearchParams,
): ContactsListState {
  const resolvedSearchParams = typeof pathnameOrSearchParams === "string" ? searchParams : pathnameOrSearchParams
  const q = getSearchParamValue(resolvedSearchParams ?? new URLSearchParams(), "q") ?? ""
  const tag = normalizeListFilter(getSearchParamValue(resolvedSearchParams ?? new URLSearchParams(), "tag"))
  const owner = normalizeListFilter(getSearchParamValue(resolvedSearchParams ?? new URLSearchParams(), "owner"))

  return {
    q,
    tag,
    owner,
  }
}

export function buildContactsListUrl(pathname: string, state: ContactsListState) {
  const params = new URLSearchParams()

  if (state.q.trim()) {
    params.set("q", state.q.trim())
  }

  if (state.tag !== "all") {
    params.set("tag", state.tag)
  }

  if (state.owner !== "all") {
    params.set("owner", state.owner)
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function resolveContactDetailState(
  pathnameOrSearchParams: string | ContactsSearchParams,
  searchParams?: ContactsSearchParams,
): ContactsDetailState {
  const resolvedSearchParams = typeof pathnameOrSearchParams === "string" ? searchParams : pathnameOrSearchParams
  const tab = normalizeDetailTab(getSearchParamValue(resolvedSearchParams ?? new URLSearchParams(), "tab"))

  return { tab }
}

export function buildContactsDetailUrl(pathname: string, state: ContactsDetailState) {
  const params = new URLSearchParams()

  if (state.tab !== contactsDetailDefaultState.tab) {
    params.set("tab", state.tab)
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function parseContactsFromCsv(csv: string, nextId: () => number): Conversation[] {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (rows.length <= 1) {
    return []
  }

  const header = parseCsvLine(rows[0])
  const columns: Record<string, number | undefined> = {}

  header.forEach((column, index) => {
    const normalized = normalizeText(column)
    const field = (Object.entries(csvFieldAliases) as Array<[string, readonly string[]]>).find(([, aliases]) =>
      aliases.map(normalizeText).includes(normalized),
    )?.[0]

    if (field) {
      columns[field] = index
    }
  })

  if (columns.name === undefined || columns.channel === undefined) {
    return []
  }

  return rows.slice(1).reduce<Conversation[]>((accumulator, row) => {
    const cells = parseCsvLine(row)
    const name = cells[columns.name!]?.trim()
    const channelCell = cells[columns.channel!]?.trim()

    if (!name || !channelCell) {
      return accumulator
    }

    const statusCell = columns.status !== undefined ? cells[columns.status] : ""
    const normalizedStatus = normalizeText(statusCell ?? "")
    const statusValue =
      normalizedStatus === "novo" || normalizedStatus === "new"
        ? "novo"
        : normalizedStatus === "resolvido" || normalizedStatus === "resolved"
          ? "resolvido"
          : "ativo"

    const contact: Conversation = {
      id: nextId(),
      name,
      avatar: generateContactInitials(name),
      channel:
        ["whatsapp", "instagram", "telegram", "email", "webchat"].includes(normalizeText(channelCell))
          ? (normalizeText(channelCell) as Conversation["channel"])
          : "whatsapp",
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
      unread: statusValue === "novo",
      score: 50,
      tags: parseTagsFromCsv(columns.tags !== undefined ? cells[columns.tags] : ""),
      status: statusValue,
      messages: [],
      phone: columns.phone !== undefined ? cells[columns.phone]?.trim() || undefined : undefined,
      email: columns.email !== undefined ? cells[columns.email]?.trim() || undefined : undefined,
      assignee: columns.owner !== undefined ? cells[columns.owner]?.trim() || undefined : undefined,
      department: columns.department !== undefined ? cells[columns.department]?.trim() || undefined : undefined,
    }

    accumulator.push(contact)
    return accumulator
  }, [])
}

export function buildContactsCsv(contacts: Conversation[]) {
  const rows = [
    contactsCsvHeader,
    ...contacts.map((contact) => [
      contact.name,
      contact.channel,
      contact.phone ?? "",
      contact.email ?? "",
      contact.tags.join(", "),
      contact.status,
      contact.assignee ?? "",
      contact.department ?? "",
      contact.lastMessage ?? "",
      contact.time ?? "",
    ]),
  ]

  return rows
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
    .join("\n")
}
