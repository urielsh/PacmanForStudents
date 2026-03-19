// ============================================================
// game.ts -- Rendering, input handling, and game loop
// ============================================================
// TypeScript adaptation of the JavaScript Pacman renderer.
// Uses HTML5 Canvas 2D API with full type annotations.
// ============================================================

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Rendering / Drawing — Type Assertions & Non-Null
// ═══════════════════════════════════════════════════════
// TypeScript cannot know at compile time whether a DOM element
// actually exists. Two TS-specific escape hatches are used below:
//
//   1. `as HTMLCanvasElement` — a TYPE ASSERTION that tells the
//      compiler "trust me, this is a canvas element." The compiler
//      stops complaining, but if the element is missing at runtime
//      the assertion does nothing — the next line would crash.
//
//   2. `canvas.getContext('2d')!` — the NON-NULL ASSERTION operator
//      (`!`). `getContext()` returns `CanvasRenderingContext2D | null`;
//      the `!` strips the `| null`, promising the compiler the value
//      is never null. A manual `if (!ctx)` check follows as a safety
//      net (belt-and-suspenders).
//
// Compare with:
//   Java   → Casting: `(Canvas) document.getElementById(...)` —
//            throws ClassCastException at runtime if wrong.
//   Python → `cast(Canvas, ...)` from `typing` — purely advisory,
//            no runtime effect at all.
//   JavaScript → No assertions needed because there is no type
//            system. The same `null` bugs exist but are only found
//            via runtime testing.
//
// KEY CONCEPT: Type assertions (`as T`) and non-null assertions
// (`!`) are TypeScript's escape hatches from strict null checking.
// Use them sparingly and always pair with a runtime guard.
// ═══════════════════════════════════════════════════════

import { GameLogic } from './game_logic';
import { Maze } from './maze';
import { Pacman } from './pacman';
import { Ghost } from './ghost';

// --- Constants ---------------------------------------------------------------
const CANVAS_WIDTH: number = 800;
const CANVAS_HEIGHT: number = 600;
const TILE_SIZE: number = 20;
const TARGET_FPS: number = 60;
const FRAME_INTERVAL: number = 1000 / TARGET_FPS; // ~16.67 ms

// --- Canvas setup ------------------------------------------------------------
const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
    throw new Error('Canvas element with id "gameCanvas" not found.');
}
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
if (!ctx) {
    throw new Error('Failed to get 2D rendering context from canvas.');
}

// --- Game state --------------------------------------------------------------
const gameLogic: GameLogic = new GameLogic();
let running: boolean = true;
let lastFrameTime: number = 0;

// --- Input handling ----------------------------------------------------------
// Arrow keys set the buffered direction on Pacman. The actual movement
// is validated inside Pacman.update() on the next tick.

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Input Handling — Typed Event Listeners
// ═══════════════════════════════════════════════════════
// The callback is typed as `(e: KeyboardEvent): void`. TypeScript
// knows that `KeyboardEvent` has a `.key` property of type `string`,
// so `e.key === 'ArrowLeft'` is type-safe. If you accidentally wrote
// `e.keyCode` (deprecated) the compiler would still allow it (it
// exists on KeyboardEvent), but writing `e.button` (a MouseEvent
// property) would be a compile error. This catches event-type mix-ups
// that are common in large JavaScript codebases.
//
// The `e.preventDefault()` call stops the browser from scrolling the
// page when arrow keys are pressed — a critical UX detail for
// browser-based games.
//
// Compare with:
//   Java   → `KeyListener.keyPressed(KeyEvent e)` — the `KeyEvent`
//            type is enforced by the interface; calling mouse methods
//            is impossible.
//   Python → `pygame.KEYDOWN` events carry a `.key` int attribute;
//            no static typing unless you add type stubs.
//   JavaScript → `addEventListener('keydown', (e) => {...})` — `e`
//            is implicitly `Event`, not `KeyboardEvent`. Accessing
//            `e.key` works at runtime but IDEs cannot autocomplete
//            or catch typos without TS.
//
// KEY CONCEPT: TypeScript's DOM type definitions (lib.dom.d.ts)
// give full autocomplete and type safety for browser APIs with
// zero additional dependencies.
// ═══════════════════════════════════════════════════════
document.addEventListener('keydown', (e: KeyboardEvent): void => {
    switch (e.key) {
        case 'ArrowLeft':
            gameLogic.pacman.setDirection(-1, 0);
            e.preventDefault();
            break;
        case 'ArrowRight':
            gameLogic.pacman.setDirection(1, 0);
            e.preventDefault();
            break;
        case 'ArrowUp':
            gameLogic.pacman.setDirection(0, -1);
            e.preventDefault();
            break;
        case 'ArrowDown':
            gameLogic.pacman.setDirection(0, 1);
            e.preventDefault();
            break;
    }
});

