const ORGANIZATION_HEADER = "x-organization-id"

function normalizeOrganizationId(value: string | null | undefined) {
  const normalized = value?.trim()
  if (!normalized) return null
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
    return null
  }
  return normalized
}

export function getOrganizationIdFromRequest(request: Request) {
  return normalizeOrganizationId(request.headers.get(ORGANIZATION_HEADER))
}

export function getDefaultOrganizationId() {
  return normalizeOrganizationId(process.env.GETSALES_DEFAULT_ORGANIZATION_ID)
}

export function requireOrganizationId(request?: Request) {
  const organizationId = request
    ? getOrganizationIdFromRequest(request) ?? getDefaultOrganizationId()
    : getDefaultOrganizationId()

  if (!organizationId) {
    throw new Error(
      `Organization context is required. Configure GETSALES_DEFAULT_ORGANIZATION_ID or send ${ORGANIZATION_HEADER}.`,
    )
  }

  return organizationId
}

export { ORGANIZATION_HEADER }
