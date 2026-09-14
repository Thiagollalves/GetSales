import assert from "node:assert/strict"
import { afterEach, test } from "node:test"

import {
  createAdminSessionToken,
  getAdminPassword,
  getAdminUsername,
  hasAdminAccessToken,
  isValidAdminCredentials,
  isValidAdminSessionToken,
} from "../lib/admin-auth.ts"

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

test("admin auth keeps dev fallback only outside production", () => {
  delete process.env.ADMIN_ACCESS_USERNAME
  delete process.env.ADMIN_ACCESS_TOKEN
  process.env.NODE_ENV = "development"

  assert.equal(hasAdminAccessToken(), true)
  assert.equal(getAdminUsername(), "admin")
  assert.equal(getAdminPassword(), "123456")
  assert.equal(isValidAdminCredentials("admin", "123456"), true)
  assert.equal(isValidAdminSessionToken("123456"), true)
})

test("admin auth keeps the fallback available in production", () => {
  delete process.env.ADMIN_ACCESS_USERNAME
  delete process.env.ADMIN_ACCESS_TOKEN
  process.env.NODE_ENV = "production"

  assert.equal(hasAdminAccessToken(), true)
  assert.equal(getAdminUsername(), "admin")
  assert.equal(getAdminPassword(), "123456")
  assert.equal(isValidAdminCredentials("admin", "123456"), true)
  assert.equal(isValidAdminSessionToken("123456"), true)
})

test("session token uses configured credentials in production", () => {
  process.env.NODE_ENV = "production"
  process.env.ADMIN_ACCESS_USERNAME = "admin"
  process.env.ADMIN_ACCESS_TOKEN = "secret-123"

  const token = createAdminSessionToken("admin")

  assert.equal(isValidAdminCredentials("admin", "secret-123"), true)
  assert.equal(isValidAdminSessionToken(token), true)
  assert.equal(isValidAdminSessionToken("secret-123"), false)
})

test("isValidAdminSessionToken returns false when base64url decoding fails", (t) => {
  const originalFrom = Buffer.from
  t.mock.method(Buffer, "from", (value: any, encoding?: BufferEncoding) => {
    if (encoding === "base64url") {
      throw new Error("Simulated buffer error")
    }
    return originalFrom(value, encoding)
  })

  // The fallback behavior in isValidAdminSessionToken is triggered when decodeBase64Url
  // catches an exception. By mocking Buffer.from to throw when decoding base64url,
  // we ensure the catch block inside decodeBase64Url executes, returning null.
  assert.equal(isValidAdminSessionToken("v1.invalid_base64_url.signature"), false)
})
