
## 2024-05-24 - API Open Relay Vulnerability in WhatsApp Proxy
**Vulnerability:** The WhatsApp proxy endpoint (`/api/whatsapp/send`) was configured to fall back to server-side credentials (`process.env.META_WHATSAPP_TOKEN`) without enforcing any authentication or authorization on incoming requests.
**Learning:** Any unauthenticated endpoint that acts as a proxy by wrapping internal API keys and making requests to a third-party service creates an Open Relay / SSRF vulnerability, allowing attackers to abuse the server's identity and quota.
**Prevention:** Always mandate strict authentication (e.g., verifying against an `API_SECRET` environment variable or checking for an active user session) whenever falling back to server-stored secrets or impersonating internal backend services. Never fail open if configuration like `API_SECRET` is missing.
