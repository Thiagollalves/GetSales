## 2025-03-02 - Optimize findStage with O(1) Map lookup
 **Learning:** In React components that perform frequent list lookups (like during drag and drop events), nested array searches `O(N*M)` can cause significant performance degradation.
 **Action:** Replaced a nested `.find` and `.some` array search with a `useMemo` backed `Map` lookup, reducing complexity from O(N*M) to O(1).
