#pragma once
// Source of truth: shared/game_constants.json
// ZERO SDL2/rendering includes — pure game entity

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Forward Declarations & Minimal Includes
// ═══════════════════════════════════════════════════════
// Instead of #include "maze.h", we use `class Maze;` — a forward declaration.
// This tells the compiler "Maze is a class that exists" without pulling in its
// full definition. This works because the header only uses Maze via references
// (const Maze&), which don't need to know Maze's size or layout. The full
// #include is deferred to the .cpp file where Maze members are actually called.
// This dramatically reduces compile times in large projects.
//
// Compare with:
//   Java → No forward declarations; import is always the full class.
//   Python → Imports are lazy by nature; circular imports handled at runtime.
//   JavaScript → ES module imports are hoisted; no forward declaration concept.
//   TypeScript → `import type` gives a similar compile-only lightweight import.
//
// KEY CONCEPT: Forward declarations reduce header dependencies and speed up
// C++ compilation — include only what you truly need in each header.
// ═══════════════════════════════════════════════════════

class Maze; // Forward declaration

class Pacman {
public:
    Pacman();

    void setDirection(int dx, int dy);
    void update(const Maze& maze);

    int getGridX() const;
    int getGridY() const;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Input Handling — Direction Buffering
// ═══════════════════════════════════════════════════════
// Pacman stores both a current direction (dirX/dirY) and a "next" queued
// direction (nextDirX/nextDirY). When the player presses an arrow key,
// setDirection() updates the *next* direction. On the next update tick,
// the game tries the queued direction first, falling back to the current one.
// This "input buffering" pattern makes controls feel responsive — the player
// can press a direction slightly before reaching a corridor opening.
//
// Compare with:
//   Java → Same pattern using int fields; identical logic structure.
//   Python → Typically uses a tuple like `self.next_dir = (dx, dy)`.
//   JavaScript → Often stored as `{dx, dy}` objects with no type safety.
//   TypeScript → Can use a typed `Direction` interface for compile-time checks.
//
// KEY CONCEPT: Buffering the next input direction before applying it creates
// smoother, more forgiving player controls in grid-based movement.
// ═══════════════════════════════════════════════════════

private:
    int gridX;
    int gridY;
    int dirX;
    int dirY;
    int nextDirX;
    int nextDirY;

    bool isValidMove(int x, int y, const Maze& maze) const;
};
