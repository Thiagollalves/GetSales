---
name: security-best-practices
description: "Use when working on GetSales cybersecurity/security: seguranca cibernetica, auditoria de seguranca, vulnerabilidade, hardening, secure coding, API security, Next.js, Supabase, WhatsApp webhook, Meta signature, n8n, admin auth, secrets, cookies, or security fixes."
---

# GetSales Security Best Practices

Use this skill to review, design, or fix security-sensitive work in GetSales. Keep the review practical: identify the reachable attack surface, verify controls in code, and report evidence with file/line references.

## Core Workflow

1. Identify the touched surface: Next.js App Router page, API route, auth helper, Supabase client, Meta WhatsApp webhook, n8n forwarding, localStorage, or UI-only code.
2. Load `references/getsales-security-checklist.md` before reviewing or changing security-sensitive code.
3. Load `references/security-report-format.md` when the user asks for an audit, report, findings list, or executive summary.
4. Trace request data from entrypoint to side effect: request body/query/cookie/header -> validation -> authorization -> external API/database/log/response.
5. Classify findings by exploitability and impact. Prefer concrete evidence over generic advice.
6. When fixing code, make the smallest safe change, add or update tests around the security behavior, and avoid leaking secrets in errors or logs.

## GetSales Priorities

- Treat admin auth, WhatsApp send, WhatsApp webhook, Supabase service-role usage, and n8n forwarding as high-risk by default.
- Require explicit authorization on every mutating API route, except public webhook verification endpoints that must instead verify provider tokens/signatures.
- Validate all inbound payloads before external calls or database writes.
- Keep secrets server-only: never expose `SUPABASE_SERVICE_ROLE_KEY`, Meta tokens, app secrets, admin tokens, webhook URLs, or raw authorization headers to client code, logs, or JSON responses.
- Review fallbacks carefully. Development fallbacks such as `admin / 123456` must not silently survive in production security posture unless the user explicitly accepts that risk.

## Output Rules

- For reviews, list findings first, ordered by severity, with file and line references.
- For implementation, explain the security property being preserved in plain language.
- For reports, use the report reference format and include recommended verification commands.
- Do not claim production safety from static inspection alone. State residual risks such as missing runtime config, deployment headers, RLS policies, or provider dashboard settings.
