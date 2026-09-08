## 2023-10-27 - [Memoize List Items to Prevent Input Re-renders]
**Learning:** In the ChatWindow component, typing in the input field causes the entire component to re-render, which includes mapping over the entire message list. This O(N) re-render behavior can cause noticeable input lag for long conversations.
**Action:** Always verify if text inputs are localized to their own component or if they live alongside large lists. When they live alongside large lists, use React.memo on the list item components (like MessageBubble) to prevent them from re-rendering on every keystroke.
