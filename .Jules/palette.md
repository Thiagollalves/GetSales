## 2024-06-25 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Icon-only buttons without `aria-label`s are a common accessibility issue pattern in the application's UI components, breaking support for screen readers. Furthermore, the application's UI is localized in Portuguese, which means these labels must be in Portuguese rather than English.
**Action:** Proactively check for and add localized `aria-label` attributes (e.g. `aria-label="Enviar mensagem"`) to any icon-only `<Button>` or `<button>` components across the application.
