# C++/SDL2 Pacman

A classic Pacman game built with C++17 and SDL2, designed as an educational reference
for systems-level game development. This implementation emphasizes the same clean
separation of concerns as the Java and Python versions -- entity classes contain zero
rendering includes, all drawing is centralized in a single panel -- but goes further by
exposing the mechanics that higher-level languages hide: manual memory management,
header/source separation, the compilation-and-linking model, and direct control over
every byte of memory and every CPU cycle.

What makes C++'s approach stand out: you manage the full lifecycle of every resource.
There is no garbage collector, no runtime, and no interpreter. SDL2 windows, renderers,
and GPU surfaces are created with explicit C calls and destroyed in reverse order. Game
objects live on the stack or inside `std::vector` with deterministic destruction. The
RAII pattern (Resource Acquisition Is Initialization) ensures that `std::string`,
`std::vector`, and other standard containers clean up their own heap memory
automatically when they go out of scope -- giving you the safety of automatic cleanup
with the performance of manual allocation.

---

## Prerequisites

| Tool        | Minimum Version | Check Command            |
|-------------|-----------------|--------------------------|
| g++ / clang | C++17           | `g++ --version`          |
| CMake       | 3.14+           | `cmake --version`        |
| libsdl2-dev | 2.0+            | `sdl2-config --version`  |
| GoogleTest  | (auto-fetched)  | fetched by CMake at build |

On Ubuntu/Debian, install SDL2 with:

```bash
sudo apt install libsdl2-dev
```

GoogleTest is fetched automatically by CMake via `FetchContent` -- no manual
installation required.

---

## Quick Start

**Option 1 -- One command** (builds and runs):

```bash
bash run.sh
```

**Option 2 -- Manual CMake build:**

```bash
mkdir -p build
cd build
cmake ..
cmake --build .
./pacman
```

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts. Press
Escape to quit. The window title bar displays the current score and game-over state.

---

## Architecture Overview

The project contains 11 source files (4 header/source pairs for game logic, 1
header/source pair for rendering, and 1 standalone main) plus a `CMakeLists.txt` build
file. The design follows the same strict rule as the Java and Python versions: **entity
headers have zero SDL2 includes** -- all `<SDL2/SDL.h>` usage is confined to
`game_panel.h`, `game_panel.cpp`, and `main.cpp`.

```
cpp/
 ├── main.cpp          Entry point, SDL2 init/cleanup, game loop
 ├── game_panel.h      Rendering class declaration (SDL2-dependent)
 ├── game_panel.cpp    Rendering, input handling, draw helpers
 ├── game_logic.h      Rules engine declaration (zero SDL2 includes)
 ├── game_logic.cpp    Score tracking, collision detection, update loop
 ├── maze.h            Maze class declaration (zero SDL2 includes)
 ├── maze.cpp          Tile grid, wall/pellet initialization, queries
 ├── pacman.h          Player entity declaration (zero SDL2 includes)
 ├── pacman.cpp        Grid movement, input buffering
 ├── ghost.h           Ghost entity declaration (zero SDL2 includes)
 ├── ghost.cpp         Random AI movement, frame-based throttling
 ├── CMakeLists.txt    Build configuration, SDL2 linking, GoogleTest
 └── tests/
      ├── test_maze.cpp       Maze unit tests
      ├── test_pacman.cpp     Pacman unit tests
      └── test_ghost.cpp      Ghost unit tests
```

### Class Diagram

```
┌────────────┐       ┌───────────────┐
│  main.cpp  │──────>│   GamePanel   │
│ (entry pt) │       │ - renderer*   │
└────────────┘       │ - running     │
                     │ - handleInput()
                     │ - render()    │
                     └───────┬───────┘
                             │ references
                             v
                      ┌──────────────┐
                      │  GameLogic   │
                      │ - score      │
                      │ - gameOver   │
                      │ - update()   │
                      │ - checkCollisions()
                      └──────┬───────┘
                             │ owns (by value)
                ┌────────────┼────────────┐
                v            v            v
         ┌──────────┐  ┌──────────┐  ┌──────────────┐
         │  Pacman   │  │  Ghost   │  │     Maze     │
         │ - gridX   │  │ - gridX  │  │ - walls[][]  │
         │ - gridY   │  │ - gridY  │  │ - pellets[][] │
         │ - dirX/Y  │  │ - name   │  │ - isWall()   │
         │ - update()│  │ - color  │  │ - hasPellet()│
         └──────────┘  │ - update()│  └──────────────┘
                       └──────────┘
                    (std::vector<Ghost>)
```

