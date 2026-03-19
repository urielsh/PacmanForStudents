// Source of truth: shared/game_constants.json
// Pure logic module — ZERO rendering/GUI code.

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Object Movement
// ═══════════════════════════════════════════════════════
// Ghosts use a frame-counting approach to slow their movement relative
// to Pacman. A _moveCounter increments every frame, and the ghost only
// moves when (counter % GHOST_MOVE_INTERVAL_FRAMES === 0). This means
// ghosts move once every 20 frames while Pacman moves every frame,
// creating the speed differential that makes the game playable.
//
// Compare with:
//   Java → Uses the same moveCounter % interval approach; the counter
//          is an int field on each Ghost instance.
//   Python → Identical pattern with self._move_counter; Python's
//            modulo operator (%) works the same way on integers.
//
// KEY CONCEPT: Frame-counting is a simple, deterministic way to create
// different movement speeds without introducing floating-point timers
// or separate update rates. All three implementations use this pattern.
// ═══════════════════════════════════════════════════════

const GHOST_MOVE_INTERVAL_FRAMES = 20;

// Direction vectors: left, right, up, down
const DIRECTIONS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
];

class Ghost {
    constructor(startX, startY, name, color) {
        this._gridX = startX;
        this._gridY = startY;
        this._name = name;
        this._color = color;
        this._moveCounter = 0;
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Ghost AI
    // ═══════════════════════════════════════════════════════
    // This is a "random walk" AI: the ghost picks one of four directions
    // at random and moves there if the tile is not a wall. If the chosen
    // direction IS a wall, the ghost simply stays put for that interval.
    // This is the simplest possible ghost AI — no pathfinding, no chase
    // logic, no state machine (scatter/chase/frightened modes).
    //
    // Compare with:
    //   Java → Uses Random.nextInt(4) for the same random selection;
    //          Java's strong typing requires explicit casting but the
    //          algorithm is identical.
    //   Python → Uses random.randint(0, 3) or random.choice(); Python's
    //            destructuring (dx, dy = DIRECTIONS[i]) mirrors the JS
    //            destructuring const [dx, dy] = DIRECTIONS[dirIndex].
    //
    // KEY CONCEPT: JavaScript uses Math.floor(Math.random() * 4) because
    // Math.random() returns a float in [0, 1). There is no built-in
    // randint() like Python or nextInt(n) like Java — you must scale and
    // floor manually (or use a library).
    // ═══════════════════════════════════════════════════════

    /**
     * Ghost AI: every GHOST_MOVE_INTERVAL_FRAMES frames, pick a random
     * direction and move there if it is not a wall. This creates
     * unpredictable but simple ghost behavior.
     */
    update(maze) {
        this._moveCounter++;
        if (this._moveCounter % GHOST_MOVE_INTERVAL_FRAMES === 0) {
            const dirIndex = Math.floor(Math.random() * 4);
            const [dx, dy] = DIRECTIONS[dirIndex];
            const newX = this._gridX + dx;
            const newY = this._gridY + dy;

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

    get name() {
        return this._name;
    }

    get color() {
        return this._color;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Ghost };
} else if (typeof window !== 'undefined') {
    window.Ghost = Ghost;
}
