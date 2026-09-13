## 2024-05-24 - Missing aria-labels on icon-only buttons
**Learning:** Icon-only buttons using Lucide React icons within the dashboard chat interface (`chat-window.tsx`) frequently miss `aria-label` attributes, creating accessibility barriers for screen reader users. The application UI uses Portuguese localization, so labels must match the local language (e.g., "Chamada de voz").
**Action:** Proactively scan for and add localized `aria-label` attributes to any icon-only `<Button>` or interactive elements across the dashboard components to ensure screen reader accessibility.
