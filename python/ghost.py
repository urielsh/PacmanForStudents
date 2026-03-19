# Source of truth: shared/game_constants.json

import random

from maze import Maze

# ═══════════════════════════════════════════════════════
# EDUCATIONAL NOTE: Ghost AI
# ═══════════════════════════════════════════════════════
# Ghosts use a RANDOM movement strategy: every 20 frames, each ghost
# picks one of four directions at random and moves if the target tile
# is open. This is the simplest possible AI -- no pathfinding, no
# chasing, no personality differences between ghosts.
#
# Compare with:
#   Java (Swing) → The Java version uses the same Random-based
#   approach with java.util.Random.nextInt(4). Python's built-in
#   random module (random.randint) requires no import of a separate
#   class -- it is a module-level function, not an object method.
#
# KEY CONCEPT: Even "dumb" random AI creates engaging gameplay
# because four ghosts moving unpredictably are hard to dodge.
# ═══════════════════════════════════════════════════════


class Ghost:
    """NPC entity with autonomous random movement.

    Pure logic class with ZERO rendering imports. Color is stored as
    raw RGB integers so the rendering layer can reconstruct its own
    color representation.
    """

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Rendering/Drawing
    # ═══════════════════════════════════════════════════════
    # Ghost stores its color as raw (R, G, B) integers instead of
    # a pygame.Color or java.awt.Color object. This keeps the class
    # completely independent of any rendering library. The renderer
    # reconstructs the color tuple when drawing: (ghost.color_r,
    # ghost.color_g, ghost.color_b).
    #
    # Compare with:
    #   Java (Swing) → new Color(255, 0, 0) creates a Color object
    #   directly in the constructor. This ties the class to AWT.
    #   Python's approach of storing plain ints is more portable.
    #
    # KEY CONCEPT: Storing colors as primitive values (not library
    # objects) keeps logic classes free from rendering dependencies.
    # ═══════════════════════════════════════════════════════

    def __init__(
        self,
        x: int,
        y: int,
        size: int,
        color_r: int,
        color_g: int,
        color_b: int,
    ):
        self._grid_x: int = x
        self._grid_y: int = y
        self._size: int = size
        self._color_r: int = color_r
        self._color_g: int = color_g
        self._color_b: int = color_b
        self._move_counter: int = 0

    # ------------------------------------------------------------------
    # Movement – random direction every 20 frames
    # ------------------------------------------------------------------

    def update(self, maze: Maze) -> None:
        """Attempt a random move every 20 frames (speed limiter)."""
        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Game Loop Timing
        # ═══════════════════════════════════════════════════════
        # _move_counter acts as a frame-based speed limiter. The ghost
        # only attempts a move every 20 frames (at 60 FPS, that is
        # roughly 3 moves per second). Without this, ghosts would move
        # once per frame -- 60 tiles/sec -- far too fast to dodge.
        #
        # Compare with:
        #   Java (Swing) → Java often uses a javax.swing.Timer with a
        #   millisecond delay. Python/pygame has no built-in per-entity
        #   timer, so a frame counter with modulo (%) is the simplest
        #   approach: if self._move_counter % 20 == 0.
        #
        # KEY CONCEPT: Frame-counting with modulo is a lightweight way
        # to control entity speed without extra timer objects.
        # ═══════════════════════════════════════════════════════

        self._move_counter += 1
        if self._move_counter % 20 == 0:
            # ═══════════════════════════════════════════════════════
            # EDUCATIONAL NOTE: Ghost AI
            # ═══════════════════════════════════════════════════════
            # Each decision is independent: pick a random int 0-3,
            # map it to (Left, Right, Up, Down), then check the wall
            # grid before moving. If the chosen direction is blocked,
            # the ghost simply stands still -- no retry, no fallback.
            #
            # Compare with:
            #   Java (Swing) → switch(direction) { case 0: ... }
            #   Python uses if/elif chains instead of switch/case.
            #   (Python 3.10+ has match/case, but if/elif is simpler
            #   for small fixed sets of values like this.)
            #
            # KEY CONCEPT: A random direction + wall check is the
            # simplest AI pattern -- easy to code, easy to debug.
            # ═══════════════════════════════════════════════════════

            direction = random.randint(0, 3)

            if direction == 0:  # Left
                if not maze.is_wall(self._grid_x - 1, self._grid_y):
                    self._grid_x -= 1
            elif direction == 1:  # Right
                if not maze.is_wall(self._grid_x + 1, self._grid_y):
                    self._grid_x += 1
            elif direction == 2:  # Up
                if not maze.is_wall(self._grid_x, self._grid_y - 1):
                    self._grid_y -= 1
            elif direction == 3:  # Down
                if not maze.is_wall(self._grid_x, self._grid_y + 1):
                    self._grid_y += 1

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Object Movement
    # ═══════════════════════════════════════════════════════
    # Like Pacman, Ghost exposes position via read-only @property
    # methods. Both entities share the same coordinate system
    # (grid_x, grid_y) and movement pattern (check wall, then move).
    # Python's duck typing means any object with grid_x and grid_y
    # properties could participate in collision detection -- no
    # shared interface or base class is required.
    #
    # Compare with:
    #   Java (Swing) → Java would typically define an interface
    #   like "GridEntity" with getGridX()/getGridY() and have both
    #   Pacman and Ghost implement it. Python achieves the same
    #   polymorphism implicitly through duck typing.
    #
    # KEY CONCEPT: Duck typing -- "if it has grid_x and grid_y,
    # it can be checked for collisions" -- no interface needed.
    # ═══════════════════════════════════════════════════════

    @property
    def grid_x(self) -> int:
        return self._grid_x

    @property
    def grid_y(self) -> int:
        return self._grid_y

    @property
    def size(self) -> int:
        return self._size

    @property
    def color_r(self) -> int:
        return self._color_r

    @property
    def color_g(self) -> int:
        return self._color_g

    @property
    def color_b(self) -> int:
        return self._color_b
