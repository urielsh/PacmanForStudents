// Source of truth: shared/game_constants.json
// Pure logic module — ZERO rendering/GUI code.

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Rendering / Drawing — Grid Data Structure
// ═══════════════════════════════════════════════════════
// The Maze class stores level geometry as two 2D boolean arrays:
// `walls[][]` and `pellets[][]`. Each cell maps 1:1 to a tile on
// screen, so the renderer simply iterates the grid and draws a blue
// rectangle for every `true` wall and a white circle for every `true`
// pellet. Separating the data (here) from the drawing (game.ts) is
// the Model–View split that keeps this file free of Canvas/DOM code.
//
// Compare with:
//   Java   → boolean[][] walls; same primitive 2D array, but Java
//            guarantees rectangular dimensions at allocation time.
//   Python → List[List[bool]]; no static size info; typically wrapped
//            with numpy for large grids.
//   JavaScript → Identical JS arrays, but without TypeScript's
//            `boolean[][]` annotation a typo like `walls[x][y] = 1`
//            would silently succeed. TS catches it at compile time.
//
// KEY CONCEPT: TypeScript's typed arrays (`boolean[][]`) prevent
// accidental insertion of non-boolean values, catching bugs that
// plain JavaScript would only surface at runtime.
// ═══════════════════════════════════════════════════════

const MAZE_WIDTH = 40;
const MAZE_HEIGHT = 30;

/**
 * Represents the game maze with walls and pellets stored as 2D boolean grids.
 * All movement and collision logic queries this class for wall/pellet state.
 */
// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Object Movement — Access Modifiers & Readonly
// ═══════════════════════════════════════════════════════
// TypeScript provides three access modifiers — `private`, `public`,
// and `protected` — enforced at compile time. Here `walls` and
// `pellets` are `private`, so only methods inside Maze can mutate
// the grid. `width` and `height` are `public readonly`, letting
// external code read them but never reassign them.
//
// Compare with:
//   Java   → Same `private`/`public`/`protected` keywords, enforced
//            at both compile time AND runtime (reflection aside).
//   Python → Convention only: `_walls` signals "private" but nothing
//            stops `maze._walls[0][0] = True` at runtime.
//   JavaScript → No access modifiers at all; ES2022 `#field` syntax
//            gives true runtime privacy, but TS `private` is
//            lighter-weight (erased at compile time).
//
// KEY CONCEPT: `public readonly` gives you immutable-looking
// properties without getter boilerplate. The compiler rejects any
// assignment to a `readonly` field outside the constructor.
// ═══════════════════════════════════════════════════════
export class Maze {
    private walls: boolean[][];
    private pellets: boolean[][];
    public readonly width: number = MAZE_WIDTH;
    public readonly height: number = MAZE_HEIGHT;

    constructor() {
        this.walls = [];
        this.pellets = [];
        this.initializeMaze();
    }

    /**
     * Builds the maze layout: border walls, internal walls, and pellets
     * on every non-wall, non-start tile.
     */
    private initializeMaze(): void {
        // Create 2D arrays initialized to false
        for (let x = 0; x < MAZE_WIDTH; x++) {
            this.walls[x] = new Array<boolean>(MAZE_HEIGHT).fill(false);
            this.pellets[x] = new Array<boolean>(MAZE_HEIGHT).fill(false);
        }

        // Create border walls
        for (let x = 0; x < MAZE_WIDTH; x++) {
            this.walls[x][0] = true;
            this.walls[x][MAZE_HEIGHT - 1] = true;
        }
        for (let y = 0; y < MAZE_HEIGHT; y++) {
            this.walls[0][y] = true;
            this.walls[MAZE_WIDTH - 1][y] = true;
        }

        // Add internal walls — horizontal at rows 10 and 20, columns 5-14 inclusive
        for (let x = 5; x < 15; x++) {
            this.walls[x][10] = true;
            this.walls[x][20] = true;
        }

        // Add internal wall — vertical at column 20, rows 5-24 inclusive
        for (let y = 5; y < 25; y++) {
            this.walls[20][y] = true;
        }

        // Initialize pellets on all non-wall tiles except Pacman start (5,5)
        for (let x = 1; x < MAZE_WIDTH - 1; x++) {
            for (let y = 1; y < MAZE_HEIGHT - 1; y++) {
                if (!this.walls[x][y] && !(x === 5 && y === 5)) {
                    this.pellets[x][y] = true;
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Collision Detection — Wall Query
    // ═══════════════════════════════════════════════════════
    // Both Pacman and Ghost call `maze.isWall(x, y)` before every
    // move to prevent walking through walls. The method treats
    // out-of-bounds coordinates as walls, creating an implicit
    // boundary. This "ask-the-grid" pattern is the foundation of
    // tile-based collision detection — no physics engine needed.
    //
    // Compare with:
    //   Java   → Same bounds-check + array lookup; Java would throw
    //            ArrayIndexOutOfBoundsException without the guard.
    //   Python → Would raise IndexError (or silently wrap with
    //            negative indices!) without explicit bounds checks.
    //   JavaScript → Returns `undefined` for out-of-bounds access,
    //            which is falsy — a subtle bug. TS's `boolean`
    //            return type annotation makes the contract explicit;
    //            the compiler ensures every code path returns a bool.
    //
    // KEY CONCEPT: Explicit return type `: boolean` ensures the
    // compiler verifies that every code path returns the expected
    // type, eliminating an entire class of "undefined" bugs.
    // ═══════════════════════════════════════════════════════
    /**
     * Returns true if the tile at (x, y) is a wall.
     * Out-of-bounds coordinates are treated as walls.
     */
    public isWall(x: number, y: number): boolean {
        if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
            return true;
        }
        return this.walls[x][y];
    }

    /**
     * Returns true if the tile at (x, y) has an uneaten pellet.
     * Out-of-bounds coordinates return false.
     */
    public hasPellet(x: number, y: number): boolean {
        if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
            return false;
        }
        return this.pellets[x][y];
    }

    /**
     * Removes the pellet at (x, y) if within bounds.
     */
    public removePellet(x: number, y: number): void {
        if (x >= 0 && x < MAZE_WIDTH && y >= 0 && y < MAZE_HEIGHT) {
            this.pellets[x][y] = false;
        }
    }
}