**Data flow each frame:**
1. `main.cpp` polls SDL events via `SDL_PollEvent()` and forwards them to `GamePanel::handleInput()`
2. `GameLogic::update()` advances Pacman, then each Ghost, then checks collisions
3. `GamePanel::render()` clears the back buffer and redraws everything from scratch
4. `SDL_RenderPresent()` flips the back buffer to the screen (double-buffering)
5. `SDL_Delay()` sleeps for the remainder of the ~16ms frame budget (60 FPS cap)

---

## Things to Notice

### Manual Memory Management (No Garbage Collector)

C++ has no garbage collector. Every SDL2 resource -- `SDL_Window*`, `SDL_Renderer*` --
is created with an explicit C function and must be destroyed with its matching destroy
call. In `main.cpp`, notice the "cascade cleanup" pattern: if renderer creation fails,
the window is destroyed AND `SDL_Quit()` is called before returning. At program exit,
resources are destroyed in reverse creation order (renderer, then window, then SDL
subsystem):

```cpp
SDL_DestroyRenderer(renderer);
SDL_DestroyWindow(window);
SDL_Quit();
```

In Java, the GC handles this. In Python, `pygame.quit()` with atexit hooks handles it.
In C++, you handle it yourself -- or you leak memory and GPU resources.

### Header/Source Separation

Every class is split into a `.h` (declaration) and `.cpp` (definition). The compiler
processes each `.cpp` independently into an object file (`.o`); the linker merges them
into the final executable. `#pragma once` prevents duplicate definitions when a header
is included by multiple translation units. This two-file-per-class structure has no
equivalent in Java (one file per class), Python (one module), or JavaScript (one
module). It provides fine-grained control over compilation speed and encapsulation.

### RAII Pattern for SDL Resources

While `main.cpp` uses explicit cleanup for SDL C resources, the game objects themselves
use C++ value semantics. `GameLogic` owns a `Maze`, a `Pacman`, and a
`std::vector<Ghost>` as direct member variables -- not pointers. When `GameLogic` goes
out of scope, all its members are destroyed automatically in reverse order. The
`std::vector` manages its own heap array of Ghosts and frees it on destruction.
`std::string` inside each Ghost manages its own character buffer the same way. This is
RAII: the constructor acquires resources, the destructor releases them, and the compiler
guarantees the destructor runs.

### CMake Build System

The project uses CMake as its build system. `CMakeLists.txt` declares the C++17
standard, finds SDL2 on the system, lists the source files for the game executable, and
configures GoogleTest via `FetchContent` for unit tests. Compare this to Java's Maven
(`pom.xml`), Python's lack of a build step, or JavaScript's `package.json` -- CMake is
more verbose but gives complete control over compiler flags, linking, and
cross-platform builds.

### Const Correctness

C++ enforces read-only access at compile time via the `const` keyword. Methods like
`isWall()` and `hasPellet()` are marked `const`, promising the compiler they will not
modify the object. Parameters like `const Maze&` pass by reference without copying
while guaranteeing no mutation. The compiler rejects any code that violates these
promises. Java has no equivalent (`final` only prevents reassignment), Python relies on
convention, and JavaScript's `Object.freeze()` is shallow and runtime-only.

---

## Exercises

These exercises build on the existing code in increasing order of difficulty.

### 1. Implement Smart Pointers for Game Objects

**Goal:** Replace the raw `SDL_Window*` and `SDL_Renderer*` in `main.cpp` with
`std::unique_ptr` using custom deleters, eliminating all manual `SDL_Destroy*` calls.

**Approach:**

```cpp
auto windowDeleter = [](SDL_Window* w) { SDL_DestroyWindow(w); };
std::unique_ptr<SDL_Window, decltype(windowDeleter)> window(
    SDL_CreateWindow(...), windowDeleter
);
```

**Hints:**
- Define a custom deleter lambda (or functor struct) for each SDL resource type.
- `std::unique_ptr<SDL_Window, void(*)(SDL_Window*)>` works with a function pointer
  deleter if you prefer not to use lambdas.
