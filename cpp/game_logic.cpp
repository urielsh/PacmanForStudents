// Source of truth: shared/game_constants.json
#include "game_logic.h"

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: emplace_back — In-Place Construction
// ═══════════════════════════════════════════════════════
// `ghosts.emplace_back(10, 10, "Blinky", "#FF0000")` constructs a Ghost
// directly inside the vector's internal array, forwarding the arguments to
// Ghost's constructor. This avoids creating a temporary Ghost and then copying
// or moving it. emplace_back is a C++11 feature that uses variadic templates
// and perfect forwarding — powerful metaprogramming that has no equivalent in
// most other languages.
//
// Compare with:
//   Java → `ghosts.add(new Ghost(10, 10, "Blinky", "#FF0000"))` — heap alloc + GC.
//   Python → `ghosts.append(Ghost(10, 10, "Blinky", "#FF0000"))` — always heap.
//   JavaScript → `ghosts.push(new Ghost(...))` — same, GC-managed.
//   TypeScript → Same as JS; no in-place construction concept.
//
// KEY CONCEPT: emplace_back constructs objects in-place within the vector,
// avoiding unnecessary copies — a key C++ performance optimization.
// ═══════════════════════════════════════════════════════

GameLogic::GameLogic()
    : score(0), gameOver(false)
{
    // Initialize 4 ghosts from shared/game_constants.json ghost_starts
    ghosts.emplace_back(10, 10, "Blinky", "#FF0000");
    ghosts.emplace_back(10, 11, "Pinky",  "#FFB8FF");
    ghosts.emplace_back(11, 10, "Inky",   "#00FFFF");
    ghosts.emplace_back(11, 11, "Clyde",  "#FF00FF");
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Game Loop Update — Range-Based For with auto&
// ═══════════════════════════════════════════════════════
// The `for (auto& ghost : ghosts)` loop is C++11 range-based for. `auto&`
// deduces the type (Ghost&) automatically and binds by reference so the
// update() call modifies the actual ghost in the vector, not a copy. Without
// the `&`, each iteration would copy the Ghost — a subtle but critical bug
// in C++ that doesn't exist in GC languages where everything is a reference.
//
// Compare with:
//   Java → `for (Ghost g : ghosts)` — g is a reference (Java objects are always refs).
//   Python → `for ghost in ghosts:` — ghost is a reference (Python objects are always refs).
//   JavaScript → `for (const ghost of ghosts)` — ghost is a reference to the object.
//   TypeScript → Same as JS, with type inference.
//
// KEY CONCEPT: In C++ range-for loops, always use `auto&` (or `const auto&`)
// to avoid accidental copies — this is a common source of subtle bugs.
// ═══════════════════════════════════════════════════════
void GameLogic::update() {
    if (gameOver) {
        return;
    }

    pacman.update(maze);

    for (auto& ghost : ghosts) {
        ghost.update(maze);
    }

    checkCollisions();
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Collision Detection — Pellet Collection & Ghost Hit
// ═══════════════════════════════════════════════════════
// This method performs two collision checks per frame:
// 1. Pellet: if Pacman's grid cell has a pellet, remove it and add score.
// 2. Ghost: if any ghost shares Pacman's cell, trigger game over.
// Grid-based collision (comparing integer coordinates) is O(1) per entity
// and avoids floating-point imprecision. Note `const auto&` in the ghost
// loop — read-only access since we only query ghost positions.
//
// Compare with:
//   Java → Same coordinate comparison; ArrayList iteration.
//   Python → `if pac.x == ghost.x and pac.y == ghost.y` — identical logic.
//   JavaScript → Same equality check; no operator overloading concerns.
//   TypeScript → Same as JS with type annotations.
//
// KEY CONCEPT: Grid-based collision detection compares integer coordinates
// for exact matches — simple, fast, and free of floating-point edge cases.
// ═══════════════════════════════════════════════════════
void GameLogic::checkCollisions() {
    int pacX = pacman.getGridX();
    int pacY = pacman.getGridY();

    // Pellet collection
    if (maze.hasPellet(pacX, pacY)) {
        maze.removePellet(pacX, pacY);
        score += PELLET_POINTS;
    }

    // Ghost collision -> game over
    for (const auto& ghost : ghosts) {
        if (pacX == ghost.getGridX() && pacY == ghost.getGridY()) {
            gameOver = true;
        }
    }
}

int GameLogic::getScore() const {
    return score;
}

bool GameLogic::isGameOver() const {
    return gameOver;
}

Maze& GameLogic::getMaze() {
    return maze;
}

const Maze& GameLogic::getMaze() const {
    return maze;
}

Pacman& GameLogic::getPacman() {
    return pacman;
}

const Pacman& GameLogic::getPacman() const {
    return pacman;
}

std::vector<Ghost>& GameLogic::getGhosts() {
    return ghosts;
}

const std::vector<Ghost>& GameLogic::getGhosts() const {
    return ghosts;
}
