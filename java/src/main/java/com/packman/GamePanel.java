package com.packman;

import javax.swing.*;
import java.awt.*;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: The Game Panel — Heart of the Game
// ═══════════════════════════════════════════════════════
// GamePanel extends JPanel (for drawing) and implements KeyListener
// (for input). This single class owns three core responsibilities:
//   1. The game loop (timing)
//   2. Rendering (paintComponent)
//   3. Input handling (keyPressed)
//
// Compare with:
//   Python (Pygame) → All three live in the main while-loop
//   JavaScript (Canvas) → Split across requestAnimationFrame + addEventListener
//   TypeScript → Same as JS but with typed event handlers
//   C++ (SDL2) → SDL_PollEvent for input, manual loop for timing/rendering
//
// KEY CONCEPT: In Java Swing, JPanel is both a layout container and
// a custom drawing surface. Overriding paintComponent() is how you
// do custom rendering, unlike Pygame where you blit directly.
// ═══════════════════════════════════════════════════════
public class GamePanel extends JPanel implements KeyListener {
    private static final int PANEL_WIDTH = 800;
    private static final int PANEL_HEIGHT = 600;
    private static final int TILE_SIZE = 20;

    private Pacman pacman;
    private Ghost[] ghosts;
    private GameLogic gameLogic;
    private boolean running;

    public GamePanel() {
        setPreferredSize(new Dimension(PANEL_WIDTH, PANEL_HEIGHT));
        setBackground(Color.BLACK);
        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: Input Handling — Focus & Listeners
        // ═══════════════════════════════════════════════════════
        // setFocusable(true) is CRITICAL: without it, this panel
        // will never receive keyboard events. In Swing, only the
        // focused component gets key events.
        // addKeyListener(this) registers this panel as its own
        // keyboard event handler (since it implements KeyListener).
        //
        // Compare with:
        //   Python (Pygame) → pygame.event.get() polls ALL events globally
        //   JavaScript (Canvas) → document.addEventListener('keydown', handler)
        //   TypeScript → Same as JS; handler typed as (e: KeyboardEvent) => void
        //   C++ (SDL2) → SDL_PollEvent(&event) in the main loop, global scope
        //
        // KEY CONCEPT: Java Swing uses an observer pattern (listeners)
        // for input, while Pygame/SDL2 use polling. JS/TS use a hybrid
        // (event listeners that fire asynchronously). Each approach
        // has trade-offs for responsiveness and code organization.
        // ═══════════════════════════════════════════════════════
        setFocusable(true);
        addKeyListener(this);

        gameLogic = new GameLogic();
        pacman = new Pacman(5, 5, TILE_SIZE);
        initializeGhosts();
    }

    private void initializeGhosts() {
        ghosts = new Ghost[4];
        ghosts[0] = new Ghost(10, 10, TILE_SIZE, 255, 0, 0);        // Blinky (red)
        ghosts[1] = new Ghost(10, 11, TILE_SIZE, 255, 184, 255);    // Pinky (pink)
        ghosts[2] = new Ghost(11, 10, TILE_SIZE, 0, 255, 255);      // Inky (cyan)
        ghosts[3] = new Ghost(11, 11, TILE_SIZE, 255, 0, 255);      // Clyde (magenta)
    }

