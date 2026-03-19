# Source of truth: shared/game_constants.json

from maze import Maze

# ═══════════════════════════════════════════════════════
# EDUCATIONAL NOTE: Object Movement
# ═══════════════════════════════════════════════════════
# Pacman moves on a discrete grid (tile-by-tile), not pixel-by-pixel.
# Each call to update() moves Pacman exactly one tile in the current
# direction. This simplifies collision detection (just compare grid
# coordinates) and keeps the movement code very short.
#
# Compare with:
#   Java (Swing) → The Java version uses the same grid approach,
#   but must declare every field type (private int gridX;) and
#   write explicit getters. Python's dynamic typing and @property
#   decorators cut the boilerplate significantly.
#
# KEY CONCEPT: Grid-based movement means position is always an
# integer tile index, never a fractional pixel coordinate.
# ═══════════════════════════════════════════════════════


class Pacman:
    """Player-controlled entity with grid-based movement and input buffering.

    Pure logic class with ZERO rendering imports. Rendering is handled
    separately by the display layer.
    """

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Input Handling
    # ═══════════════════════════════════════════════════════
    # Pacman stores TWO directions: the current one (_dir_x/y)
    # and a buffered "next" one (_next_dir_x/y). When the player
    # presses an arrow key, only the buffer is updated. On the
    # next update(), the game tries the buffered direction first.
    # This "input buffering" makes controls feel responsive --
    # the player can press a key slightly early and it still works.
    #
    # Compare with:
    #   Java (Swing) → Same pattern, but Java's KeyListener
    #   requires implementing an interface with keyPressed(),
    #   keyReleased(), keyTyped(). Python/pygame just checks
    #   event.key in a simple loop -- no interface to implement.
    #
    # KEY CONCEPT: Input buffering separates "when the player
    # presses a key" from "when the character actually turns."
    # ═══════════════════════════════════════════════════════

    def __init__(self, x: int, y: int, size: int):
        self._grid_x: int = x
        self._grid_y: int = y
        self._size: int = size
        self._dir_x: int = 0
        self._dir_y: int = 0
        self._next_dir_x: int = 0
        self._next_dir_y: int = 0

    # ------------------------------------------------------------------
    # Input buffering
    # ------------------------------------------------------------------

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Input Handling
    # ═══════════════════════════════════════════════════════
    # set_direction() is called from game_panel.py when a key
    # is pressed. It only updates the BUFFER -- the actual move
    # happens later in update(). This decouples input events
    # from the game simulation tick.
    #
    # Compare with:
    #   Java (Swing) → In Java, the KeyListener callback would
    #   call pacman.setDirection(dx, dy) -- same concept, but
    #   Java requires @Override annotations and interface
    #   boilerplate. Python just passes a method reference.
    #
    # KEY CONCEPT: Decoupling input from movement lets the game
    # loop control exactly when direction changes take effect.
    # ═══════════════════════════════════════════════════════

    def set_direction(self, dx: int, dy: int) -> None:
        """Queue the desired direction.  Actual change happens in update()."""
        self._next_dir_x = dx
        self._next_dir_y = dy

    # ------------------------------------------------------------------
    # Movement
    # ------------------------------------------------------------------

    def update(self, maze: Maze) -> None:
        """Move one tile per call.

        1. Try the buffered (next) direction first.
        2. If blocked, try continuing in the current direction.
        3. If both are blocked, stand still.
        """
        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Collision Detection
        # ═══════════════════════════════════════════════════════
        # Before moving, Pacman checks maze.is_wall() at the target
        # tile. This is "pre-movement collision detection" -- we test
        # BEFORE changing position, so Pacman never enters a wall.
        # The two-step fallback (try buffered, then current direction)
        # makes movement feel smooth even when the player is pressing
        # into a wall while sliding along a corridor.
        #
        # Compare with:
        #   Java (Swing) → Identical logic, but notice Python
        #   does not need a separate "Direction" enum or switch
        #   statement. The direction is just a (dx, dy) pair of
        #   integers -- Python's duck typing keeps it simple.
        #
        # KEY CONCEPT: Pre-movement wall checks prevent the player
        # from ever occupying an illegal tile position.
        # ═══════════════════════════════════════════════════════

        # Attempt buffered direction
        new_x = self._grid_x + self._next_dir_x
        new_y = self._grid_y + self._next_dir_y

        if not maze.is_wall(new_x, new_y):
            self._dir_x = self._next_dir_x
            self._dir_y = self._next_dir_y
            self._grid_x = new_x
            self._grid_y = new_y
        else:
            # Fall back to current direction
            new_x = self._grid_x + self._dir_x
            new_y = self._grid_y + self._dir_y
            if not maze.is_wall(new_x, new_y):
                self._grid_x = new_x
                self._grid_y = new_y

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Rendering/Drawing
    # ═══════════════════════════════════════════════════════
    # These @property methods expose grid_x, grid_y, and size
    # as read-only attributes for the rendering layer. Pacman
    # itself has NO idea how it gets drawn -- it just publishes
    # its position. The renderer (game_panel.py) converts grid
    # coordinates to pixel positions: pixel_x = grid_x * TILE_SIZE.
    #
    # Compare with:
    #   Java (Swing) → public int getGridX() { return gridX; }
    #   Python's @property is syntactic sugar that lets callers
    #   write pacman.grid_x instead of pacman.getGridX().
    #   No compilation step needed -- just save and run.
    #
    # KEY CONCEPT: Logic classes expose state via properties;
    # only the rendering layer knows about pixels and screens.
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
