# Tradeoff Analysis: Iframe vs Inline Game Embedding

**Date:** 2026-03-19
**Status:** Decided
**Decision:** Iframe

---

## Context

The Packman website embeds up to 5 game implementations (C++, Python, Java, JavaScript, TypeScript) into a single-page or multi-page site. Each game was written as a standalone application with its own global variables, keyboard listeners, and game loops. We need to decide how to embed these games into the website's HTML.

Two approaches: **iframe** (each game in its own sandboxed frame) or **inline** (load game scripts directly into the main page's DOM).

## The Global State Problem

Each game implementation was written as a standalone application. They declare globals freely:

| Implementation | Known Globals | Keyboard Listeners |
|---|---|---|
| JavaScript | `Maze`, `Pacman`, `Ghost`, `gameLoop`, `canvas`, `ctx` | `document.addEventListener('keydown', ...)` |
| TypeScript | Same as JS (compiled output) | Same |
| C++ (Emscripten) | `Module`, `_main`, `HEAP8/16/32`, `canvas` | Emscripten input handler on `canvas` element |
| Python (pygbag) | `window.Maze`, `window.Pacman` via Pyodide | pygame event loop mapped to browser events |
| Java (CheerpJ) | CheerpJ runtime globals, virtual display | CheerpJ virtual keyboard handler |

If two games are loaded inline on the same page, `window.Maze` from the JavaScript version collides with `window.Maze` from the TypeScript version. Keyboard events meant for one game would fire handlers in all loaded games.

## Option A: Iframe Embedding

Each game loads in its own `<iframe>`, creating a completely isolated browsing context.

```html
<iframe
  src="/games/javascript/index.html"
  width="800"
  height="600"
  sandbox="allow-scripts allow-same-origin"
  title="Pacman - JavaScript version"
></iframe>
```

### Pros

| Advantage | Detail |
|---|---|
| **Complete global isolation** | Each iframe has its own `window`, `document`, and JS context. `window.Maze` in one iframe cannot collide with another. |
| **Keyboard listener isolation** | `document.addEventListener('keydown')` in one iframe only captures events when that iframe is focused. No cross-game interference. |
| **Zero game code changes** | All 5 game implementations run exactly as-is. No refactoring of any game source file. |
| **Independent crash isolation** | If the Python runtime crashes, only its iframe dies. The rest of the page and other games remain functional. |
| **Security sandboxing** | `sandbox` attribute restricts what the game can do (no popups, no top-level navigation, no form submission). |
| **Simple integration** | Each game is a self-contained `index.html`. Drop it in a directory and point an iframe at it. |
| **Independent loading** | Each iframe loads independently. Heavy games (Python, Java) can show their own loading indicators without blocking the main page. |

### Cons

| Disadvantage | Detail |
|---|---|
| **Cross-origin communication requires PostMessage** | To report scores, game-over events, or other state from the game to the parent page, we need `window.postMessage()` / `addEventListener('message')`. |
| **Slight memory overhead** | Each iframe creates a separate browsing context. ~2-5 MB overhead per iframe for the JS engine context. Negligible for 1-2 active iframes. |
| **Styling constraints** | Cannot directly style elements inside the iframe from the parent CSS. The game must handle its own sizing. |
| **Focus management** | User must click into the iframe to give it keyboard focus. Requires a visual hint ("Click to play") or programmatic `iframe.focus()`. |
| **Accessibility** | Screen readers may struggle with iframe boundaries if not properly labeled with `title` attribute. |

### PostMessage Protocol for Score Communication

```javascript
// Inside game iframe (game code addition - optional, ~5 lines):
window.parent.postMessage({
  type: 'packman-score',
  language: 'javascript',
  score: currentScore,
  level: currentLevel
}, '*');

// Parent page:
window.addEventListener('message', (event) => {
  if (event.data.type === 'packman-score') {
    updateScoreboard(event.data.language, event.data.score);
  }
});
```

This is the only code change needed in game files -- and it is **optional**. The games work perfectly without it; PostMessage is only needed if we want a unified scoreboard on the parent page.

## Option B: Inline Embedding

Load game scripts directly into the main page via `<script>` tags or dynamic `import()`.

### What Would Be Required

To avoid global collisions, **all 5 game entry points** would need to be refactored:

1. **Wrap each game in an ES module or IIFE** to prevent global leakage.
2. **Namespace all globals**: `window.Maze` becomes `PackmanJS.Maze`, etc.
3. **Scope keyboard listeners** to a specific canvas element, not `document`.
4. **Coordinate game loops** so only the active game's `requestAnimationFrame` runs.
5. **Manage canvas contexts** -- ensure each game draws to its own canvas, not a shared one.

### Estimated Refactoring Scope

| Implementation | Files to Modify | Lines to Change | Difficulty |
|---|---|---|---|
| JavaScript | 4-5 source files | ~100-150 lines | Medium -- straightforward namespace wrapping |
| TypeScript | 4-5 source files | ~100-150 lines | Medium -- similar to JS |
| C++ (Emscripten) | Emscripten build flags + glue code | ~50 lines | Hard -- Emscripten assumes it owns `Module` and the canvas |
| Python (pygbag) | pygbag configuration + game files | ~80 lines | Hard -- pygbag manages its own runtime initialization |
| Java (CheerpJ) | CheerpJ init code | ~20 lines | Easy -- CheerpJ already targets a specific div |

**Total estimated effort: 3-5 days of refactoring and testing across all 5 implementations.**

### Pros

| Advantage | Detail |
|---|---|
| **Single browsing context** | Slightly lower memory usage (saves ~10-25 MB across 5 iframes). |
| **Direct DOM access** | Parent page can directly read game state without PostMessage. |
| **No focus management** | Keyboard events are in the same context, so no "click to play" needed (but collision problem remains). |

### Cons

| Disadvantage | Detail |
|---|---|
| **3-5 days of refactoring** | All 5 game implementations need significant changes to avoid global collisions. |
| **Fragile** | Any new global added to a game in the future breaks the inline approach. Ongoing maintenance burden. |
| **Keyboard listener conflicts** | Even with scoped listeners, edge cases arise (e.g., arrow keys scrolling the page while also controlling the game). |
| **Emscripten does not play well with others** | Emscripten assumes a single `Module` object and sole ownership of the canvas. Running two Emscripten apps on one page is officially unsupported. |
| **Breaks game code authenticity** | The "view source" experience now shows module wrappers and namespacing that do not exist in the original educational code. |
| **No crash isolation** | A Python runtime crash can take down the entire page. |

## Side-by-Side Comparison

| Criterion | Iframe | Inline |
|---|---|---|
| Game code changes | **0 files** (PostMessage is optional) | **~20 files across 5 implementations** |
| Global isolation | Automatic | Manual (requires refactoring) |
| Keyboard isolation | Automatic (on focus) | Manual (requires scoped listeners) |
| Crash isolation | Yes | No |
| Score communication | PostMessage (~10 lines) | Direct access |
| Implementation effort | ~2 hours | ~3-5 days |
| Ongoing maintenance | None | Must audit every game change for global leaks |
| Emscripten compatibility | Full | Officially unsupported with multiple modules |
| Memory overhead | ~10-25 MB total | ~0 MB |

## Decision

**Iframe.**

The case is overwhelming. Iframe embedding requires zero changes to game code, provides automatic isolation of globals and keyboard listeners, and takes 2 hours to implement vs 3-5 days for the inline approach. The only real cost -- PostMessage for score communication -- is ~10 lines of optional code.

The inline approach requires refactoring all 5 game implementations, introduces ongoing maintenance burden, is officially unsupported for Emscripten multi-instance scenarios, and removes crash isolation. The ~10-25 MB memory savings is irrelevant on any device manufactured in the last decade.

### Implementation Plan

1. Each game implementation gets its own `index.html` in `/games/{language}/`.
2. The main site page embeds the active game via `<iframe src="/games/{language}/index.html">`.
3. Switching languages swaps the iframe `src` attribute.
4. Optional: Add PostMessage score reporting (~5 lines per game) for a unified scoreboard.
5. Add `title` attribute to each iframe for accessibility.
6. Add a "Click to play" overlay or auto-focus the iframe on language selection.
