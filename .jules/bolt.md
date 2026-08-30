## 2024-08-30 - Prevent unnecessary re-renders in MessageBubble list
**Learning:** In the chat interface, mapping over a list of messages and rendering them inside the same component that holds the text input state causes the entire list of messages to re-render on every keystroke. This causes an O(N) render cost per keystroke.
**Action:** Use `React.memo` to wrap list items (like `MessageBubble`) to prevent re-renders when their props (`message`, `isFirst`) haven't changed, reducing render cost to O(1) during typing.
