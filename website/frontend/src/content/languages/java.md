---
name: "Java"
icon: "&#9749;"
color: "#ED8B00"
order: 4
---

# Java Pacman Implementation

A classic Pacman game built with Java Swing, designed as an educational reference for
object-oriented game architecture. This implementation emphasizes clean separation of
concerns: every game entity is its own class, entity classes contain zero rendering
imports, and all drawing is centralized in a single panel.

---

## What Makes Java's Approach Unique

### OOP Class Hierarchy

Java encourages a strict one-class-per-file structure that naturally decomposes the
game into distinct responsibilities. `Pacman`, `Ghost`, `Maze`, and `GameLogic` are
pure data-and-logic classes with no dependency on `java.awt` or `javax.swing`. The
rendering layer (`GamePanel`) reads their state through getters and handles all
drawing.

### Swing's Event Dispatch Thread Model

Unlike Python, JavaScript, and TypeScript -- which are effectively single-threaded for
UI work -- Java Swing is built on a multithreaded foundation. All GUI updates **must**
happen on the Event Dispatch Thread (EDT). The game loop itself runs on a separate `Thread`, calling `repaint()` to schedule redraws back on the EDT.

### Compiled Language Benefits

Java compiles to bytecode ahead of time (`mvn compile`), which means type errors,
missing imports, and method signature mismatches are caught **before** the game runs.

---

## Prerequisites

| Tool   | Minimum Version | Check Command         |
|--------|-----------------|-----------------------|
| JDK    | 11+             | `java -version`       |
| Maven  | 3.6+            | `mvn -version`        |

---

## Quick Start

```bash
mvn clean compile
bash run.sh
```

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts.

---

## Architecture Overview

```
com.packman
 ├── PacmanGame.java   Entry point & window setup
 ├── GamePanel.java    Rendering, input, game loop
 ├── GameLogic.java    Score tracking & collision detection
 ├── Maze.java         Tile-based level data (walls & pellets)
 ├── Pacman.java       Player entity (position, direction, movement)
 └── Ghost.java        NPC entity (position, color, random AI)
```

---

## Exercises

1. **Modify Ghost AI to Chase Pacman** -- Use Manhattan distance to target pursuit.
2. **Add Power Pellets with a Timer** -- Implement frightened ghost mode.
3. **Implement Multiple Lives** -- Give Pacman three lives with HUD display.
