## 2024-05-18 - [React.memo in Chat History List]
**Learning:** Frequent local state updates (e.g. typing text into an input box) can trigger unnecessary re-renders of large lists rendered in the same component. In `ChatWindow`, each keystroke triggered a full re-render of the message history.
**Action:** Always verify if components rendering large lists have local state that updates frequently. If so, move the input state into a dedicated child component or `memo`ize the list/list items to prevent O(N) re-renders.
