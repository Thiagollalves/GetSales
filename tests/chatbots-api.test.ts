import assert from "node:assert/strict"
import { afterEach, test } from "node:test"

import { ADMIN_COOKIE_NAME } from "../lib/admin-auth.ts"
import {
  GET as getFlowById,
  PATCH as patchFlowById,
  DELETE as deleteFlowById,
} from "../app/api/chatbots/flows/[id]/route.ts"
import { POST as duplicateFlow } from "../app/api/chatbots/flows/[id]/duplicate/route.ts"
import { POST as testFlow } from "../app/api/chatbots/flows/[id]/test/route.ts"
import { POST as publishFlow } from "../app/api/chatbots/flows/[id]/publish/route.ts"
import { GET as listFlows, POST as createFlow, PATCH as toggleFlow } from "../app/api/chatbots/flows/route.ts"

const envKeys = [
  "NODE_ENV",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "N8N_CHATBOT_FLOW_WEBHOOK_URL",
] as const

const savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))
const adminCookie = `${ADMIN_COOKIE_NAME}=123456`

afterEach(() => {
  for (const key of envKeys) {
    const value = savedEnv[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
  globalThis.fetch = originalFetch
})

const originalFetch = globalThis.fetch

function authorizedRequest(url: string, init: RequestInit = {}) {
  return new Request(url, {
    ...init,
    headers: {
      cookie: adminCookie,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })
}

test("chatbot flow routes require auth", async () => {
  process.env.NODE_ENV = "test"

  const response = await listFlows(new Request("http://localhost/api/chatbots/flows"))

  assert.equal(response.status, 401)
})

test("chatbot flow CRUD works with local fallback storage", async () => {
  process.env.NODE_ENV = "test"
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY

  const createResponse = await createFlow(
    authorizedRequest("http://localhost/api/chatbots/flows", {
      method: "POST",
      body: JSON.stringify({
        name: "Fluxo de teste",
        description: "Recebe o lead, qualifica e encaminha.",
        testPhone: "(85) 99999-0000",
        keywords: ["teste", "demo"],
        isServiceFlow: true,
        active: true,
      }),
    }),
  )

  assert.equal(createResponse.status, 201)
  const created = await createResponse.json()
  assert.equal(created.name, "Fluxo de teste")
  assert.equal(created.definition.nodes.length, 3)
  assert.equal(created.keywords.length, 2)

  const getResponse = await getFlowById(
    authorizedRequest(`http://localhost/api/chatbots/flows/${created.id}`),
    { params: Promise.resolve({ id: String(created.id) }) },
  )
  assert.equal(getResponse.status, 200)
  const loaded = await getResponse.json()
  assert.equal(loaded.id, created.id)
  assert.equal(loaded.testPhone, "(85) 99999-0000")

  const patchResponse = await patchFlowById(
    authorizedRequest(`http://localhost/api/chatbots/flows/${created.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: "Fluxo atualizado",
        active: false,
        keywords: ["atualizado"],
      }),
    }),
    { params: Promise.resolve({ id: String(created.id) }) },
  )
  assert.equal(patchResponse.status, 200)
  const patched = await patchResponse.json()
  assert.equal(patched.name, "Fluxo atualizado")
  assert.equal(patched.active, false)
  assert.deepEqual(patched.keywords, ["atualizado"])

  const toggleResponse = await toggleFlow(
    authorizedRequest("http://localhost/api/chatbots/flows", {
      method: "PATCH",
      body: JSON.stringify({ id: created.id, active: true }),
    }),
  )
  assert.equal(toggleResponse.status, 200)
  const toggled = await toggleResponse.json()
  assert.equal(toggled.active, true)

  const duplicateResponse = await duplicateFlow(
    authorizedRequest(`http://localhost/api/chatbots/flows/${created.id}/duplicate`, {
      method: "POST",
    }),
    { params: Promise.resolve({ id: String(created.id) }) },
  )
  assert.equal(duplicateResponse.status, 201)
  const duplicated = await duplicateResponse.json()
  assert.equal(duplicated.name.includes("Cópia"), true)
  assert.equal(duplicated.id !== created.id, true)
  assert.equal(duplicated.definition.nodes.length, created.definition.nodes.length)
  assert.equal(duplicated.definition.nodes[0].id === created.definition.nodes[0].id, false)

  const deleteResponse = await deleteFlowById(
    authorizedRequest(`http://localhost/api/chatbots/flows/${created.id}`, {
      method: "DELETE",
    }),
    { params: Promise.resolve({ id: String(created.id) }) },
  )
  assert.equal(deleteResponse.status, 200)
  const deleted = await deleteResponse.json()
  assert.equal(deleted.id, created.id)
})

test("chatbot webhook routes send the expected payload to n8n", async () => {
  process.env.NODE_ENV = "test"
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  process.env.N8N_CHATBOT_FLOW_WEBHOOK_URL = "https://n8n.example/webhook/chatbots"

  const calls: Array<{ url: string; body: unknown }> = []
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init)
    calls.push({ url: request.url, body: await request.json() })

    if (request.url.includes("chatbots")) {
      if ((calls.length === 1)) {
        return Response.json({ ok: true, score: 97, status: "Excelente" })
      }

      return Response.json({ ok: true, publishedAt: "2026-05-08T15:48:14.000Z" })
    }

    return originalFetch(input, init)
  }

  const createResponse = await createFlow(
    authorizedRequest("http://localhost/api/chatbots/flows", {
      method: "POST",
      body: JSON.stringify({
        name: "Fluxo webhook",
        description: "Fluxo para testar webhook.",
        testPhone: "(85) 98888-7777",
        keywords: ["webhook"],
        isServiceFlow: false,
        active: true,
      }),
    }),
  )
  const created = await createResponse.json()

  const testResponse = await testFlow(
    authorizedRequest(`http://localhost/api/chatbots/flows/${created.id}/test`, { method: "POST" }),
    { params: Promise.resolve({ id: String(created.id) }) },
  )
  assert.equal(testResponse.status, 200)
  const tested = await testResponse.json()
  assert.equal(tested.n8nSyncStatus, "success")
  assert.equal(tested.lastTestScore, 97)
  assert.equal(tested.lastTestStatus, "Excelente")

  const publishResponse = await publishFlow(
    authorizedRequest(`http://localhost/api/chatbots/flows/${created.id}/publish`, { method: "POST" }),
    { params: Promise.resolve({ id: String(created.id) }) },
  )
  assert.equal(publishResponse.status, 200)
  const published = await publishResponse.json()
  assert.equal(published.n8nSyncStatus, "success")
  assert.equal(typeof published.lastPublishedAt, "string")

  assert.equal(calls.length, 2)
  assert.equal(calls[0].body && (calls[0].body as { event?: string }).event, "chatbot.flow.test")
  assert.equal(calls[1].body && (calls[1].body as { event?: string }).event, "chatbot.flow.publish")
})
