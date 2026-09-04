## 2023-11-20 - Memoizing Message Components
**Learning:** In chat applications, controlled inputs updating state on every keystroke cause re-renders of the entire parent component. If large child components (like a conversation history containing many message bubbles) are not memoized, they re-render continuously, creating significant input lag.
**Action:** Always wrap list items or expensive child components with `React.memo` when their parent component's state updates frequently (like from a text input).
