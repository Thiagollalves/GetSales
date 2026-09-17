## 2024-05-18 - Optimize list rendering with React.memo and useCallback
**Learning:** In lists with frequent state updates (like `ConversationList` when a selection changes), an inline function or failure to memoize individual items can cause the entire list to re-render in an O(N) bottleneck.
**Action:** Extract list items into `React.memo` wrapped components (e.g., `ConversationItem`), pass specific boolean props for selection state (e.g., `isSelected`), and stabilize parent callbacks using `useCallback` to prevent unnecessary re-renders of unaffected items.
