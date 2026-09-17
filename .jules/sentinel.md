## 2024-05-18 - Input Validation for External Requests
**Vulnerability:** Unvalidated user inputs (`phone` and `resolvedPhoneId`) were interpolated into an external fetch URL and JSON payload, introducing risks of Server-Side Request Forgery (SSRF), Path Traversal, and payload injection.
**Learning:** Even internal backend routes calling third-party services (like the Meta Graph API) must strictly validate the format of user-provided data, especially when those routes can be hit from the frontend.
**Prevention:** Implement strict regex validation for numeric and formatting constraints (e.g., E.164 phone formats and numeric IDs) before interpolating inputs into URLs or passing them to external endpoints.
