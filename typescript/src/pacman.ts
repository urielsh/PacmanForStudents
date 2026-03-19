// Source of truth: shared/game_constants.json
// Pure logic module — ZERO rendering/GUI code.

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Input Handling — Direction Buffering
// ═══════════════════════════════════════════════════════
// Pacman uses an "input buffer" pattern: when the player presses an
// arrow key, the desired direction is stored in `_nextDirX/_nextDirY`
// but NOT applied immediately. On the next update tick, the game
// checks whether that direction is walkable; if not, Pacman keeps
// moving in its current direction. This decouples input events
// (asynchronous, fired at any time) from the fixed-step game loop.
//
// Compare with:
//   Java   → KeyListener stores key state in a HashMap<Integer,Boolean>;
//            the game loop polls it each tick. Same two-phase pattern.
//   Python → pygame.key.get_pressed() returns a snapshot each frame;
//            direction is resolved in update(), not in the event handler.
//   JavaScript → Identical DOM `keydown` listener, but without TS the
//            `dx: number` parameter could silently receive a string
//            from a refactoring mistake. TS catches that at compile time.
//
// KEY CONCEPT: Separating "record intent" (setDirection) from
// "execute intent" (update) is a fundamental game-architecture
// pattern that prevents input-dependent race conditions.
// ═══════════════════════════════════════════════════════

import { Maze } from './maze';

const PACMAN_START_X = 5;
const PACMAN_START_Y = 5;

/**
 * Represents the player-controlled Pacman character.
 * Uses input buffering: setDirection() stores the desired direction,
 * and update() applies it only if the target tile is not a wall.
 */
// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Object Movement — Underscore-Prefixed Privates
// ═══════════════════════════════════════════════════════
// TypeScript convention often uses `_field` for private backing
// fields paired with a public getter (`get gridX()`). The `private`
// keyword prevents external code from writing `pacman._gridX = 99`,
// while the getter exposes a read-only view. This is a lightweight
// alternative to Java's explicit getX()/setX() boilerplate.
//
// Compare with:
//   Java   → `private int gridX;` + `public int getGridX()`. Verbose
//            but universally understood. No property-syntax shortcut.
//   Python → Uses `@property` decorator: `@property def grid_x(self)`
//            to expose a "getter" on a `_grid_x` backing attribute.
//   JavaScript → Same `get gridX()` syntax exists, but nothing stops
//            someone from assigning `pacman._gridX` since JS has no
//            `private`. TS adds compile-time enforcement.
//
// KEY CONCEPT: TypeScript's `private` + getter pattern gives you
// Java-level encapsulation with Python-level syntactic convenience.
// ═══════════════════════════════════════════════════════
export class Pacman {
    private _gridX: number;
    private _gridY: number;
    private _dirX: number;
    private _dirY: number;
    private _nextDirX: number;
    private _nextDirY: number;

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
    public setDirection(dx: number, dy: number): void {
        this._nextDirX = dx;
        this._nextDirY = dy;
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Collision Detection — Wall Collision in Movement
    // ═══════════════════════════════════════════════════════
    // Before moving, Pacman checks `maze.isWall(newX, newY)`. This
    // is "predictive" collision detection: instead of moving first
    // and then undoing an illegal move, we test the destination tile
    // BEFORE updating position. The parameter `maze: Maze` is type-
    // checked at compile time — you cannot accidentally pass a Ghost
    // or a bare object here.
    //
    // Compare with:
    //   Java   → `public void update(Maze maze)` — same nominal
    //            typing; passing a non-Maze is a compile error.
    //   Python → `def update(self, maze: Maze)` — type hint only;
    //            passing a dict at runtime causes an AttributeError
    //            later, not at the call site.
    //   JavaScript → `update(maze)` — no type info; a wrong argument
    //            causes a runtime TypeError deep inside the method.
    //
    // KEY CONCEPT: TypeScript's nominal-like structural typing
    // catches wrong-argument bugs at compile time while keeping the
    // flexibility of duck typing when interfaces match.
    // ═══════════════════════════════════════════════════════
    /**
     * Attempts to move Pacman one tile per update:
     *   1. Try the buffered direction (player's latest input)
     *   2. If blocked by a wall, try continuing in the current direction
     *   3. If both are blocked, Pacman stands still
     */
    public update(maze: Maze): void {
        // Try to move in the buffered (next) direction
        let newX: number = this._gridX + this._nextDirX;
        let newY: number = this._gridY + this._nextDirY;

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

    /** Current grid X coordinate. */
    public get gridX(): number {
        return this._gridX;
    }

    /** Current grid Y coordinate. */
    public get gridY(): number {
        return this._gridY;
    }
}
