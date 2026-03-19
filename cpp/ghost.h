#pragma once
// Source of truth: shared/game_constants.json
// ZERO SDL2/rendering includes — pure game entity

#include <string>

class Maze; // Forward declaration

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Ghost AI — Class Design with std::string
// ═══════════════════════════════════════════════════════
// Each Ghost stores its name and color as std::string — C++'s dynamic string
// type that manages its own heap memory (allocating, growing, and freeing
// automatically via RAII). The constructor takes `const std::string&` to avoid
// copying the caller's string. Unlike C-style `char*`, std::string is safe,
// knows its own length, and cleans up automatically when the Ghost is destroyed.
//
// Compare with:
//   Java → `String` is immutable and GC-managed; no manual memory concerns.
//   Python → `str` is immutable and reference-counted; same ease of use.
//   JavaScript → Strings are immutable primitives; GC handles memory.
//   TypeScript → Same as JS; `string` type is a primitive.
//
// KEY CONCEPT: std::string is a RAII container — it allocates heap memory
// internally and frees it in its destructor, preventing memory leaks.
// ═══════════════════════════════════════════════════════

class Ghost {
public:
    Ghost(int startX, int startY, const std::string& name, const std::string& color);

    void update(const Maze& maze);

    int getGridX() const;
    int getGridY() const;
    const std::string& getName() const;
    const std::string& getColor() const;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Ghost AI — Movement Throttling via Frame Counter
// ═══════════════════════════════════════════════════════
// The `moveCounter` field counts frames since creation. Ghosts only attempt
// a move every 20 frames (see ghost.cpp), creating a speed differential
// between Pacman (moves every frame) and ghosts. This simple throttle avoids
// the need for floating-point speed values or timer callbacks.
//
// Compare with:
//   Java → Same approach using an int counter; `Timer`/`TimerTask` is an alternative.
//   Python → Could use `time.time()` for real-time or a frame counter for tick-based.
//   JavaScript → `requestAnimationFrame` + timestamp delta for browser games.
//   TypeScript → Same as JS; could type the counter as `number`.
//
// KEY CONCEPT: Frame-counting is the simplest movement-throttle technique —
// compare entity speed by varying how many frames between moves.
// ═══════════════════════════════════════════════════════

private:
    int gridX;
    int gridY;
    std::string name;
    std::string color;
    int moveCounter;
};
