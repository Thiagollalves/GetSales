## 2024-09-02 - Icon-Only Button Accessibility Pattern
**Learning:** Found a common accessibility issue pattern across this application's UI components where icon-only buttons (like those for voice/video calls, attachments, and emojis in the chat window) are completely missing `aria-label` attributes. This renders them unusable for screen reader users.
**Action:** Proactively ensure all future icon-only buttons receive descriptive `aria-label`s as a standard practice for this codebase.
