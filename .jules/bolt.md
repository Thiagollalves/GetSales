## 2024-05-18 - Optimize O(N) Re-renders in Dashboard Inbox List
**Learning:** In a dashboard with frequent updates to a central list containing many items, like the `ConversationList` containing real-time incoming chat messages, inline anonymous functions (`(c) => setSelectedId(c.id)`) and unmemoized iteration elements cause O(N) re-renders, stalling the UI during updates.
**Action:** Extract list items into `React.memo` wrapped components and stabilize callback props (e.g. `onSelect`) via `useCallback` in the parent component.
