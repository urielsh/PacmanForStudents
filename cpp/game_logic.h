#pragma once
// Source of truth: shared/game_constants.json
// ZERO SDL2/rendering includes — pure game logic orchestrator

#include "maze.h"
#include "pacman.h"
#include "ghost.h"
#include <vector>

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Composition — Owning Game Objects by Value
// ═══════════════════════════════════════════════════════
// GameLogic owns a Maze, a Pacman, and a std::vector<Ghost> as direct member
// variables (by value, NOT by pointer). When GameLogic is destroyed, all its
// members are automatically destroyed in reverse order — no `delete` needed.
// This is C++ "value semantics" combined with RAII: the compiler generates the
// correct destructor chain. The vector manages its own heap array of Ghosts,
// growing as needed and freeing on destruction.
//
// Compare with:
//   Java → All objects are heap-allocated behind references; GC frees them.
//   Python → All objects are heap-allocated; refcount + GC frees them.
//   JavaScript → Same as Python; GC handles all memory.
//   TypeScript → Same as JS at runtime; types add compile-time structure only.
//
// KEY CONCEPT: C++ value semantics + RAII mean objects own their sub-objects
// directly — destruction is automatic, deterministic, and zero-overhead.
// ═══════════════════════════════════════════════════════

class GameLogic {
public:
    static const int PELLET_POINTS = 10;

    GameLogic();

    void update();
    int getScore() const;
    bool isGameOver() const;

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Const/Non-Const Overload Pairs
    // ═══════════════════════════════════════════════════════
    // Each getter has TWO overloads: one returning `Type&` (mutable) and one
    // returning `const Type&` (read-only). The compiler picks the const version
    // when called on a const GameLogic object. This pattern is idiomatic C++ for
    // providing both read and write access while respecting const-correctness.
    //
    // Compare with:
    //   Java → No overloading by const; single getter returns a mutable reference.
    //   Python → No const; a single property or method returns the same object.
    //   JavaScript → No const overloading; same reference returned always.
    //   TypeScript → `readonly` prevents reassignment but not deep mutation.
    //
    // KEY CONCEPT: Const/non-const overloads let C++ enforce read-only access
    // at compile time while still allowing mutation when appropriate.
    // ═══════════════════════════════════════════════════════
    Maze& getMaze();
    const Maze& getMaze() const;
    Pacman& getPacman();
    const Pacman& getPacman() const;
    std::vector<Ghost>& getGhosts();
    const std::vector<Ghost>& getGhosts() const;

private:
    Maze maze;
    Pacman pacman;
    std::vector<Ghost> ghosts;
    int score;
    bool gameOver;

    void checkCollisions();
};
