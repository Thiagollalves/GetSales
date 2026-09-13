## 2024-03-20 - [React.memo for Frequent Local State Updates]
**Learning:** In components like `ChatWindow` that render lists and have frequent local state updates (like a text input firing onChange events on every keystroke), the entire component and its children will re-render by default. This causes an O(N) performance bottleneck for long lists like message histories.
**Action:** Always utilize `React.memo` for list item components (like `MessageBubble`) when they are rendered alongside frequent local state updates to prevent unnecessary re-renders of the entire list.
