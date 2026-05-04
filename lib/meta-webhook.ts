import crypto from "node:crypto"

export const META_WEBHOOK_SIGNATURE_HEADER = "x-hub-signature-256"

export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string | undefined,
) {
  const secret = appSecret?.trim()
  const header = signatureHeader?.trim()

  if (!secret || !header?.startsWith("sha256=")) {
    return false
  }

  const providedSignature = header.slice("sha256=".length).toLowerCase()
  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex").toLowerCase()

  if (!providedSignature || expectedSignature.length !== providedSignature.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(expectedSignature, "utf8"), Buffer.from(providedSignature, "utf8"))
}