// --- Rendering ---------------------------------------------------------------

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Rendering / Drawing — Canvas 2D Immediate Mode
// ═══════════════════════════════════════════════════════
// The Canvas 2D API is "immediate mode": every frame, we clear the
// entire canvas to black and redraw everything from scratch (walls,
// pellets, Pacman, ghosts, HUD). There is no retained scene graph.
// This is simple but means draw order matters: walls are drawn first
// (background), then pellets, then Pacman, then ghosts on top.
//
// The `ctx` variable is typed as `CanvasRenderingContext2D`, giving
// autocomplete for all 60+ methods (fillRect, arc, fillText, etc.)
// and catching misspellings like `ctx.fillStlye` at compile time.
//
// Compare with:
//   Java   → `Graphics2D g` in `paintComponent()`; same immediate-
//            mode pattern with `g.fillRect()`, `g.fillOval()`, etc.
//   Python → Pygame `screen.fill()` + `pygame.draw.rect()` — same
//            clear-and-redraw loop; no type info on the surface.
//   JavaScript → Identical Canvas API, but `ctx` is untyped so
//            `ctx.fillRekt()` is only caught at runtime. TS catches
//            it instantly.
//
// KEY CONCEPT: Immediate-mode rendering redraws every frame from
// scratch — simple to reason about, easy to debug, and the standard
// approach for small 2D games.
// ═══════════════════════════════════════════════════════

/**
 * Draws the entire maze: walls as blue rectangles, pellets as small
 * white circles centered inside their tiles.
 */
