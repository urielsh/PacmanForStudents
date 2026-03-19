# Source of truth: shared/game_constants.json

import pygame

from pacman import Pacman
from ghost import Ghost
from game_logic import GameLogic

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
PANEL_WIDTH = 800
PANEL_HEIGHT = 600
TILE_SIZE = 20
FPS = 60

# ═══════════════════════════════════════════════════════
# EDUCATIONAL NOTE: Rendering/Drawing
# ═══════════════════════════════════════════════════════
# Colors are plain tuples of (R, G, B) integers. Python tuples
# are immutable and lightweight -- perfect for constants that
# never change. No need for a Color class or static final fields.
#
# Compare with:
#   Java (Swing) → Color.BLUE, Color.WHITE, new Color(255,255,0)
#   Java uses Color objects from java.awt. Python tuples are
#   simpler and do not require any import -- they are built-in.
#
# KEY CONCEPT: Python tuples serve as lightweight, immutable
# data containers -- ideal for constants like RGB colors.
# ═══════════════════════════════════════════════════════

# Colors
BLACK = (0, 0, 0)
BLUE = (0, 0, 255)
WHITE = (255, 255, 255)
YELLOW = (255, 255, 0)


class GamePanel:
    """Rendering and input layer for Pacman.

    Owns the pygame display surface and clock. All rendering is centralised
    here -- Pacman, Ghost, Maze, and GameLogic are pure data/logic classes
    with ZERO pygame imports.
    """

    def __init__(self):
        self._screen: pygame.Surface = pygame.display.set_mode(
            (PANEL_WIDTH, PANEL_HEIGHT)
        )
        pygame.display.set_caption("Pacman - Python/Pygame")
        self._clock: pygame.time.Clock = pygame.time.Clock()
        self._font: pygame.font.Font = pygame.font.SysFont(None, 28)
        self._game_over_font: pygame.font.Font = pygame.font.SysFont(None, 64)
        self._running: bool = True

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    @property
    def running(self) -> bool:
        return self._running

    @property
    def screen(self) -> pygame.Surface:
        return self._screen

    @property
    def clock(self) -> pygame.time.Clock:
        return self._clock

    # ------------------------------------------------------------------
    # Input handling
    # ------------------------------------------------------------------

    def handle_input(self, pacman: Pacman) -> None:
        """Process pygame events.

        Arrow keys set Pacman's buffered direction.
        Closing the window (or pressing Escape) stops the game loop.
        """
        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Input Handling
        # ═══════════════════════════════════════════════════════
        # Pygame uses an EVENT QUEUE: all keyboard/mouse/window events
        # are collected by the OS and retrieved with pygame.event.get().
        # We iterate through ALL events each frame and respond to the
        # ones we care about (QUIT, KEYDOWN). Unhandled events are
        # silently ignored -- no crash, no error.
        #
        # Compare with:
        #   Java (Swing) → addKeyListener(new KeyAdapter() { ... })
        #   Java registers a listener OBJECT that the framework calls
        #   back asynchronously. Python/pygame polls events explicitly
        #   in the game loop -- simpler flow, no callback surprises.
        #
        # KEY CONCEPT: Polling (check every frame) vs. Callbacks
        # (framework calls you). Pygame uses polling, Swing uses
        # callbacks. Polling gives you full control over timing.
        # ═══════════════════════════════════════════════════════

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self._running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    pacman.set_direction(-1, 0)
                elif event.key == pygame.K_RIGHT:
                    pacman.set_direction(1, 0)
                elif event.key == pygame.K_UP:
                    pacman.set_direction(0, -1)
                elif event.key == pygame.K_DOWN:
                    pacman.set_direction(0, 1)
                elif event.key == pygame.K_ESCAPE:
                    self._running = False

    # ------------------------------------------------------------------
    # Update
    # ------------------------------------------------------------------

    def update(
        self,
        pacman: Pacman,
        ghosts: list[Ghost],
        game_logic: GameLogic,
    ) -> None:
        """Advance game state by one frame (skip if game over)."""
        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Object Movement
        # ═══════════════════════════════════════════════════════
        # The update order matters: Pacman moves first, then each
        # ghost moves, then collisions are checked. This ensures
        # that collision detection always sees the FINAL positions
        # for this frame. Changing the order (e.g., checking
        # collisions before ghosts move) would create subtle bugs.
        #
        # Compare with:
        #   Java (Swing) → actionPerformed(ActionEvent e) in a
        #   Timer callback follows the same sequence. Python makes
        #   the ordering more visible because the calls are plain
        #   sequential statements -- no event-dispatch indirection.
        #
        # KEY CONCEPT: Update order (move -> check collisions) is
        # a critical game-loop design decision. Always be explicit.
        # ═══════════════════════════════════════════════════════

        if game_logic.game_over:
            return

        pacman.update(game_logic.maze)

        for ghost in ghosts:
            ghost.update(game_logic.maze)

        game_logic.check_collisions(pacman, ghosts)

    # ------------------------------------------------------------------
    # Drawing
    # ------------------------------------------------------------------

    def draw(
        self,
        screen: pygame.Surface,
        pacman: Pacman,
        ghosts: list[Ghost],
        game_logic: GameLogic,
    ) -> None:
        """Render the entire frame: maze, entities, HUD."""
        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Rendering/Drawing
        # ═══════════════════════════════════════════════════════
        # Every frame starts by filling the screen with BLACK (clearing
        # the previous frame), then redraws everything from scratch:
        # walls, pellets, Pacman, ghosts, HUD, and game-over overlay.
        # This is called "immediate mode" rendering -- nothing persists
        # between frames; you redraw the entire scene each time.
        #
        # Compare with:
        #   Java (Swing) → paintComponent(Graphics g) works the same
        #   way: clear with g.setColor(BLACK); g.fillRect(...), then
        #   redraw. Java uses Graphics2D methods; Python uses pygame's
        #   draw module (pygame.draw.rect, pygame.draw.circle).
        #
        # KEY CONCEPT: Immediate-mode rendering (clear + redraw every
        # frame) is standard for 2D games in both Python and Java.
        # ═══════════════════════════════════════════════════════

        screen.fill(BLACK)

        maze = game_logic.maze
        maze_w = maze.width
        maze_h = maze.height

        # --- Walls (blue filled rectangles) ---
        for x in range(maze_w):
            for y in range(maze_h):
                if maze.is_wall(x, y):
                    pygame.draw.rect(
                        screen,
                        BLUE,
                        (x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE),
                    )

        # --- Pellets (white circles, 4px diameter, centred in tile) ---
        for x in range(maze_w):
            for y in range(maze_h):
                if maze.has_pellet(x, y):
                    center_x = x * TILE_SIZE + TILE_SIZE // 2
                    center_y = y * TILE_SIZE + TILE_SIZE // 2
                    pygame.draw.circle(screen, WHITE, (center_x, center_y), 2)

        # --- Pacman (yellow filled circle, full tile size) ---
        pac_center_x = pacman.grid_x * TILE_SIZE + TILE_SIZE // 2
        pac_center_y = pacman.grid_y * TILE_SIZE + TILE_SIZE // 2
        pygame.draw.circle(
            screen, YELLOW, (pac_center_x, pac_center_y), TILE_SIZE // 2
        )

        # --- Ghosts (coloured rectangle + two white eye circles) ---
        for ghost in ghosts:
            color = (ghost.color_r, ghost.color_g, ghost.color_b)
            gx = ghost.grid_x * TILE_SIZE
            gy = ghost.grid_y * TILE_SIZE

            # Body
            pygame.draw.rect(
                screen, color, (gx, gy, ghost.size, ghost.size)
            )

            # Eyes (two white circles matching the Java reference offsets)
            pygame.draw.circle(screen, WHITE, (gx + 7, gy + 7), 2)
            pygame.draw.circle(screen, WHITE, (gx + 13, gy + 7), 2)

        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Rendering/Drawing
        # ═══════════════════════════════════════════════════════
        # Text in pygame is a two-step process: (1) render the string
        # to a Surface with font.render(), (2) blit (copy) that Surface
        # onto the screen. pygame.display.flip() then pushes the
        # completed frame to the monitor in one operation (double
        # buffering prevents screen tearing).
        #
        # Compare with:
        #   Java (Swing) → g.drawString("Score: " + score, x, y)
        #   Java draws text directly onto the Graphics context.
        #   Pygame's Surface-based approach is more explicit but
        #   gives you precise control over text positioning via
        #   get_rect() and centering helpers.
        #
        # KEY CONCEPT: Double buffering (draw offscreen, then flip)
        # eliminates flicker and tearing in both pygame and Swing.
        # ═══════════════════════════════════════════════════════

        # --- Score HUD (white text, bottom-left) ---
        score_surface = self._font.render(
            f"Score: {game_logic.score}", True, WHITE
        )
        screen.blit(score_surface, (10, PANEL_HEIGHT - 30))

        # --- Game Over overlay ---
        if game_logic.game_over:
            go_surface = self._game_over_font.render("GAME OVER", True, WHITE)
            go_rect = go_surface.get_rect(
                center=(PANEL_WIDTH // 2, PANEL_HEIGHT // 2)
            )
            screen.blit(go_surface, go_rect)

        pygame.display.flip()
