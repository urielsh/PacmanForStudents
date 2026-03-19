---
name: "JavaScript"
icon: "&#9997;"
color: "#F7DF1E"
order: 2
---

# JavaScript/HTML5 Canvas Pacman

A classic Pacman game built with vanilla JavaScript and the HTML5 Canvas 2D API, designed
as an educational reference for browser-based game development. This implementation is
entirely event-driven: keyboard input arrives via DOM `keydown` listeners, the game loop
runs on `requestAnimationFrame`, and all rendering uses immediate-mode Canvas 2D calls.
There is no compilation step, no bundler, no framework -- you open a single HTML file in
any browser and the game runs.

---

## Prerequisites

| Tool       | Minimum Version | Check Command          |
|------------|-----------------|------------------------|
| Browser    | Any modern      | Chrome, Firefox, Safari, Edge |
| Node.js    | 16+ (for tests) | `node --version`       |

The game itself has **zero dependencies** -- only a browser is needed to play.

---

## Quick Start

```bash
bash run.sh
```

Or simply double-click `index.html` and open it in any browser. No server required.

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts.

---

## Architecture Overview

```
javascript/
 ├── index.html        Entry point & script loader
 ├── game.js           Rendering, input handling, game loop
 ├── game_logic.js     Score tracking, collision detection, update orchestration
 ├── maze.js           Tile-based level data (walls & pellets)
 ├── pacman.js         Player entity (position, direction, input buffering)
 └── ghost.js          NPC entity (position, color, random AI)
```

---

## Things to Notice

- **requestAnimationFrame vs setInterval** -- vsync-aligned, power-efficient loop.
- **Canvas 2D Rendering Pipeline** -- Immediate-mode, no scene graph.
- **DOM Event-Driven Input** -- Push model, no polling needed.
- **No Compilation Step** -- Edit JS, refresh browser, done.
- **Prototype-Based OOP with ES6 Classes** -- `class` syntax over prototypes.

---

## Exercises

1. **Add Touch Controls for Mobile** -- Swipe gestures on canvas.
2. **Implement localStorage High Scores** -- Persist top 5 scores.
3. **Add CSS Animations for Game Over** -- HTML overlay with transitions.
