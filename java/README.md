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
drawing. This is not just a style preference -- it is enforced by Java's access
modifiers, package system, and the cultural expectation that each `.java` file maps
to one public class. The result is a codebase where you could swap Swing for JavaFX
(or a headless test harness) without touching a single entity file.

### Swing's Event Dispatch Thread Model

Unlike Python, JavaScript, and TypeScript -- which are effectively single-threaded for
UI work -- Java Swing is built on a multithreaded foundation. All GUI updates **must**
happen on the Event Dispatch Thread (EDT). The entry point in `PacmanGame.main()`
wraps the entire window setup inside `SwingUtilities.invokeLater()` to guarantee
thread safety. The game loop itself runs on a separate `Thread`, calling `repaint()`
to schedule redraws back on the EDT. This explicit thread choreography is unique to
Java among the five implementations in this project and teaches a critical lesson
about UI threading that applies to Android, desktop, and enterprise Java alike.

### Compiled Language Benefits

Java compiles to bytecode ahead of time (`mvn compile`), which means type errors,
missing imports, and method signature mismatches are caught **before** the game runs.
Python and JavaScript discover these problems at runtime. The Maven build system also
enforces dependency management, reproducible builds, and a standardized project layout
(`src/main/java`, `src/test/java`) that scales from a 6-file game to a million-line
enterprise application.

---

## Prerequisites

| Tool   | Minimum Version | Check Command         |
|--------|-----------------|-----------------------|
| JDK    | 11+             | `java -version`       |
| Maven  | 3.6+            | `mvn -version`        |

Both must be on your `PATH`. Any JDK distribution works (OpenJDK, Temurin, Oracle).

---

## Quick Start

**Build** the project (compile all `.java` files):

```bash
mvn clean compile
```

**Run** the game (either method works):

```bash
bash run.sh
```

```bash
mvn exec:java -Dexec.mainClass="com.packman.PacmanGame"
```

**Test** with JUnit:

```bash
mvn test
```

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts.

---

## Architecture Overview

The project contains six source files under `src/main/java/com/packman/`. The design
follows a strict rule: **entity files have zero rendering imports** -- all `java.awt`
and `javax.swing` usage is confined to `GamePanel` and `PacmanGame`.

```
com.packman
 ├── PacmanGame.java   Entry point & window setup
 ├── GamePanel.java    Rendering, input, game loop
 ├── GameLogic.java    Score tracking & collision detection
 ├── Maze.java         Tile-based level data (walls & pellets)
 ├── Pacman.java       Player entity (position, direction, movement)
 └── Ghost.java        NPC entity (position, color, random AI)
```

### PacmanGame.java -- Entry Point

The `main()` method. Creates a `JFrame` window, adds a `GamePanel`, packs it, and
starts the game. All of this is wrapped in `SwingUtilities.invokeLater()` to ensure
the GUI is built on the EDT. This file is intentionally tiny -- its only job is
bootstrapping.

### GamePanel.java -- Rendering, Input, and Game Loop

The heart of the application. `GamePanel` extends `JPanel` and implements
`KeyListener`, giving it three responsibilities:

- **Game loop:** A dedicated `Thread` runs a fixed-timestep loop using
  `System.nanoTime()` and a delta accumulator targeting 60 updates per second.
- **Rendering:** `paintComponent(Graphics g)` is overridden to draw the maze (blue
  walls, white pellet dots), Pacman (yellow circle), ghosts (colored rectangles with
  white eyes), and the score HUD. Drawing order follows the painter's algorithm:
  background first, entities next, UI on top.
- **Input:** `keyPressed(KeyEvent e)` translates arrow key codes into direction
  vectors and passes them to `Pacman.setDirection()`.

### GameLogic.java -- Rules Engine

A pure-logic class with no rendering imports. Owns the `Maze` instance, tracks the
`score`, and exposes `checkCollisions()` which handles two collision types:

