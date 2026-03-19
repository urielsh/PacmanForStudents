# Source of truth: shared/game_constants.json

from maze import Maze
from pacman import Pacman
from ghost import Ghost

# ═══════════════════════════════════════════════════════
# EDUCATIONAL NOTE: Collision Detection
# ═══════════════════════════════════════════════════════
# GameLogic is the SINGLE place where game rules are enforced:
# pellet collection and ghost-kills-Pacman. Keeping all rule
# checks in one class (instead of spreading them across Pacman
# and Ghost) makes the rules easy to find, read, and modify.
#
# Compare with:
#   Java (Swing) → Java often puts collision logic inside the
#   JPanel's actionPerformed() or a dedicated "GameEngine" class.
#   The pattern is the same, but Python needs no ActionListener
#   interface, no @Override, and no public/private keywords.
#
# KEY CONCEPT: Centralizing game rules in one class follows the
# Single Responsibility Principle and simplifies debugging.
# ═══════════════════════════════════════════════════════


class GameLogic:
    """Pure game-rule layer: owns the Maze, tracks score, detects collisions.

    ZERO rendering imports. The rendering layer reads state through
    the public properties and calls check_collisions() each frame.
    """

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Game Loop Timing
    # ═══════════════════════════════════════════════════════
    # GameLogic is called once per frame by game_panel.update().
    # It does NOT own the timing -- the main loop and pygame's
    # clock.tick(FPS) control how often check_collisions() runs.
    # This separation means GameLogic is easy to unit-test: just
    # call check_collisions() directly without needing a clock.
    #
    # Compare with:
    #   Java (Swing) → ActionListener.actionPerformed() is called
    #   by a javax.swing.Timer at a fixed interval. Python's
    #   approach (caller drives the timing) is more explicit and
    #   does not require event-listener registration boilerplate.
    #
    # KEY CONCEPT: Logic classes should not own timing -- let the
    # game loop call them, making the code testable and flexible.
    # ═══════════════════════════════════════════════════════

    def __init__(self):
        self._maze: Maze = Maze()
        self._score: int = 0
        self._game_over: bool = False

    # ------------------------------------------------------------------
    # Collision detection (grid-based)
    # ------------------------------------------------------------------

    def check_collisions(self, pacman: Pacman, ghosts: list[Ghost]) -> None:
        """Check pellet collection and ghost collision every frame.

        1. Pellet collection: if Pacman is on a pellet, remove it and
           add 10 points.
        2. Ghost collision: if Pacman shares a tile with any ghost,
           set game_over to True.
        """
        pacman_x = pacman.grid_x
        pacman_y = pacman.grid_y

        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Collision Detection
        # ═══════════════════════════════════════════════════════
        # Pellet collection is a single grid-coordinate check:
        # "is there a pellet at Pacman's current tile?" Because
        # movement is tile-based, there is no need for bounding-box
        # or circle-intersection math -- just compare integers.
        #
        # Compare with:
        #   Java (Swing) → if (maze.hasPellet(px, py)) { ... }
        #   Identical logic. Python's f-string score display and
        #   lack of semicolons make the code shorter, but the
        #   algorithm is exactly the same in both languages.
        #
        # KEY CONCEPT: Grid-based collision = integer equality check.
        # No floating-point rounding errors, no overlap calculations.
        # ═══════════════════════════════════════════════════════

        # Pellet collection
        if self._maze.has_pellet(pacman_x, pacman_y):
            self._maze.remove_pellet(pacman_x, pacman_y)
            self._score += 10

        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Collision Detection
        # ═══════════════════════════════════════════════════════
        # Ghost collision iterates over the ghost list using a
        # Python for-in loop. If ANY ghost shares Pacman's tile,
        # the game ends immediately. The list[Ghost] type hint
        # is optional documentation -- Python would run the same
        # code without it, unlike Java which requires List<Ghost>.
        #
        # Compare with:
        #   Java (Swing) → for (Ghost g : ghosts) { if (...) }
        #   Java's enhanced for-loop is similar, but requires the
        #   collection to implement Iterable<Ghost>. In Python,
        #   any iterable (list, tuple, generator) works in a for loop.
        #
        # KEY CONCEPT: Python's for-in loop works with ANY iterable,
        # not just specific collection types -- duck typing again.
        # ═══════════════════════════════════════════════════════

        # Ghost collision
        for ghost in ghosts:
            if pacman_x == ghost.grid_x and pacman_y == ghost.grid_y:
                self._game_over = True

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Rendering/Drawing
    # ═══════════════════════════════════════════════════════
    # These properties expose game state to the renderer. The
    # renderer reads game_logic.score to display the HUD and
    # game_logic.game_over to show the "GAME OVER" overlay.
    # GameLogic itself has ZERO knowledge of pygame or pixels.
    #
    # Compare with:
    #   Java (Swing) → public int getScore() / public boolean
    #   isGameOver(). Java naming convention uses "is" prefix for
    #   booleans. Python just uses the property name directly:
    #   game_logic.game_over (reads naturally as a statement).
    #
    # KEY CONCEPT: Properties create a clean API boundary between
    # the game rules layer and the rendering/display layer.
    # ═══════════════════════════════════════════════════════

    @property
    def maze(self) -> Maze:
        return self._maze

    @property
    def score(self) -> int:
        return self._score

    @property
    def game_over(self) -> bool:
        return self._game_over
