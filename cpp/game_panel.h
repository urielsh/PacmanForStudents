#pragma once
// SDL2 rendering layer for the Pacman game.
// Source of truth: shared/game_constants.json

#include <SDL2/SDL.h>
#include <string>

class GameLogic;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Rendering — SDL2 Resource Ownership
// ═══════════════════════════════════════════════════════
// GamePanel holds a raw pointer to SDL_Renderer* but does NOT own it (the
// comment "caller must keep renderer alive" documents this contract). In
// modern C++, ownership is typically expressed via smart pointers
// (std::unique_ptr with a custom deleter for SDL resources), but raw pointers
// are still common when interfacing with C libraries like SDL2. The destructor
// intentionally does NOT call SDL_DestroyRenderer — that responsibility
// belongs to main.cpp which created the renderer.
//
// Compare with:
//   Java → Swing/AWT Graphics objects are managed by the framework; no manual cleanup.
//   Python → Pygame surfaces are refcounted; `del` or scope exit handles cleanup.
//   JavaScript → Canvas 2D context is GC-managed; no manual destruction.
//   TypeScript → Same as JS; no destructor concept.
//
// KEY CONCEPT: In C++, who creates a resource should destroy it — GamePanel
// borrows the renderer via raw pointer, leaving ownership to the caller.
// ═══════════════════════════════════════════════════════

class GamePanel {
public:
    static const int TILE_SIZE = 20;
    static const int WINDOW_WIDTH = 800;
    static const int WINDOW_HEIGHT = 600;

    // Takes ownership of nothing — caller must keep renderer alive.
    GamePanel(GameLogic& logic, SDL_Renderer* renderer);
    ~GamePanel();

    void render();
    void handleInput(const SDL_Event& event);
    bool isRunning() const;

    // Update the window title with the current score / game-over state.
    void updateTitle(SDL_Window* window) const;

private:
    GameLogic& gameLogic;
    SDL_Renderer* renderer;
    bool running;

    // Rendering helpers
    void renderMaze();
    void renderPellets();
    void renderPacman();
    void renderGhosts();
    void renderGameOver();

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Static Utility Methods & Output Parameters
    // ═══════════════════════════════════════════════════════
    // parseHexColor is `static` — it doesn't access any instance data, so it
    // belongs to the class rather than an object. It uses C++ output parameters
    // (Uint8& r, Uint8& g, Uint8& b) to "return" multiple values by reference.
    // Modern C++ might use std::tuple or a struct, but output params remain
    // common in performance-critical or C-interop code.
    //
    // Compare with:
    //   Java → Would return a Color object or int[3]; no output params.
    //   Python → Would return a tuple: `return (r, g, b)`.
    //   JavaScript → Would return an object: `{ r, g, b }` or array.
    //   TypeScript → Same as JS with a typed return: `[number, number, number]`.
    //
    // KEY CONCEPT: C++ output parameters via references allow returning multiple
    // values without heap allocation — a pattern from C that persists in C++.
    // ═══════════════════════════════════════════════════════
    static void parseHexColor(const std::string& hex, Uint8& r, Uint8& g, Uint8& b);
};