- **Pellet collection** (trigger collision): If Pacman's grid position matches a
  pellet, remove it and add 10 points.
- **Ghost collision** (death trigger): If Pacman shares a tile with any ghost, set
  `gameOver = true`.

### Maze.java -- Level Data

Stores the 40x30 tile grid as two `boolean[][]` arrays (`walls` and `pellets`).
`initializeMaze()` programmatically generates border walls, internal wall segments,
and places pellets on every open tile except Pacman's start position. Bounds checking
in `isWall()` treats out-of-bounds coordinates as walls, preventing
`ArrayIndexOutOfBoundsException` and keeping entities inside the map.

### Pacman.java -- Player Entity

Holds grid position (`gridX`, `gridY`), current direction (`dirX`, `dirY`), and
buffered input (`nextDirX`, `nextDirY`). The `update(Maze)` method implements input
buffering: it first tries the queued direction, and if that is blocked by a wall, it
continues in the current direction. This creates the classic Pacman feel where you can
press a direction key before reaching a junction and the turn happens automatically
when possible. Contains **no** `java.awt` imports.

### Ghost.java -- NPC Entity

Same positional fields as Pacman, plus RGB color values (`colorR`, `colorG`, `colorB`)
stored as plain integers -- not as `java.awt.Color` -- so the class stays free of
rendering imports. Movement uses a simple random AI: every 20 frames, pick one of four
directions at random and move there if it is not a wall. The `moveCounter` acts as a
speed limiter, making ghosts roughly three times slower than Pacman.

---

## Things to Notice

### OOP Class Hierarchy

Each game entity (`Pacman`, `Ghost`, `Maze`) is its own class with private fields
and public getters. There is no god-object holding all state. This is Java's natural
grain: the language rewards you for decomposing behavior into focused classes. Compare
this to the Python implementation where entities tend to be lighter-weight objects
(or even dictionaries) and the JavaScript version where plain objects with closures
are idiomatic.

### Swing Event Dispatch Thread

`PacmanGame.main()` does not create the window directly -- it hands a lambda to
`SwingUtilities.invokeLater()`, which schedules the work on the EDT. This is a
requirement, not a suggestion. Swing components are not thread-safe, so creating or
modifying them from the main thread (or any other thread) can cause race conditions,
rendering glitches, or crashes. No other implementation in this project needs this
pattern because Pygame, the HTML Canvas, and SDL2 are all single-threaded for
rendering.

### AWT/Swing Rendering Pipeline

Rendering flows through `paintComponent(Graphics g)`, which the Swing framework calls
whenever the panel needs repainting. The method receives a `Graphics` object (cast to
`Graphics2D` for richer API access) and draws everything from scratch each frame. Key
methods used: `fillRect()` for walls and ghost bodies, `fillOval()` for Pacman and
pellets, `drawString()` for the score. The call to `super.paintComponent(g)` at the
top clears the previous frame -- without it, old drawings would persist on screen.

### Timer-Based Game Loop

The game loop in `gameLoop()` uses a delta accumulation pattern for a fixed 60 FPS
update rate:

```java
double ns = 1_000_000_000 / 60.0;
double delta = 0;
while (running) {
    long now = System.nanoTime();
    delta += (now - lastTime) / ns;
    lastTime = now;
    if (delta >= 1) {
        update();
        repaint();
        delta--;
    }
}
```

This ensures the game runs at the same speed regardless of hardware. If a frame takes
longer than 16.6ms, the loop catches up. If the system is fast, it waits. Pygame hides
this behind `Clock.tick(60)`, and JavaScript delegates it to `requestAnimationFrame()`.
Java (and C++) require you to build the timing mechanism yourself.

---

## Exercises

These exercises build on the existing code in increasing order of difficulty.

### 1. Modify Ghost AI to Chase Pacman

**Goal:** Replace the random movement in `Ghost.update()` with targeted pursuit.

