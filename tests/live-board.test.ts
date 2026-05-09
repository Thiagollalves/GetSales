import assert from "node:assert/strict"
import { test } from "node:test"

import {
  buildLiveBoardModel,
  buildLiveBoardUrl,
  getSeededLivePresenceCount,
  resolveLiveBoardState,
} from "../lib/live-board.ts"
import { initialConversations } from "../lib/mock-data.ts"

test("live board defaults to assignee grid mode on the ao vivo route", () => {
  const state = resolveLiveBoardState("/dashboard/ao-vivo", new URLSearchParams())
  const model = buildLiveBoardModel(initialConversations, state)

  assert.deepEqual(state, {
    groupBy: "assignee",
    view: "grid",
    q: "",
  })
  assert.equal(model.onlineCount, 34)
  assert.equal(model.visibleCount, 5)
  assert.deepEqual(model.lanes.map((lane) => lane.label), ["Pendentes", "Ana Souza", "Equipe Bot", "Time Comercial"])
  assert.equal(model.lanes[0].count, 1)
})

test("live board groups by atendente with pendentes first", () => {
  const model = buildLiveBoardModel(
    initialConversations,
    {
      groupBy: "assignee",
      view: "grid",
      q: "",
    },
  )

  assert.deepEqual(model.lanes.map((lane) => lane.label), ["Pendentes", "Ana Souza", "Equipe Bot", "Time Comercial"])
  assert.deepEqual(model.lanes.map((lane) => lane.count), [1, 2, 1, 1])
})

test("live board groups by department with pendentes first", () => {
  const model = buildLiveBoardModel(
    initialConversations,
    {
      groupBy: "department",
      view: "list",
      q: "",
    },
  )

  assert.deepEqual(model.lanes.map((lane) => lane.label), ["Pendentes", "Automação", "Comercial"])
  assert.deepEqual(model.lanes.map((lane) => lane.count), [1, 1, 3])
})

test("live board search filters cards without removing the lanes", () => {
  const model = buildLiveBoardModel(
    initialConversations,
    {
      groupBy: "assignee",
      view: "grid",
      q: "vip",
    },
  )

  assert.equal(model.visibleCount, 1)
  assert.deepEqual(model.lanes.map((lane) => lane.count), [0, 1, 0, 0])
})

test("live board url state round-trips through the query string", () => {
  const state = {
    groupBy: "department" as const,
    view: "list" as const,
    q: "ana",
  }

  assert.equal(buildLiveBoardUrl("/dashboard/ao-vivo", state), "/dashboard/ao-vivo?groupBy=department&view=list&q=ana")
  assert.deepEqual(resolveLiveBoardState("/dashboard/ao-vivo", new URLSearchParams("groupBy=department&view=list&q=ana")), state)
})

test("seeded online count matches the current fixture mix", () => {
  assert.equal(getSeededLivePresenceCount(initialConversations), 34)
})
