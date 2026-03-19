// Pacman C++/SDL2 — entry point and game loop.
// Source of truth: shared/game_constants.json
#include <SDL2/SDL.h>
#include "game_logic.h"
#include "game_panel.h"
#include <cstdio>
#include <cstdlib>
#include <ctime>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Game Loop Timing — Fixed Frame Rate Cap
// ═══════════════════════════════════════════════════════
// FRAME_DELAY = 1000ms / 60 = ~16ms per frame. The game loop measures how long
// each frame takes (SDL_GetTicks delta) and calls SDL_Delay() for the remainder.
// This is a simple "sleep-based" frame cap. More sophisticated approaches use
// fixed-timestep with interpolation (e.g., "fix your timestep" pattern) to
// decouple physics updates from rendering. The `static const` at file scope
// gives internal linkage — visible only within this translation unit.
//
// Compare with:
//   Java → `Thread.sleep(remaining)` in a game loop, or Swing Timer at ~16ms.
//   Python → `pygame.time.Clock().tick(60)` handles the delay automatically.
//   JavaScript → `requestAnimationFrame` is V-sync driven (~16ms); no manual delay.
//   TypeScript → Same as JS; `requestAnimationFrame` callback pattern.
//
// KEY CONCEPT: Sleep-based frame capping is simple but imprecise — SDL_Delay
// has ~1ms granularity; VSync (already enabled via SDL_RENDERER_PRESENTVSYNC)
// provides smoother timing when available.
// ═══════════════════════════════════════════════════════

static const int TARGET_FPS = 60;
static const int FRAME_DELAY = 1000 / TARGET_FPS; // ~16 ms

// ═══════════════════════════════════════════════════════
// EMSCRIPTEN SUPPORT: Per-Frame Callback for Browser Main Loop
// ═══════════════════════════════════════════════════════
// Browsers cannot run a blocking while(true) loop — the page would freeze
// and never get a chance to paint or process user input. Emscripten provides
// `emscripten_set_main_loop()` which registers a C callback to be invoked
// once per animation frame (via requestAnimationFrame under the hood).
// We package all per-frame state into a file-scope struct so the static
// callback function can access gameLogic, gamePanel, and the window pointer.
// The #ifdef __EMSCRIPTEN__ guard ensures desktop builds are unaffected.
// ═══════════════════════════════════════════════════════

#ifdef __EMSCRIPTEN__
struct EmscriptenLoopContext {
    GameLogic*  gameLogic;
    GamePanel*  gamePanel;
    SDL_Window* window;
};

static EmscriptenLoopContext g_emCtx;

static void emscripten_frame_callback() {
    // --- Event handling ---
    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        g_emCtx.gamePanel->handleInput(event);
    }

    // --- Update ---
    if (!g_emCtx.gameLogic->isGameOver()) {
        g_emCtx.gameLogic->update();
    }

    // --- Render ---
    g_emCtx.gamePanel->render();
    g_emCtx.gamePanel->updateTitle(g_emCtx.window);

    // --- Check for quit (Escape pressed, window close, etc.) ---
    if (!g_emCtx.gamePanel->isRunning()) {
        emscripten_cancel_main_loop();
    }
}
#endif // __EMSCRIPTEN__

