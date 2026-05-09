import assert from "node:assert/strict"
import { after, test } from "node:test"

import {
  buildFlowTestOutcome,
} from "../lib/chatbots-core.ts"
import {
  createAgent,
  createFlow,
  deleteFlow,
  listAgents,
  listFlows,
  runFlowTest,
  updateFlow,
} from "../lib/chatbots.ts"

const envKeys = [
  "NODE_ENV",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "N8N_CHATBOT_FLOW_WEBHOOK_URL",
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

test("chatbot storage falls back cleanly in test mode", async () => {
  process.env.NODE_ENV = "test"
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.N8N_CHATBOT_FLOW_WEBHOOK_URL

  const flowsBefore = await listFlows()
  assert.equal(flowsBefore.length, 10)

  const created = await createFlow({
    name: "Teste de fluxo",
    description: "Fluxo local criado para teste.",
    testPhone: "(85) 90000-0000",
    keywords: ["teste", "local"],
    isServiceFlow: true,
    active: true,
    conversations: 7,
  })

  assert.ok(created.id >= 11)
  assert.equal(created.name, "Teste de fluxo")
  assert.deepEqual(created.keywords, ["teste", "local"])
  assert.equal(created.definition.nodes.length, 3)

  const updated = await updateFlow(created.id, { active: false, conversations: 9 })
  assert.equal(updated?.active, false)
  assert.equal(updated?.conversations, 9)

  const tested = await runFlowTest(created.id)
  const expectedOutcome = buildFlowTestOutcome(created.id)
  assert.equal(tested?.lastTestScore, expectedOutcome.score)
  assert.equal(tested?.lastTestStatus, expectedOutcome.status)

  const agentsBefore = await listAgents()
  assert.equal(agentsBefore.length, 1)

  const createdAgent = await createAgent({
    name: "Assistente de Teste",
    channel: "WhatsApp",
    focus: "Validar o fluxo local",
    status: "Em teste",
  })

  assert.ok(createdAgent.id >= 2)
  assert.equal(createdAgent.status, "Em teste")

  await deleteFlow(created.id)
})

test("chatbot storage falls back cleanly in production when Supabase is unavailable", async () => {
  process.env.NODE_ENV = "production"
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.N8N_CHATBOT_FLOW_WEBHOOK_URL

  const flowsBefore = await listFlows()
  const baselineCount = flowsBefore.length

  assert.ok(baselineCount >= 10)
  assert.ok(flowsBefore.some((flow) => flow.name === "NYM oficial"))

  const created = await createFlow({
    name: "Teste de produção",
    description: "Fluxo local de fallback no deploy.",
    testPhone: "(85) 90000-1111",
    keywords: ["produção", "fallback"],
    isServiceFlow: false,
    active: true,
    conversations: 3,
  })

  const afterCreate = await listFlows()
  assert.equal(afterCreate.length, baselineCount + 1)
  assert.equal(afterCreate.some((flow) => flow.id === created.id), true)

  const updated = await updateFlow(created.id, { active: false })
  assert.equal(updated?.active, false)

  const deleted = await deleteFlow(created.id)
  assert.equal(deleted?.id, created.id)

  const afterDelete = await listFlows()
  assert.equal(afterDelete.length, baselineCount)
})
