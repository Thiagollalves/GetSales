## 2024-05-15 - [Open Relay Vulnerability in WhatsApp Proxy]
**Vulnerability:** The WhatsApp send message endpoint (`app/api/whatsapp/send/route.ts`) fell back to server-stored Meta API tokens without authenticating the requesting client. This allowed arbitrary users to send WhatsApp messages using the server's credentials.
**Learning:** Proxy endpoints that optionally accept client credentials but fall back to server credentials MUST strictly authenticate the caller before utilizing the server's secrets, otherwise they expose an Open Relay vulnerability.
**Prevention:** Always require an authentication token (e.g., matching an `API_SECRET` environment variable) on proxy endpoints if the server's stored credentials are being utilized.
