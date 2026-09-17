## 2024-11-20 - Using `title` + `aria-label` for Native Tooltips & Accessibility

**Learning:** Sighted mouse users often struggle to identify the purpose of icon-only buttons without tooltips, and screen readers fail entirely without accessible names.
**Action:** Always add both `title` (for lightweight, native hover tooltips) and `aria-label` (for screen readers) to icon-only buttons when custom tooltip components are unnecessary or overkill.
