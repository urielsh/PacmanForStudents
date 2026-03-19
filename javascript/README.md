# JavaScript/HTML5 Canvas Pacman

A classic Pacman game built with vanilla JavaScript and the HTML5 Canvas 2D API, designed
as an educational reference for browser-based game development. This implementation is
entirely event-driven: keyboard input arrives via DOM `keydown` listeners, the game loop
runs on `requestAnimationFrame`, and all rendering uses immediate-mode Canvas 2D calls.
There is no compilation step, no bundler, no framework -- you open a single HTML file in
any browser and the game runs.

What makes the JavaScript approach stand out: the browser is the runtime. There is no
`javac`, no `pip install`, no build system of any kind. The project ships as plain `.js`
files loaded by `<script>` tags in `index.html`. The `requestAnimationFrame` API provides
a vsync-aligned, power-efficient game loop that automatically pauses when the tab is
hidden -- a free optimization you get from the platform. Canvas 2D gives you an
immediate-mode drawing surface without a scene graph or DOM manipulation overhead.

---

## Prerequisites

| Tool       | Minimum Version | Check Command          |
|------------|-----------------|------------------------|
| Browser    | Any modern      | Chrome, Firefox, Safari, Edge |
| Node.js    | 16+ (for tests) | `node --version`       |
| npm        | 8+ (for tests)  | `npm --version`        |

The game itself has **zero dependencies** -- only a browser is needed to play. Node.js and
npm are only required if you want to run the Jest test suite.

---

## Quick Start

**Option 1 -- One command** (opens in your default browser):

```bash
bash run.sh
```

**Option 2 -- Open directly:**

Double-click `index.html` or open it in any browser. No server required.

