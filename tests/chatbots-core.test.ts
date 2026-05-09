import assert from "node:assert/strict"
import { test } from "node:test"

import {
  addFlowCondition,
  addFlowInteraction,
  addFlowStage,
  connectFlowStages,
  createDefaultFlowDefinition,
  deserializeFlowDefinition,
  duplicateFlowDefinition,
  removeFlowStage,
  serializeFlowDefinition,
} from "../lib/chatbots-core.ts"

test("flow test outcome is deterministic", () => {
  const outcome = createDefaultFlowDefinition("Boas-vindas")

  assert.equal(outcome.version, 1)
  assert.equal(outcome.nodes.length, 3)
  assert.equal(outcome.edges.length, 2)
  assert.equal(outcome.nodes[0].type, "start")
  assert.equal(outcome.nodes[1].interactions.length > 0, true)
  assert.equal(outcome.nodes[1].conditions.length > 0, true)
})

test("flow definition round-trips through serialization", () => {
  const definition = createDefaultFlowDefinition("Teste")
  const serialized = serializeFlowDefinition(definition)
  const parsed = deserializeFlowDefinition(serialized)

  assert.deepEqual(parsed, definition)
})

test("flow stages can be added and removed", () => {
  const base = createDefaultFlowDefinition("Teste")
  const added = addFlowStage(base, "Qualificação")
  const removed = removeFlowStage(added, added.nodes[1].id)

  assert.equal(added.nodes.length, base.nodes.length + 1)
  assert.equal(removed.nodes.some((node) => node.title === "Qualificação"), true)
  assert.equal(removed.nodes.some((node) => node.id === added.nodes[1].id), false)
})

test("flow stages can receive message, menu, media and conditions", () => {
  const base = createDefaultFlowDefinition("Teste")
  const targetNodeId = base.nodes[2].id
  const withMessage = addFlowInteraction(base, base.nodes[1].id, {
    type: "message",
    text: "Olá, seja bem-vindo.",
  })
  const withMenu = addFlowInteraction(withMessage, base.nodes[1].id, {
    type: "menu",
    title: "Escolha uma opção",
    options: ["Vendas", "Suporte"],
  })
  const withMedia = addFlowInteraction(withMenu, base.nodes[1].id, {
    type: "media",
    mediaType: "image",
    url: "/capa.png",
    caption: "Imagem de apoio",
  })
  const withCondition = addFlowCondition(withMedia, base.nodes[1].id, {
    label: "Qualquer resposta",
    targetNodeId,
    kind: "response",
  })
  const connected = connectFlowStages(withCondition, base.nodes[1].id, targetNodeId, "continua")

  const node = connected.nodes.find((item) => item.id === base.nodes[1].id)
  assert.equal(node?.interactions.at(-1)?.type, "media")
  assert.equal(node?.conditions.at(-1)?.label, "Qualquer resposta")
  assert.equal(connected.edges.some((edge) => edge.from === base.nodes[1].id && edge.to === targetNodeId), true)
})

test("duplicating a flow remaps internal ids", () => {
  const base = createDefaultFlowDefinition("Teste")
  const duplicated = duplicateFlowDefinition(base)

  const originalIds = new Set(base.nodes.map((node) => node.id))
  const duplicatedIds = new Set(duplicated.nodes.map((node) => node.id))

  assert.equal(duplicated.nodes.length, base.nodes.length)
  assert.equal(duplicated.edges.length, base.edges.length)
  for (const id of originalIds) {
    assert.equal(duplicatedIds.has(id), false)
  }
  for (const edge of duplicated.edges) {
    assert.equal(duplicatedIds.has(edge.from), true)
    assert.equal(duplicatedIds.has(edge.to), true)
  }
})
