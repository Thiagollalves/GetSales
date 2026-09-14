import assert from "node:assert/strict"
import { test, beforeEach, afterEach, describe } from "node:test"

import {
  loadInternalChatState,
  createInitialInternalChatState,
  INTERNAL_CHAT_STORAGE_KEY,
} from "../lib/internal-chat.ts"

describe("loadInternalChatState", () => {
  let originalWindow: any

  beforeEach(() => {
    originalWindow = global.window
    // @ts-ignore
    global.window = {
      localStorage: {
        getItem: () => null,
        setItem: () => {},
      }
    }
  })

  afterEach(() => {
    global.window = originalWindow
  })

  test("returns fallback when window is undefined", () => {
    // @ts-ignore
    global.window = undefined
    const fallback = createInitialInternalChatState()
    const result = loadInternalChatState(fallback)
    assert.deepEqual(result, fallback)
  })

  test("returns fallback when stored value is null", () => {
    // @ts-ignore
    global.window.localStorage.getItem = () => null
    const fallback = createInitialInternalChatState()
    const result = loadInternalChatState(fallback)
    assert.deepEqual(result, fallback)
  })

  test("returns fallback when stored JSON is invalid", () => {
    // @ts-ignore
    global.window.localStorage.getItem = () => "invalid json"
    const fallback = createInitialInternalChatState()
    const result = loadInternalChatState(fallback)
    assert.deepEqual(result, fallback)
  })

  test("returns fallback when parsed JSON conversations is not an array", () => {
    // @ts-ignore
    global.window.localStorage.getItem = () => JSON.stringify({ conversations: "not an array" })
    const fallback = createInitialInternalChatState()
    const result = loadInternalChatState(fallback)
    assert.deepEqual(result, fallback)
  })

  test("returns loaded state when valid JSON is present", () => {
    const validState = {
      conversations: [
        {
          id: 100,
          type: "dm",
          name: "Test",
          memberIds: [1],
          messages: [
            {
              id: 1,
              authorId: 1,
              content: "test message",
              createdAt: "2026-05-05T08:51:00.000Z",
              time: "08:51",
            }
          ]
        }
      ],
      selectedConversationId: 100
    }

    // @ts-ignore
    global.window.localStorage.getItem = () => JSON.stringify(validState)
    const fallback = createInitialInternalChatState()
    const result = loadInternalChatState(fallback)

    assert.equal(result.conversations.length, 1)
    assert.equal(result.conversations[0].id, 100)
    assert.equal(result.conversations[0].messages.length, 1)
    assert.equal(result.selectedConversationId, 100)
  })
})
