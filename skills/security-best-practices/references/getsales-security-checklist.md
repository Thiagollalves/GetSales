# GetSales Security Checklist

Use this checklist for GetSales code paths that touch authentication, APIs, Supabase, Meta WhatsApp Cloud API, webhooks, n8n, or sensitive user/customer data.

## Attack Surface Map

Start with these areas:

| Area | Typical files | Review focus |
| --- | --- | --- |
| Admin auth | `lib/admin-auth.ts`, `app/api/auth/*`, `app/dashboard/layout.tsx` | Credential source, cookie flags, session signature, fallback behavior |
| Mutating APIs | `app/api/chatbots/*`, `app/api/whatsapp/send/route.ts` | Authorization before side effects, payload limits, error shape |
| Public webhook | `app/api/whatsapp/webhook/route.ts`, `lib/meta-webhook.ts` | Verify token, raw-body signature, replay/size/log behavior |
| Supabase admin | `lib/supabase/server.ts`, `lib/chatbots.ts`, webhook routes | Service-role containment, server-only usage, RLS assumptions |
| n8n forwarding | `N8N_WEBHOOK_URL`, WhatsApp webhook route | Destination trust, payload minimization, failure handling |
| Client storage | dashboard components, docs | Avoid secrets, tokens, or long-lived sensitive customer data in browser storage |

## Admin Auth

- Require `ADMIN_ACCESS_USERNAME` and `ADMIN_ACCESS_TOKEN` for any production-ready posture.
- Flag hard-coded or fallback credentials (`admin`, `123456`) as high severity when production is in scope.
- Keep session cookies `httpOnly`, `sameSite: "lax"` or stricter, `path: "/"`, and `secure` in production.
- Check that session tokens are HMAC-signed and verified with timing-safe comparison.
- Avoid accepting a raw admin token as a session token unless explicitly documented as a development-only fallback.
- Do not return whether the username or password was wrong.
- Consider brute-force controls for `/api/auth/login`: rate limiting, lockout, or provider-level protection.

## API Routes

- Authorize before parsing expensive payloads, calling external APIs, writing to Supabase, or forwarding to n8n.
- Validate method, content type, required fields, lengths, formats, and enum values.
- Normalize phone numbers and enforce realistic E.164 length before calling Meta.
- Limit message length before external API calls; WhatsApp text payloads should stay within provider limits.
- Keep external provider error details out of client responses if they may include tokens, account IDs, internal URLs, or operational context.
- Use generic 500 responses and structured server logs with redaction.

## Meta WhatsApp Webhook

- For `GET` verification, compare `hub.verify_token` with `META_VERIFY_TOKEN` and return only the challenge on success.
- For `POST`, read the raw body first and verify `x-hub-signature-256` with `META_APP_SECRET` before JSON parsing or side effects.
- Use timing-safe comparison for signatures and reject missing or malformed signatures.
- Avoid logging raw webhook payloads, message text, contacts, phone numbers, or full provider error bodies.
- Consider request body size limits and replay protection if the deployment platform does not provide them.
- Forward only the data n8n actually needs; avoid sending full raw payloads unless explicitly required.

## Supabase

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never import server admin clients into client components.
- Prefer narrow write shapes; do not insert entire raw provider payloads unless there is a retention reason.
- Confirm migrations define ownership, indexes, and RLS policy expectations. If service-role bypasses RLS, state that clearly in reports.
- Treat missing Supabase config differently in development and production. Silent fallbacks are acceptable only for local demos.

## Secrets And Config

- Search for secrets in code, docs, tests, examples, localStorage, and client-exposed env names.
- `NEXT_PUBLIC_*` variables are client-visible; never put secret material there.
- Redact tokens, signatures, cookie values, phone numbers, emails, and message bodies in findings and logs.
- Mention rotation when a real secret appears in a tracked file or console output.

## Reporting Severity

- Critical: direct secret exposure, unauthenticated write/send action, signature bypass on public webhook, service-role exposure to client.
- High: production default credentials, missing authorization on mutating API, raw sensitive payload logging, unsafe token fallback.
- Medium: weak validation, overly detailed provider errors, missing rate limit on login/send endpoint, broad n8n payload forwarding.
- Low: missing security comments, unclear config docs, minor hardening gaps with low exploitability.
