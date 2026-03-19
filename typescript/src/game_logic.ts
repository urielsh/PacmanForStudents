// Source of truth: shared/game_constants.json
// Pure logic module — ZERO rendering/GUI code.

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Game Loop Timing — Tick Orchestration
// ═══════════════════════════════════════════════════════
// GameLogic.update() is the single "tick" function called once per
// frame by the game loop in game.ts. It sequences three phases:
//   1. Move Pacman   2. Move all Ghosts   3. Check collisions
// This deterministic ordering prevents ambiguity (e.g., does Pacman
// collect a pellet before or after ghosts move?). The answer is:
// Pacman moves first, then ghosts, then collisions are checked.
//
// Compare with:
//   Java   → A `GameLoop` class with a `tick()` method calling
//            subsystem updates in order. Often uses an interface like
//            `Tickable` that each entity implements.
//   Python → A `def update(self)` method on a Game class, calling
//            `self.pacman.update()` etc. Same sequential pattern.
//   JavaScript → Identical structure, but GameLogic's fields like
//            `_ghosts` have no type info. Passing the wrong object
//            into the array is only caught at runtime.
//
// KEY CONCEPT: A single orchestrator method that calls subsystems
// in a fixed order is the backbone of deterministic game simulation.
// ═══════════════════════════════════════════════════════

import { Maze } from './maze';
import { Pacman } from './pacman';
import { Ghost } from './ghost';

const PELLET_POINTS = 10;

/**
 * Top-level game orchestrator. Owns the maze, pacman, ghosts, score,
 * and game-over state. Each call to update() advances the game by one tick.
 */
// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Collision Detection — Readonly Collections
// ═══════════════════════════════════════════════════════
// `_ghosts` is typed as `readonly Ghost[]` — a TypeScript-only
// construct that prevents `.push()`, `.pop()`, `.splice()` and any
// other mutating array method at compile time. The getter returns
// the same `readonly Ghost[]` type, so external code can iterate
// over ghosts but never add or remove them. This enforces the game
// rule that the ghost roster is fixed after construction.
//
// Compare with:
//   Java   → `Collections.unmodifiableList(ghosts)` returns an
//            immutable view at runtime; attempts to mutate throw
//            UnsupportedOperationException.
//   Python → `tuple(ghosts)` makes it immutable at runtime, but
//            `Sequence[Ghost]` in type hints is advisory only.
//   JavaScript → No built-in way to prevent `.push()` on an array
//            without `Object.freeze()`, which is shallow and has
//            runtime cost. TS `readonly` is zero-cost and caught
//            at compile time.
//
// KEY CONCEPT: `readonly` on array types is a compile-time-only
// guard — the emitted JS is a normal mutable array, but TS
// prevents accidental mutation during development.
// ═══════════════════════════════════════════════════════
export class GameLogic {
    private readonly _maze: Maze;
    private readonly _pacman: Pacman;
    private readonly _ghosts: readonly Ghost[];
    private _score: number;
    private _gameOver: boolean;

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

    /**
     * Main update tick: move pacman, move all ghosts, check collisions.
     * Does nothing if the game is already over.
     */
    public update(): void {
        if (this._gameOver) return;

        this._pacman.update(this._maze);

        for (const ghost of this._ghosts) {
            ghost.update(this._maze);
        }

        this.checkCollisions();
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Collision Detection — Entity vs. Entity
    // ═══════════════════════════════════════════════════════
    // Two collision types are checked each tick:
    //   1. Pacman vs. Pellet: grid-cell equality check; if
    //      `maze.hasPellet(pacX, pacY)` is true, collect it.
    //   2. Pacman vs. Ghost: loop over all ghosts and compare grid
    //      coordinates. If any ghost shares Pacman's tile, game over.
    // Both use exact integer equality on grid coords — no bounding-
    // box or distance math needed in a tile-based game.
    //
    // Compare with:
    //   Java   → Same `for (Ghost g : ghosts)` loop with `==` on
    //            int coordinates. Java's `for-each` is essentially
    //            identical to TS's `for...of`.
    //   Python → `if any(g.grid_x == px and g.grid_y == py for g in
    //            ghosts)` — Pythonic one-liner using a generator.
    //   JavaScript → Same `for...of`, but without TS you could
    //            accidentally compare `ghost.gridX` (a getter) with
    //            a string, and JS's `===` would silently return false.
    //            TS ensures both sides are `number`.
    //
    // KEY CONCEPT: Tile-based collision reduces complex overlap math
    // to simple integer equality, making it both fast and bug-free.
    // ═══════════════════════════════════════════════════════
    /**
     * Checks two types of collisions:
     *   1. Pacman vs. Pellets — collect pellet, add score
     *   2. Pacman vs. Ghosts — game over
     */
    private checkCollisions(): void {
        const pacX: number = this._pacman.gridX;
        const pacY: number = this._pacman.gridY;

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

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Rendering / Drawing — Getter-Based API
    // ═══════════════════════════════════════════════════════
    // The rendering layer (game.ts) accesses game state exclusively
    // through these getters: `maze`, `pacman`, `ghosts`, `score`,
    // `gameOver`. Because the backing fields are `private readonly`,
    // the renderer can read but never mutate game state. This clean
    // separation means you could swap the Canvas renderer for a
    // terminal renderer without touching GameLogic at all.
    //
    // Compare with:
    //   Java   → Getter methods (`getMaze()`, `getPacman()`) are the
    //            standard pattern; JavaBeans convention.
    //   Python → `@property` decorators achieve the same; direct
    //            attribute access (`game.maze`) is the norm.
    //   JavaScript → `get maze()` works identically, but without TS
    //            the return type is implicit. TS makes the contract
    //            `get ghosts(): readonly Ghost[]` explicit, so the
    //            renderer knows it cannot call `.push()`.
    //
    // KEY CONCEPT: TypeScript getters with explicit return types
    // form a self-documenting, read-only API boundary between the
    // game logic layer and the rendering layer.
    // ═══════════════════════════════════════════════════════

    /** The game maze. */
    public get maze(): Maze {
        return this._maze;
    }

    /** The player-controlled Pacman. */
    public get pacman(): Pacman {
        return this._pacman;
    }

    /** Array of ghost enemies. */
    public get ghosts(): readonly Ghost[] {
        return this._ghosts;
    }

    /** Current score. */
    public get score(): number {
        return this._score;
    }

    /** Whether the game has ended (ghost caught Pacman). */
    public get gameOver(): boolean {
        return this._gameOver;
    }
}