**Approach:** Use Manhattan distance (`|ghostX - pacmanX| + |ghostY - pacmanY|`) to
evaluate each of the four possible moves. Pick the move that minimizes the distance
to Pacman's current position, as long as it is not a wall.

**Hints:**
- `Ghost.update()` will need to accept a `Pacman` parameter (or at least its
  coordinates) in addition to the `Maze`.
- Update the call in `GamePanel.update()` to pass the Pacman reference.
- Start by making only one ghost (Blinky) chase -- keep the others random for
  contrast.

### 2. Add Power Pellets with a Timer

**Goal:** Place a few special pellets on the maze. When Pacman eats one, ghosts
become vulnerable for a limited time, and Pacman can eat them for bonus points.

**Approach:**
- Add a `powerPellets` boolean array to `Maze`, similar to the existing `pellets`
  array.
- Add a `frightenedTimer` field (int, counting down each frame) to `Ghost`.
- In `GameLogic.checkCollisions()`, when Pacman eats a power pellet, set all ghosts
  to frightened mode for a duration (e.g., 300 frames = 5 seconds at 60 FPS).
- When a ghost is frightened, reverse its color (or draw it blue) and allow Pacman to
  "eat" it for 200 points.
- When the timer expires, ghosts return to normal.

### 3. Implement Multiple Lives

**Goal:** Give Pacman three lives. When a ghost catches Pacman, lose one life instead
of ending the game immediately. Display remaining lives on the HUD.

**Approach:**
- Add a `lives` field to `GameLogic` (initialized to 3).
- On ghost collision, decrement `lives` and reset Pacman and ghost positions instead
  of setting `gameOver = true`.
- Only set `gameOver = true` when `lives` reaches 0.
- In `GamePanel.paintComponent()`, draw small yellow circles near the score to
  represent remaining lives.

---

## Cross-Language Notes

This project implements the same Pacman game in five languages. Here is how they
diverge on the key architectural decisions:

| Concept | Java / Swing | Python / Pygame | JavaScript / Canvas | TypeScript / Canvas | C++ / SDL2 |
|---|---|---|---|---|---|
| **Entry point** | `main()` + `SwingUtilities.invokeLater()` | `pygame.init()` + module-level script | `<script>` tag or module, no `main()` | Same as JS, compiled from `.ts` | `main()` + `SDL_Init()` |
| **Game loop** | Manual `Thread` with `System.nanoTime()` delta | `while True:` + `Clock.tick(60)` | `requestAnimationFrame()` (browser-managed) | Same as JS | Manual loop with `SDL_GetTicks()` or `chrono` |
| **Rendering** | Override `paintComponent(Graphics2D)` | `screen.blit()` / `pygame.draw.*` | `ctx.fillRect()` / `ctx.arc()` on `<canvas>` | Same as JS with typed `CanvasRenderingContext2D` | `SDL_RenderFillRect()` / `SDL_RenderCopy()` |
| **Input** | `KeyListener` interface (observer pattern) | `pygame.event.get()` polling | `addEventListener('keydown', ...)` | Same as JS with `KeyboardEvent` type | `SDL_PollEvent()` polling |
| **Thread safety** | EDT required for all GUI work | Single-threaded, not an issue | Single-threaded event loop | Same as JS | Single-threaded (typically) |
| **Type checking** | Compile-time (javac) | Runtime only (or optional mypy) | Runtime only | Compile-time (tsc) | Compile-time (g++/clang) |
| **Build system** | Maven (`pom.xml`) | None (run `.py` directly) | None (run `.html` directly) | `tsc` compiler, optional bundler | CMake / Makefile |
| **Entity design** | One class per file, private fields + getters | Classes or plain objects, public attributes | Constructor functions or classes | Classes with typed properties | Structs or classes, header + source files |

The core game loop pattern -- **initialize, loop (handle input, update state, render),
clean up** -- is identical across all five. What changes is the syntax and the
framework API wrapping each step.
