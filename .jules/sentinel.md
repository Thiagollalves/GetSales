## 2024-05-24 - Hardcoded Admin Credentials Bypass
**Vulnerability:** An authentication check function (`hasAdminAccessToken`) ended with an unconditional `return true`, allowing a complete authentication bypass if configuration variables were absent.
**Learning:** Security-critical functions, especially authorization and authentication checks, must default to a secure state (e.g., `false`, or throw an error) if conditions are not explicitly met. Failing "open" is a critical vulnerability.
**Prevention:** Always write defensive code where the final return statement in an authentication function is `false` (fail-closed), unless explicitly returning `true` inside a strictly validated condition block.
