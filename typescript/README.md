# TypeScript/HTML5 Canvas Pacman

A classic Pacman game built with TypeScript and the HTML5 Canvas 2D API, designed as
an educational reference for game development in a statically typed language that
compiles to JavaScript. This implementation uses the same Canvas rendering pipeline as
the JavaScript version but layers TypeScript's static type system on top: access
modifiers (`private`, `public`, `readonly`) enforce encapsulation at compile time,
explicit return types catch missing code paths, and `readonly` array types prevent
accidental mutation of shared state. The result is the same runtime behavior as plain
JavaScript, with an entire class of bugs eliminated before the code ever reaches a
browser.

What makes TypeScript's approach stand out: you get compile-time error catching without
leaving the JavaScript ecosystem. The same Canvas API, the same `requestAnimationFrame`
loop, the same DOM event model -- but with type safety layered on top via `tsconfig.json`
strict mode. Mistakes like passing a `Ghost` where a `Maze` is expected, accessing a
misspelled property on `CanvasRenderingContext2D`, or pushing into a `readonly` array
are caught instantly by the compiler. The project compiles to a single `dist/bundle.js`
via esbuild, so the browser sees ordinary JavaScript with zero runtime overhead from
types.

---

## Prerequisites

| Tool    | Minimum Version | Check Command      |
|---------|-----------------|--------------------|
| Node.js | 18+             | `node --version`   |
| npm     | 9+              | `npm --version`    |

All other dependencies (TypeScript, esbuild, Vitest) are installed locally via `npm install`.

---

## Quick Start

**Option 1 -- One command** (installs dependencies, builds, and opens in browser):

```bash
bash run.sh
```

**Option 2 -- Manual steps:**

```bash
npm install
npm run build
open index.html        # macOS
xdg-open index.html    # Linux
```

**Type-check without building:**

```bash
npm run typecheck
```

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts.

---

## Architecture Overview

The project contains five source files in `src/`, a `tsconfig.json` for the TypeScript
compiler, and an esbuild script that bundles everything into `dist/bundle.js`. The
design follows the same strict rule as the Java and Python versions: **entity files
have zero rendering or DOM imports** -- all Canvas usage is confined to `game.ts`.

```
typescript/
 ├── src/
 │    ├── game.ts          Rendering, input handling, game loop (Canvas 2D)
 │    ├── game_logic.ts    Tick orchestrator, score tracking, collision detection
 │    ├── maze.ts          Tile-based level data (walls & pellets as boolean[][])
 │    ├── pacman.ts        Player entity (position, direction, input buffering)
 │    └── ghost.ts         NPC entity (position, color, random-walk AI)
 ├── index.html            Host page with <canvas> element
 ├── tsconfig.json         Compiler options (strict mode, ES2020 target)
 ├── package.json          Scripts: build, typecheck, test, start
 ├── vitest.config.ts      Test runner configuration
 └── run.sh                One-command build & launch
```

### Class Diagram

```
┌────────────┐       ┌─────────────┐
│  game.ts   │──────>│  GameLogic   │
│ (entry pt) │       │  - _maze     │
└────────────┘       │  - _pacman   │
                     │  - _ghosts   │
                     │  - update()  │
                     └──────┬───────┘
                            │ calls
               ┌────────────┼────────────┐
               v            v            v
        ┌──────────┐  ┌──────────┐  ┌─────────┐
        │  Pacman   │  │  Ghost   │  │  Maze   │
        │ - _gridX  │  │ - _gridX │  │ - walls │
        │ - _gridY  │  │ - _gridY │  │ - pellets│
        │ - update()│  │ - update()│  │ - isWall()│
        └──────────┘  └──────────┘  │ - hasPellet()│
                                     └─────────┘
```

**Data flow each frame:**
1. `keydown` listener buffers the player's desired direction on `Pacman`
2. `gameLoop()` throttles to 60 FPS via `requestAnimationFrame` + elapsed-time check
3. `GameLogic.update()` advances Pacman, then each Ghost, then checks collisions
4. `game.ts` clears the canvas to black and redraws maze, entities, and HUD from scratch

---

## Things to Notice

### Static Type System

TypeScript adds a full static type system on top of JavaScript. Every variable,
parameter, and return value has an explicit type annotation:

```typescript
private _gridX: number;
public isWall(x: number, y: number): boolean { ... }
public get ghosts(): readonly Ghost[] { ... }
```

These types are erased at compile time -- the emitted JavaScript is identical to what
you would write by hand. The value is entirely in compile-time checking: a misspelled
method on `CanvasRenderingContext2D` or a wrong argument type is caught before the code
ever runs.

### Interfaces for Game Entities

