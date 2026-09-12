## 2026-09-12 - Add Portuguese Aria Labels to Icon-Only Buttons
**Learning:** Icon-only action buttons are used frequently in the inbox components (e.g., chat-window, conversation-list) and are missing aria-labels by default. The application is localized in Portuguese, so accessibility improvements must match the local language.
**Action:** Always proactively verify the presence of 'aria-label' attributes on icon-only buttons like those in shadcn-ui/Radix UI across the dashboard. Ensure that any added text elements match the application's localization language (Portuguese).
