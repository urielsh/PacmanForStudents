package com.packman;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Entity Class — Pacman as a Game Object
// ═══════════════════════════════════════════════════════
// Pacman is a self-contained entity with position (gridX, gridY),
// movement direction (dirX, dirY), and buffered input (nextDirX,
// nextDirY). It knows how to update itself but does NOT draw itself.
// Rendering is handled separately by GamePanel (separation of concerns).
//
// Compare with:
//   Python (Pygame) → class Pacman(pygame.sprite.Sprite): with
//                      self.rect for position, self.image for display
//   JavaScript (Canvas) → Plain object { x, y, dx, dy } with
//                          external renderer drawing it
//   TypeScript → class Pacman with typed properties: x: number, etc.
//   C++ (SDL2) → struct Pacman { int x, y; SDL_Texture* tex; }
//
// KEY CONCEPT: Separating entity state from rendering logic is a
// fundamental software design principle. The entity class holds data
// and game logic; a dedicated renderer reads that data to draw.
// This makes entities testable without a graphics context and allows
// swapping renderers (e.g., Swing to JavaFX) without touching entities.
// ═══════════════════════════════════════════════════════
public class Pacman {
    private int gridX;
    private int gridY;
    private int size;
    private int dirX = 0;
    private int dirY = 0;
    private int nextDirX = 0;
    private int nextDirY = 0;

    public Pacman(int x, int y, int size) {
        this.gridX = x;
        this.gridY = y;
        this.size = size;
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Input Buffering — Direction Queuing
    // ═══════════════════════════════════════════════════════
    // setDirection() stores the DESIRED direction, not the active
    // one. The actual direction change happens in update() only
    // if the new direction is valid (no wall). This means:
    //   - Player presses LEFT near a junction
    //   - nextDirX/Y is set to (-1, 0) immediately
    //   - On next update(), if left is open, direction changes
    //   - If left is a wall, Pacman keeps moving in current dir
    //
    // Compare with:
    //   Python (Pygame) → Store next_direction in event handler,
    //                      apply in update() after wall check
    //   JavaScript (Canvas) → Same pattern; nextDir set in keydown,
    //                          validated in update()
    //   TypeScript → Same as JS with typed direction enum/tuple
    //   C++ (SDL2) → Same pattern; queue direction in event handler
    //
    // KEY CONCEPT: Input buffering makes grid-based movement feel
    // smooth. Without it, pressing a key one frame too early at a
    // junction would be ignored, frustrating the player.
    // ═══════════════════════════════════════════════════════
    public void setDirection(int x, int y) {
        nextDirX = x;
        nextDirY = y;
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Object Movement — Grid-Based with Wall Checking
    // ═══════════════════════════════════════════════════════
    // Movement happens one tile per update. The algorithm:
    //   1. Try the buffered direction (player's latest input)
    //   2. If that's blocked by a wall, try continuing in current direction
    //   3. If both are blocked, Pacman stands still
    //
    // This creates the classic Pacman feel: you can "pre-turn" by
    // pressing a direction before reaching the junction.
    //
    // Compare with:
    //   Python (Pygame) → rect.x += speed * dx; then check colliderect()
    //                      with walls; undo if colliding
    //   JavaScript (Canvas) → x += speed * dx; check collision; revert
    //   TypeScript → Same as JS with typed position/velocity
    //   C++ (SDL2) → Similar check-then-move or move-then-revert pattern
    //
    // KEY CONCEPT: Grid-based movement simplifies collision — you check
    // BEFORE moving, not after. Pixel-based movement often uses
    // "move then correct" (push back if overlapping). Grid-based
    // is simpler but limits movement to discrete tile steps.
    // ═══════════════════════════════════════════════════════
    public void update(Maze maze) {
        // Try to move in the next direction if possible
        int newX = gridX + nextDirX;
        int newY = gridY + nextDirY;

        if (isValidMove(newX, newY, maze)) {
            dirX = nextDirX;
            dirY = nextDirY;
            gridX = newX;
            gridY = newY;
        } else {
            // Try to continue in current direction
            newX = gridX + dirX;
            newY = gridY + dirY;
            if (isValidMove(newX, newY, maze)) {
                gridX = newX;
                gridY = newY;
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Wall Collision — Boundary Checking
    // ═══════════════════════════════════════════════════════
    // isValidMove delegates to Maze.isWall(), which handles
    // bounds checking. This is a "look before you leap" pattern:
    // check the destination BEFORE moving there.
    //
    // Compare with:
    //   Python (Pygame) → if not maze[new_y][new_x].is_wall: move
    //   JavaScript (Canvas) → if (!maze.isWall(newX, newY)) { ... }
    //   TypeScript → Same as JS; maze.isWall(x: number, y: number): boolean
    //   C++ (SDL2) → if (!maze.isWall(newX, newY)) { pos = newPos; }
    //
    // KEY CONCEPT: Validation before mutation is a defensive programming
    // pattern. In games, it prevents entities from entering invalid
    // states (inside walls, out of bounds).
    // ═══════════════════════════════════════════════════════
    private boolean isValidMove(int x, int y, Maze maze) {
        return !maze.isWall(x, y);
    }

    public int getSize() {
        return size;
    }

    public int getGridX() {
        return gridX;
    }

    public int getGridY() {
        return gridY;
    }
}
