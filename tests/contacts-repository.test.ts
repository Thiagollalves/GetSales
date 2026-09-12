import assert from "node:assert/strict"
import { after, test } from "node:test"

import { contactToRow, listContacts, rowToContact, saveContacts } from "../lib/contacts-repository.ts"
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

const envKeys = [
  "NODE_ENV",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const
const savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))

after(() => {
  for (const key of envKeys) {
    const value = savedEnv[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
})

test("contact repository throws when storage is not configured", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY

  await assert.rejects(listContacts(), (err: any) => {
    return err.message === "Contacts storage is not configured."
  })

  await assert.rejects(saveContacts([]), (err: any) => {
    return err.message === "Contacts storage is not configured."
  })
})

test("contact repository correctly propagates database errors", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321"
  process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy"

  const originalFetch = global.fetch
  global.fetch = async () => {
    return new Response(JSON.stringify({ message: "Mocked Database Error", details: "", hint: "", code: "500" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    await assert.rejects(listContacts(), (err: any) => {
      return err.message === "Mocked Database Error" || err.code === "500"
    })

    await assert.rejects(saveContacts([]), (err: any) => {
      return err.message === "Mocked Database Error" || err.code === "500"
    })
  } finally {
    global.fetch = originalFetch
  }
})
