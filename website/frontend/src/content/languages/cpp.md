---
name: "C++"
icon: "&#9881;"
color: "#00599C"
order: 5
---

# C++/SDL2 Pacman

A classic Pacman game built with C++17 and SDL2, designed as an educational reference
for systems-level game development. This implementation emphasizes the same clean
separation of concerns as the Java and Python versions -- entity classes contain zero
rendering includes, all drawing is centralized in a single panel -- but goes further by
exposing the mechanics that higher-level languages hide: manual memory management,
header/source separation, the compilation-and-linking model, and direct control over
every byte of memory and every CPU cycle.

---

## Prerequisites

| Tool        | Minimum Version | Check Command            |
|-------------|-----------------|--------------------------|
| g++ / clang | C++17           | `g++ --version`          |
| CMake       | 3.14+           | `cmake --version`        |
| libsdl2-dev | 2.0+            | `sdl2-config --version`  |

On Ubuntu/Debian:

```bash
sudo apt install libsdl2-dev
```

---

## Quick Start

```bash
bash run.sh
```

Or manually:

```bash
mkdir -p build && cd build
cmake .. && cmake --build .
./pacman
```

**Controls:** Arrow keys to move Pacman. Collect all pellets. Avoid ghosts. Press Escape to quit.

---

## Architecture Overview

```
cpp/
 ├── main.cpp          Entry point, SDL2 init/cleanup, game loop
 ├── game_panel.h/cpp  Rendering class (SDL2-dependent)
 ├── game_logic.h/cpp  Rules engine (zero SDL2 includes)
 ├── maze.h/cpp        Tile grid, wall/pellet data
 ├── pacman.h/cpp      Player entity (zero SDL2 includes)
 ├── ghost.h/cpp       Ghost entity (zero SDL2 includes)
 └── CMakeLists.txt    Build configuration
```

---

## Things to Notice

- **Manual Memory Management** -- No garbage collector; explicit create/destroy for SDL2 resources.
- **Header/Source Separation** -- Declarations in `.h`, definitions in `.cpp`.
- **RAII Pattern** -- `std::vector` and `std::string` manage their own heap memory.
- **CMake Build System** -- Complete control over compiler flags and linking.
- **Const Correctness** -- `const` keyword enforces read-only access at compile time.

---

## Exercises

1. **Implement Smart Pointers for Game Objects** -- Replace raw `SDL_Window*` with `unique_ptr`.
2. **Add Move Semantics for the Ghost Vector** -- Move constructor with `noexcept`.
3. **Profile with Valgrind and Optimize** -- Zero-leak verification and hotspot analysis.
