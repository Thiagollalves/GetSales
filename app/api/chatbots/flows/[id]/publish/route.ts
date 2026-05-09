import { NextResponse } from "next/server"
import { publishFlow } from "@/lib/chatbots"
import { isAdminRequestAuthorized } from "@/lib/admin-auth"

export async function POST(
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

  try {
    const updated = await publishFlow(flowId)
    if (!updated) {
      return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao publicar o fluxo." },
      { status: 502 },
    )
  }
}
