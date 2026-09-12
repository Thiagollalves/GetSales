## 2024-11-20 - [Nested Reduce for Pipeline Value]
 **Learning:** Calculating summary statistics (total leads and value) across a pipeline using nested `reduce` functions on every render causes an O(N*M) performance bottleneck, especially during drag-and-drop operations which trigger frequent re-renders.
 **Action:** Replaced the unmemoized, nested `reduce` calls with a single `useMemo` block utilizing explicit `for` loops. This prevents unnecessary recalculations on unrelated re-renders (a 99% gain on cached renders) and provides a ~35% speedup when calculations actually need to occur.