- After this change, the cleanup section at the end of `main()` reduces to just
  `SDL_Quit()` -- the smart pointers handle the rest automatically when they go out
  of scope.
- Consider what happens when `SDL_CreateRenderer` fails: with smart pointers, the
  window is automatically destroyed by the unique_ptr destructor -- no cascade needed.

### 2. Add Move Semantics for the Ghost Vector

**Goal:** Add a move constructor and move assignment operator to `Ghost`, and observe
the performance difference when the ghost vector grows.

**Approach:**
- Add `Ghost(Ghost&& other) noexcept` and `Ghost& operator=(Ghost&& other) noexcept`
  to transfer ownership of the `std::string` members without copying their heap buffers.
- Mark the move operations `noexcept` -- `std::vector` will only use move semantics
  during reallocation if the move constructor is `noexcept`.
- Use `ghosts.reserve(4)` in the `GameLogic` constructor to pre-allocate and avoid
  reallocation entirely.

**Hints:**
- Use `std::move()` to transfer each string member: `name(std::move(other.name))`.
- After a move, the source object's strings are left in a valid-but-empty state.
- Compare before and after with a counter in Ghost's copy constructor to see how many
  copies the vector was making during `emplace_back` reallocation.
- The Rule of Five: if you define a move constructor, also consider the destructor,
  copy constructor, copy assignment, and move assignment.

### 3. Profile with Valgrind and Optimize

**Goal:** Run the game under Valgrind's memcheck and callgrind tools to verify zero
memory leaks and identify the hottest code paths.

**Approach:**
- Build in debug mode: `cmake -DCMAKE_BUILD_TYPE=Debug ..`
- Run memcheck: `valgrind --leak-check=full ./pacman`
- Run callgrind: `valgrind --tool=callgrind ./pacman` then visualize with
  `kcachegrind callgrind.out.*`
- Identify the most-called functions (likely `renderMaze` and `isWall`) and consider
  optimizations: caching the wall grid as an SDL_Texture, using bitwise operations
  for the pellet grid, or batching draw calls.

**Hints:**
- Valgrind slows execution ~20x; the game will run very slowly but that is expected.
- A clean memcheck report (0 leaks, 0 errors) proves the manual cleanup in `main.cpp`
  is correct.
- The callgrind profile will show that `renderMaze()` iterates all 1200 cells every
  frame -- pre-rendering walls to a static texture would eliminate this per-frame cost.
- Compare the Valgrind workflow to Java's VisualVM or Python's `cProfile` -- C++ gives
  you instruction-level granularity at the cost of more complex tooling.

---

## File Reference

| File | Lines | Description |
|------|-------|-------------|
| `main.cpp` | ~177 | Entry point. Initializes SDL2 (video subsystem, window, renderer), seeds the RNG, runs the poll/update/render game loop at 60 FPS, and performs explicit cleanup in reverse creation order. Equivalent to Java's `PacmanGame.java` and Python's `main.py`. |
| `game_panel.h` | ~79 | Rendering class declaration. Defines `GamePanel` with an SDL_Renderer pointer (non-owning), render/input methods, and a static hex-color parser. The only header that includes `<SDL2/SDL.h>`. |
| `game_panel.cpp` | ~365 | Rendering implementation. Draws the maze (blue walls), pellets (white dots), Pacman (yellow square), and ghosts (colored bodies with eyes). Handles SDL2 keyboard events via scancodes. Uses alpha blending for the game-over overlay. |
| `game_logic.h` | ~72 | Rules engine declaration. Owns `Maze`, `Pacman`, and `std::vector<Ghost>` by value. Provides const/non-const overload pairs for each getter. Zero SDL2 includes. |
| `game_logic.cpp` | ~133 | Rules engine implementation. Constructs 4 ghosts via `emplace_back`, updates all entities each frame with range-based for loops, checks pellet collection and ghost collisions. |
| `maze.h` | ~61 | Maze class declaration. Fixed-size 2D C-style arrays (`bool[40][30]`) for walls and pellets. Stack-allocated with zero heap overhead. Zero SDL2 includes. |
| `maze.cpp` | ~127 | Maze implementation. Initializes border walls, internal wall segments, and pellets on every open tile. Manual bounds checking on all array access to prevent undefined behavior. |
| `pacman.h` | ~66 | Player entity declaration. Uses forward declaration (`class Maze;`) to avoid including `maze.h`. Stores grid position and buffered direction. Zero SDL2 includes. |
| `pacman.cpp` | ~104 | Player implementation. Member initializer list for construction. Input buffering: tries queued direction first, falls back to current direction. `const Maze&` parameters for zero-copy read-only access. |
| `ghost.h` | ~63 | Ghost entity declaration. Stores name and color as `std::string` (RAII heap management). Frame counter for movement throttling. Zero SDL2 includes. |
| `ghost.cpp` | ~106 | Ghost implementation. Random movement via `std::rand()` every 20 frames. Returns `const std::string&` from getters to avoid copies. |
| `CMakeLists.txt` | ~45 | Build configuration. Sets C++17 standard, finds SDL2, declares game and test executables, auto-fetches GoogleTest v1.14.0 via FetchContent. |
| `run.sh` | ~18 | Build-and-run script. Creates build directory, runs CMake configure and build, then launches the game. |
| `tests/test_maze.cpp` | ~67 | Maze unit tests. 9 GoogleTest cases covering dimensions, border walls, out-of-bounds handling, pellet placement, and pellet removal. |
| `tests/test_pacman.cpp` | ~56 | Pacman unit tests. 5 GoogleTest cases covering initial position, movement in each direction, wall collision, and direction buffering. |
| `tests/test_ghost.cpp` | ~55 | Ghost unit tests. 5 GoogleTest cases covering initial position, name/color storage, frame-based movement throttling, and bounds safety over 1000 updates. |

