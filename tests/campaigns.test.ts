import assert from "node:assert/strict"
import { test } from "node:test"

import type { Conversation } from "../lib/mock-data.ts"
import { buildCampaignTagOptions, selectCampaignAudience } from "../lib/campaigns.ts"

const importedLead = (overrides: Partial<Conversation>): Conversation =>
  ({
    id: 1,
    name: "Imported Lead",
    avatar: "IL",
    channel: "whatsapp",
    lastMessage: "Importado via planilha",
    time: "09:00",
    unread: false,
    score: 50,
    tags: ["JetSales", "VIP"],
    messages: [],
    status: "ativo",
    ...overrides,
  }) as Conversation

test("campaign tags and audience derive from the shared contacts store", () => {
  const contacts = [
    importedLead({ id: 1, name: "Maria Lima", tags: ["JetSales", "VIP"] }),
    importedLead({ id: 2, name: "Bruno Araujo", tags: ["JetSales", "Growth"] }),
    importedLead({ id: 3, name: "Sem Tag", tags: [] }),
  ]

  const options = buildCampaignTagOptions(contacts)
  assert.deepEqual(options, [
    { value: "all", label: "Todos os Contatos", count: 3 },
    { value: "Growth", label: "Growth", count: 1 },
    { value: "JetSales", label: "JetSales", count: 2 },
    { value: "VIP", label: "VIP", count: 1 },
  ])

  assert.deepEqual(selectCampaignAudience(contacts, "all").map((contact) => contact.name), [
    "Maria Lima",
    "Bruno Araujo",
    "Sem Tag",
  ])
  assert.deepEqual(selectCampaignAudience(contacts, "JetSales").map((contact) => contact.name), [
    "Maria Lima",
    "Bruno Araujo",
  ])
})