int main(int argc, char* argv[]) {
    (void)argc;
    (void)argv;

    // Seed the random number generator (used by Ghost movement)
    std::srand(static_cast<unsigned>(std::time(nullptr)));

    // ------------------------------------------------------------------
    // SDL2 initialisation
    // ------------------------------------------------------------------
    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Manual Resource Management — No Garbage Collector
    // ═══════════════════════════════════════════════════════
    // SDL2 is a C library: SDL_Init() initializes subsystems, SDL_CreateWindow()
    // and SDL_CreateRenderer() allocate GPU resources. Each has a matching
    // destroy function that MUST be called — there is no GC. Notice the
    // "cascade cleanup" pattern: if renderer creation fails, we destroy the
    // window AND call SDL_Quit() before returning. Modern C++ would use RAII
    // wrappers (e.g., std::unique_ptr with custom deleters) to automate this,
    // but the explicit style shown here is common in SDL tutorials.
    //
    // Compare with:
    //   Java → JFrame/Canvas managed by AWT; GC cleans up native peers.
    //   Python → Pygame: `pygame.init()` / `pygame.quit()` with atexit hooks.
    //   JavaScript → Canvas element is DOM-managed; browser handles GPU resources.
    //   TypeScript → Same as JS; no manual resource cleanup needed.
    //
    // KEY CONCEPT: C++ has no garbage collector — every SDL resource must be
    // explicitly destroyed in reverse creation order to prevent leaks.
    // ═══════════════════════════════════════════════════════
    if (SDL_Init(SDL_INIT_VIDEO) != 0) {
        std::fprintf(stderr, "SDL_Init failed: %s\n", SDL_GetError());
        return 1;
    }

    SDL_Window* window = SDL_CreateWindow(
        "Pacman - C++/SDL2",
        SDL_WINDOWPOS_CENTERED,
        SDL_WINDOWPOS_CENTERED,
        GamePanel::WINDOW_WIDTH,
        GamePanel::WINDOW_HEIGHT,
        SDL_WINDOW_SHOWN
    );
    if (!window) {
        std::fprintf(stderr, "SDL_CreateWindow failed: %s\n", SDL_GetError());
        SDL_Quit();
        return 1;
    }

    SDL_Renderer* renderer = SDL_CreateRenderer(
        window, -1,
        SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC
    );
    if (!renderer) {
        std::fprintf(stderr, "SDL_CreateRenderer failed: %s\n", SDL_GetError());
        SDL_DestroyWindow(window);
        SDL_Quit();
        return 1;
    }

    // ------------------------------------------------------------------
    // Game objects
    // ------------------------------------------------------------------
    GameLogic gameLogic;
    GamePanel gamePanel(gameLogic, renderer);

    // ------------------------------------------------------------------
    // Main loop — 60 FPS
    // ------------------------------------------------------------------
    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: The Classic Game Loop — Poll / Update / Render
    // ═══════════════════════════════════════════════════════
    // This is the canonical game loop pattern used across all languages:
    //   1. POLL events (input, window close)
    //   2. UPDATE game state (physics, AI, collisions)
    //   3. RENDER the new frame
    //   4. WAIT to cap frame rate
    // In C++ with SDL2, the loop is explicit — YOU own the while() loop.
    // SDL_PollEvent drains the OS event queue without blocking. The inner
    // `while` ensures ALL queued events are processed before the next frame,
    // preventing input lag on fast key presses.
    //
    // Compare with:
    //   Java → Swing Timer fires repaint; or explicit loop with Thread.sleep.
    //   Python → `while running: for event in pygame.event.get(): ...`
    //   JavaScript → No explicit loop; `requestAnimationFrame(callback)` is recursive.
    //   TypeScript → Same as JS; the browser drives the loop via rAF callbacks.
    //
    // KEY CONCEPT: C++ gives full control over the game loop — you decide
    // exactly when to poll, update, render, and sleep each frame.
    // ═══════════════════════════════════════════════════════

#ifdef __EMSCRIPTEN__
    // ---------------------------------------------------------------
    // Emscripten path: hand control to the browser's animation loop.
    // ---------------------------------------------------------------
    // We store pointers to our stack-allocated game objects in a file-scope
    // struct so the static callback can reach them. emscripten_set_main_loop()
    // uses requestAnimationFrame internally; the second parameter (0) means
    // "use the browser's default frame rate" (typically 60 Hz on most monitors).
    // The third parameter (1) tells Emscripten to simulate an infinite loop
    // (i.e., it does NOT return — the rest of main() after this call is never
    // reached until emscripten_cancel_main_loop() is called).
    g_emCtx.gameLogic = &gameLogic;
    g_emCtx.gamePanel = &gamePanel;
    g_emCtx.window    = window;
    emscripten_set_main_loop(emscripten_frame_callback, 0, 1);
#else
    // ---------------------------------------------------------------
    // Desktop path: traditional blocking game loop with frame-rate cap.
    // ---------------------------------------------------------------
    while (gamePanel.isRunning()) {
        Uint32 frameStart = SDL_GetTicks();

        // --- Event handling ---
        SDL_Event event;
        while (SDL_PollEvent(&event)) {
            gamePanel.handleInput(event);
        }

        // --- Update ---
        if (!gameLogic.isGameOver()) {
            gameLogic.update();
        }

        // --- Render ---
        gamePanel.render();
        gamePanel.updateTitle(window);

        // --- Frame-rate cap ---
        Uint32 frameTime = SDL_GetTicks() - frameStart;
        if (frameTime < static_cast<Uint32>(FRAME_DELAY)) {
            SDL_Delay(static_cast<Uint32>(FRAME_DELAY) - frameTime);
        }
    }
#endif // __EMSCRIPTEN__

    // ------------------------------------------------------------------
    // Cleanup
    // ------------------------------------------------------------------
    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Deterministic Cleanup — Reverse Order Destruction
    // ═══════════════════════════════════════════════════════
    // Resources are destroyed in reverse creation order: renderer first (it
    // depends on the window), then window, then SDL subsystem. This mirrors
    // how C++ destructors run for stack objects (LIFO). If we used RAII
    // wrappers (unique_ptr with custom deleters), this cleanup would be
    // automatic. The explicit style here makes the dependency chain visible,
    // which is valuable for learning but error-prone in larger codebases.
    //
    // Compare with:
    //   Java → `System.exit(0)` or just return; GC + finalizers handle cleanup.
    //   Python → `pygame.quit()` at end; atexit hooks for safety.
    //   JavaScript → Page unload cleans up Canvas; no explicit destruction.
    //   TypeScript → Same as JS; browser manages all resources.
    //
    // KEY CONCEPT: C++ destruction order matters — destroy dependents before
    // their dependencies, matching the reverse of construction order (LIFO).
    // ═══════════════════════════════════════════════════════
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
