## 2024-05-18 - Missing Authentication on Proxy Endpoints (Open Relay)
**Vulnerability:** The `/api/whatsapp/send` endpoint fell back to server-side credentials (`META_WHATSAPP_TOKEN`) when client tokens were missing, allowing unauthenticated public users to send messages using the server's WhatsApp credentials (open relay / SSRF risk).
**Learning:** Proxy endpoints that optionally pass through credentials must strictly authenticate any requests that trigger fallback to server-stored secrets.
**Prevention:** Enforce rigorous authentication (e.g., verifying an `API_SECRET`) on all proxy routes whenever they use server-owned credentials instead of user-provided ones.
