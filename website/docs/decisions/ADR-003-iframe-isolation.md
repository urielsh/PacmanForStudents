# ADR-003: iframe Isolation for Game Embeds

**Status:** Accepted
**Date:** 2026-03-19
**Author:** System Architect

## Decision

Embed each game variant (C++/Emscripten, Python/pygbag, Java/CheerpJ) in its own `<iframe>` element with the `sandbox` attribute. Communication between the game iframe and the parent page will use the `window.postMessage` API with a structured message protocol for score reporting and lifecycle events.

The iframe markup will follow this pattern:

```html
<iframe
  src="/games/cpp/index.html"
  sandbox="allow-scripts allow-same-origin"
  loading="lazy"
  title="Pacman - C++ Implementation"
></iframe>
```

The PostMessage protocol will use typed messages:

```typescript
interface GameMessage {
  type: "score_update" | "game_over" | "game_ready" | "game_error";
  payload: {
    score?: number;
    level?: number;
    lives?: number;
    error?: string;
  };
  source: "packman-game";
  variant: "cpp" | "python" | "java";
}
```

## Rationale

The three game variants use fundamentally different WASM runtimes that each inject their own global state into the page:

- **Emscripten** creates a global `Module` object and attaches keyboard/mouse event listeners to `document`.
- **pygbag** initializes a Python runtime with its own event loop and captures keyboard input globally.
- **CheerpJ** installs a JVM runtime that manages its own DOM elements and event handlers.

Running any two of these in the same browsing context would cause:

1. **Keyboard conflicts** -- All three runtimes listen for `keydown`/`keyup` events on `document` or `window`. Arrow keys, WASD, and other game inputs would be captured by whichever runtime registered its listener last, causing unpredictable behavior.
2. **Global namespace collisions** -- Emscripten's `Module` object, pygbag's `__BRYTHON__` / CPython initialization, and CheerpJ's runtime objects would collide in the global scope.
3. **Canvas contention** -- Each runtime expects to control a specific `<canvas>` element. Multiple runtimes attempting to manage the same rendering context would fail.

iframes provide complete DOM and JavaScript isolation by design. Each game runs in its own browsing context with its own `window`, `document`, and event system. No additional sandboxing code is needed -- the browser enforces isolation natively.

The `sandbox` attribute adds defense in depth: `allow-scripts` permits the WASM runtime to execute, and `allow-same-origin` allows the iframe to load assets from the same domain. Other capabilities (forms, popups, top navigation) are blocked by default.

## Alternatives Considered

### Shadow DOM Isolation

Shadow DOM isolates CSS but does not isolate JavaScript. Event listeners attached to `document` or `window` in a Shadow DOM context still operate in the main page's JavaScript scope. Keyboard conflicts and global namespace collisions would persist. Shadow DOM solves a different problem (style encapsulation) and is not a substitute for browsing context isolation.

### Web Workers + OffscreenCanvas

Running each game in a Web Worker with an `OffscreenCanvas` would provide JavaScript isolation without iframes. However, OffscreenCanvas support is incomplete (Safari added support only recently), none of the three WASM toolchains (Emscripten, pygbag, CheerpJ) support OffscreenCanvas as a primary rendering target out of the box, and the integration work would be substantial. This approach trades one complexity (iframes) for a much larger one (custom Worker-based rendering pipelines for three toolchains).

### Single-game-at-a-time with Teardown

Loading only one game variant at a time and fully tearing down its runtime before loading another would avoid conflicts without iframes. However, this prevents side-by-side comparison (a key educational feature), makes switching between variants slow (full WASM reload on each switch), and requires implementing reliable teardown logic for three different runtimes -- each of which may leave behind global state, event listeners, or animation frames.

### Embedding via Web Components with Scoped Scripts

Custom elements (`<packman-game variant="cpp">`) could encapsulate game loading, but Web Components share the same global JavaScript scope as the rest of the page. A custom element cannot prevent Emscripten's `Module` from being global or stop pygbag from attaching document-level keyboard listeners. The encapsulation is cosmetic, not functional.

## Tradeoffs

- **Increased memory usage** -- Each iframe creates a separate browsing context with its own JavaScript heap. Running three games simultaneously (side-by-side comparison) triples the memory footprint compared to a single-context approach. On memory-constrained devices, this may cause performance degradation. Mitigation: default to showing one game at a time with tabs; side-by-side is an opt-in layout.
- **Cross-origin restrictions on same-origin iframes** -- Even with `allow-same-origin`, certain browser security policies (COEP, COOP) may complicate SharedArrayBuffer usage that some WASM runtimes require for threading. The Emscripten build may need to disable pthreads or the server must set appropriate cross-origin headers.
- **Styling constraints** -- The parent page cannot directly style elements inside the iframe. Each game's loading indicator, error state, and canvas sizing must be handled within the iframe's own HTML/CSS. Consistent visual design requires duplicating or sharing stylesheets across the parent and each iframe.
- **PostMessage overhead** -- Score updates and lifecycle events must be serialized through `postMessage`, introducing marginal latency compared to direct function calls. For the low-frequency events in this use case (score changes, game over), this overhead is negligible.
- **Accessibility** -- Screen readers may have difficulty navigating across iframe boundaries. Each iframe must include a descriptive `title` attribute and the parent page should provide sufficient context about what each iframe contains. Keyboard focus management between the game iframe and the surrounding page content requires explicit handling.
