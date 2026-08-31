## 2025-02-12 - Icon-only buttons lacking accessibility labels in `chat-window.tsx`
**Learning:** Found multiple instances of icon-only action buttons (e.g., Phone, Video, Send) lacking accessible names, which are commonly found in rich interactive components like a chat UI.
**Action:** Always ensure that any action button composed purely of an icon includes a descriptive `aria-label` or visually hidden text for screen readers. Check other interactive components like Dashboards or builders for similar patterns.
