// Source of truth: shared/game_constants.json
// Pure logic module — ZERO rendering/GUI code.

import { Maze } from './maze';

const GHOST_MOVE_INTERVAL_FRAMES = 20;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Ghost AI — Immutable Direction Tuples
// ═══════════════════════════════════════════════════════
// The DIRECTIONS constant is typed as `ReadonlyArray<readonly [number, number]>`.
// This is a deeply immutable tuple array: you cannot push new entries,
// remove existing ones, or mutate the inner [dx, dy] pairs. The
// `as const` assertion at the end tells the compiler to infer the
// narrowest possible literal types, making DIRECTIONS completely
// frozen at the type level.
//
// Compare with:
//   Java   → `static final int[][] DIRS = {{-1,0},{1,0},...};` — the
//            `final` keyword only prevents reassigning the variable;
//            individual elements are still mutable.
//   Python → `DIRECTIONS = ((-1,0),(1,0),(0,-1),(0,1))` — tuples are
//            immutable at runtime, but type checkers need
//            `Tuple[Tuple[int,int],...]` to catch misuse.
//   JavaScript → `Object.freeze()` makes arrays shallowly immutable
//            at runtime, but the compiler still sees them as mutable.
//            TS `as const` is zero-cost and deeply immutable.
//
// KEY CONCEPT: `ReadonlyArray` + `as const` gives you compile-time
// deep immutability with zero runtime overhead — a pattern unique
// to TypeScript among these four languages.
// ═══════════════════════════════════════════════════════

/** Direction vectors: left, right, up, down. */
const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
] as const;

/**
 * Represents a ghost enemy with random-walk AI.
 * Ghosts move once every GHOST_MOVE_INTERVAL_FRAMES frames,
 * picking a random direction each time.
 */
// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Ghost AI — Random-Walk Movement
// ═══════════════════════════════════════════════════════
// Each ghost moves once every GHOST_MOVE_INTERVAL_FRAMES frames by
// picking a random direction from DIRECTIONS. If the chosen tile is
// a wall, the ghost simply stays put. This "random walk" is the
// simplest ghost AI — real Pac-Man uses per-ghost targeting (Blinky
// chases directly, Pinky ambushes, etc.), but the architecture is
// the same: a per-entity update() method called every tick.
//
// Compare with:
//   Java   → Ghost would implement an `Updateable` interface with
//            `void update(Maze maze);`. The loop calls each ghost
//            polymorphically.
//   Python → Same duck-typed `def update(self, maze)` — no interface
//            declaration needed, but also no compile-time guarantee
//            that every entity implements update().
//   JavaScript → Same prototype method, but passing `maze` with the
//            wrong shape (e.g., missing `isWall`) is only caught at
//            runtime. TS verifies the `Maze` type at compile time.
//
// KEY CONCEPT: TypeScript lets you enforce interface contracts
// (`update(maze: Maze): void`) at compile time while still emitting
// plain JavaScript — zero runtime overhead for type safety.
// ═══════════════════════════════════════════════════════
export class Ghost {
    private _gridX: number;
    private _gridY: number;
    private readonly _name: string;
    private readonly _color: string;
    private _moveCounter: number;

    constructor(startX: number, startY: number, name: string, color: string) {
        this._gridX = startX;
        this._gridY = startY;
        this._name = name;
        this._color = color;
        this._moveCounter = 0;
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Game Loop Timing — Frame-Counter Throttle
    // ═══════════════════════════════════════════════════════
    // The ghost's `_moveCounter` increments every frame. Movement
    // only happens when `counter % GHOST_MOVE_INTERVAL_FRAMES === 0`,
    // effectively making ghosts move at 1/20th of the game's frame
    // rate. This is a simple alternative to delta-time scaling: it
    // assumes a fixed tick rate and divides it down.
    //
    // Compare with:
    //   Java   → `if (tickCount % interval == 0)` — same modular
    //            arithmetic pattern, often inside a Timer or Thread.
    //   Python → Pygame typically uses `pygame.time.Clock.tick(fps)`
    //            for global rate and a similar counter for per-entity
    //            throttling.
    //   JavaScript → Same modulo logic, but `_moveCounter` would be
    //            an untyped `this.moveCounter` — accidentally storing
    //            a float like `0.5` would silently break the modulo.
    //            TS's `: number` does not prevent floats, but makes
    //            the intended type explicit for code reviewers.
    //
    // KEY CONCEPT: Frame-counter throttling is the simplest way to
    // give different entities different movement speeds in a
    // fixed-timestep game loop.
    // ═══════════════════════════════════════════════════════
    /**
     * Ghost AI: every GHOST_MOVE_INTERVAL_FRAMES frames, pick a random
     * direction and move there if it is not a wall. This creates
     * unpredictable but simple ghost behavior.
     */
    public update(maze: Maze): void {
        this._moveCounter++;
        if (this._moveCounter % GHOST_MOVE_INTERVAL_FRAMES === 0) {
            const dirIndex: number = Math.floor(Math.random() * 4);
            const [dx, dy] = DIRECTIONS[dirIndex];
            const newX: number = this._gridX + dx;
            const newY: number = this._gridY + dy;

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

    /** Ghost name (e.g., "Blinky"). */
    public get name(): string {
        return this._name;
    }

    /** Ghost color as a hex string (e.g., "#FF0000"). */
    public get color(): string {
        return this._color;
    }
}
