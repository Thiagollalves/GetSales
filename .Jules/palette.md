## 2024-05-18 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found a recurring pattern in `components/dashboard/inbox/chat-window.tsx` where icon-only Action buttons (e.g., `<Button size="icon"><Icon /></Button>`) are missing `aria-label` attributes, rendering them inaccessible to screen readers.
**Action:** Always verify that `<Button>` elements using the `size="icon"` variant include descriptive, localized `aria-label` attributes.
