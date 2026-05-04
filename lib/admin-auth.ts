import crypto from "node:crypto"

export const ADMIN_COOKIE_NAME = "getsales_admin_session"

const FALLBACK_DEV_ADMIN_USERNAME = "admin"
const FALLBACK_DEV_ADMIN_PASSWORD = "getsales-dev-access"
const SESSION_PREFIX = "v1"

function timingSafeEqualStrings(expected: string, candidate: string) {
  if (!expected || !candidate || expected.length !== candidate.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(candidate))
}

function normalizeCredential(candidate: string | null | undefined) {
  return candidate?.trim() ?? ""
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
  const configuredUsername = process.env.ADMIN_ACCESS_USERNAME?.trim()
  if (configuredUsername) {
    return configuredUsername
  }

  return process.env.NODE_ENV === "production" ? "" : FALLBACK_DEV_ADMIN_USERNAME
}

export function getAdminPassword() {
  const configuredPassword = process.env.ADMIN_ACCESS_TOKEN?.trim()
  if (configuredPassword) {
    return configuredPassword
  }

  return process.env.NODE_ENV === "production" ? "" : FALLBACK_DEV_ADMIN_PASSWORD
}

export function hasAdminAccessToken() {
  return getAdminUsername().length > 0 && getAdminPassword().length > 0
}

export function getAdminAccessToken() {
  return getAdminPassword()
}

export function isValidAdminAccessToken(candidate: string | null | undefined) {
  return timingSafeEqualStrings(getAdminPassword(), normalizeCredential(candidate))
}

export function isValidAdminCredentials(
  candidateUsername: string | null | undefined,
  candidatePassword: string | null | undefined,
) {
  return (
    timingSafeEqualStrings(getAdminUsername(), normalizeCredential(candidateUsername)) &&
    timingSafeEqualStrings(getAdminPassword(), normalizeCredential(candidatePassword))
  )
}

export function createAdminSessionToken(username: string) {
  const normalizedUsername = normalizeCredential(username)
  if (!normalizedUsername) {
    throw new Error("Cannot create an admin session without a username.")
  }

  const encodedUsername = encodeBase64Url(normalizedUsername)
  const payload = `${SESSION_PREFIX}.${encodedUsername}`
  const signature = crypto.createHmac("sha256", getAdminPassword()).update(payload).digest("base64url")

  return `${payload}.${signature}`
}

export function isValidAdminSessionToken(candidate: string | null | undefined) {
  const token = normalizeCredential(candidate)
  if (!token) {
    return false
  }

  const [prefix, encodedUsername, providedSignature] = token.split(".")
  if (prefix !== SESSION_PREFIX || !encodedUsername || !providedSignature) {
    return token === getAdminPassword()
  }

  const decodedUsername = decodeBase64Url(encodedUsername)
  if (!decodedUsername || !timingSafeEqualStrings(getAdminUsername(), decodedUsername)) {
    return false
  }

  const payload = `${prefix}.${encodedUsername}`
  const expectedSignature = crypto.createHmac("sha256", getAdminPassword()).update(payload).digest("base64url")

  return timingSafeEqualStrings(expectedSignature, providedSignature)
}

export function getCookieValue(cookieHeader: string | null | undefined, name: string) {
  if (!cookieHeader) {
    return null
  }

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
    maxAge: 60 * 60 * 24 * 7,
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