function drawMaze(maze: Maze): void {
    const mazeW: number = maze.width;
    const mazeH: number = maze.height;

    // Walls
    ctx.fillStyle = '#0000FF';
    for (let x = 0; x < mazeW; x++) {
        for (let y = 0; y < mazeH; y++) {
            if (maze.isWall(x, y)) {
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Pellets -- radius 3, centered in tile
    ctx.fillStyle = '#FFFFFF';
    for (let x = 0; x < mazeW; x++) {
        for (let y = 0; y < mazeH; y++) {
            if (maze.hasPellet(x, y)) {
                ctx.beginPath();
                ctx.arc(
                    x * TILE_SIZE + TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    3,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            }
        }
    }
}

/**
 * Draws Pacman as a yellow filled circle (radius 8) centered in its tile.
 */
function drawPacman(pacman: Pacman): void {
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(
        pacman.gridX * TILE_SIZE + TILE_SIZE / 2,
        pacman.gridY * TILE_SIZE + TILE_SIZE / 2,
        8,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Object Movement — Readonly Parameter Types
// ═══════════════════════════════════════════════════════
// The `ghosts` parameter is typed `readonly Ghost[]`, meaning this
// function promises NOT to add, remove, or reorder ghosts — it only
// reads them for drawing. This is a compile-time-only contract: the
// emitted JavaScript receives a plain mutable array, but during
// development TS prevents accidental `ghosts.push(...)` inside the
// renderer. This is how TypeScript encodes the principle of least
// privilege at the function-signature level.
//
// Compare with:
//   Java   → `List<Ghost>` vs `Collections.unmodifiableList()` —
//            the immutability is enforced at runtime, not compile time.
//   Python → `Sequence[Ghost]` type hint signals read-only intent,
//            but nothing prevents `.append()` at runtime.
//   JavaScript → No way to express "this array parameter is read-only"
//            in the language itself.
//
// KEY CONCEPT: `readonly T[]` in parameter positions communicates
// and enforces that a function is a pure consumer of data, never
// a mutator — a powerful design-by-contract tool unique to TS.
// ═══════════════════════════════════════════════════════

/**
 * Draws each ghost as an 18x18 colored rectangle (centered in tile)
 * with two 4px white circle "eyes".
 */
function drawGhosts(ghosts: readonly Ghost[]): void {
    for (const ghost of ghosts) {
        const gx: number = ghost.gridX * TILE_SIZE;
        const gy: number = ghost.gridY * TILE_SIZE;

        // Body -- 18x18, offset by 1px to center within 20x20 tile
        ctx.fillStyle = ghost.color;
        ctx.fillRect(gx + 1, gy + 1, 18, 18);

        // Eyes -- two white circles (radius 2) at fixed offsets
        ctx.fillStyle = '#FFFFFF';
        // Left eye
        ctx.beginPath();
        ctx.arc(gx + 7, gy + 7, 2, 0, 2 * Math.PI);
        ctx.fill();
        // Right eye
        ctx.beginPath();
        ctx.arc(gx + 13, gy + 7, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

/**
 * Draws the score HUD at the bottom of the canvas.
 */
function drawHUD(score: number): void {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText('Score: ' + score, 10, CANVAS_HEIGHT - 24);
}

/**
 * Draws "GAME OVER" in large red text, centered on the canvas.
 */
function drawGameOver(): void {
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    // Reset alignment for other draws
    ctx.textAlign = 'start';
    ctx.textBaseline = 'top';
}

// --- Game loop (requestAnimationFrame with 60 FPS throttle) ------------------

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Game Loop Timing — requestAnimationFrame + Throttle
// ═══════════════════════════════════════════════════════
// `requestAnimationFrame(gameLoop)` asks the browser to call
// `gameLoop` before the next screen repaint (~60 Hz on most
// monitors). However, the actual callback rate can vary (e.g.,
// 144 Hz monitors), so we add a manual throttle: if fewer than
// FRAME_INTERVAL milliseconds (~16.67 ms) have elapsed since the
// last update, we skip the frame. The remainder `elapsed % FRAME_INTERVAL`
// is carried forward to prevent drift.
//
// The `timestamp` parameter is typed as `number` (DOMHighResTimeStamp).
// TypeScript ensures we do arithmetic only with numbers — accidentally
// comparing it to a Date object would be a compile error.
//
// Compare with:
//   Java   → `javax.swing.Timer` or a manual `Thread.sleep()` loop;
//            no built-in vsync-aligned callback.
//   Python → `clock.tick(60)` in Pygame blocks the thread until the
//            target frame time elapses — simpler but less precise.
//   JavaScript → Same `requestAnimationFrame`, but `timestamp` is
//            implicitly `any` without TS, so `timestamp - lastFrameTime`
//            could silently produce `NaN` if either is undefined.
//
// KEY CONCEPT: requestAnimationFrame is the browser's vsync-aligned
// callback. Combining it with elapsed-time throttling gives smooth,
// consistent frame rates across different monitor refresh rates.
// ═══════════════════════════════════════════════════════

function gameLoop(timestamp: number): void {
    if (!running) return;

    // Throttle to ~60 FPS
    const elapsed: number = timestamp - lastFrameTime;
    if (elapsed < FRAME_INTERVAL) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

    // --- Update --------------------------------------------------------------
    gameLogic.update();

    // --- Render --------------------------------------------------------------
    // Clear entire canvas to black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawMaze(gameLogic.maze);
    drawPacman(gameLogic.pacman);
    drawGhosts(gameLogic.ghosts);
    drawHUD(gameLogic.score);

    // Check for game over AFTER rendering the final frame
    if (gameLogic.gameOver) {
        drawGameOver();
        running = false;
        return; // Stop the loop
    }

    requestAnimationFrame(gameLoop);
}

// --- Start -------------------------------------------------------------------
requestAnimationFrame(gameLoop);
