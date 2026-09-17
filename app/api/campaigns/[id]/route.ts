import { NextResponse } from "next/server"
import { cancelCampaign, getCampaign } from "@/lib/campaigns-store"
import { isAdminRequestAuthorized } from "@/lib/admin-auth"

async function resolveId(params: Promise<{ id: string }>) {
  const { id } = await params
  const parsed = Number(id)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = await resolveId(params)
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const campaign = await getCampaign(id)
  if (!campaign) return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
  return NextResponse.json(campaign)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = await resolveId(params)
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const body = await request.json().catch(() => null)
  if (body?.action !== "cancel") {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  }

  const campaign = await cancelCampaign(id)
  if (!campaign) {
    return NextResponse.json({ error: "Campanha não encontrada ou não pode ser cancelada" }, { status: 404 })
  }

  return NextResponse.json(campaign)
}
