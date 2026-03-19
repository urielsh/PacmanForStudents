// Source of truth: shared/game_constants.json
#include "pacman.h"
#include "maze.h"

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Member Initializer Lists
// ═══════════════════════════════════════════════════════
// C++ uses the `: member(value), ...` syntax (member initializer list) to
// initialize fields BEFORE the constructor body runs. This is not just
// syntactic sugar — for non-trivial types it avoids default-constructing then
// reassigning. For primitive ints here it ensures defined initial values
// (without this, they would contain garbage memory). The initializer list is
// the idiomatic and most efficient way to set up member state in C++.
//
// Compare with:
//   Java → Fields initialized inline or in the constructor body; no special syntax.
//   Python → `self.gridX = 5` in __init__(); no separate initialization phase.
//   JavaScript → `this.gridX = 5` in constructor(); same as Python approach.
//   TypeScript → Same as JS, but with type annotations on the fields.
//
// KEY CONCEPT: Member initializer lists are the preferred C++ way to
// initialize fields — they are more efficient and avoid uninitialized state.
// ═══════════════════════════════════════════════════════

Pacman::Pacman()
    : gridX(5), gridY(5),
      dirX(0), dirY(0),
      nextDirX(0), nextDirY(0)
{
}

void Pacman::setDirection(int dx, int dy) {
    nextDirX = dx;
    nextDirY = dy;
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Object Movement — Grid-Based Motion with Const References
// ═══════════════════════════════════════════════════════
// Pacman moves one grid cell per update tick. The `const Maze&` parameter
// passes the maze by reference (no copy) while guaranteeing this method won't
// modify it. In C++, passing by `const&` is the standard idiom for "read-only
// access without copying." Without `const`, the compiler would allow accidental
// mutation; without `&`, it would copy the entire Maze (including its arrays).
//
// Compare with:
//   Java → Objects always passed by reference (to the heap); no `const` enforcement.
//   Python → Objects passed by reference; no copy, but also no immutability guarantee.
//   JavaScript → Objects passed by reference; mutation is always possible.
//   TypeScript → `Readonly<Maze>` provides compile-time-only protection.
//
// KEY CONCEPT: `const Type&` is the C++ idiom for efficient, safe read-only
// parameter passing — zero copies and compiler-enforced immutability.
// ═══════════════════════════════════════════════════════
void Pacman::update(const Maze& maze) {
    // Try the buffered (queued) direction first
    int newX = gridX + nextDirX;
    int newY = gridY + nextDirY;

    if (isValidMove(newX, newY, maze)) {
        dirX = nextDirX;
        dirY = nextDirY;
        gridX = newX;
        gridY = newY;
    } else {
        // Fall back to continuing in current direction
        newX = gridX + dirX;
        newY = gridY + dirY;
        if (isValidMove(newX, newY, maze)) {
            gridX = newX;
            gridY = newY;
        }
    }
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Collision Detection — Wall Checking
// ═══════════════════════════════════════════════════════
// isValidMove() delegates to Maze::isWall(), which checks array bounds and
// grid state. This method is both `const` (won't modify Pacman) and takes
// `const Maze&` (won't modify the maze). The double `const` guarantee means
// the compiler proves this is a pure query with no side effects. In a larger
// game, such guarantees enable safe multithreading without locks.
//
// Compare with:
//   Java → Same delegation pattern, but no compile-time immutability proof.
//   Python → `def is_valid_move(self, x, y, maze):` — no const, relies on discipline.
//   JavaScript → Same as Python; no enforcement mechanism.
//   TypeScript → Can mark parameters as `Readonly<>` for compile-time safety.
//
// KEY CONCEPT: Marking both the method and its parameters `const` gives the
// compiler a proof of purity — enabling optimizations and preventing bugs.
// ═══════════════════════════════════════════════════════
bool Pacman::isValidMove(int x, int y, const Maze& maze) const {
    return !maze.isWall(x, y);
}

int Pacman::getGridX() const {
    return gridX;
}

int Pacman::getGridY() const {
    return gridY;
}
