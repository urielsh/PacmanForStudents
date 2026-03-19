---
name: "Python"
icon: "&#128013;"
color: "#3776AB"
order: 1
---

# Python/Pygame Pacman

A classic Pacman game built with Python and Pygame, designed as an educational reference
for game development in a dynamically typed language. This implementation emphasizes the
same clean separation of concerns as the Java version -- entity classes contain zero
rendering imports, all drawing is centralized in a single panel -- but achieves it with
significantly less boilerplate.

What makes Python's approach stand out: there is no compilation step, no build system,
and no class-wrapper ceremony. You edit a `.py` file, run `python main.py`, and see
your changes immediately.

---

## Prerequisites

| Tool   | Minimum Version | Check Command          |
|--------|-----------------|------------------------|
| Python | 3.8+            | `python3 --version`    |
| pip    | 20+             | `pip --version`        |

---

## Quick Start

```bash
bash run.sh
```

Or manually:

```bash
pip install -r requirements.txt
python3 main.py
```

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts. Press Escape to quit.

---

## Architecture Overview

```
python/
 ├── main.py          Entry point & pygame initialization
 ├── game_panel.py    Rendering, input handling, update orchestration
 ├── game_logic.py    Score tracking & collision detection
 ├── maze.py          Tile-based level data (walls & pellets)
 ├── pacman.py        Player entity (position, direction, movement)
 └── ghost.py         NPC entity (position, color, random AI)
```

---

## Things to Notice

- **Dynamic Typing with Optional Type Hints** -- Python trusts the programmer, not the compiler.
- **Simple Game Loop** -- Four lines: handle input, update, draw, tick.
- **List Comprehensions** -- 2D grids built in single expressions.
- **No Compilation Step** -- Edit and run immediately.
- **@property Replaces Getters** -- Same encapsulation, cleaner syntax.

---

## Exercises

1. **Add Ghost Chase AI Using Manhattan Distance**
2. **Implement Level Progression** -- Reset maze with faster ghosts each level.
3. **Add Sound Effects with pygame.mixer**
