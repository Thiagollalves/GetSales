import assert from "node:assert/strict"
import { test } from "node:test"

import { contactToRow, rowToContact } from "../lib/contacts-repository.ts"
import { initialConversations } from "../lib/mock-data.ts"

test("contact repository round-trips ticket timeline data", () => {
  const source = initialConversations[2]
  assert.ok(source)

  const row = contactToRow(source)
  const restored = rowToContact(row)

  assert.equal(restored.id, source.id)
  assert.equal(restored.timeline?.[0]?.kind, "ticket")
  assert.equal(restored.timeline?.[0]?.title, "Ticket aberto")
})
