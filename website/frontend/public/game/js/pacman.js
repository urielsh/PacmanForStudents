// Source of truth: shared/game_constants.json
// Pure logic module — ZERO rendering/GUI code.

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Input Handling
// ═══════════════════════════════════════════════════════
// Pacman uses an "input buffering" pattern: setDirection() stores the
// DESIRED direction, but the move only executes in update() if the
// target tile is not a wall. This decouples input capture from movement
// validation. In JavaScript, keydown events fire asynchronously via the
// browser's event loop, so buffering prevents lost inputs between frames.
//
// Compare with:
//   Java → Uses a Swing KeyListener (keyPressed) to buffer direction in
//          the same way; Java's EDT (Event Dispatch Thread) serializes
//          input events, similar to the browser's single-threaded model.
//   Python → Uses pygame.event.get() polled each frame in the game loop;
//            direction is buffered identically, but input is pulled (polled)
//            rather than pushed (event-driven) as in JS and Java.
//
// KEY CONCEPT: JavaScript's event-driven architecture means keydown fires
// between animation frames. Buffering ensures the latest input is always
// available when the next update() tick runs.
// ═══════════════════════════════════════════════════════

const PACMAN_START_X = 5;
const PACMAN_START_Y = 5;

class Pacman {
    constructor() {
        this._gridX = PACMAN_START_X;
        this._gridY = PACMAN_START_Y;
        this._dirX = 0;
        this._dirY = 0;
        this._nextDirX = 0;
        this._nextDirY = 0;
    }

    /**
     * Buffers the next desired direction. The actual direction change
     * happens in update() only if the new direction is valid (no wall).
     * This input buffering makes grid-based movement feel responsive.
     */
    setDirection(dx, dy) {
        this._nextDirX = dx;
        this._nextDirY = dy;
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Object Movement
    // ═══════════════════════════════════════════════════════
    // Pacman moves exactly one grid tile per update tick. The algorithm
    // tries the buffered direction first, then falls back to the current
    // direction, then stops. This "try-preferred, fallback-to-current"
    // pattern is standard for grid-based Pac-Man movement across all
    // three language implementations.
    //
    // Compare with:
    //   Java → Identical logic in Pacman.update(Maze); Java's strong
    //          typing requires explicit int parameters but the algorithm
    //          is the same step-for-step.
    //   Python → Same algorithm in pacman.update(maze); Python uses
    //            tuples for direction (dx, dy) instead of separate fields,
    //            which is more Pythonic but functionally identical.
    //
    // KEY CONCEPT: Grid-based movement avoids floating-point issues
    // entirely. Position is always an integer tile coordinate, making
    // wall checks and collision detection trivially exact.
    // ═══════════════════════════════════════════════════════

    /**
     * Attempts to move Pacman one tile per update:
     *   1. Try the buffered direction (player's latest input)
     *   2. If blocked by a wall, try continuing in the current direction
     *   3. If both are blocked, Pacman stands still
     */
    update(maze) {
        // Try to move in the buffered (next) direction
        let newX = this._gridX + this._nextDirX;
        let newY = this._gridY + this._nextDirY;

        if (!maze.isWall(newX, newY)) {
            this._dirX = this._nextDirX;
            this._dirY = this._nextDirY;
            this._gridX = newX;
            this._gridY = newY;
        } else {
            // Fall back to continuing in current direction
            newX = this._gridX + this._dirX;
            newY = this._gridY + this._dirY;
            if (!maze.isWall(newX, newY)) {
                this._gridX = newX;
                this._gridY = newY;
            }
        }
    }

    get gridX() {
        return this._gridX;
    }

    get gridY() {
        return this._gridY;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pacman };
} else if (typeof window !== 'undefined') {
    window.Pacman = Pacman;
}
