## 2026-09-03 - [Missing ARIA labels on Icon-only buttons]
**Learning:** Icon-only buttons without `aria-label` attributes are a common accessibility issue pattern across components like the chat-window, negatively impacting screen reader usability. The UI is localized in Portuguese, so accessibility labels should match this language.
**Action:** Always verify icon-only buttons include descriptive `aria-label` attributes mapped to the application's local language (e.g., Portuguese) when building or modifying UI elements.
