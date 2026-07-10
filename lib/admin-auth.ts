import crypto from "node:crypto"

export const ADMIN_COOKIE_NAME = "getsales_admin_session"
const SESSION_PREFIX = "v2"
const SESSION_TTL_SECONDS = 60 * 60 * 8

function timingSafeEqualStrings(expected: string, candidate: string) {
  if (!expected || !candidate || expected.length !== candidate.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(candidate))
}

function normalizeCredential(candidate: string | null | undefined) {
  return candidate?.trim() ?? ""
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} must be configured.`)
  return value
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url")
}

function decodeBase64Url(value: string) {
  try {
    return Buffer.from(value, "base64url").toString("utf8")
  } catch {
    return null
  }
}

export function getAdminUsername() {
  return requiredEnv("ADMIN_ACCESS_USERNAME")
}

export function getAdminPassword() {
  return requiredEnv("ADMIN_ACCESS_TOKEN")
}

function getSessionSecret() {
  return requiredEnv("ADMIN_SESSION_SECRET")
}

export function hasAdminAccessToken() {
  return Boolean(
    process.env.ADMIN_ACCESS_USERNAME?.trim() &&
      process.env.ADMIN_ACCESS_TOKEN?.trim() &&
      process.env.ADMIN_SESSION_SECRET?.trim(),
  )
}

export function getAdminAccessToken() {
  return getAdminPassword()
}

export function isValidAdminAccessToken(candidate: string | null | undefined) {
  if (!hasAdminAccessToken()) return false
  return timingSafeEqualStrings(getAdminPassword(), normalizeCredential(candidate))
}

export function isValidAdminCredentials(
  candidateUsername: string | null | undefined,
  candidatePassword: string | null | undefined,
) {
  if (!hasAdminAccessToken()) return false
  return (
    timingSafeEqualStrings(getAdminUsername(), normalizeCredential(candidateUsername)) &&
    timingSafeEqualStrings(getAdminPassword(), normalizeCredential(candidatePassword))
  )
}

export function createAdminSessionToken(username: string) {
  if (!hasAdminAccessToken()) throw new Error("Admin access is not configured.")

  const normalizedUsername = normalizeCredential(username)
  if (!normalizedUsername) throw new Error("Cannot create an admin session without a username.")

  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = issuedAt + SESSION_TTL_SECONDS
  const nonce = crypto.randomBytes(16).toString("base64url")
  const encodedUsername = encodeBase64Url(normalizedUsername)
  const payload = `${SESSION_PREFIX}.${encodedUsername}.${issuedAt}.${expiresAt}.${nonce}`
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url")

  return `${payload}.${signature}`
}

export function isValidAdminSessionToken(candidate: string | null | undefined) {
  if (!hasAdminAccessToken()) return false

  const token = normalizeCredential(candidate)
  const [prefix, encodedUsername, issuedAtRaw, expiresAtRaw, nonce, providedSignature] = token.split(".")
  if (
    prefix !== SESSION_PREFIX ||
    !encodedUsername ||
    !issuedAtRaw ||
    !expiresAtRaw ||
    !nonce ||
    !providedSignature
  ) return false

  const issuedAt = Number(issuedAtRaw)
  const expiresAt = Number(expiresAtRaw)
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isSafeInteger(issuedAt) || !Number.isSafeInteger(expiresAt)) return false
  if (issuedAt > now + 60 || expiresAt <= now || expiresAt - issuedAt > SESSION_TTL_SECONDS) return false

  const decodedUsername = decodeBase64Url(encodedUsername)
  if (!decodedUsername || !timingSafeEqualStrings(getAdminUsername(), decodedUsername)) return false

  const payload = `${prefix}.${encodedUsername}.${issuedAtRaw}.${expiresAtRaw}.${nonce}`
  const expectedSignature = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url")
  return timingSafeEqualStrings(expectedSignature, providedSignature)
}

export function getCookieValue(cookieHeader: string | null | undefined, name: string) {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = part.trim().split("=")
    if (rawName === name) {
      const rawValue = rawValueParts.join("=")
      try {
        return decodeURIComponent(rawValue)
      } catch {
        return rawValue
      }
    }
  }
  return null
}

export function getAdminSessionFromCookieHeader(cookieHeader: string | null | undefined) {
  return getCookieValue(cookieHeader, ADMIN_COOKIE_NAME)
}

export function isAdminSessionValid(cookieHeader: string | null | undefined) {
  return isValidAdminSessionToken(getAdminSessionFromCookieHeader(cookieHeader))
}

export function isAdminRequestAuthorized(request: Request) {
  return isAdminSessionValid(request.headers.get("cookie"))
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  }
}

export function getExpiredAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  }
}
