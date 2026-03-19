package com.packman;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Separation of Concerns — Game Logic Layer
// ═══════════════════════════════════════════════════════
// GameLogic is a pure logic class with NO rendering code.
// It owns the Maze, tracks the score, and handles collisions.
// This separation means you could swap the rendering layer
// (e.g., from Swing to JavaFX) without touching game rules.
//
// Compare with:
//   Python (Pygame) → Often mixed into the main loop; disciplined
//                      devs use a separate game_state module
//   JavaScript (Canvas) → Typically a Game class or module that
//                          tracks state separately from draw()
//   TypeScript → Same as JS but interfaces enforce the separation
//                (e.g., IGameState with typed score, isGameOver)
//   C++ (SDL2) → Often a GameState struct/class passed to both
//                update() and render() functions
//
// KEY CONCEPT: Separating logic from rendering makes your game
// testable (unit test collisions without a display), portable
// (same logic, different renderer), and maintainable.
// ═══════════════════════════════════════════════════════
public class GameLogic {
    private Maze maze;
    private int score = 0;
    private boolean gameOver = false;

    public GameLogic() {
        this.maze = new Maze();
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Collision Detection — Grid-Based
    // ═══════════════════════════════════════════════════════
    // This method checks TWO types of collisions every frame:
    //   1. Pacman vs. Pellets (item collection)
    //   2. Pacman vs. Ghosts (death condition)
    //
    // Because movement is grid-based (tile-by-tile), collision
    // detection is trivially simple: just compare grid coordinates.
    // No bounding boxes, no circle-circle tests, no SAT algorithm.
    // If two entities share the same (gridX, gridY), they collide.
    //
    // Compare with:
    //   Python (Pygame) → pygame.sprite.spritecollide() or
    //                      pygame.Rect.colliderect() for pixel-based
    //   JavaScript (Canvas) → Manual AABB: if (ax < bx+bw && ax+aw > bx ...)
    //   TypeScript → Same manual AABB but with typed Rect interfaces
    //   C++ (SDL2) → SDL_HasIntersection(&rectA, &rectB) for AABB
    //
    // KEY CONCEPT: Grid-based collision is the simplest form.
    // Pixel-based games need AABB (axis-aligned bounding box) or
    // circle tests. Physics engines add continuous collision
    // detection. Choose the simplest method your game allows.
    // ═══════════════════════════════════════════════════════
    public void checkCollisions(Pacman pacman, Ghost[] ghosts) {
        // Check pellet collection
        int pacmanX = pacman.getGridX();
        int pacmanY = pacman.getGridY();

        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: Pellet Collection — State Mutation
        // ═══════════════════════════════════════════════════════
        // When Pacman's grid position matches a pellet, we:
        //   1. Remove the pellet from the maze (maze state change)
        //   2. Increment the score (game state change)
        // This is a "trigger" collision — it modifies world state
        // rather than affecting movement (unlike wall collisions).
        //
        // Compare with:
        //   Python (Pygame) → sprite.kill() removes from group; score += 10
        //   JavaScript (Canvas) → pellets.splice(index, 1) or set flag
        //   TypeScript → Same as JS; pellets: Pellet[] with filter/splice
        //   C++ (SDL2) → Mark pellet as collected in array/vector; score++
        //
        // KEY CONCEPT: Games have two collision response types:
        // "physical" (bounce, stop) and "trigger" (collect, damage).
        // Pellets are triggers; walls are physical barriers.
        // ═══════════════════════════════════════════════════════
        if (maze.hasPellet(pacmanX, pacmanY)) {
            maze.removePellet(pacmanX, pacmanY);
            score += 10;
        }

        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: Ghost Collision — Game Over Trigger
        // ═══════════════════════════════════════════════════════
        // Ghost collision uses the same grid-coordinate comparison.
        // We loop through ALL ghosts because any one can end the game.
        // Setting gameOver = true stops the update loop in GamePanel.
        //
        // Compare with:
        //   Python (Pygame) → pygame.sprite.spritecollideany(pacman, ghost_group)
        //   JavaScript (Canvas) → ghosts.some(g => g.x === pac.x && g.y === pac.y)
        //   TypeScript → Same as JS with typed Ghost[] array
        //   C++ (SDL2) → for (auto& ghost : ghosts) { if (overlaps(pac, ghost)) ... }
        //
        // KEY CONCEPT: In a real Pacman, ghost collision is more nuanced
        // (power pellets make ghosts vulnerable). This simplified version
        // shows the core pattern: check condition, change game state.
        // ═══════════════════════════════════════════════════════
        for (Ghost ghost : ghosts) {
            if (pacmanX == ghost.getGridX() && pacmanY == ghost.getGridY()) {
                gameOver = true;
            }
        }
    }

    public Maze getMaze() {
        return maze;
    }

    public int getScore() {
        return score;
    }

    public boolean isGameOver() {
        return gameOver;
    }
}
