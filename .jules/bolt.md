## 2024-05-24 - [React.memo in Chat Windows]
**Learning:** In chat interfaces, input state changes (like typing a message) can trigger re-renders of the entire message history if child components are not memoized, causing O(N) re-renders for every keystroke.
**Action:** Always verify if list items like `MessageBubble` that are rendered many times are wrapped in `React.memo` to avoid expensive re-renders when parent state updates independently (e.g. text input).
