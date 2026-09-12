
## 2024-09-12 - Memoize list items dependent on local state
**Learning:** Component list elements (like `MessageBubble` in chat windows) that sit in the same component as highly volatile local state (like text input) can cause significant O(N) performance bottlenecks as they unnecessarily re-render on every keystroke.
**Action:** Always wrap such list elements in `React.memo` to skip re-rendering when their props haven't changed.
