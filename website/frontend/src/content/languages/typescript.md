---
name: "TypeScript"
icon: "&#128295;"
color: "#3178C6"
order: 3
---

# TypeScript/HTML5 Canvas Pacman

A classic Pacman game built with TypeScript and the HTML5 Canvas 2D API, designed as
an educational reference for game development in a statically typed language that
compiles to JavaScript. This implementation uses the same Canvas rendering pipeline as
the JavaScript version but layers TypeScript's static type system on top: access
modifiers (`private`, `public`, `readonly`) enforce encapsulation at compile time,
explicit return types catch missing code paths, and `readonly` array types prevent
accidental mutation of shared state.

---

## Prerequisites

| Tool    | Minimum Version | Check Command      |
|---------|-----------------|--------------------|
| Node.js | 18+             | `node --version`   |
| npm     | 9+              | `npm --version`    |

All other dependencies (TypeScript, esbuild, Vitest) are installed locally via `npm install`.

---

## Quick Start

```bash
bash run.sh
```

Or manually:

```bash
npm install
npm run build
open index.html
```

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts.

---

## Architecture Overview

```
typescript/
 ├── src/
 │    ├── game.ts          Rendering, input handling, game loop
 │    ├── game_logic.ts    Tick orchestrator, score tracking, collision detection
 │    ├── maze.ts          Tile-based level data (walls & pellets)
 │    ├── pacman.ts        Player entity (position, direction, input buffering)
 │    └── ghost.ts         NPC entity (position, color, random-walk AI)
 ├── index.html            Host page with canvas element
 ├── tsconfig.json         Compiler options (strict mode)
 └── package.json          Scripts: build, typecheck, test
```

---

## Things to Notice

- **Static Type System** -- Types erased at compile time, zero runtime cost.
- **Access Modifiers** -- `private`, `public`, `readonly` enforced at compile time.
- **Compile-Time Error Catching** -- Catches null access, wrong argument types, missing returns.
- **Structural Typing** -- Duck typing with compile-time verification.
- **Type-Safe DOM Access** -- Full autocomplete and typo detection for Canvas API.

---

## Exercises

1. **Add a Generic Type for Grid Positions** -- Replace scattered `number` pairs.
2. **Implement Discriminated Union for Game States** -- Type-safe state machine.
3. **Add Strict Null Checks for All DOM Access** -- Remove all `!` assertions.
