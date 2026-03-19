#pragma once
// Source of truth: shared/game_constants.json
// ZERO SDL2/rendering includes — pure game data

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Header/Source Separation (C++ Compilation Model)
// ═══════════════════════════════════════════════════════
// In C++, every class is typically split into a .h (declaration) and .cpp
// (definition) file. The compiler processes each .cpp independently into an
// object file (.o); the linker then merges them. `#pragma once` prevents the
// same header from being included twice in one translation unit, avoiding
// duplicate-definition errors.
//
// Compare with:
//   Java → One file per public class; no separate header needed.
//   Python → One .py module; import system handles deduplication.
//   JavaScript → ES modules; `import`/`export` with no header concept.
//   TypeScript → .d.ts declaration files exist but are optional/auto-generated.
//
// KEY CONCEPT: C++ separates interface (.h) from implementation (.cpp),
// giving fine-grained control over compilation speed and encapsulation.
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Static Const Arrays vs. Dynamic Containers
// ═══════════════════════════════════════════════════════
// The maze stores its grid as fixed-size 2D C-style arrays (bool[40][30]).
// Because MAZE_WIDTH and MAZE_HEIGHT are compile-time constants (`static const int`),
// the compiler can allocate these arrays on the stack with zero heap overhead.
// This is extremely cache-friendly and fast but inflexible at runtime.
//
// Compare with:
//   Java → boolean[][] allocated on the heap; size fixed after `new` but GC-managed.
//   Python → Nested lists; fully dynamic, but slower due to per-element boxing.
//   JavaScript → 2D arrays are arrays-of-arrays on the heap; V8 may optimize dense arrays.
//   TypeScript → Same as JS at runtime; `readonly` gives compile-time immutability only.
//
// KEY CONCEPT: C++ static arrays live on the stack with zero allocation cost,
// trading runtime flexibility for deterministic performance.
// ═══════════════════════════════════════════════════════

class Maze {
public:
    static const int MAZE_WIDTH = 40;
    static const int MAZE_HEIGHT = 30;

    Maze();

    bool isWall(int x, int y) const;
    bool hasPellet(int x, int y) const;
    void removePellet(int x, int y);

    int getWidth() const;
    int getHeight() const;

private:
    bool walls[MAZE_WIDTH][MAZE_HEIGHT];
    bool pellets[MAZE_WIDTH][MAZE_HEIGHT];

    void initializeMaze();
};
