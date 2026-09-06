## 2026-09-06 - [Chat Window MessageList Re-Renders]
**Learning:** The ChatWindow component was re-rendering the entire list of messages (O(N) operation) on every keystroke because the `message` text input state lived in the same component, causing all `MessageBubble` children to re-render.
**Action:** Use `React.memo` on list items (like `MessageBubble`) that rely on local component state updates (like text input causing re-renders) to prevent O(N) performance bottlenecks in long unified inbox conversations.
