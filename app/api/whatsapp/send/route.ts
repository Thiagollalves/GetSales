import { NextResponse } from "next/server"
import { isAdminSessionValid } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    if (!isAdminSessionValid(request.headers.get("cookie"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : ""
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const resolvedToken = process.env.META_WHATSAPP_TOKEN?.trim()
    const resolvedPhoneId = process.env.META_PHONE_NUMBER_ID?.trim()
    const apiVersion = process.env.META_GRAPH_API_VERSION?.trim() ?? "v20.0"

    if (phone.length < 8 || phone.length > 15 || !message) {
      return NextResponse.json(
        { error: "Campos obrigatórios: phone válido e message" },
        { status: 400 },
      )
    }

    if (!resolvedToken || !resolvedPhoneId) {
      return NextResponse.json(
        { error: "WhatsApp is not configured. Set META_WHATSAPP_TOKEN and META_PHONE_NUMBER_ID." },
        { status: 500 },
      )
    }

    if (message.length > 4096) {
      return NextResponse.json(
        { error: "Message is too long. Keep the payload under 4096 characters." },
        { status: 400 },
      )
    }

    const url = `https://graph.facebook.com/${apiVersion}/${resolvedPhoneId}/messages`

    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      text: { body: message },
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resolvedToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    let data: { error?: { message?: string }; raw?: string } = {}

    if (responseText) {
      try {
        data = JSON.parse(responseText) as typeof data
      } catch {
        data = { raw: responseText }
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || data.raw || "Failed to send message" },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
