// ============================================================
// game.js — Rendering, input handling, and game loop
// ============================================================
// Depends on window.GameLogic (from game_logic.js), which
// internally creates Maze, Pacman, and Ghost instances.
// All four logic scripts must be loaded before this file.
// ============================================================

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Game Loop Timing
    // ═══════════════════════════════════════════════════════
    // JavaScript uses requestAnimationFrame (rAF) for the game loop,
    // which is unique among the three implementations. rAF is called by
    // the browser before each screen repaint (~60 Hz), and it passes a
    // high-resolution timestamp. We throttle to TARGET_FPS by skipping
    // frames that arrive too early. rAF also automatically pauses when
    // the tab is hidden, saving CPU/battery — a free optimization.
    //
    // Compare with:
    //   Java → Uses javax.swing.Timer with a fixed delay (e.g., 16ms),
    //          which fires ActionEvents on the EDT. Unlike rAF, Swing
    //          timers do not sync to the display refresh rate.
    //   Python → Uses pygame.time.Clock().tick(60) which blocks the
    //            thread to maintain the target FPS. This is a busy-wait
    //            approach vs. JS's callback-based cooperative scheduling.
    //
    // KEY CONCEPT: requestAnimationFrame is the browser-native way to
    // run game loops. It is non-blocking, vsync-aligned, and power-
    // efficient — no polling, no threading, no manual sleep.
    // ═══════════════════════════════════════════════════════

    // --- Constants -----------------------------------------------------------
    const CANVAS_WIDTH  = 800;
    const CANVAS_HEIGHT = 600;
    const TILE_SIZE     = 20;
    const TARGET_FPS    = 60;
    const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~16.67 ms

    // --- Canvas setup --------------------------------------------------------
    const canvas = document.getElementById('gameCanvas');
    const ctx    = canvas.getContext('2d');

    // --- Game state ----------------------------------------------------------
    const gameLogic = new GameLogic();
    let running     = true;
    let lastFrameTime = 0;

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Input Handling
    // ═══════════════════════════════════════════════════════
    // JavaScript captures keyboard input via DOM event listeners. The
    // 'keydown' event fires asynchronously whenever a key is pressed,
    // and the handler calls setDirection() to buffer the input. The
    // e.preventDefault() call stops arrow keys from scrolling the page.
    //
    // Compare with:
    //   Java → Uses KeyListener.keyPressed() attached to the JPanel;
    //          Swing dispatches key events on the EDT. The switch/case
    //          on e.getKeyCode() (VK_LEFT, etc.) mirrors this pattern.
    //   Python → Polls pygame.event.get() each frame in the game loop,
    //            filtering for KEYDOWN events. This is a pull model vs.
    //            JavaScript's push model (event listeners fire between
    //            frames automatically).
    //
    // KEY CONCEPT: JavaScript's event-driven I/O means input handlers
    // run asynchronously between animation frames. The browser queues
    // keydown events and dispatches them on the main thread — no
    // explicit polling needed, unlike Python's pygame approach.
    // ═══════════════════════════════════════════════════════

    // --- Input handling ------------------------------------------------------
    // Arrow keys set the buffered direction on Pacman. The actual movement
    // is validated inside Pacman.update() on the next tick.
    document.addEventListener('keydown', function (e) {
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

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Rendering/Drawing
    // ═══════════════════════════════════════════════════════
    // JavaScript renders via the HTML5 Canvas 2D API. The ctx object
    // (CanvasRenderingContext2D) provides immediate-mode drawing: you
    // set fillStyle, then call fillRect() for rectangles or beginPath()/
    // arc()/fill() for circles. Every frame, the entire canvas is cleared
    // to black and redrawn from scratch (no retained scene graph).
    //
    // Compare with:
    //   Java → Uses Graphics2D in Swing's paintComponent(). The API is
    //          similar (g.setColor(), g.fillRect(), g.fillOval()) but
    //          rendering is triggered by repaint()/paintComponent() rather
    //          than an explicit draw call each frame.
    //   Python → Uses pygame.draw.rect() and pygame.draw.circle(), then
    //            pygame.display.flip() to swap buffers. Pygame uses a
    //            backbuffer pattern; Canvas 2D composites directly.
    //
    // KEY CONCEPT: Canvas 2D is an immediate-mode API — there is no
    // scene graph or display list. You draw pixels directly each frame.
    // This is simpler than DOM manipulation and faster for games than
    // updating HTML elements, but requires manual redraw logic.
    // ═══════════════════════════════════════════════════════

    // --- Rendering -----------------------------------------------------------

    /**
     * Draws the entire maze: walls as blue rectangles, pellets as small
     * white circles centered inside their tiles.
     */
    function drawMaze(maze) {
        var mazeW = maze.width;
        var mazeH = maze.height;

        // Walls
        ctx.fillStyle = '#0000FF';
        for (var x = 0; x < mazeW; x++) {
            for (var y = 0; y < mazeH; y++) {
                if (maze.isWall(x, y)) {
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        // Pellets — radius 3, centered in tile
        ctx.fillStyle = '#FFFFFF';
        for (var x = 0; x < mazeW; x++) {
            for (var y = 0; y < mazeH; y++) {
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
    function drawPacman(pacman) {
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
    // EDUCATIONAL NOTE: Ghost AI
    // ═══════════════════════════════════════════════════════
    // The ghost rendering here visualizes the Ghost AI state. Each ghost
    // has a unique color (Blinky=red, Pinky=pink, Inky=cyan, Clyde=purple)
    // matching classic Pac-Man. Although the current AI is random-walk,
    // the visual distinction sets up for future AI differentiation where
    // each ghost could have unique chase behavior (e.g., Blinky targets
    // Pacman directly, Pinky targets ahead of Pacman).
    //
    // Compare with:
    //   Java → Ghost colors are stored as java.awt.Color constants and
    //          passed to Graphics2D.setColor() before fillRect(). Java
    //          uses Color objects while JS uses CSS color strings.
    //   Python → Ghost colors are RGB tuples like (255, 0, 0) passed to
    //            pygame.draw.rect(). Python's tuple-based colors differ
    //            from JS's string-based '#FF0000' hex notation.
    //
    // KEY CONCEPT: JavaScript uses CSS-style color strings ('#FF0000',
    // '#FFB8FF', etc.) for Canvas drawing. This makes colors easy to
    // read and consistent with web standards, but they are strings —
    // not typed color objects as in Java.
    // ═══════════════════════════════════════════════════════

    /**
     * Draws each ghost as an 18x18 colored rectangle (centered in tile)
     * with two 4px white circle "eyes".
     */
    function drawGhosts(ghosts) {
        for (var i = 0; i < ghosts.length; i++) {
            var ghost = ghosts[i];
            var gx = ghost.gridX * TILE_SIZE;
            var gy = ghost.gridY * TILE_SIZE;

            // Body — 18x18, offset by 1px to center within 20x20 tile
            ctx.fillStyle = ghost.color;
            ctx.fillRect(gx + 1, gy + 1, 18, 18);

            // Eyes — two white circles (radius 2) at fixed offsets
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
     * Draws the score HUD at the top of the canvas.
     */
    function drawHUD(score) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px monospace';
        ctx.textBaseline = 'top';
        ctx.fillText('Score: ' + score, 10, CANVAS_HEIGHT - 24);
    }

    /**
     * Draws "GAME OVER" in large red text, centered on the canvas.
     */
    function drawGameOver() {
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        // Reset alignment for other draws
        ctx.textAlign = 'start';
        ctx.textBaseline = 'top';
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Collision Detection
    // ═══════════════════════════════════════════════════════
    // The game loop checks gameLogic.gameOver AFTER rendering, so the
    // player sees the frame where the collision happened before the
    // "GAME OVER" overlay appears. This is a deliberate UX choice — the
    // collision is detected in gameLogic.update() (via _checkCollisions),
    // but the visual response is deferred to the render phase.
    //
    // Compare with:
    //   Java → The Swing Timer callback similarly checks gameOver after
    //          calling repaint(), and stops the timer to end the loop.
    //   Python → The pygame loop checks game_over after pygame.display.flip()
    //            and breaks out of the while loop to show the final screen.
    //
    // KEY CONCEPT: Separating collision detection (in update) from
    // collision response (in render/loop control) is a clean pattern.
    // The game loop here stops by simply not calling requestAnimationFrame
    // again — the callback chain ends naturally, with no timer to cancel.
    // ═══════════════════════════════════════════════════════

    // --- Game loop (requestAnimationFrame with 60 FPS throttle) --------------

    function gameLoop(timestamp) {
        if (!running) return;

        // Throttle to ~60 FPS
        var elapsed = timestamp - lastFrameTime;
        if (elapsed < FRAME_INTERVAL) {
            requestAnimationFrame(gameLoop);
            return;
        }
        lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

        // --- Update ------------------------------------------------------------
        gameLogic.update();

        // --- Render ------------------------------------------------------------
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

    // --- Start ---------------------------------------------------------------
    requestAnimationFrame(gameLoop);

})();
