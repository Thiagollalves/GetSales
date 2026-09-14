import { test, describe, mock, afterEach, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { loadPipelineStagesFromStorage, PIPELINE_STORAGE_KEY, createDefaultPipelineStages } from "../lib/pipeline-board"

describe("loadPipelineStagesFromStorage", () => {
  let originalWindow: typeof globalThis.window | undefined

  beforeEach(() => {
    originalWindow = globalThis.window
  })

  afterEach(() => {
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow
    } else {
      // @ts-ignore
      delete globalThis.window
    }
    mock.restoreAll()
  })

  test("returns fallback stages when window is undefined", () => {
    // Ensure window is undefined
    const previousWindow = globalThis.window
    // @ts-ignore
    delete globalThis.window

    try {
      const result = loadPipelineStagesFromStorage()
      const defaults = createDefaultPipelineStages()

      assert.deepEqual(result, defaults)
    } finally {
      globalThis.window = previousWindow
    }
  })

  test("returns fallback stages when localStorage returns null", () => {
    const getItemMock = mock.fn(() => null)

    globalThis.window = {
      // @ts-ignore
      localStorage: {
        getItem: getItemMock,
      },
    }

    const result = loadPipelineStagesFromStorage()
    const defaults = createDefaultPipelineStages()

    assert.deepEqual(result, defaults)
    assert.equal(getItemMock.mock.calls.length, 1)
    const args = getItemMock.mock.calls[0].arguments as unknown as [string]
    assert.equal(args[0], PIPELINE_STORAGE_KEY)
  })

  test("returns fallback stages when localStorage has invalid JSON", () => {
    const getItemMock = mock.fn(() => "invalid json {")

    globalThis.window = {
      // @ts-ignore
      localStorage: {
        getItem: getItemMock,
      },
    }

    const result = loadPipelineStagesFromStorage()
    const defaults = createDefaultPipelineStages()

    assert.deepEqual(result, defaults)
    assert.equal(getItemMock.mock.calls.length, 1)
  })

  test("returns fallback stages when localStorage has valid JSON that is not an array", () => {
    const getItemMock = mock.fn(() => JSON.stringify({ some: "object" }))

    globalThis.window = {
      // @ts-ignore
      localStorage: {
        getItem: getItemMock,
      },
    }

    const result = loadPipelineStagesFromStorage()
    const defaults = createDefaultPipelineStages()

    assert.deepEqual(result, defaults)
    assert.equal(getItemMock.mock.calls.length, 1)
  })

  test("returns parsed stages when localStorage has a valid array", () => {
    const customStages = [
      {
        id: "test-stage",
        title: "Test Stage",
        color: "test-color",
        bgGradient: "test-gradient",
        leads: [
          {
            id: "lead-1",
            name: "Test Lead",
            company: "Test Co",
            value: 100,
            channel: "whatsapp",
            lastContact: "Today",
            score: 100,
            avatar: "TL"
          }
        ]
      }
    ]
    const getItemMock = mock.fn(() => JSON.stringify(customStages))

    globalThis.window = {
      // @ts-ignore
      localStorage: {
        getItem: getItemMock,
      },
    }

    const result = loadPipelineStagesFromStorage()

    assert.deepEqual(result, customStages)
    assert.equal(getItemMock.mock.calls.length, 1)
  })
})
