import assert from "node:assert/strict"
import { after, test } from "node:test"

import { CONTACTS_STORAGE_KEY, loadContactsFromStorage } from "../lib/contacts.ts"
import { initialConversations } from "../lib/mock-data.ts"

const originalWindow = global.window

after(() => {
  global.window = originalWindow
})

test("loadContactsFromStorage returns fallback on invalid JSON", () => {
  let getItemMockCount = 0

  global.window = {
    ...originalWindow,
    localStorage: {
      getItem: (key: string) => {
        if (key === CONTACTS_STORAGE_KEY) {
          getItemMockCount++
          return "{ invalid json"
        }
        return null
      },
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
  } as unknown as Window & typeof globalThis

  const result = loadContactsFromStorage(initialConversations)

  assert.equal(getItemMockCount, 1)
  assert.equal(result.length, initialConversations.length)
  assert.equal(result[0].id, initialConversations[0].id)
})

test("loadContactsFromStorage returns fallback on non-array JSON", () => {
  global.window = {
    ...originalWindow,
    localStorage: {
      getItem: (key: string) => {
        if (key === CONTACTS_STORAGE_KEY) {
          return '{"not": "an array"}'
        }
        return null
      },
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
  } as unknown as Window & typeof globalThis

  const result = loadContactsFromStorage(initialConversations)

  assert.equal(result.length, initialConversations.length)
  assert.equal(result[0].id, initialConversations[0].id)
})

test("loadContactsFromStorage parses valid JSON correctly", () => {
  const customConversations = [
    { ...initialConversations[0], name: "Test User 1" }
  ]

  global.window = {
    ...originalWindow,
    localStorage: {
      getItem: (key: string) => {
        if (key === CONTACTS_STORAGE_KEY) {
          return JSON.stringify(customConversations)
        }
        return null
      },
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
  } as unknown as Window & typeof globalThis

  const result = loadContactsFromStorage(initialConversations)

  assert.equal(result.length, customConversations.length)
  assert.equal(result[0].name, "Test User 1")
})
