## 2024-05-24 - [O(N) List Re-renders in Inbox]
 **Learning:** Frequent local state updates (such as a text input keystroke) inside a parent component that also renders a long, un-memoized list will cause O(N) re-renders, severely degrading performance as the list grows.
 **Action:** Always use `React.memo` for list item components when the parent contains frequent, unrelated state updates.