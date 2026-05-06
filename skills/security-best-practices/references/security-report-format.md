# Security Report Format

Use this format when the user asks for a security audit, vulnerability report, hardening report, or executive summary.

## Report Template

```markdown
# GetSales Security Report

## Executive Summary
- Overall risk: Critical | High | Medium | Low
- Scope reviewed: files, routes, features, or commit range
- Highest-risk area:
- Immediate action:

## Findings

### [GS-SEC-001] Short finding title
- Severity: Critical | High | Medium | Low
- Evidence: `path/to/file.ts:line`
- Impact: What an attacker or unauthorized user can do.
- Why it matters: Tie the behavior to GetSales data, WhatsApp sending, Supabase writes, admin access, or webhook processing.
- Recommended fix: Smallest safe correction.
- Verification: Test, lint, manual request, or config check that proves the fix.

## Positive Controls Observed
- Existing security controls worth preserving.

## Residual Risks
- Risks not fully provable from code inspection, such as provider dashboard settings, deployed environment variables, WAF/rate limiting, TLS headers, or Supabase project policies.

## Suggested Next Steps
1. Highest-priority fix.
2. Follow-up hardening.
3. Monitoring or operational task.
```

## Finding Rules

- Put findings before summaries in code-review style responses unless the user explicitly asks for an executive-first report.
- Use file and line references for every code finding.
- Avoid vague findings such as "improve security"; name the exploitable behavior.
- Do not include real secret values in the report. Write `[redacted]` and recommend rotation.
- If a finding depends on deployment config that is not visible, mark it as an assumption or residual risk.
- Include tests or verification for every recommended code fix.
