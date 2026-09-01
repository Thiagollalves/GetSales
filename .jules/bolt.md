## 2024-05-18 - String allocation in map/filter loops
**Learning:** String operations like `.toLowerCase()` inside tight `.filter` or `.map` loops cause unnecessary allocations on every iteration (O(n) operations).
**Action:** Always extract constant operations outside of the loop and memoize the resulting arrays when filtering large lists based on search terms.
