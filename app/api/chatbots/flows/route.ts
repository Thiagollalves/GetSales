import { NextResponse } from "next/server"
import { createFlow, listFlows, updateFlow } from "@/lib/chatbots"
import { isAdminRequestAuthorized } from "@/lib/admin-auth"

function parseKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean)
  }

  if (typeof value === "string") {
    return value
      .split(/[,;\n]/g)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const flows = await listFlows()
  return NextResponse.json(flows)
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  const description = typeof body.description === "string" ? body.description.trim() : ""
  if (!name || !description) {
    return NextResponse.json({ error: "Campos obrigatórios: name e description" }, { status: 400 })
  }

  const flow = await createFlow({
    name,
    description,
    active: typeof body.active === "boolean" ? body.active : true,
    testPhone: typeof body.testPhone === "string" ? body.testPhone.trim() : undefined,
    keywords: parseKeywords(body.keywords),
    isServiceFlow: typeof body.isServiceFlow === "boolean" ? body.isServiceFlow : false,
    trigger: typeof body.trigger === "string" ? body.trigger.trim() : undefined,
    conversations: typeof body.conversations === "number" ? Math.max(0, Math.trunc(body.conversations)) : undefined,
    definition: body.definition,
    n8nSyncStatus: typeof body.n8nSyncStatus === "string" ? body.n8nSyncStatus : undefined,
    lastPublishedAt: typeof body.lastPublishedAt === "string" ? body.lastPublishedAt : body.lastPublishedAt === null ? null : undefined,
    lastTestScore: typeof body.lastTestScore === "number" ? body.lastTestScore : body.lastTestScore === null ? null : undefined,
    lastTestStatus: typeof body.lastTestStatus === "string" ? body.lastTestStatus : body.lastTestStatus === null ? null : undefined,
  })

  return NextResponse.json(flow, { status: 201 })
}

export async function PATCH(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  const id = Number(body.id)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Campos obrigatórios: id (number)" }, { status: 400 })
  }

  const updated = await updateFlow(id, {
    active: typeof body.active === "boolean" ? body.active : undefined,
  })

  if (!updated) {
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 })
  }

  return NextResponse.json(updated)
}
