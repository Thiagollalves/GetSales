## 2024-05-14 - SSRF and Injection in Proxy Routes
**Vulnerability:** Found unvalidated user inputs (phoneId, apiVersion) being interpolated directly into an external API URL (`https://graph.facebook.com/${apiVersion}/${resolvedPhoneId}/messages`) in `app/api/whatsapp/send/route.ts`.
**Learning:** Backend proxy routes that take parameters from the frontend and use them to construct outbound requests must strictly validate and sanitize those inputs to prevent SSRF and injection attacks.
**Prevention:** Always use regex validation or strict typing for URL parameters before interpolating them into outbound request URLs.
