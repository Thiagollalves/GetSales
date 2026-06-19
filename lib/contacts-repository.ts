import { cloneContacts } from "@/lib/contacts"
import { initialConversations, type Conversation } from "@/lib/mock-data"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export interface ContactRecord {
  id: number
  data: Conversation
  updated_at?: string | null
  created_at?: string | null
}

const CONTACTS_TABLE = "crm_contacts"

function cloneContact(contact: Conversation) {
  return cloneContacts([contact])[0]!
}

function ensureSupabaseClient() {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error("Contacts storage is not configured.")
  }

  return client
}

export function contactToRow(contact: Conversation): ContactRecord {
  return {
    id: contact.id,
    data: cloneContact(contact),
    updated_at: new Date().toISOString(),
  }
}

export function rowToContact(row: Pick<ContactRecord, "id" | "data">) {
  return cloneContact({
    ...row.data,
    id: Number(row.data.id ?? row.id),
  })
}

async function seedContactsIfEmpty() {
  const client = ensureSupabaseClient()
  const { data, error } = await client.from(CONTACTS_TABLE).select("id").limit(1)

  if (error) {
    throw error
  }

  if (Array.isArray(data) && data.length > 0) {
    return
  }

  const { error: seedError } = await client
    .from(CONTACTS_TABLE)
    .upsert(initialConversations.map(contactToRow), { onConflict: "id" })

  if (seedError) {
    throw seedError
  }
}

export async function listContacts() {
  const client = ensureSupabaseClient()

  await seedContactsIfEmpty()

  const { data, error } = await client.from(CONTACTS_TABLE).select("*").order("id", { ascending: true })
  if (error) {
    throw error
  }

  return cloneContacts((data ?? []).map((row) => rowToContact(row as ContactRecord)))
}

export async function saveContacts(contacts: Conversation[]) {
  const client = ensureSupabaseClient()
  const rows = contacts.map(contactToRow)

  const { error } = await client.from(CONTACTS_TABLE).upsert(rows, { onConflict: "id" })
  if (error) {
    throw error
  }

  return cloneContacts(contacts)
}
