import { NextResponse } from "next/server"

import { isAdminRequestAuthorized } from "@/lib/admin-auth"
import { listContacts, saveContacts } from "@/lib/contacts-repository"
import type { Conversation } from "@/lib/mock-data"

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const contacts = await listContacts()
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Contacts load error:", error)
    return NextResponse.json({ error: "Contacts storage is not configured." }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const contacts = Array.isArray(body?.contacts) ? (body.contacts as Conversation[]) : null

  if (!contacts) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  try {
    const savedContacts = await saveContacts(contacts)
    return NextResponse.json(savedContacts)
  } catch (error) {
    console.error("Contacts save error:", error)
    return NextResponse.json({ error: "Contacts storage is not configured." }, { status: 503 })
  }
}
