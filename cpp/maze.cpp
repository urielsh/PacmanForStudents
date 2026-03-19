// Source of truth: shared/game_constants.json
#include "maze.h"

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Object Construction & Maze Initialization
// ═══════════════════════════════════════════════════════
// The constructor delegates all setup to initializeMaze(). In C++, member
// variables (the walls[][] and pellets[][] arrays) are NOT automatically zeroed
// for primitive types in a class — they contain whatever was previously in that
// memory. The explicit loop in initializeMaze() is therefore required for
// correctness, unlike Java where `new boolean[]` is guaranteed all-false.
//
// Compare with:
//   Java → `new boolean[W][H]` guarantees zero-initialization by the JVM.
//   Python → List comprehensions like `[[False]*H for _ in range(W)]` create fresh objects.
//   JavaScript → `Array(W).fill(null).map(() => Array(H).fill(false))`.
//   TypeScript → Same as JS; no built-in fixed-size array type.
//
// KEY CONCEPT: C++ does NOT zero-initialize primitive member arrays —
// always initialize them explicitly or use value-initialization syntax.
// ═══════════════════════════════════════════════════════

Maze::Maze() {
    initializeMaze();
}

void Maze::initializeMaze() {
    // Zero-initialize both arrays
    for (int x = 0; x < MAZE_WIDTH; x++) {
        for (int y = 0; y < MAZE_HEIGHT; y++) {
            walls[x][y] = false;
            pellets[x][y] = false;
        }
    }

    // Create border walls
    for (int x = 0; x < MAZE_WIDTH; x++) {
        walls[x][0] = true;
        walls[x][MAZE_HEIGHT - 1] = true;
    }
    for (int y = 0; y < MAZE_HEIGHT; y++) {
        walls[0][y] = true;
        walls[MAZE_WIDTH - 1][y] = true;
    }

    // Add internal walls (same layout as Java version)
    for (int x = 5; x < 15; x++) {
        walls[x][10] = true;
        walls[x][20] = true;
    }
    for (int y = 5; y < 25; y++) {
        walls[20][y] = true;
    }

    // Initialize pellets on every open tile except Pacman's start (5,5)
    for (int x = 1; x < MAZE_WIDTH - 1; x++) {
        for (int y = 1; y < MAZE_HEIGHT - 1; y++) {
            if (!walls[x][y] && !(x == 5 && y == 5)) {
                pellets[x][y] = true;
            }
        }
    }
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Bounds-Checking & Collision Detection
// ═══════════════════════════════════════════════════════
// C++ arrays have NO built-in bounds checking. Accessing walls[-1][5] would be
// undefined behavior — it silently reads/writes random memory, potentially
// crashing or corrupting data. This method manually checks bounds first and
// treats out-of-range coordinates as walls, forming the foundation of all
// collision detection in the game.
//
// Compare with:
//   Java → ArrayIndexOutOfBoundsException thrown automatically at runtime.
//   Python → IndexError raised; negative indices wrap around instead.
//   JavaScript → Returns `undefined` for out-of-range access (no crash, but bugs).
//   TypeScript → Compile-time checks help, but runtime behavior matches JS.
//
// KEY CONCEPT: C++ gives maximum speed by skipping bounds checks, but the
// programmer MUST guard against out-of-range access to avoid undefined behavior.
// ═══════════════════════════════════════════════════════
bool Maze::isWall(int x, int y) const {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
        return true; // Out-of-bounds treated as wall
    }
    return walls[x][y];
}

bool Maze::hasPellet(int x, int y) const {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
        return false;
    }
    return pellets[x][y];
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Const Correctness in C++
// ═══════════════════════════════════════════════════════
// Notice that isWall() and hasPellet() are marked `const` (they promise not to
// modify the object), while removePellet() is NOT const because it mutates the
// pellets array. The compiler enforces this: calling removePellet() through a
// `const Maze&` reference would be a compile error. This is a powerful C++
// feature for documenting and enforcing read-only intent.
//
// Compare with:
//   Java → No `const` keyword; `final` only prevents reassignment, not mutation.
//   Python → No enforcement; convention uses docstrings or typing.Final.
//   JavaScript → `Object.freeze()` is shallow and runtime-only.
//   TypeScript → `readonly` properties are compile-time only, not deep.
//
// KEY CONCEPT: C++ `const` methods are compiler-enforced promises of
// immutability, catching mutation bugs at compile time rather than runtime.
// ═══════════════════════════════════════════════════════
void Maze::removePellet(int x, int y) {
    if (x >= 0 && x < MAZE_WIDTH && y >= 0 && y < MAZE_HEIGHT) {
        pellets[x][y] = false;
    }
}

int Maze::getWidth() const {
    return MAZE_WIDTH;
}

int Maze::getHeight() const {
    return MAZE_HEIGHT;
}