Both `Pacman` and `Ghost` expose `gridX` and `gridY` getters and an `update(maze: Maze)`
method. TypeScript's structural type system means any object with matching shape satisfies
the contract -- no explicit `implements` keyword required (though you could add one for
documentation). This is duck typing with compile-time verification.

### Access Modifiers (private / readonly)

TypeScript provides `private`, `public`, and `protected` keywords enforced at compile
time. Combined with `readonly`, they create clean API boundaries:

```typescript
private readonly _maze: Maze;       // Only GameLogic can access
public readonly width: number;      // Anyone can read, nobody can reassign
private _score: number;             // Only GameLogic can read or write
```

Compare with Java (enforced at compile time AND runtime), Python (convention only via
`_underscore`), and JavaScript (no access modifiers; ES2022 `#field` is runtime-only).

### Compile-Time Error Catching

With `"strict": true` in `tsconfig.json`, the compiler catches:
- Null/undefined access (`strictNullChecks`)
- Implicit `any` types (`noImplicitAny`)
- Wrong argument types passed to functions
- Missing return statements in functions with declared return types
- Assignment to `readonly` fields outside constructors

These are entire categories of bugs that JavaScript discovers only at runtime.

### Type-Safe DOM Access

The Canvas setup demonstrates TypeScript's DOM type definitions:

```typescript
const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
```

The `as HTMLCanvasElement` type assertion and `!` non-null assertion are TypeScript's
escape hatches from strict null checking. The code pairs them with runtime guards
(`if (!canvas) throw ...`) for belt-and-suspenders safety.

---

## Exercises

These exercises build on the existing code in increasing order of difficulty.

### 1. Add a Generic Type for Grid Positions

**Goal:** Replace scattered `number` pairs with a reusable generic `Position<T>` type.

**Approach:** Define a generic interface:

```typescript
interface Position<T extends number = number> {
    readonly x: T;
    readonly y: T;
}
```

Refactor `Pacman` and `Ghost` to store position as `Position` instead of separate
`_gridX`/`_gridY` fields. Update `Maze.isWall()` to accept a `Position` parameter.

**Hints:**
- Start with `type GridPosition = Position<number>` and use it in entity classes.
- The generic constraint `T extends number` prevents accidental `Position<string>`.
- Consider making movement methods return a new `Position` instead of mutating fields
  (functional style).
- Add a utility function: `function adjacent(pos: Position, dx: number, dy: number): Position`.

### 2. Implement Discriminated Union for Game States

**Goal:** Replace the boolean `_gameOver` flag with a type-safe state machine using
TypeScript's discriminated unions.

**Approach:** Define a union type:

```typescript
type GameState =
    | { readonly kind: 'playing'; readonly score: number }
    | { readonly kind: 'paused'; readonly score: number }
    | { readonly kind: 'gameOver'; readonly finalScore: number }
    | { readonly kind: 'won'; readonly finalScore: number };
```

Replace `_gameOver: boolean` and `_score: number` in `GameLogic` with a single
`_state: GameState` field. Use `switch (state.kind)` with exhaustiveness checking
to handle each state.

**Hints:**
- TypeScript narrows the type inside each `case` branch, so `state.finalScore` is
  only accessible in the `gameOver` and `won` branches.
- Add a `never` default case to get compile errors if you add a new state but forget
  to handle it.
- The renderer (`game.ts`) can use the same `switch` to decide what overlay to draw.

### 3. Add Strict Null Checks for All DOM Access

**Goal:** Remove all non-null assertions (`!`) and type assertions (`as`) from
`game.ts`, replacing them with proper narrowing.

