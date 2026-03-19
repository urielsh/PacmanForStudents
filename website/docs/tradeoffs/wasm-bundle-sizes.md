# Tradeoff Analysis: WASM/Transpiled Bundle Sizes

**Date:** 2026-03-19
**Status:** Decided
**Decision:** Accept all three runtimes; mitigate large bundles with caching and loading UX

---

## Context

Packman ships the same game in three languages (C++, Python, Java), each compiled/transpiled to run in the browser. The bundle sizes differ by two orders of magnitude, which affects first-load experience on slower connections.

## Bundle Size Comparison

| Implementation | Technology | Total Download | Breakdown |
|---|---|---|---|
| C++ | Emscripten (WASM) | ~300 KB | ~180 KB `.wasm` + ~120 KB JS glue |
| Python | pygbag (CPython WASM) | ~18 MB | ~17 MB CPython runtime + ~1 MB game assets/scripts |
| Java | CheerpJ (JVM in WASM) | ~30 MB | ~30 MB runtime loaded from CheerpJ CDN + ~50 KB game `.jar` |

## Loading Time Estimates

Assuming typical real-world throughput (not raw bandwidth):

| Connection | C++ (~300 KB) | Python (~18 MB) | Java (~30 MB) |
|---|---|---|---|
| 3G (1 Mbps effective) | ~2.4 s | ~144 s (~2.4 min) | ~240 s (~4 min) |
| 4G (10 Mbps effective) | ~0.24 s | ~14.4 s | ~24 s |
| Broadband (50 Mbps effective) | ~0.05 s | ~2.9 s | ~4.8 s |

### Key Observations

- **C++** is essentially instant on any connection. No mitigation needed.
- **Python** is painful on 3G but manageable on 4G with a progress indicator.
- **Java** is the heaviest, but CheerpJ serves from their CDN with HTTP/2, edge caching, and Brotli compression, which reduces effective transfer to roughly 10-12 MB compressed.

## Caching Strategies

### Browser Cache (All Implementations)

After the first load, the browser caches all assets. Subsequent visits load from disk cache in under 1 second regardless of connection speed. This is the single most important mitigation: **the large download is a one-time cost**.

- CheerpJ CDN assets are served with `Cache-Control: max-age=31536000` (1 year, immutable content hash in URL).
- pygbag WASM bundles can be served with the same long-lived cache headers from our own Nginx.
- Emscripten output is small enough that caching is a nice-to-have, not a necessity.

### Service Worker Pre-caching (Optional Enhancement)

A service worker could pre-cache the Python and Java runtimes in the background while the user reads the landing page or plays the C++ version. This would make the heavier versions feel instant when the user navigates to them.

**Estimated implementation effort:** ~2 hours for a basic `workbox` setup.

**Decision:** Deferred. Not needed for launch. The loading indicator provides sufficient UX.

### CDN for Self-hosted Assets

The C++ and Python builds are self-hosted. Placing them behind a CDN (e.g., Cloudflare free tier) would add edge caching and Brotli compression.

- pygbag ~18 MB compresses to ~6 MB with Brotli, cutting 4G load time from ~14 s to ~5 s.
- C++ is already small enough that CDN is unnecessary.

**Decision:** Recommended for production but not required for the educational demo.

## Loading Indicator UX

For Python and Java versions, a loading indicator is essential. The design:

```
+------------------------------------------+
|                                          |
|        [Pacman chomping animation]       |
|                                          |
|     Loading Python runtime...            |
|     [================>       ] 67%       |
|     12.1 MB / 18.0 MB                   |
|                                          |
|     First load only - cached after this  |
|                                          |
+------------------------------------------+
```

### Requirements

1. **Progress bar with percentage** -- not a spinner. Users tolerate waits better when they see progress.
2. **Show MB downloaded / total MB** -- sets expectations for the wait.
3. **"First load only" message** -- reassures users this is not the permanent experience.
4. **Animated Pacman** -- keeps the page feeling alive and on-brand.
5. **Graceful timeout** -- after 60 seconds with no progress, show a retry button and suggest trying on a faster connection.

### Implementation Notes

- pygbag exposes download progress events that can drive the progress bar.
- CheerpJ provides `cheerpjInit()` which returns a Promise; progress can be approximated by tracking `PerformanceObserver` resource timing entries.
- Emscripten's `Module.setStatus` callback provides native progress reporting.

## Pros and Cons of Accepting All Three Runtimes

### Pros

- **Educational completeness**: Showing the same game in C++, Python, and Java is the core value proposition of Packman. Dropping any language undermines the project's purpose.
- **Caching eliminates repeat-visit pain**: The large download is a one-time cost per browser.
- **CheerpJ CDN offloads bandwidth**: The heaviest runtime (Java) does not consume our hosting bandwidth.
- **Progressive engagement**: Users on slow connections can start with the C++ version (instant) and let the others cache in the background.

### Cons

- **First-visit 3G experience for Python/Java is poor**: 2-4 minute waits are likely to cause abandonment.
- **Mobile data costs**: 18-30 MB downloads may matter to users on metered connections.
- **Perceived complexity**: Loading indicators add UI surface area to maintain.

## Decision

**Accept all three runtimes.** The educational mission requires all three languages. Mitigate the bundle size disparity through:

1. A polished loading indicator with progress bar and reassuring messaging.
2. Long-lived cache headers on all assets (browser caches after first load).
3. Suggest the C++ version as the default/first experience so users see something instantly.
4. Defer service worker pre-caching and CDN to a future enhancement pass.

The 3G experience is a known limitation that is acceptable for an educational project primarily used on university/home broadband connections.
