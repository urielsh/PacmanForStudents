// Source of truth: shared/game_constants.json
// Pure logic module — ZERO rendering/GUI code.

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Rendering/Drawing
// ═══════════════════════════════════════════════════════
// In JavaScript, the Maze class stores wall and pellet data as 2D arrays
// of booleans. The rendering layer (game.js) reads these arrays and draws
// them onto an HTML5 <canvas> using the Canvas 2D API (fillRect, arc).
// The data and drawing are fully separated across files.
//
// Compare with:
//   Java → Uses a boolean[][] with the same separation; rendering is done
//          via Graphics2D.fillRect() in a Swing JPanel's paintComponent().
//   Python → Uses a list-of-lists of booleans; rendering happens through
//            pygame.draw.rect() and pygame.draw.circle() in a separate loop.
//
// KEY CONCEPT: JavaScript's approach mirrors MVC — the Maze is pure data
// (model), while the Canvas 2D context in game.js is the view. No DOM or
// Canvas references exist in this file.
// ═══════════════════════════════════════════════════════

const MAZE_WIDTH = 40;
const MAZE_HEIGHT = 30;

class Maze {
    constructor() {
        this._walls = [];
        this._pellets = [];
        this._initializeMaze();
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Object Movement
    // ═══════════════════════════════════════════════════════
    // The maze's wall data serves as the boundary system for ALL object
    // movement. Both Pacman and Ghost call maze.isWall(x, y) before
    // moving. JavaScript uses simple boolean arrays indexed by grid
    // coordinates — no spatial data structures or physics engines needed.
    //
    // Compare with:
    //   Java → Identical boolean[][] approach; isWall() is called by
    //          Pacman.update() and Ghost.update() with the same logic.
    //   Python → Uses a list-of-lists; is_wall() performs the same
    //            bounds check and boolean lookup.
    //
    // KEY CONCEPT: Grid-based collision boundaries are language-agnostic.
    // The simplicity of a boolean grid makes wall checks O(1) regardless
    // of maze complexity — the same pattern works in JS, Java, and Python.
    // ═══════════════════════════════════════════════════════
    _initializeMaze() {
        // Create 2D arrays initialized to false
        for (let x = 0; x < MAZE_WIDTH; x++) {
            this._walls[x] = new Array(MAZE_HEIGHT).fill(false);
            this._pellets[x] = new Array(MAZE_HEIGHT).fill(false);
        }

        // Create border walls
        for (let x = 0; x < MAZE_WIDTH; x++) {
            this._walls[x][0] = true;
            this._walls[x][MAZE_HEIGHT - 1] = true;
        }
        for (let y = 0; y < MAZE_HEIGHT; y++) {
            this._walls[0][y] = true;
            this._walls[MAZE_WIDTH - 1][y] = true;
        }

        // Add internal walls — horizontal at rows 10 and 20, columns 5-14 inclusive
        for (let x = 5; x < 15; x++) {
            this._walls[x][10] = true;
            this._walls[x][20] = true;
        }

        // Add internal wall — vertical at column 20, rows 5-24 inclusive
        for (let y = 5; y < 25; y++) {
            this._walls[20][y] = true;
        }

        // Initialize pellets on all non-wall tiles except Pacman start (5,5)
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
                if (!this._walls[x][y] && !(x === 5 && y === 5)) {
                    this._pellets[x][y] = true;
                }
            }
        }
    }

    /**
     * Returns true if the tile at (x, y) is a wall.
     * Out-of-bounds coordinates are treated as walls.
     */
    isWall(x, y) {
        if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
            return true;
        }
        return this._walls[x][y];
    }

    /**
     * Returns true if the tile at (x, y) has an uneaten pellet.
     * Out-of-bounds coordinates return false.
     */
    hasPellet(x, y) {
        if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
            return false;
        }
        return this._pellets[x][y];
    }

    /**
     * Removes the pellet at (x, y) if within bounds.
     */
    removePellet(x, y) {
        if (x >= 0 && x < MAZE_WIDTH && y >= 0 && y < MAZE_HEIGHT) {
            this._pellets[x][y] = false;
        }
    }

    get width() {
        return MAZE_WIDTH;
    }

    get height() {
        return MAZE_HEIGHT;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Maze };
} else if (typeof window !== 'undefined') {
    window.Maze = Maze;
}
