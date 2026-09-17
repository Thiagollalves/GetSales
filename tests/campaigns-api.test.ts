import assert from "node:assert/strict"
import { afterEach, test } from "node:test"

import { ADMIN_COOKIE_NAME } from "../lib/admin-auth.ts"
import { resetCampaignStoreForTests } from "../lib/campaigns-store.ts"
import { GET as getCampaignById, PATCH as patchCampaign } from "../app/api/campaigns/[id]/route.ts"
import { GET as listCampaigns, POST as createCampaign } from "../app/api/campaigns/route.ts"

const envKeys = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const
const savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))
const adminCookie = `${ADMIN_COOKIE_NAME}=123456`

function authorizedRequest(url: string, init: RequestInit = {}) {
  return new Request(url, {
    ...init,
    headers: { cookie: adminCookie, "Content-Type": "application/json", ...(init.headers ?? {}) },
  })
}

afterEach(() => {
  resetCampaignStoreForTests()
  for (const key of envKeys) {
    const value = savedEnv[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test("campaign routes require an authenticated admin session", async () => {
  const response = await listCampaigns(new Request("http://localhost/api/campaigns"))
  assert.equal(response.status, 401)
})

test("campaign MVP stores only validated drafts and allows cancellation", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY

  const invalid = await createCampaign(
    authorizedRequest("http://localhost/api/campaigns", {
      method: "POST",
      body: JSON.stringify({
        name: "Campanha oficial",
        kind: "official",
        connectionId: "whatsmeow-1",
        connectionKind: "whatsmeow",
        audienceCount: 2,
      }),
    }),
  )
  assert.equal(invalid.status, 422)

  const personalized = await createCampaign(
    authorizedRequest("http://localhost/api/campaigns", {
      method: "POST",
      body: JSON.stringify({
        name: "Retomada personalizada",
        kind: "personalized",
        connectionId: "whatsmeow-1",
        connectionKind: "whatsmeow",
        audienceCount: 1,
      }),
    }),
  )
  assert.equal(personalized.status, 201)

  const create = await createCampaign(
    authorizedRequest("http://localhost/api/campaigns", {
      method: "POST",
      body: JSON.stringify({
        name: "Follow-up de setembro",
        kind: "official",
        connectionId: "official-1",
        connectionKind: "official",
        audienceTag: "Clientes",
        audienceCount: 3,
        templateId: "follow_up",
      }),
    }),
  )
  assert.equal(create.status, 201)
  const created = await create.json()
  assert.equal(created.status, "DRAFT")
  assert.equal(created.audienceCount, 3)

  const listed = await listCampaigns(authorizedRequest("http://localhost/api/campaigns"))
  assert.equal(listed.status, 200)
  assert.equal((await listed.json()).length, 2)

  const loaded = await getCampaignById(authorizedRequest(`http://localhost/api/campaigns/${created.id}`), {
    params: Promise.resolve({ id: String(created.id) }),
  })
  assert.equal(loaded.status, 200)

  const cancelled = await patchCampaign(
    authorizedRequest(`http://localhost/api/campaigns/${created.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "cancel" }),
    }),
    { params: Promise.resolve({ id: String(created.id) }) },
  )
  assert.equal(cancelled.status, 200)
  assert.equal((await cancelled.json()).status, "CANCELLED")
})