---

## Running Tests

The project uses GoogleTest, which CMake fetches automatically on first build.

```bash
cd build
cmake ..
cmake --build .
ctest
```

Or run the test binary directly for verbose output:

```bash
./build/pacman_tests
```

There are 26 GoogleTest cases across three test files, covering maze geometry, entity
movement, collision boundaries, and ghost AI behavior. All tests run without SDL2 --
they exercise only the logic classes, validating the header/source separation.

---

## Cross-Language Notes

This project implements the same Pacman game in five languages. Here is how C++
compares on the key architectural decisions:

| Concept | Java / Swing | Python / Pygame | JavaScript / Canvas | TypeScript / Canvas | C++ / SDL2 |
|---|---|---|---|---|---|
| **Entry point** | `main()` + `SwingUtilities.invokeLater()` | `pygame.init()` + `if __name__` | `window.onload` + `requestAnimationFrame` | Same as JS with typed setup | `SDL_Init()` + explicit `while` loop |
| **Game loop** | Manual `Thread` with `System.nanoTime()` | `while True` + `Clock.tick(60)` | `requestAnimationFrame` callback | Same as JS | `while` + `SDL_GetTicks()` delta + `SDL_Delay()` |
| **Rendering** | Override `paintComponent(Graphics2D)` | `pygame.draw.*` + `screen.blit()` | `ctx.fillRect()` + `ctx.arc()` | Same as JS with typed context | `SDL_SetRenderDrawColor()` + `SDL_RenderFillRect()` |
| **Input** | `KeyListener` interface | `pygame.event.get()` polling | `addEventListener('keydown')` | Same as JS with `KeyboardEvent` | `SDL_PollEvent()` + scancode switch |
| **Type system** | Compile-time enforced | Dynamic (optional hints) | Dynamic | Compile-time (erased at runtime) | Compile-time enforced + `const` correctness |
| **Build system** | Maven (`pom.xml`) | None (run `.py` directly) | npm/webpack | npm + `tsc` | CMake (`CMakeLists.txt`) |
| **Memory** | GC (JVM heap) | GC (refcount + cycle) | GC (V8 mark-sweep) | Same as JS | Manual + RAII (no GC) |
| **Entity design** | One class per `.java` file | Classes with `@property` | ES6 classes, one per file | Same as JS + interfaces | Header/source pairs, `const` methods |
| **Thread safety** | EDT required for GUI | Single-threaded | Single-threaded (event loop) | Same as JS | Single-threaded (but YOU own the loop) |
| **Resource cleanup** | GC + finalizers | `pygame.quit()` + atexit | Browser manages DOM/Canvas | Same as JS | Explicit `SDL_Destroy*` in reverse order |
