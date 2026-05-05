import assert from "node:assert/strict"
import { afterEach, test } from "node:test"

import { POST } from "../app/api/auth/login/route.ts"

const envKeys = ["NODE_ENV", "ADMIN_ACCESS_USERNAME", "ADMIN_ACCESS_TOKEN"] as const
const savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))

afterEach(() => {
  for (const key of envKeys) {
    const value = savedEnv[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
})

test("login route accepts the fallback in production", async () => {
  process.env.NODE_ENV = "production"
  delete process.env.ADMIN_ACCESS_USERNAME
  delete process.env.ADMIN_ACCESS_TOKEN

  const response = await POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "123456" }),
    }),
  )

  assert.equal(response.status, 200)
  assert.equal(response.headers.get("set-cookie")?.includes("getsales_admin_session"), true)
})

test("login route accepts the development fallback", async () => {
  process.env.NODE_ENV = "development"
  delete process.env.ADMIN_ACCESS_USERNAME
  delete process.env.ADMIN_ACCESS_TOKEN

  const response = await POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "123456" }),
    }),
  )

  assert.equal(response.status, 200)
  assert.equal(response.headers.get("set-cookie")?.includes("getsales_admin_session"), true)
})
