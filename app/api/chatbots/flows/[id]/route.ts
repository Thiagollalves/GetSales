import { NextResponse } from "next/server"
import { deleteFlow, getFlow, updateFlow } from "@/lib/chatbots"
import { isAdminRequestAuthorized } from "@/lib/admin-auth"
import type { FlowSyncStatus } from "@/lib/chatbots-core"

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

  return undefined
}

function parseOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined
}

function parseSyncStatus(value: unknown): FlowSyncStatus | undefined {
  if (
    value === "idle" ||
    value === "testing" ||
    value === "publishing" ||
    value === "success" ||
    value === "error"
  ) {
    return value
  }

  return undefined
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const flowId = Number(id)
  if (!Number.isFinite(flowId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const flow = await getFlow(flowId)
  if (!flow) {
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 })
  }

  return NextResponse.json(flow)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const flowId = Number(id)
  if (!Number.isFinite(flowId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  const updated = await updateFlow(flowId, {
    name: parseOptionalString(body.name),
    description: parseOptionalString(body.description),
    active: typeof body.active === "boolean" ? body.active : undefined,
    testPhone: parseOptionalString(body.testPhone),
    keywords: parseKeywords(body.keywords),
    isServiceFlow: typeof body.isServiceFlow === "boolean" ? body.isServiceFlow : undefined,
    trigger: parseOptionalString(body.trigger),
    conversations: typeof body.conversations === "number" ? Math.max(0, Math.trunc(body.conversations)) : undefined,
    definition: body.definition,
    n8nSyncStatus: parseSyncStatus(body.n8nSyncStatus),
    lastPublishedAt:
      typeof body.lastPublishedAt === "string"
        ? body.lastPublishedAt
        : body.lastPublishedAt === null
          ? null
          : undefined,
    lastTestScore:
      typeof body.lastTestScore === "number"
        ? body.lastTestScore
        : body.lastTestScore === null
          ? null
          : undefined,
    lastTestStatus:
      typeof body.lastTestStatus === "string"
        ? body.lastTestStatus
        : body.lastTestStatus === null
          ? null
          : undefined,
  })

  if (!updated) {
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const flowId = Number(id)
  if (!Number.isFinite(flowId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const deleted = await deleteFlow(flowId)
  if (!deleted) {
    return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ ...deleted, deleted: true })
}