    public void startGame() {
        running = true;
        gameLoop();
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Game Loop Timing — Fixed 60 FPS
    // ═══════════════════════════════════════════════════════
    // This is a "fixed timestep" game loop. It uses System.nanoTime()
    // to measure elapsed time and only calls update()+repaint() when
    // enough time has accumulated for one frame (1/60th of a second).
    //
    // The delta accumulator pattern works like this:
    //   1. Measure time since last iteration (now - lastTime)
    //   2. Convert to "frames worth of time" by dividing by ns
    //   3. When delta >= 1.0, one frame's worth of time has passed
    //   4. Process exactly one update, subtract 1 from delta
    //
    // Compare with:
    //   Python (Pygame) → clock = pygame.time.Clock(); clock.tick(60)
    //   JavaScript (Canvas) → requestAnimationFrame(callback) — browser controls FPS
    //   TypeScript → Same as JS; requestAnimationFrame with typed callback
    //   C++ (SDL2) → SDL_Delay(16) or std::chrono for precise timing
    //
    // KEY CONCEPT: A fixed timestep ensures game speed is independent
    // of hardware speed. Without it, the game would run at different
    // speeds on different machines. Pygame's Clock.tick() and JS's
    // requestAnimationFrame hide this complexity; Java and C++ require
    // you to implement it yourself.
    // ═══════════════════════════════════════════════════════
    private void gameLoop() {
        Thread gameThread = new Thread(() -> {
            long lastTime = System.nanoTime();
            double amountOfUpdates = 60.0;
            double ns = 1000000000 / amountOfUpdates;
            double delta = 0;

            while (running) {
                long now = System.nanoTime();
                delta += (now - lastTime) / ns;
                lastTime = now;

                // ═══════════════════════════════════════════════════════
                // EDUCATIONAL NOTE: Update-Render Separation
                // ═══════════════════════════════════════════════════════
                // update() changes game state (positions, collisions).
                // repaint() schedules a redraw (calls paintComponent).
                // Keeping these separate is a fundamental game architecture
                // principle: logic and rendering are decoupled.
                //
                // Compare with:
                //   Python (Pygame) → update logic, then pygame.display.flip()
                //   JavaScript (Canvas) → update(), then draw() in rAF callback
                //   TypeScript → Same pattern; update(dt: number), render(ctx: CanvasRenderingContext2D)
                //   C++ (SDL2) → update(), then SDL_RenderPresent(renderer)
                //
                // KEY CONCEPT: The Update-Render split is universal across
                // all game frameworks. It enables features like variable
                // render rates, replay systems, and headless testing.
                // ═══════════════════════════════════════════════════════
                if (delta >= 1) {
                    update();
                    repaint();
                    delta--;
                }
            }
        });
        gameThread.start();
    }

    private void update() {
        if (gameLogic.isGameOver()) return;
        pacman.update(gameLogic.getMaze());

        for (Ghost ghost : ghosts) {
            ghost.update(gameLogic.getMaze());
        }

        gameLogic.checkCollisions(pacman, ghosts);
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Rendering/Drawing — paintComponent
    // ═══════════════════════════════════════════════════════
    // In Swing, paintComponent() is called by the system whenever
    // the panel needs to be redrawn (including when we call repaint()).
    // The Graphics2D object is our "drawing context" — we use it to
    // draw shapes, images, and text.
    //
    // IMPORTANT: super.paintComponent(g) clears the panel first.
    // Without it, old frames would remain visible (ghosting effect).
    //
    // Compare with:
    //   Python (Pygame) → screen.fill(BLACK) then screen.blit() for each sprite
    //   JavaScript (Canvas) → ctx.clearRect(0,0,w,h) then ctx.fillRect() etc.
    //   TypeScript → Same as JS; ctx: CanvasRenderingContext2D provides typed API
    //   C++ (SDL2) → SDL_RenderClear() then SDL_RenderCopy() for each texture
    //
    // KEY CONCEPT: Every frame, you must clear the screen, then redraw
    // everything in order (back to front). This is called the "painter's
    // algorithm" — draw background first, then objects, then UI on top.
    // ═══════════════════════════════════════════════════════
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;

        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: Centralized Rendering — All Drawing in One Place
        // ═══════════════════════════════════════════════════════
        // All rendering logic lives here in GamePanel.paintComponent(),
        // not spread across entity classes. Maze, Pacman, and Ghost are
        // pure data/logic classes with NO java.awt imports. GamePanel
        // reads their state via getters and draws them.
        //
        // This is the "renderer reads model" pattern — the same approach
        // used by MVC (Model-View-Controller) and ECS (Entity-Component-
        // System) architectures. The entities ARE the model; this method
        // IS the view.
        //
        // Compare with:
        //   Python (Pygame) → A single draw() function that reads game state
        //   JavaScript (Canvas) → A render(state, ctx) function
        //   TypeScript → Same as JS; render(state: GameState, ctx: Ctx)
        //   C++ (SDL2) → A render(state, renderer) function
        //
        // KEY CONCEPT: Centralizing rendering makes it easy to control
        // draw order (painter's algorithm), add post-processing effects,
        // and swap rendering backends — without touching game logic.
        // ═══════════════════════════════════════════════════════

        // --- Draw maze (walls + pellets) ---
        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: Rendering/Drawing — Tile-by-Tile Rendering
        // ═══════════════════════════════════════════════════════
        // We iterate over every tile in the maze, drawing walls as blue
        // filled rectangles and pellets as small white circles. This is
        // the most straightforward rendering approach: loop through the
        // grid, draw each cell based on its state.
        //
        // Performance note: iterating 40x30 = 1200 tiles every frame
        // is fine for this scale. For larger maps (e.g., 1000x1000),
        // you would only draw tiles visible in the camera viewport
        // ("frustum culling" for 2D).
        //
        // Compare with:
        //   Python (Pygame) → for y in range(H): for x in range(W):
        //                        if maze[y][x] == WALL: pygame.draw.rect(...)
        //   JavaScript (Canvas) → Same nested loop with ctx.fillRect()
        //                          or use a pre-rendered canvas as a cache
        //   TypeScript → Same as JS; often extract to drawMaze(ctx: Ctx, maze: Maze)
        //   C++ (SDL2) → Same nested loop with SDL_RenderFillRect() per tile
        //                or pre-render to a texture for performance
        //
        // KEY CONCEPT: For static geometry like walls, a major optimization
        // is to pre-render the maze to an off-screen image (BufferedImage
        // in Java, Surface in Pygame, off-screen Canvas in JS) once, then
        // draw that single image each frame. Only pellets (which change)
        // need per-frame iteration.
        // ═══════════════════════════════════════════════════════
        Maze maze = gameLogic.getMaze();
        int mazeW = maze.getWidth();
        int mazeH = maze.getHeight();

        // Draw walls
        g2d.setColor(Color.BLUE);
        for (int x = 0; x < mazeW; x++) {
            for (int y = 0; y < mazeH; y++) {
                if (maze.isWall(x, y)) {
                    g2d.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: Rendering Pellets — Small Detail Drawing
        // ═══════════════════════════════════════════════════════
        // Pellets are drawn as tiny circles (4x4 pixels) centered
        // within their tile. The offset (+8 pixels) centers the dot
        // inside the 20-pixel tile: (20 - 4) / 2 = 8.
        //
        // Compare with:
        //   Python (Pygame) → pygame.draw.circle(screen, WHITE,
        //                      (x*TILE+TILE//2, y*TILE+TILE//2), 2)
        //   JavaScript (Canvas) → ctx.arc(x*T+T/2, y*T+T/2, 2, 0, 2*Math.PI)
        //   TypeScript → Same as JS with explicit number types
        //   C++ (SDL2) → SDL_gfx filledCircleRGBA() or manual pixel drawing
        //
        // KEY CONCEPT: Centering small elements within tiles requires
        // offset math: offset = (tileSize - elementSize) / 2. This
        // formula works universally for any tile-based centering need.
        // ═══════════════════════════════════════════════════════
        g2d.setColor(Color.WHITE);
        for (int x = 0; x < mazeW; x++) {
            for (int y = 0; y < mazeH; y++) {
                if (maze.hasPellet(x, y)) {
                    g2d.fillOval(x * TILE_SIZE + 8, y * TILE_SIZE + 8, 4, 4);
                }
            }
        }

        // --- Draw Pacman ---
        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: Rendering — Drawing the Player
        // ═══════════════════════════════════════════════════════
        // Grid-to-pixel conversion (gridX * tileSize) translates the
        // logical grid position to screen coordinates. A filled yellow
        // circle represents Pacman.
        //
        // Compare with:
        //   Python (Pygame) → pygame.draw.circle(screen, YELLOW, (px, py), r)
        //   JavaScript (Canvas) → ctx.beginPath(); ctx.arc(px, py, r, 0, 2*PI);
        //                          ctx.fillStyle = 'yellow'; ctx.fill()
        //   TypeScript → Same as JS with CanvasRenderingContext2D type
        //   C++ (SDL2) → No built-in circle; use SDL_gfx's filledCircleRGBA()
        //                or draw pixel-by-pixel with midpoint circle algorithm
        //
        // KEY CONCEPT: Grid-to-pixel conversion (gridX * tileSize) is
        // fundamental in tile-based games. The game logic works in grid
        // units; rendering converts to screen pixels at draw time.
        // ═══════════════════════════════════════════════════════
        g2d.setColor(Color.YELLOW);
        g2d.fillOval(pacman.getGridX() * TILE_SIZE, pacman.getGridY() * TILE_SIZE,
                pacman.getSize(), pacman.getSize());

        // --- Draw ghosts ---
        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: Rendering — Drawing the Ghosts
        // ═══════════════════════════════════════════════════════
        // Ghosts are drawn as a colored rectangle with two white "eyes".
        // The eyes are small filled ovals offset from the top-left corner.
        // This is a minimalist representation — real games would use
        // sprite sheets with animation frames.
        //
        // Note: Pacman is a circle (fillOval), ghosts are squares
        // (fillRect). This visual distinction helps the player instantly
        // tell them apart even without color.
        //
        // Compare with:
        //   Python (Pygame) → pygame.draw.rect() + pygame.draw.circle() for eyes
        //                      or pygame.Surface.blit() with a sprite image
        //   JavaScript (Canvas) → ctx.fillRect() + ctx.arc() for eyes
        //                          or ctx.drawImage(spriteSheet, sx, sy, ...)
        //   TypeScript → Same as JS; drawImage with typed Image element
        //   C++ (SDL2) → SDL_RenderFillRect() for body + SDL_gfx for eye circles
        //                or SDL_RenderCopy() with a texture atlas
        //
        // KEY CONCEPT: Shape primitives (rect, circle) are great for
        // prototyping. Production games use sprite sheets — a single
        // image containing all animation frames, drawn with source
        // rectangle clipping. Start with shapes, upgrade to sprites later.
        // ═══════════════════════════════════════════════════════
        for (Ghost ghost : ghosts) {
            g2d.setColor(new Color(ghost.getColorR(), ghost.getColorG(), ghost.getColorB()));
            g2d.fillRect(ghost.getGridX() * TILE_SIZE, ghost.getGridY() * TILE_SIZE,
                    ghost.getSize(), ghost.getSize());

            // Draw simple ghost eyes
            g2d.setColor(Color.WHITE);
            g2d.fillOval(ghost.getGridX() * TILE_SIZE + 5, ghost.getGridY() * TILE_SIZE + 5, 4, 4);
            g2d.fillOval(ghost.getGridX() * TILE_SIZE + 11, ghost.getGridY() * TILE_SIZE + 5, 4, 4);
        }

        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: HUD/UI Rendering — Drawing Text
        // ═══════════════════════════════════════════════════════
        // The score is drawn last so it appears on top of everything.
        // In Swing, g2d.drawString() renders text at pixel coordinates.
        //
        // Compare with:
        //   Python (Pygame) → font.render("Score: "+str(s), True, WHITE); screen.blit()
        //   JavaScript (Canvas) → ctx.fillText("Score: " + score, x, y)
        //   TypeScript → Same as JS with typed context
        //   C++ (SDL2) → SDL_ttf library: TTF_RenderText_Solid() + SDL_RenderCopy()
        //
        // KEY CONCEPT: Text rendering varies wildly across frameworks.
        // Java and JS have built-in text drawing. Pygame needs a Font
        // object. SDL2 requires an external library (SDL_ttf). Always
        // draw UI elements last in your render order.
        // ═══════════════════════════════════════════════════════
        g2d.setColor(Color.WHITE);
        g2d.drawString("Score: " + gameLogic.getScore(), 10, PANEL_HEIGHT - 10);
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Input Handling — KeyListener Pattern
    // ═══════════════════════════════════════════════════════
    // keyPressed() fires once when a key goes down. We translate
    // physical key codes (VK_LEFT, VK_RIGHT, etc.) into game-
    // meaningful direction vectors (dx, dy).
    //
    // Notice: we set the NEXT direction, not the current one.
    // The actual direction change happens in Pacman.update(),
    // which checks if the new direction is valid (no wall).
    // This "input buffering" pattern makes the game feel responsive.
    //
    // Compare with:
    //   Python (Pygame) → for event in pygame.event.get():
    //                         if event.type == KEYDOWN: ...
    //   JavaScript (Canvas) → document.addEventListener('keydown', (e) => {
    //                            if (e.key === 'ArrowLeft') ... })
    //   TypeScript → Same as JS: (e: KeyboardEvent) => { e.key === 'ArrowLeft' }
    //   C++ (SDL2) → case SDL_KEYDOWN: switch(event.key.keysym.sym) {
    //                   case SDLK_LEFT: ... }
    //
    // KEY CONCEPT: Input should set intentions, not directly modify
    // positions. The game loop's update phase validates and applies
    // movement. This prevents moving through walls on the frame
    // input is received.
    // ═══════════════════════════════════════════════════════
    @Override
    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_LEFT) {
            pacman.setDirection(-1, 0);
        } else if (e.getKeyCode() == KeyEvent.VK_RIGHT) {
            pacman.setDirection(1, 0);
        } else if (e.getKeyCode() == KeyEvent.VK_UP) {
            pacman.setDirection(0, -1);
        } else if (e.getKeyCode() == KeyEvent.VK_DOWN) {
            pacman.setDirection(0, 1);
        }
    }

    @Override
    public void keyReleased(KeyEvent e) {}

    @Override
    public void keyTyped(KeyEvent e) {}
}
