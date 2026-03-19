// SDL2 rendering implementation for Pacman.
// Source of truth: shared/game_constants.json
#include "game_panel.h"
#include "game_logic.h"
#include <cstdlib>
#include <string>
#include <sstream>

// ---------------------------------------------------------------------------
// Construction / destruction
// ---------------------------------------------------------------------------

GamePanel::GamePanel(GameLogic& logic, SDL_Renderer* renderer)
    : gameLogic(logic),
      renderer(renderer),
      running(true)
{
}

GamePanel::~GamePanel() {
    // We do NOT own the renderer — caller destroys it.
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

bool GamePanel::isRunning() const {
    return running;
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Input Handling — SDL2 Event Processing
// ═══════════════════════════════════════════════════════
// SDL2 uses a C-style event union (SDL_Event) where the `type` field tells you
// which member of the union is valid. For SDL_KEYDOWN, `event.key.keysym.scancode`
// gives the physical key pressed. The switch/case maps scancodes to game
// directions. SDL_SCANCODE_* refers to physical key positions (layout-independent),
// while SDL_KEYCODE_* (SDLK_*) refers to logical characters — scancodes are
// preferred for game input since WASD stays in the same place on any keyboard.
//
// Compare with:
//   Java → `KeyListener.keyPressed(KeyEvent e)` with `e.getKeyCode()`.
//   Python → Pygame: `pygame.event.get()` with `event.key == pygame.K_UP`.
//   JavaScript → `document.addEventListener('keydown', e => e.key)`.
//   TypeScript → Same as JS with `KeyboardEvent` type for the event object.
//
// KEY CONCEPT: SDL2 scancodes represent physical key positions — use them
// for game input so controls work correctly on any keyboard layout.
// ═══════════════════════════════════════════════════════
void GamePanel::handleInput(const SDL_Event& event) {
    if (event.type == SDL_QUIT) {
        running = false;
        return;
    }

    if (event.type == SDL_KEYDOWN) {
        switch (event.key.keysym.scancode) {
            case SDL_SCANCODE_UP:
                gameLogic.getPacman().setDirection(0, -1);
                break;
            case SDL_SCANCODE_DOWN:
                gameLogic.getPacman().setDirection(0, 1);
                break;
            case SDL_SCANCODE_LEFT:
                gameLogic.getPacman().setDirection(-1, 0);
                break;
            case SDL_SCANCODE_RIGHT:
                gameLogic.getPacman().setDirection(1, 0);
                break;
            case SDL_SCANCODE_ESCAPE:
                running = false;
                break;
            default:
                break;
        }
    }
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Rendering — SDL2 Draw-Then-Present Pipeline
// ═══════════════════════════════════════════════════════
// SDL2 uses double-buffering: all draw calls (SetRenderDrawColor, FillRect,
// etc.) write to a back buffer. SDL_RenderPresent() then swaps it to the
// screen in one atomic operation, preventing flicker. This is the same
// principle behind Java's BufferStrategy, Pygame's display.flip(), and the
// HTML5 Canvas (which auto-presents after the JS event handler returns).
//
// Compare with:
//   Java → `BufferStrategy.show()` or Swing's automatic double-buffering.
//   Python → Pygame `display.flip()` or `display.update()`.
//   JavaScript → Canvas auto-presents; WebGL needs explicit `gl.flush()`.
//   TypeScript → Same as JS; canvas rendering is identical.
//
// KEY CONCEPT: Double-buffering draws to an offscreen buffer then flips it
// to the display — preventing visual tearing and partial-frame artifacts.
// ═══════════════════════════════════════════════════════
void GamePanel::render() {
    // Clear to black background
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
    SDL_RenderClear(renderer);

    renderMaze();
    renderPellets();
    renderPacman();
    renderGhosts();

    if (gameLogic.isGameOver()) {
        renderGameOver();
    }

    SDL_RenderPresent(renderer);
}

void GamePanel::updateTitle(SDL_Window* window) const {
    std::string title = "Pacman - C++/SDL2  |  Score: "
                      + std::to_string(gameLogic.getScore());
    if (gameLogic.isGameOver()) {
        title += "  |  GAME OVER";
    }
    SDL_SetWindowTitle(window, title.c_str());
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Rendering — Tile-Based Drawing with SDL_Rect
// ═══════════════════════════════════════════════════════
// Each maze cell is drawn as a TILE_SIZE x TILE_SIZE filled rectangle.
// SDL_Rect is a plain C struct {int x, y, w, h} — no constructor, no
// destructor, zero overhead. C++ allows aggregate initialization with braces:
// `SDL_Rect rect = {x, y, w, h};` which is concise and efficient. The nested
// loop iterates all cells, drawing only walls — this brute-force approach
// works fine for small grids but would need culling/spatial partitioning for
// large worlds.
//
// Compare with:
//   Java → `Graphics2D.fillRect(x, y, w, h)` — similar immediate-mode API.
//   Python → `pygame.draw.rect(surface, color, (x, y, w, h))`.
//   JavaScript → `ctx.fillRect(x, y, w, h)` — Canvas 2D is very similar.
//   TypeScript → Same as JS Canvas API with typed context.
//
// KEY CONCEPT: SDL_Rect is a plain-old-data (POD) struct with zero overhead —
// C++ aggregate initialization makes creating them concise and allocation-free.
// ═══════════════════════════════════════════════════════
void GamePanel::renderMaze() {
    const Maze& maze = gameLogic.getMaze();

    // Walls: blue filled rectangles, TILE_SIZE x TILE_SIZE
    SDL_SetRenderDrawColor(renderer, 0, 0, 255, 255);

    for (int x = 0; x < maze.getWidth(); ++x) {
        for (int y = 0; y < maze.getHeight(); ++y) {
            if (maze.isWall(x, y)) {
                SDL_Rect rect = {
                    x * TILE_SIZE,
                    y * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE
                };
                SDL_RenderFillRect(renderer, &rect);
            }
        }
    }
}

void GamePanel::renderPellets() {
    const Maze& maze = gameLogic.getMaze();

    // Pellets: white 4x4 rectangles centered in each tile
    SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);

    const int pelletSize = 4;
    const int offset = (TILE_SIZE - pelletSize) / 2;

    for (int x = 0; x < maze.getWidth(); ++x) {
        for (int y = 0; y < maze.getHeight(); ++y) {
            if (maze.hasPellet(x, y)) {
                SDL_Rect rect = {
                    x * TILE_SIZE + offset,
                    y * TILE_SIZE + offset,
                    pelletSize,
                    pelletSize
                };
                SDL_RenderFillRect(renderer, &rect);
            }
        }
    }
}

void GamePanel::renderPacman() {
    const Pacman& pac = gameLogic.getPacman();

    // Yellow 16x16 filled rectangle centered in the tile
    SDL_SetRenderDrawColor(renderer, 255, 255, 0, 255);

    const int pacSize = 16;
    const int offset = (TILE_SIZE - pacSize) / 2;

    SDL_Rect rect = {
        pac.getGridX() * TILE_SIZE + offset,
        pac.getGridY() * TILE_SIZE + offset,
        pacSize,
        pacSize
    };
    SDL_RenderFillRect(renderer, &rect);
}

void GamePanel::renderGhosts() {
    const auto& ghosts = gameLogic.getGhosts();

    const int ghostSize = 18;
    const int bodyOffset = (TILE_SIZE - ghostSize) / 2;
    const int eyeSize = 4;

    for (const auto& ghost : ghosts) {
        Uint8 r, g, b;
        parseHexColor(ghost.getColor(), r, g, b);

        // Ghost body: colored 18x18 rectangle
        SDL_SetRenderDrawColor(renderer, r, g, b, 255);
        SDL_Rect body = {
            ghost.getGridX() * TILE_SIZE + bodyOffset,
            ghost.getGridY() * TILE_SIZE + bodyOffset,
            ghostSize,
            ghostSize
        };
        SDL_RenderFillRect(renderer, &body);

        // Eyes: two white 4x4 rectangles in upper portion of the ghost body
        SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);

        // Left eye
        SDL_Rect leftEye = {
            body.x + 3,
            body.y + 3,
            eyeSize,
            eyeSize
        };
        SDL_RenderFillRect(renderer, &leftEye);

        // Right eye
        SDL_Rect rightEye = {
            body.x + ghostSize - 3 - eyeSize,
            body.y + 3,
            eyeSize,
            eyeSize
        };
        SDL_RenderFillRect(renderer, &rightEye);

        // Pupils: two dark-blue 2x2 rectangles inside the eyes
        SDL_SetRenderDrawColor(renderer, 0, 0, 128, 255);

        SDL_Rect leftPupil = {
            leftEye.x + 1,
            leftEye.y + 1,
            2,
            2
        };
        SDL_RenderFillRect(renderer, &leftPupil);

        SDL_Rect rightPupil = {
            rightEye.x + 1,
            rightEye.y + 1,
            2,
            2
        };
        SDL_RenderFillRect(renderer, &rightPupil);
    }
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Rendering — Alpha Blending for Overlays
// ═══════════════════════════════════════════════════════
// SDL2 requires explicitly enabling blend mode before drawing translucent
// shapes. The alpha channel (120 out of 255 here) controls opacity. After
// drawing, blend mode is reset to NONE for subsequent opaque draws. This
// explicit state management is typical of C-level graphics APIs where you
// control the GPU pipeline state directly.
//
// Compare with:
//   Java → `Graphics2D.setComposite(AlphaComposite.getInstance(...))`.
//   Python → Pygame: `surface.set_alpha(120)` or per-pixel alpha with convert_alpha().
//   JavaScript → `ctx.globalAlpha = 0.47` or `rgba(200, 0, 0, 0.47)` in fillStyle.
//   TypeScript → Same as JS Canvas; `globalAlpha` property.
//
// KEY CONCEPT: SDL2's explicit blend-mode state must be toggled on/off —
// forgetting to reset it is a common bug that makes everything translucent.
// ═══════════════════════════════════════════════════════
void GamePanel::renderGameOver() {
    // Draw a semi-transparent red overlay to indicate game over.
    // SDL2 supports alpha blending with SDL_BLENDMODE_BLEND.
    SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);
    SDL_SetRenderDrawColor(renderer, 200, 0, 0, 120);

    SDL_Rect overlay = { 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT };
    SDL_RenderFillRect(renderer, &overlay);

    // Reset blend mode
    SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_NONE);

    // Draw a centered white rectangle as a "GAME OVER" placeholder banner.
    // (Proper text would require SDL_ttf; the title bar already shows the text.)
    SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
    const int bannerW = 200;
    const int bannerH = 40;
    SDL_Rect banner = {
        (WINDOW_WIDTH - bannerW) / 2,
        (WINDOW_HEIGHT - bannerH) / 2,
        bannerW,
        bannerH
    };
    SDL_RenderFillRect(renderer, &banner);

    // Inner dark rectangle to create a border effect
    SDL_SetRenderDrawColor(renderer, 200, 0, 0, 255);
    SDL_Rect inner = {
        banner.x + 4,
        banner.y + 4,
        bannerW - 8,
        bannerH - 8
    };
    SDL_RenderFillRect(renderer, &inner);
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: String Parsing — istringstream for Hex Colors
// ═══════════════════════════════════════════════════════
// C++ has no built-in hex-color parser, so we use std::istringstream with
// the `std::hex` manipulator to parse "#RRGGBB" into an unsigned int, then
// extract R/G/B via bit-shifting. The static_cast<Uint8> is required because
// C++ is strict about narrowing conversions. This manual parsing is verbose
// compared to other languages but gives full control over error handling.
//
// Compare with:
//   Java → `Color.decode("#FF0000")` or `Integer.parseInt(hex, 16)`.
//   Python → `int(hex[1:], 16)` — one-liner with slice and base conversion.
//   JavaScript → `parseInt(hex.slice(1), 16)` — very similar to Python.
//   TypeScript → Same as JS; could add a return type like `{r: number, g: number, b: number}`.
//
// KEY CONCEPT: C++ requires explicit parsing and casting for type conversions —
// more verbose than dynamic languages but catches type errors at compile time.
// ═══════════════════════════════════════════════════════
void GamePanel::parseHexColor(const std::string& hex, Uint8& r, Uint8& g, Uint8& b) {
    // Expected format: "#RRGGBB"
    if (hex.size() == 7 && hex[0] == '#') {
        unsigned int rgb = 0;
        std::istringstream iss(hex.substr(1));
        iss >> std::hex >> rgb;
        r = static_cast<Uint8>((rgb >> 16) & 0xFF);
        g = static_cast<Uint8>((rgb >> 8) & 0xFF);
        b = static_cast<Uint8>(rgb & 0xFF);
    } else {
        // Fallback: white
        r = 255;
        g = 255;
        b = 255;
    }
}
