# Python/Pygame Pacman

A classic Pacman game built with Python and Pygame, designed as an educational reference
for game development in a dynamically typed language. This implementation emphasizes the
same clean separation of concerns as the Java version -- entity classes contain zero
rendering imports, all drawing is centralized in a single panel -- but achieves it with
significantly less boilerplate. Python's dynamic typing, first-class functions, and
"batteries included" standard library let you focus on game logic instead of type
declarations, interface implementations, and build configuration.

What makes Python's approach stand out: there is no compilation step, no build system,
and no class-wrapper ceremony. You edit a `.py` file, run `python main.py`, and see
your changes immediately. The entire project runs from six source files with a single
external dependency (`pygame`).

---

## Prerequisites

| Tool   | Minimum Version | Check Command          |
|--------|-----------------|------------------------|
| Python | 3.8+            | `python3 --version`    |
| pip    | 20+             | `pip --version`        |

Pygame is the only external dependency and is installed automatically by `run.sh`.

---

## Quick Start

**Option 1 -- One command** (installs dependencies and runs):

```bash
bash run.sh
```

**Option 2 -- Manual steps:**

```bash
pip install -r requirements.txt
python3 main.py
```

**Run tests:**

```bash
pip install pytest
python3 -m pytest tests/
```

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts. Press
Escape to quit.

---

## Architecture Overview

The project contains six source files in the `python/` directory. The design follows
the same strict rule as the Java version: **entity files have zero rendering imports** --
all `pygame` usage is confined to `game_panel.py` and `main.py`.

```
python/
 ├── main.py          Entry point & pygame initialization
 ├── game_panel.py    Rendering, input handling, update orchestration
 ├── game_logic.py    Score tracking & collision detection
 ├── maze.py          Tile-based level data (walls & pellets)
 ├── pacman.py        Player entity (position, direction, movement)
 └── ghost.py         NPC entity (position, color, random AI)
```

### Class Diagram

```
┌────────────┐       ┌─────────────┐
│   main.py  │──────>│  GamePanel   │
│ (entry pt) │       │  - screen    │
└────────────┘       │  - clock     │
                     │  - handle_input()
                     │  - update()  │
                     │  - draw()    │
                     └──────┬───────┘
                            │ calls
               ┌────────────┼────────────┐
               v            v            v
        ┌──────────┐  ┌──────────┐  ┌─────────┐
        │  Pacman   │  │  Ghost   │  │GameLogic│
        │ - grid_x  │  │ - grid_x │  │ - score │
        │ - grid_y  │  │ - grid_y │  │ - maze  │
        │ - update()│  │ - update()│  │ - check │
        └──────────┘  └──────────┘  │ _collisions()
                                     └────┬────┘
                                          │ owns
                                          v
                                     ┌─────────┐
                                     │  Maze    │
                                     │ - walls  │
                                     │ - pellets│
                                     │ - is_wall()
                                     │ - has_pellet()
                                     └─────────┘
```

**Data flow each frame:**
1. `GamePanel.handle_input()` reads keyboard events and buffers Pacman's direction
2. `GamePanel.update()` advances Pacman, then each Ghost, then checks collisions
3. `GamePanel.draw()` clears the screen and redraws everything from scratch
4. `clock.tick(60)` sleeps to maintain a steady 60 FPS

---

## Things to Notice

### Dynamic Typing (with Optional Type Hints)

Python does not require type declarations -- variables take whatever type you assign.
However, this project uses type hints throughout for documentation and editor support:

```python
self._grid_x: int = x
self._walls: list[list[bool]] = []
def is_wall(self, x: int, y: int) -> bool:
```

These hints are **ignored at runtime**. Python would run identically without them. In
Java, `int gridX` is a compiler-enforced contract; in Python, `self._grid_x: int = x`
is a suggestion that tools like `mypy` can optionally check. This is a fundamental
difference in language philosophy: Python trusts the programmer, Java trusts the
compiler.

### Simple Game Loop

The entire game loop fits in four lines:

```python
while panel.running:
    panel.handle_input(pacman)
    panel.update(pacman, ghosts, game_logic)
    panel.draw(panel.screen, pacman, ghosts, game_logic)
    panel.clock.tick(FPS)
```

Compare this to Java's manual `System.nanoTime()` delta accumulator. Pygame's
`clock.tick(60)` handles all the timing math internally -- it sleeps just long enough
to cap the frame rate at 60 FPS. The tradeoff: Java's approach gives you finer control
over fixed-timestep updates, while Python's approach is simpler but slightly less
precise.

### List Comprehensions for Maze Initialization

The 2D grid is built in a single expression:

```python
self._walls = [
    [False] * self._MAZE_HEIGHT for _ in range(self._MAZE_WIDTH)
]
```

In Java, this requires an explicit `new boolean[40][30]` declaration with a fixed type
and size. Python's list comprehension is more concise and creates a fully dynamic
structure -- you could resize it at runtime without recompilation.

### No Compilation Step

There is no `javac`, no `mvn compile`, no bytecode. You edit `ghost.py`, run
`python3 main.py`, and your changes are live. This rapid feedback loop is one of
Python's biggest strengths for learning and prototyping. The tradeoff is that type
errors and missing attributes are only caught when the offending line actually executes,
whereas Java catches them at compile time.

### Duck Typing Instead of Interfaces

Both `Pacman` and `Ghost` expose `grid_x` and `grid_y` properties, and both have an
`update(maze)` method. In Java, you would define a shared `GridEntity` interface. In
Python, no formal contract is needed -- if an object has `grid_x` and `grid_y`,
collision detection works with it. This is "duck typing": if it walks like a grid
entity and quacks like a grid entity, it is a grid entity.

