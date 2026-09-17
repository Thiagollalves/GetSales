import { NextResponse } from "next/server"
import { createCampaign, listCampaigns } from "@/lib/campaigns-store"
import { isAdminRequestAuthorized } from "@/lib/admin-auth"

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json(await listCampaigns())
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  const result = await createCampaign(body)
  if (!result.ok) {
    return NextResponse.json({ error: "Campanha inválida", details: result.errors }, { status: 422 })
  }

  return NextResponse.json(result.value, { status: 201 })
}
