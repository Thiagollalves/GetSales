import assert from "node:assert/strict"
import { test } from "node:test"
import crypto from "node:crypto"
import { verifyMetaWebhookSignature, META_WEBHOOK_SIGNATURE_HEADER } from "../lib/meta-webhook.ts"

test("META_WEBHOOK_SIGNATURE_HEADER is correct", () => {
  assert.equal(META_WEBHOOK_SIGNATURE_HEADER, "x-hub-signature-256")
})

test("verifyMetaWebhookSignature correctly verifies a valid signature", () => {
  const appSecret = "my_secret_key"
  const rawBody = JSON.stringify({ test: "data" })
  const expectedSignature = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex").toLowerCase()
  const signatureHeader = `sha256=${expectedSignature}`

  assert.equal(verifyMetaWebhookSignature(rawBody, signatureHeader, appSecret), true)
})

test("verifyMetaWebhookSignature handles whitespace in secret and header", () => {
  const appSecret = "my_secret_key"
  const rawBody = JSON.stringify({ test: "data" })
  const expectedSignature = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex").toLowerCase()
  const signatureHeader = ` sha256=${expectedSignature} `

  assert.equal(verifyMetaWebhookSignature(rawBody, signatureHeader, ` ${appSecret} `), true)
})

test("verifyMetaWebhookSignature rejects an invalid signature", () => {
  const appSecret = "my_secret_key"
  const rawBody = JSON.stringify({ test: "data" })
  const expectedSignature = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex").toLowerCase()
  const invalidSignature = expectedSignature.slice(0, -1) + (expectedSignature.endsWith('a') ? 'b' : 'a')
  const signatureHeader = `sha256=${invalidSignature}`

  assert.equal(verifyMetaWebhookSignature(rawBody, signatureHeader, appSecret), false)
})

test("verifyMetaWebhookSignature rejects a signature with incorrect body", () => {
  const appSecret = "my_secret_key"
  const rawBody = JSON.stringify({ test: "data" })
  const expectedSignature = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex").toLowerCase()
  const signatureHeader = `sha256=${expectedSignature}`

  assert.equal(verifyMetaWebhookSignature('{"test":"other_data"}', signatureHeader, appSecret), false)
})

test("verifyMetaWebhookSignature returns false when appSecret is missing or empty", () => {
  const rawBody = JSON.stringify({ test: "data" })
  const signatureHeader = `sha256=1234567890abcdef`

  assert.equal(verifyMetaWebhookSignature(rawBody, signatureHeader, undefined), false)
  assert.equal(verifyMetaWebhookSignature(rawBody, signatureHeader, ""), false)
  assert.equal(verifyMetaWebhookSignature(rawBody, signatureHeader, "   "), false)
})

test("verifyMetaWebhookSignature returns false when signatureHeader is missing, empty, or malformed", () => {
  const appSecret = "my_secret_key"
  const rawBody = JSON.stringify({ test: "data" })
  const expectedSignature = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex").toLowerCase()

  assert.equal(verifyMetaWebhookSignature(rawBody, null, appSecret), false)
  assert.equal(verifyMetaWebhookSignature(rawBody, undefined, appSecret), false)
  assert.equal(verifyMetaWebhookSignature(rawBody, "", appSecret), false)
  assert.equal(verifyMetaWebhookSignature(rawBody, expectedSignature, appSecret), false) // missing sha256= prefix
  assert.equal(verifyMetaWebhookSignature(rawBody, "sha256=", appSecret), false) // empty signature after prefix
})

test("verifyMetaWebhookSignature returns false for signature length mismatch", () => {
  const appSecret = "my_secret_key"
  const rawBody = JSON.stringify({ test: "data" })
  const signatureHeader = `sha256=short`

  assert.equal(verifyMetaWebhookSignature(rawBody, signatureHeader, appSecret), false)
})
