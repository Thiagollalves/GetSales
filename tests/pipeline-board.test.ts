import assert from "node:assert/strict"
import { test } from "node:test"
import { updateInboxConversationPipeline, syncInboxConversationFromPipelineLead, loadPipelineStagesFromStorage, PIPELINE_STORAGE_KEY } from "../lib/pipeline-board.ts"
import type { PipelineLead } from "../lib/pipeline-board.ts"

test("updateInboxConversationPipeline safely handles invalid JSON in localStorage", () => {
  global.window = {
    localStorage: {
      getItem: (key: string) => {
        if (key === "inbox_conversations") return "{invalid-json"
        return null
      },
      setItem: () => {}
    }
  } as any

  assert.doesNotThrow(() => {
    updateInboxConversationPipeline(1, "qualificacao")
  })

  delete (global as any).window
})

test("syncInboxConversationFromPipelineLead safely handles invalid JSON in localStorage", () => {
  global.window = {
    localStorage: {
      getItem: (key: string) => {
        if (key === "inbox_conversations") return "{invalid-json"
        return null
      },
      setItem: () => {}
    }
  } as any

  const lead: PipelineLead = {
    id: "1",
    name: "Test",
    company: "Test",
    value: 100,
    channel: "whatsapp",
    lastContact: "Hoje",
    score: 10,
    avatar: "TS",
    sourceConversationId: 1
  }

  assert.doesNotThrow(() => {
    syncInboxConversationFromPipelineLead(lead, "qualificacao")
  })

  delete (global as any).window
})

test("loadPipelineStagesFromStorage safely handles invalid JSON in localStorage", () => {
  global.window = {
    localStorage: {
      getItem: (key: string) => {
        if (key === PIPELINE_STORAGE_KEY) return "{invalid-json"
        return null
      },
      setItem: () => {}
    }
  } as any

  assert.doesNotThrow(() => {
    const stages = loadPipelineStagesFromStorage()
    assert.ok(Array.isArray(stages))
  })

  delete (global as any).window
})
