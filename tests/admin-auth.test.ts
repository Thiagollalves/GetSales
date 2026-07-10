import assert from "node:assert/strict"
import { afterEach, test } from "node:test"

import {
  createAdminSessionToken,
  hasAdminAccessToken,
  isValidAdminCredentials,
  isValidAdminSessionToken,
} from "../lib/admin-auth.ts"

const envKeys = [
  "NODE_ENV",
  "ADMIN_ACCESS_USERNAME",
  "ADMIN_ACCESS_TOKEN",
  "ADMIN_SESSION_SECRET",
] as const
const savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))

afterEach(() => {
  for (const key of envKeys) {
    const value = savedEnv[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test("admin auth fails closed when credentials are missing", () => {
  delete process.env.ADMIN_ACCESS_USERNAME
  delete process.env.ADMIN_ACCESS_TOKEN
  delete process.env.ADMIN_SESSION_SECRET

  assert.equal(hasAdminAccessToken(), false)
  assert.equal(isValidAdminCredentials("admin", "123456"), false)
  assert.equal(isValidAdminSessionToken("123456"), false)
})

test("admin auth requires username, password and a dedicated session secret", () => {
  process.env.ADMIN_ACCESS_USERNAME = "admin"
  process.env.ADMIN_ACCESS_TOKEN = "secret-123"
  delete process.env.ADMIN_SESSION_SECRET

  assert.equal(hasAdminAccessToken(), false)
  assert.equal(isValidAdminCredentials("admin", "secret-123"), false)
})

test("session token is signed, valid and rejects direct password use", () => {
  process.env.NODE_ENV = "production"
  process.env.ADMIN_ACCESS_USERNAME = "admin"
  process.env.ADMIN_ACCESS_TOKEN = "secret-123"
  process.env.ADMIN_SESSION_SECRET = "a-long-independent-session-secret-for-tests"

  const token = createAdminSessionToken("admin")

  assert.equal(isValidAdminCredentials("admin", "secret-123"), true)
  assert.equal(isValidAdminSessionToken(token), true)
  assert.equal(isValidAdminSessionToken("secret-123"), false)
  assert.equal(isValidAdminSessionToken(`${token}tampered`), false)
})
