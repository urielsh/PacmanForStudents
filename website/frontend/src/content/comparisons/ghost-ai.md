---
title: "Ghost AI Movement"
description: "Random-walk AI with frame-counter throttling, direction selection strategies, and RNG differences."
order: 5
---

# Ghost AI Movement -- Cross-Language Comparison

## Introduction

Ghost AI is the engine of challenge in Pac-Man. All five Packman implementations use a simple approach -- **random walk** -- where each ghost picks a random direction every N frames and moves there if the tile is not a wall.

---

## Frame-Counter Throttling

Ghosts move slower than Pacman. While Pacman moves every frame (60 tiles/second at 60 FPS), ghosts only attempt a move every 20 frames (3 moves/second). All five use the exact same modulo pattern: increment a counter, check with modulo.

---

## Direction Selection Approaches

Two distinct approaches are visible:

### Switch/If-Else (Java, Python, C++)
Maps an integer to a direction using a switch statement or if/elif chain. Straightforward but verbose.

### Direction Vector Array (JavaScript, TypeScript)
Uses a pre-defined `DIRECTIONS` array of `[dx, dy]` pairs. More elegant and scales naturally to any number of directions. TypeScript adds deep immutability with `ReadonlyArray<readonly [number, number]>`.

---

## Random Number Generation

| Language | API | Notes |
|---|---|---|
| Java | `Math.random()` | Returns double in [0, 1) |
| Python | `random.randint()` | Inclusive both ends; cleanest API |
| JavaScript | `Math.random()` | Must floor manually |
| TypeScript | `Math.random()` | Same as JS |
| C++ | `std::rand()` | C legacy; has modulo bias |

---

## Key Takeaways

1. **The direction vector array (JS/TS) is more elegant than switch statements.**
2. **Frame-counter throttling is the simplest speed control.**
3. **Random walk creates emergent difficulty** -- four ghosts moving unpredictably are genuinely challenging.