### @property Replaces Getters

Where Java writes `public int getGridX() { return gridX; }`, Python uses the
`@property` decorator:

```python
@property
def grid_x(self) -> int:
    return self._grid_x
```

Callers write `pacman.grid_x` instead of `pacman.getGridX()` -- same encapsulation,
cleaner syntax.

---

## Exercises

These exercises build on the existing code in increasing order of difficulty.

### 1. Add Ghost Chase AI Using Manhattan Distance

**Goal:** Replace the random movement in `Ghost.update()` with targeted pursuit.

**Approach:** For each of the four possible moves, compute the Manhattan distance to
Pacman: `abs(ghost_x - pacman_x) + abs(ghost_y - pacman_y)`. Choose the move that
minimizes this distance, as long as the target tile is not a wall.

**Hints:**
- `Ghost.update()` will need to accept a `Pacman` parameter (or at least `pacman_x`
  and `pacman_y`) in addition to the `Maze`.
- Update the call in `GamePanel.update()` to pass the Pacman reference:
  `ghost.update(game_logic.maze, pacman)`.
- Start by making only Blinky (the red ghost at index 0) chase -- keep the others
  random for contrast.
- Use Python's `min()` with a key function to pick the best direction elegantly:
  ```python
  moves = [(dx, dy) for dx, dy in directions if not maze.is_wall(x+dx, y+dy)]
  best = min(moves, key=lambda m: abs(x+m[0]-px) + abs(y+m[1]-py))
  ```

### 2. Implement Level Progression

**Goal:** When all pellets are eaten, reset the maze with new pellets and increase
difficulty (faster ghosts).

**Approach:**
- Add a `pellet_count` tracker to `Maze` that decrements in `remove_pellet()`.
- Add a `level` field to `GameLogic`. When `pellet_count` reaches 0, increment the
  level and call a reset method.
- Reduce the ghost move interval (currently 20 frames) based on the level:
  `max(5, 20 - level * 2)`. Pass the current interval to `Ghost.update()` or store
  it on the ghost.
- Reset Pacman and ghost positions to their starting tiles.

**Hints:**
- Count initial pellets during `_initialize_maze()` instead of hardcoding a number.
- Add a `reset()` method to `Maze` that re-calls `_initialize_maze()`.
- Display the current level on the HUD alongside the score.

### 3. Add Sound Effects with pygame.mixer

**Goal:** Play sound effects when Pacman eats a pellet, when a ghost catches Pacman,
and when a level is completed.

**Approach:**
- Initialize the mixer in `main.py`: `pygame.mixer.init()` (already called by
  `pygame.init()`).
- Load sounds: `chomp = pygame.mixer.Sound("sounds/chomp.wav")`.
- Play at the appropriate moment: call `chomp.play()` in `GameLogic.check_collisions()`
  when a pellet is collected.

**Hints:**
- Free `.wav` sound effects are available from sites like freesound.org and
  opengameart.org.
- To keep `GameLogic` free of pygame imports, use a callback pattern: pass a
  `on_pellet_eaten` function from `main.py` into `GameLogic`, and call it when a
  pellet is consumed. This preserves the separation of concerns.
- Control volume with `sound.set_volume(0.5)` to avoid startling players.
- Background music can loop with `pygame.mixer.music.load("music.mp3")` and
  `pygame.mixer.music.play(-1)` (the `-1` means loop forever).

---

## File Reference

| File | Lines | Description |
|------|-------|-------------|
| `main.py` | ~139 | Entry point. Initializes pygame, creates game objects, runs the main loop. Equivalent to Java's `PacmanGame.java`. |
| `game_panel.py` | ~271 | Display layer. Owns the pygame surface, clock, and font. Handles keyboard input (polling via `pygame.event.get()`), orchestrates per-frame updates, and renders the maze, entities, score HUD, and game-over overlay. |
| `game_logic.py` | ~152 | Rules engine. Owns the `Maze`, tracks the score, and checks pellet collection and ghost collisions each frame. Zero pygame imports. |
| `maze.py` | ~178 | Level data model. Stores walls and pellets on a 40x30 grid using 2D lists. Provides `is_wall()`, `has_pellet()`, and `remove_pellet()` query methods. Zero pygame imports. |
| `pacman.py` | ~169 | Player entity. Stores grid position and implements input buffering (queued direction tried first, current direction as fallback). Zero pygame imports. |
| `ghost.py` | ~175 | NPC entity. Stores grid position and RGB color as plain integers. Moves randomly every 20 frames. Zero pygame imports. |

---

## Cross-Language Notes

This project implements the same Pacman game in multiple languages. Here is how Python
compares on the key architectural decisions:

| Concept | Java / Swing | Python / Pygame |
|---|---|---|
| **Entry point** | `main()` + `SwingUtilities.invokeLater()` | `pygame.init()` + `if __name__ == "__main__"` |
| **Game loop** | Manual `Thread` with `System.nanoTime()` delta | `while True` + `Clock.tick(60)` |
| **Rendering** | Override `paintComponent(Graphics2D)` | `pygame.draw.*` + `screen.blit()` |
| **Input** | `KeyListener` interface (observer pattern) | `pygame.event.get()` polling |
| **Type system** | Compile-time enforced | Dynamic (optional hints via mypy) |
| **Build system** | Maven (`pom.xml`, `mvn compile`) | None (run `.py` directly) |
| **Entity design** | One class per file, private fields + getters | Classes with `@property`, duck typing |
| **Thread safety** | EDT required for all GUI work | Single-threaded, not an issue |
