import type { Conversation } from "@/lib/mock-data"

const CONTACT_CHANNEL_OPTIONS = ["whatsapp", "instagram", "telegram", "email", "webchat"] as const

type ImportField =
  | "name"
  | "channel"
  | "phone"
  | "email"
  | "tags"
  | "status"
  | "assignee"
  | "department"
  | "message"
  | "time"

type ImportColumnMap = Partial<Record<ImportField, number>>

const FIELD_ALIASES: Record<ImportField, readonly string[]> = {
  name: [
    "nome",
    "name",
    "contato",
    "fullname",
    "nomecompleto",
    "nomecompletodocliente",
    "nome do cliente",
    "primeiro nome",
  ],
  channel: ["canal", "channel", "origem", "plataforma"],
  phone: ["telefone", "phone", "fone", "celular", "numero", "número", "number"],
  email: ["email", "e-mail", "emailsecundario", "email secundario"],
  tags: ["tags", "etiquetas", "segmento"],
  status: ["status", "estado", "etapa", "leadstatus", "lead status"],
  assignee: ["responsavel", "responsável", "owner", "assignee", "responsavel comercial", "consultor"],
  department: ["departamento", "department", "time", "equipe", "squad"],
  message: ["mensagem", "message", "ultima mensagem", "última mensagem", "lastmessage", "observacoes", "observações"],
  time: ["hora", "horario", "time", "tempo", "data", "carimbo de data/hora", "timestamp"],
}

function normalizeImportText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "")
}

function normalizeImportStatus(value: string): Conversation["status"] {
  const normalized = normalizeImportText(value)

  if (["novo", "new", "nolead", "leadnovo"].includes(normalized)) {
    return "novo"
  }

  if (["resolvido", "resolved", "closed", "fechado"].includes(normalized)) {
    return "resolvido"
  }

  return "ativo"
}

function normalizeImportChannel(value: string): Conversation["channel"] {
  const normalized = normalizeImportText(value)
  const matched = CONTACT_CHANNEL_OPTIONS.find((option) => normalizeImportText(option) === normalized)

  if (matched) {
    return matched
  }

  if (normalized.startsWith("whats")) {
    return "whatsapp"
  }

  if (normalized.startsWith("insta")) {
    return "instagram"
  }

  if (normalized.startsWith("tele")) {
    return "telegram"
  }

  if (normalized.startsWith("mail") || normalized.startsWith("email")) {
    return "email"
  }

  return "whatsapp"
}

function toCellText(value: unknown) {
  if (value === null || value === undefined) {
    return ""
  }

  return String(value).trim()
}

function parseDelimitedLine(line: string) {
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

function parseTags(value: string) {
  return value
    .split(/[,;|]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function generateAvatarInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "??"
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
}

function resolveImportColumns(headers: string[]): ImportColumnMap {
  const columns: ImportColumnMap = {}

  headers.forEach((header, index) => {
    const normalizedHeader = normalizeImportText(header)

    const matchedField = (Object.entries(FIELD_ALIASES) as Array<[ImportField, readonly string[]]>).find(([, aliases]) =>
      aliases.some((alias) => normalizeImportText(alias) === normalizedHeader),
    )?.[0]

    if (matchedField !== undefined) {
      columns[matchedField] = index
    }
  })

  return columns
}

function readColumnValue(row: readonly unknown[], columnIndex: number | undefined) {
  if (columnIndex === undefined) {
    return ""
  }

  return toCellText(row[columnIndex])
}

function buildImportedContact(
  row: readonly unknown[],
  columns: ImportColumnMap,
  nextId: () => number,
): Conversation | null {
  const name = readColumnValue(row, columns.name)
  if (!name) {
    return null
  }

  const explicitTags = parseTags(readColumnValue(row, columns.tags))
  const contact: Conversation = {
    id: nextId(),
    name,
    avatar: generateAvatarInitials(name),
    channel: normalizeImportChannel(readColumnValue(row, columns.channel)),
    lastMessage: readColumnValue(row, columns.message) || "Importado via planilha",
    time:
      readColumnValue(row, columns.time) ||
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    unread: normalizeImportStatus(readColumnValue(row, columns.status)) === "novo",
    score: 50,
    tags: explicitTags,
    messages: [],
    status: normalizeImportStatus(readColumnValue(row, columns.status)),
    phone: readColumnValue(row, columns.phone) || undefined,
    email: readColumnValue(row, columns.email) || undefined,
    assignee: readColumnValue(row, columns.assignee) || undefined,
    department: readColumnValue(row, columns.department) || undefined,
  }

  return contact
}

export function parseContactsFromRows(rows: Array<readonly unknown[]>, nextId: () => number): Conversation[] {
  if (rows.length <= 1) {
    return []
  }

  const headers = rows[0].map((value) => toCellText(value))
  const columns = resolveImportColumns(headers)

  if (columns.name === undefined) {
    return []
  }

  return rows.slice(1).reduce<Conversation[]>((accumulator, row) => {
    const contact = buildImportedContact(row, columns, nextId)
    if (contact) {
      accumulator.push(contact)
    }

    return accumulator
  }, [])
}

export function parseContactsFromCsv(csv: string, nextId: () => number): Conversation[] {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseDelimitedLine(line))

  return parseContactsFromRows(rows, nextId)
}

export async function parseContactsFromFile(file: File, nextId: () => number): Promise<Conversation[]> {
  const extension = file.name.split(".").pop()?.toLowerCase()

  if (extension === "csv") {
    return parseContactsFromCsv(await file.text(), nextId)
  }

  if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer()
    const xlsx = await import("xlsx")
    const workbook = xlsx.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]

    if (!sheetName) {
      return []
    }

    const sheet = workbook.Sheets[sheetName]
    if (!sheet) {
      return []
    }

    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as Array<readonly unknown[]>
    return parseContactsFromRows(rows, nextId)
  }

  throw new Error("Formato não suportado")
}
