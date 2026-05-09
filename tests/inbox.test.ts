import assert from "node:assert/strict"
import { test } from "node:test"

import {
  getInboxTab,
  getInboxTabCountTone,
  getInboxTabLabel,
  type InboxTab,
} from "../lib/inbox.ts"
import type { Conversation } from "../lib/mock-data.ts"

test("WhatsApp group conversations are routed to the groups tab", () => {
  const conversation = {
    id: 101,
    name: "Grupo Comercial",
    avatar: "GC",
    channel: "whatsapp",
    isGroup: true,
    lastMessage: "Fechamos o alinhamento para amanhã.",
    time: "Agora",
    unread: true,
    score: 72,
    tags: [],
    messages: [],
    status: "ativo",
  } as Conversation

  assert.equal(getInboxTab(conversation), "grupos")
})

test("the groups tab has a readable label", () => {
  const groupsTab = "grupos" as InboxTab

  assert.equal(getInboxTabLabel(groupsTab), "Grupos")
})

test("inbox tab count tones follow the expected thresholds", () => {
  const cases = [
    [0, "neutral"],
    [1, "success"],
    [9, "success"],
    [10, "warning"],
    [49, "warning"],
    [50, "danger"],
  ] as const

  for (const [count, expectedTone] of cases) {
    assert.equal(getInboxTabCountTone(count), expectedTone)
  }
})
