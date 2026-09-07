## 2024-09-07 - Missing Input Validation on External API Proxy
**Vulnerability:** The `/api/whatsapp/send` backend endpoint proxy passed user input directly to an external Meta WhatsApp API without strict validation, risking injection and potential SSRF.
**Learning:** Even when delegating requests to third-party APIs, input must be strictly typed and validated (e.g., regex for phone IDs) before being interpolated into URLs or payloads.
**Prevention:** Always implement strong input validation (like regex for expected formats) on all proxy endpoint parameters.
