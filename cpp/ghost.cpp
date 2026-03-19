// Source of truth: shared/game_constants.json
#include "ghost.h"
#include "maze.h"
#include <cstdlib>

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Ghost AI — Random Movement with std::rand()
// ═══════════════════════════════════════════════════════
// This file uses the C legacy function std::rand() seeded by std::srand() in
// main.cpp. While simple, std::rand() has well-known issues: poor randomness
// quality, global state (not thread-safe), and modulo bias with `% 4`.
// Modern C++ (C++11+) offers <random> with engines like std::mt19937 and
// distributions like std::uniform_int_distribution for better quality.
//
// Compare with:
//   Java → `Math.random()` or `java.util.Random`; `ThreadLocalRandom` for threads.
//   Python → `random.randint()` uses Mersenne Twister; `secrets` for crypto.
//   JavaScript → `Math.random()` is a PRNG; no built-in seeding mechanism.
//   TypeScript → Same as JS; no additional random facilities.
//
// KEY CONCEPT: Prefer C++ <random> over std::rand() for better randomness,
// thread safety, and unbiased distributions — std::rand() is a C legacy.
// ═══════════════════════════════════════════════════════

Ghost::Ghost(int startX, int startY, const std::string& name, const std::string& color)
    : gridX(startX), gridY(startY),
      name(name), color(color),
      moveCounter(0)
{
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Ghost AI — Random Direction Selection
// ═══════════════════════════════════════════════════════
// Every 20 frames, a ghost picks one of 4 cardinal directions at random and
// moves if the target cell is not a wall. This is the simplest ghost AI —
// purely random. Classic Pac-Man uses distinct personality algorithms per ghost
// (Blinky chases directly, Pinky ambushes ahead, etc.). The switch/case maps
// integers 0-3 to directions, a common C/C++ pattern for enum-like dispatch.
//
// Compare with:
//   Java → Same switch/case; could also use an enum with a Direction[] array.
//   Python → `if/elif` chain or dictionary dispatch `{0: left, 1: right, ...}`.
//   JavaScript → Switch or object lookup; no true enum support.
//   TypeScript → `enum Direction { Left, Right, Up, Down }` with exhaustive switch.
//
// KEY CONCEPT: Random ghost movement is a baseline AI — real Pac-Man ghosts
// use targeting algorithms that create emergent difficulty.
// ═══════════════════════════════════════════════════════
void Ghost::update(const Maze& maze) {
    moveCounter++;

    // Ghosts only attempt to move every 20 frames (ghost.move_interval_frames)
    if (moveCounter % 20 == 0) {
        int direction = std::rand() % 4;

        switch (direction) {
            case 0: // Left
                if (!maze.isWall(gridX - 1, gridY)) gridX--;
                break;
            case 1: // Right
                if (!maze.isWall(gridX + 1, gridY)) gridX++;
                break;
            case 2: // Up
                if (!maze.isWall(gridX, gridY - 1)) gridY--;
                break;
            case 3: // Down
                if (!maze.isWall(gridX, gridY + 1)) gridY++;
                break;
        }
    }
}

int Ghost::getGridX() const {
    return gridX;
}

int Ghost::getGridY() const {
    return gridY;
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Returning const References
// ═══════════════════════════════════════════════════════
// getName() and getColor() return `const std::string&` — a reference to the
// internal string without copying it. This is efficient (no heap allocation for
// the copy) but the caller must not store the reference beyond the Ghost's
// lifetime. Returning by value would be safer but slower for large strings.
// This trade-off (performance vs. lifetime safety) is unique to C++.
//
// Compare with:
//   Java → Returns a reference to the String object (immutable, GC-safe).
//   Python → Returns a reference; GC prevents dangling (refcount/cycle collector).
//   JavaScript → Strings are primitives, always copied (but engines optimize this).
//   TypeScript → Same as JS; no dangling-reference concern.
//
// KEY CONCEPT: Returning `const&` avoids copies but requires the caller to
// respect the referenced object's lifetime — a core C++ ownership concern.
// ═══════════════════════════════════════════════════════
const std::string& Ghost::getName() const {
    return name;
}

const std::string& Ghost::getColor() const {
    return color;
}
