## 2026-08-30 - Prevent SSRF in WhatsApp API
**Vulnerability:** Path traversal and Server-Side Request Forgery (SSRF) was possible in the WhatsApp message sending endpoint (`/api/whatsapp/send`) due to unsanitized `phoneId` input from the user payload being directly interpolated into the Meta Graph API URL.
**Learning:** External IDs passed from clients must be strictly validated before being used to construct outbound request URLs, even if they default to environment variables.
**Prevention:** Implement strict regex validation (e.g., `/^\d+$/`) to ensure numeric IDs and phone numbers contain only expected characters before URL construction.
