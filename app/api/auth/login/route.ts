import { NextResponse } from "next/server"
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieOptions,
  getAdminUsername,
  hasAdminAccessToken,
  isValidAdminCredentials,
} from "@/lib/admin-auth"

export async function POST(request: Request) {
  if (!hasAdminAccessToken()) {
    return NextResponse.json(
      {
        error:
          "Admin access is not configured. Set ADMIN_ACCESS_USERNAME and ADMIN_ACCESS_TOKEN before attempting to sign in.",
      },
      { status: 500 },
    )
  }

  const body = await request.json().catch(() => null)
  const username = typeof body?.username === "string" ? body.username : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!username || !password || !isValidAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(getAdminUsername()), getAdminCookieOptions())
  return response
}
