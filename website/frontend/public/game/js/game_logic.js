// Source of truth: shared/game_constants.json
// Pure logic module — ZERO rendering/GUI code.

if (typeof require !== 'undefined') {
    var { Maze } = require('./maze');
    var { Pacman } = require('./pacman');
    var { Ghost } = require('./ghost');
}

const PELLET_POINTS = 10;

class GameLogic {
    constructor() {
        this._maze = new Maze();
        this._pacman = new Pacman();
        this._ghosts = [
            new Ghost(10, 10, 'Blinky', '#FF0000'),
            new Ghost(10, 11, 'Pinky', '#FFB8FF'),
            new Ghost(11, 10, 'Inky', '#00FFFF'),
            new Ghost(11, 11, 'Clyde', '#FF00FF'),
        ];
        this._score = 0;
        this._gameOver = false;
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Game Loop Timing
    // ═══════════════════════════════════════════════════════
    // GameLogic.update() is the single "tick" function called once per
    // frame by the game loop in game.js. It orchestrates the update
    // order: Pacman moves first, then all ghosts, then collisions are
    // checked. This ordering matters — if ghosts moved first, Pacman
    // could "dodge through" a ghost that just vacated a tile.
    //
    // Compare with:
    //   Java → GameLogic.update() is called from a javax.swing.Timer's
    //          ActionListener at a fixed interval; same update ordering.
    //   Python → game_logic.update() is called from the pygame while-loop;
    //            Python's GIL ensures single-threaded execution just like
    //            the JS event loop and Java's EDT.
    //
    // KEY CONCEPT: This "logic-only" update method contains no rendering
    // or timing code. The game loop (game.js) controls WHEN to call it;
    // this class controls WHAT happens each tick. This separation is
    // consistent across all three language implementations.
    // ═══════════════════════════════════════════════════════

    /**
     * Main update tick: move pacman, move all ghosts, check collisions.
     * Does nothing if the game is already over.
     */
    update() {
        if (this._gameOver) return;

        this._pacman.update(this._maze);

        for (const ghost of this._ghosts) {
            ghost.update(this._maze);
        }

        this._checkCollisions();
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Collision Detection
    // ═══════════════════════════════════════════════════════
    // Grid-based collision detection is the simplest possible approach:
    // two entities collide if and only if they occupy the same (x, y)
    // tile. No bounding boxes, no hitboxes, no pixel-perfect checks —
    // just integer equality. This works because all movement snaps to
    // the grid. Two collision types are checked here:
    //   1. Pacman vs. Pellet (same tile = collect, add score)
    //   2. Pacman vs. Ghost (same tile = game over)
    //
    // Compare with:
    //   Java → Identical integer comparison in _checkCollisions(); Java
    //          uses == for primitive int comparison (same semantics as
    //          JavaScript's === for integers).
    //   Python → Same logic in _check_collisions(); Python uses == which
    //            works correctly for integer comparison.
    //
    // KEY CONCEPT: JavaScript's === (strict equality) is used here for
    // integer grid coordinates. Unlike ==, it does not perform type
    // coercion, making it the safe choice. For grid-based games, this
    // O(ghosts) collision check is far simpler than AABB or circle
    // intersection tests needed in continuous-movement games.
    // ═══════════════════════════════════════════════════════

    /**
     * Checks two types of collisions:
     *   1. Pacman vs. Pellets — collect pellet, add score
     *   2. Pacman vs. Ghosts — game over
     */
    _checkCollisions() {
        const pacX = this._pacman.gridX;
        const pacY = this._pacman.gridY;

        // Pellet collection
        if (this._maze.hasPellet(pacX, pacY)) {
            this._maze.removePellet(pacX, pacY);
            this._score += PELLET_POINTS;
        }

        // Ghost collision — any ghost sharing Pacman's tile ends the game
        for (const ghost of this._ghosts) {
            if (pacX === ghost.gridX && pacY === ghost.gridY) {
                this._gameOver = true;
            }
        }
    }

    get maze() {
        return this._maze;
    }

    get pacman() {
        return this._pacman;
    }

    get ghosts() {
        return this._ghosts;
    }

    get score() {
        return this._score;
    }

    get gameOver() {
        return this._gameOver;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameLogic };
} else if (typeof window !== 'undefined') {
    window.GameLogic = GameLogic;
}