**Option 3 -- Local server** (if file:// protocol causes issues):

```bash
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts.

---

## Architecture Overview

The project contains five source files plus `index.html`. The design follows a strict
separation: **four logic files contain zero DOM, Canvas, or browser API references** --
all rendering is confined to `game.js`. Each logic module uses a dual-export pattern
(CommonJS for Node.js tests, `window` attachment for browser use) so the same code runs
in both environments without a bundler.

```
javascript/
 ├── index.html        Entry point & script loader
 ├── game.js           Rendering, input handling, game loop (requestAnimationFrame)
 ├── game_logic.js     Score tracking, collision detection, update orchestration
 ├── maze.js           Tile-based level data (walls & pellets)
 ├── pacman.js         Player entity (position, direction, input buffering)
 └── ghost.js          NPC entity (position, color, random AI)
```

### Class Diagram

```
┌──────────────┐       ┌────────────────────────────┐
│  index.html  │──────>│         game.js             │
│ (loads all   │       │  - canvas / ctx             │
│  scripts)    │       │  - drawMaze(), drawPacman() │
└──────────────┘       │  - drawGhosts(), drawHUD()  │
                       │  - gameLoop() via rAF       │
                       └──────────┬─────────────────-┘
                                  │ calls
                     ┌────────────┼────────────┐
                     v            v            v
              ┌──────────┐  ┌──────────┐  ┌───────────┐
              │  Pacman   │  │  Ghost   │  │ GameLogic │
              │ - gridX   │  │ - gridX  │  │ - score   │
              │ - gridY   │  │ - gridY  │  │ - maze    │
              │ - update()│  │ - update()│  │ - update()│
              └──────────┘  └──────────┘  │ - _check   │
                                          │  Collisions│
                                          └─────┬──────┘
                                                │ owns
                                                v
                                           ┌─────────┐
                                           │  Maze    │
                                           │ - walls  │
                                           │ - pellets│
                                           │ - isWall()
                                           │ - hasPellet()
                                           └─────────┘
```

**Data flow each frame:**
1. DOM `keydown` event fires asynchronously, calls `pacman.setDirection()` to buffer input
2. `requestAnimationFrame` fires `gameLoop()` -- throttled to 60 FPS
3. `gameLogic.update()` advances Pacman, then each Ghost, then checks collisions
4. Canvas is cleared to black and redrawn from scratch (maze, entities, HUD)
5. If `gameOver` is true, "GAME OVER" overlay renders and the rAF chain stops

---

## Things to Notice

### requestAnimationFrame vs setInterval

The game loop uses `requestAnimationFrame` (rAF) rather than `setInterval` or
`setTimeout`. rAF is called by the browser before each screen repaint (~60 Hz), passing
a high-resolution timestamp. The loop throttles to `TARGET_FPS` by skipping frames that
arrive too early. rAF automatically pauses when the tab is hidden, saving CPU and battery.
Compare with Java's `javax.swing.Timer` (fixed-delay, not vsync-aligned) and Python's
`clock.tick(60)` (blocks the thread with a busy-wait).

### Canvas 2D Rendering Pipeline

Every frame follows the same pattern: clear the entire canvas to black, then draw walls
(`fillRect`), pellets (`arc` + `fill`), Pacman (yellow circle), ghosts (colored
rectangles with white circle eyes), and the HUD (`fillText`). This is immediate-mode
rendering -- there is no retained scene graph, no sprite objects, no display list. You
draw pixels directly each frame and start from scratch the next.

### DOM Event-Driven Input

Keyboard input arrives via a `document.addEventListener('keydown', ...)` callback that
runs asynchronously between animation frames. This is a push model -- the browser queues
events and dispatches them on the main thread. Compare with Python's pygame, which uses a
pull model (polling `pygame.event.get()` each frame). JavaScript's approach means no
explicit polling is needed and no inputs are missed between frames.

### No Compilation Step

There is no transpiler, no bundler, no build step. The `.js` files are loaded directly
via `<script>` tags in order of dependency. You edit `ghost.js`, refresh the browser, and
see your changes immediately. The tradeoff: dependency ordering is manual (the HTML must
load `maze.js` before `game_logic.js`), and errors are only caught at runtime.

### Prototype-Based OOP with ES6 Classes

The code uses ES6 `class` syntax (`class Maze {}`, `class Ghost {}`), which is syntactic
sugar over JavaScript's prototype-based inheritance. Properties prefixed with `_` signal
"private by convention" (not enforced by the language), and `get` accessors provide
read-only public access. Compare with Java's `private` keyword (compiler-enforced) and
Python's `@property` decorator (same convention, different syntax).

---

## Exercises

These exercises build on the existing code in increasing order of difficulty.

### 1. Add Touch Controls for Mobile

**Goal:** Make the game playable on phones and tablets using swipe gestures.

**Approach:** Listen for `touchstart` and `touchend` events on the canvas. Compute the
swipe direction from the delta between start and end coordinates. Call
`pacman.setDirection()` with the appropriate `(dx, dy)`.

**Hints:**
- Use `e.touches[0].clientX` and `e.touches[0].clientY` to get touch coordinates.
- Determine the dominant axis: if `|deltaX| > |deltaY|`, it is a horizontal swipe.
- Call `e.preventDefault()` on `touchmove` to prevent the page from scrolling.
- Add the listeners in `game.js` alongside the existing `keydown` handler.
- Test with Chrome DevTools mobile emulation (toggle device toolbar).

### 2. Implement localStorage High Scores

**Goal:** Persist the top 5 scores across browser sessions using the Web Storage API.

**Approach:** When the game ends, read the current high scores from `localStorage`,
insert the new score if it qualifies, and write the updated list back. Display the high
score table on the game-over screen.

**Hints:**
- `localStorage.getItem('highScores')` returns a JSON string or `null`.
- Parse with `JSON.parse()`, default to an empty array if `null`.
- Sort descending, slice to top 5, save with `localStorage.setItem('highScores', JSON.stringify(scores))`.
- Draw each score with `ctx.fillText()` below the "GAME OVER" text.
- Consider adding a player name prompt using `window.prompt()`.

### 3. Add CSS Animations for Game Over

**Goal:** Replace the static "GAME OVER" canvas text with an animated HTML overlay using
CSS transitions or keyframe animations.

**Approach:** Create a hidden `<div>` in `index.html` with the game-over message. When
`gameLogic.gameOver` becomes true, remove the `hidden` class to trigger a CSS animation
(fade-in, scale-up, or slide-down). Position the overlay absolutely over the canvas.

**Hints:**
- Use `position: absolute` on the overlay and `position: relative` on a wrapper `<div>`.
- Define a `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }` animation.
- In `game.js`, replace `drawGameOver()` with `document.getElementById('gameOverOverlay').classList.remove('hidden')`.
- Add a "Play Again" button inside the overlay that calls `location.reload()`.
- This exercise bridges Canvas rendering with DOM manipulation -- a useful pattern for HUD
  elements in Canvas-based games.

---

## File Reference

| File | Lines | Description |
|------|-------|-------------|
| `index.html` | ~39 | Entry point. Loads all scripts in dependency order via `<script>` tags. Sets up the Canvas element and minimal CSS (black background, centered layout). |
| `game.js` | ~312 | Rendering and game loop. Owns the Canvas 2D context, draws maze/entities/HUD each frame, handles keyboard input via DOM events, and runs the rAF loop with 60 FPS throttling. The only file that touches browser APIs. |
| `game_logic.js` | ~137 | Rules engine. Creates and owns the Maze, Pacman, and four Ghosts. Orchestrates per-tick updates and checks pellet collection and ghost collisions. Zero browser API imports. |
| `maze.js` | ~133 | Level data model. Stores walls and pellets on a 40x30 grid using 2D arrays. Provides `isWall()`, `hasPellet()`, and `removePellet()` query methods. Zero browser API imports. |
| `pacman.js` | ~111 | Player entity. Stores grid position and implements input buffering (queued direction tried first, current direction as fallback). Zero browser API imports. |
| `ghost.js` | ~107 | NPC entity. Stores grid position, name, and CSS color string. Moves randomly every 20 frames via frame-counting. Zero browser API imports. |

---

## Running Tests

The project includes 38 Jest tests across four test files covering all logic modules.

```bash
npm install        # Install Jest + jsdom (dev dependencies only)
npm test           # Run all 38 tests with verbose output
```

Test files mirror source files: `maze.test.js`, `pacman.test.js`, `ghost.test.js`, and
`game_logic.test.js`. The tests use the `jsdom` environment so Node.js can run code that
checks for `window` and `module` without a real browser.

---

## Cross-Language Notes

This project implements the same Pacman game in multiple languages. Here is how JavaScript
compares on the key architectural decisions:

| Concept | Java / Swing | Python / Pygame | JavaScript / Canvas |
|---|---|---|---|
| **Entry point** | `main()` + `SwingUtilities.invokeLater()` | `pygame.init()` + `if __name__` | `<script>` tags + IIFE in `game.js` |
| **Game loop** | `javax.swing.Timer` with fixed delay | `while True` + `Clock.tick(60)` | `requestAnimationFrame` + timestamp throttle |
| **Rendering** | Override `paintComponent(Graphics2D)` | `pygame.draw.*` + `display.flip()` | Canvas 2D `fillRect()`, `arc()`, `fillText()` |
| **Input** | `KeyListener` interface (EDT push) | `pygame.event.get()` polling (pull) | `addEventListener('keydown')` (async push) |
| **Type system** | Compile-time enforced | Dynamic (optional hints) | Dynamic (no standard type layer) |
| **Build system** | Maven (`pom.xml`, `mvn compile`) | None (`python3 main.py`) | None (open `index.html`) |
| **Entity design** | One class per file, `private` + getters | Classes with `@property`, duck typing | ES6 classes, `_` convention + `get` accessors |
| **Module system** | Packages + `import` statements | `import` / `from ... import` | `<script>` load order + dual-export pattern |
| **Test framework** | JUnit | pytest | Jest (jsdom) |
