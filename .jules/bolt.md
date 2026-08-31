## 2024-05-18 - [Derived State Memoization]
**Learning:** Computations like Set, Array.from, and filtering array operations can often run unnecessarily inside component render functions if they are unmemoized, impacting UI performance especially when arrays get large.
**Action:** Identify expensive state derivations and array manipulations inside component renders and wrap them with `useMemo` hooks, specifying correct dependencies.