**Approach:** Instead of:

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
```

Use type guards:

```typescript
const maybeCanvas = document.getElementById('gameCanvas');
if (!(maybeCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Expected a <canvas> element');
}
const ctx = maybeCanvas.getContext('2d');
if (ctx === null) {
    throw new Error('2D context not supported');
}
```

**Hints:**
- `instanceof HTMLCanvasElement` is a runtime check that TypeScript recognizes as a
  type guard -- after the check, `maybeCanvas` is narrowed to `HTMLCanvasElement`.
- This eliminates the `as` assertion entirely; the compiler verifies the type.
- Apply the same pattern to any other DOM queries in the project.
- Enable `noUncheckedIndexedAccess` in `tsconfig.json` for an extra challenge --
  array access like `this.walls[x][y]` will require explicit undefined checks.

---

## File Reference

| File | Lines | Description |
|------|-------|-------------|
| `src/game.ts` | ~343 | Entry point and renderer. Sets up the HTML5 Canvas, registers keyboard input via `addEventListener('keydown')`, draws maze/entities/HUD each frame, and runs the game loop via `requestAnimationFrame` with a 60 FPS throttle. Only file that touches the DOM or Canvas API. |
| `src/game_logic.ts` | ~196 | Tick orchestrator. Owns the `Maze`, `Pacman`, four `Ghost` instances, score, and game-over flag. Each `update()` call advances Pacman, then ghosts, then checks pellet collection and ghost collisions. Zero DOM imports. |
| `src/maze.ts` | ~164 | Level data model. Stores walls and pellets on a 40x30 grid as `boolean[][]` with `private` access. Provides `isWall()`, `hasPellet()`, and `removePellet()` query methods. Uses `public readonly` for width/height. Zero DOM imports. |
| `src/pacman.ts` | ~145 | Player entity. Stores grid position as `private` fields with `get` accessors. Implements input buffering: `setDirection()` stores the desired direction, `update()` applies it only if the target tile is not a wall. Zero DOM imports. |
| `src/ghost.ts` | ~151 | NPC entity. Stores position, name, and CSS color string. Moves randomly every 20 frames using a frame-counter throttle. Uses `ReadonlyArray<readonly [number, number]>` for the direction tuple array. Zero DOM imports. |
| `tsconfig.json` | ~18 | TypeScript compiler configuration. Targets ES2020, enables `strict` mode, includes `DOM` and `DOM.Iterable` libs, outputs to `dist/`. |
| `vitest.config.ts` | ~14 | Test runner configuration. Uses Node environment, includes `*.test.ts` files, excludes `game.ts` from coverage (DOM-dependent). |
| `index.html` | ~33 | Host page. Contains an 800x600 `<canvas>` element and loads `dist/bundle.js`. |
| `run.sh` | ~27 | Build script. Installs dependencies if needed, runs esbuild, and opens `index.html` in the default browser. |

---

## Running Tests

The project includes 57 Vitest tests across four test files covering all logic modules:

```bash
npm test
```

Test files mirror the source files they cover:

| Test File | Tests | Covers |
|-----------|-------|--------|
| `src/maze.test.ts` | 22 | Wall boundaries, internal walls, pellet placement, `isWall()`, `hasPellet()`, `removePellet()`, out-of-bounds handling |
| `src/game_logic.test.ts` | 12 | Tick orchestration, pellet collection scoring, ghost collision detection, game-over state transitions |
| `src/pacman.test.ts` | 12 | Starting position, direction buffering, wall collision prevention, continued movement in current direction |
| `src/ghost.test.ts` | 11 | Starting position, frame-counter throttle, random movement, wall collision prevention, name/color accessors |

To type-check without running tests:

```bash
npm run typecheck
```

---

## Cross-Language Notes

This project implements the same Pacman game in multiple languages. Here is how
TypeScript compares on the key architectural decisions:

| Concept | Java / Swing | Python / Pygame | JavaScript / Canvas | TypeScript / Canvas |
|---|---|---|---|---|
| **Type system** | Static, nominal, compile-time enforced | Dynamic (optional hints via mypy) | Dynamic, no static checking | Static, structural, compile-time enforced; erased at runtime |
| **Access modifiers** | `private`/`public`/`protected` enforced at compile + runtime | Convention (`_underscore`) only | None (ES2022 `#field` is runtime-only) | `private`/`public`/`readonly` enforced at compile time only |
| **Immutability** | `final` prevents reassignment; `Collections.unmodifiableList()` for runtime | `tuple` for runtime immutability | `Object.freeze()` (shallow, runtime cost) | `readonly` keyword + `as const` -- zero-cost, compile-time only |
| **Entry point** | `main()` + `SwingUtilities.invokeLater()` | `pygame.init()` + `if __name__` | `<script>` tag, immediate execution | `<script>` tag loading compiled bundle |
| **Game loop** | Manual `Thread` with `System.nanoTime()` delta | `while True` + `Clock.tick(60)` | `requestAnimationFrame` + elapsed-time throttle | Same `requestAnimationFrame`, with typed `DOMHighResTimeStamp` |
| **Rendering** | Override `paintComponent(Graphics2D)` | `pygame.draw.*` + `screen.blit()` | `CanvasRenderingContext2D` methods | Same Canvas API, with full autocomplete and typo detection |
| **Input** | `KeyListener` interface (observer pattern) | `pygame.event.get()` polling | `addEventListener('keydown')` | Same DOM listener, with typed `KeyboardEvent` parameter |
| **Build system** | Maven (`pom.xml`, `mvn compile`) | None (run `.py` directly) | None (run `.js` directly) | `tsconfig.json` + esbuild bundling to `dist/bundle.js` |
| **Error catching** | Compile-time type errors + runtime exceptions | Runtime only (unless using mypy) | Runtime only | Compile-time type errors + runtime exceptions |
| **Entity design** | One class per file, private fields + explicit getters | Classes with `@property`, duck typing | Prototype methods, no access control | Classes with `private` fields + `get` accessors |
