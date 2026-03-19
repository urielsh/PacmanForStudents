# Source of truth: shared/game_constants.json

# ═══════════════════════════════════════════════════════
# EDUCATIONAL NOTE: Rendering/Drawing
# ═══════════════════════════════════════════════════════
# The Maze class is a PURE DATA MODEL with zero rendering imports.
# It stores wall/pellet state only; the rendering layer (game_panel.py)
# reads this data via is_wall() / has_pellet() and draws tiles itself.
#
# Compare with:
#   Java (Swing) → In many Java tutorials, maze rendering is embedded
#   directly inside a JPanel's paintComponent() alongside the data.
#   Here Python encourages a cleaner separation because there is no
#   required class hierarchy (no "extends JPanel").
#
# KEY CONCEPT: Separating data from drawing makes classes easier to
# test and reuse -- a core benefit of Python's flexible design.
# ═══════════════════════════════════════════════════════


class Maze:
    """Tile-based level data: walls and pellets on a 40x30 grid.

    Pure data model with ZERO rendering imports. The rendering layer
    reads wall/pellet state via is_wall()/has_pellet() and draws
    the maze itself.
    """

    _MAZE_WIDTH = 40
    _MAZE_HEIGHT = 30

    def __init__(self):
        self._walls: list[list[bool]] = []
        self._pellets: list[list[bool]] = []
        self._initialize_maze()

    # ------------------------------------------------------------------
    # Maze construction
    # ------------------------------------------------------------------

    def _initialize_maze(self) -> None:
        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Object Movement
        # ═══════════════════════════════════════════════════════
        # The maze grid is the foundation for ALL movement. Every entity
        # (Pacman, Ghosts) moves tile-by-tile and checks this grid before
        # stepping. The 2D list is built with a list comprehension --
        # one line creates 40 columns, each containing 30 booleans.
        #
        # Compare with:
        #   Java (Swing) → boolean[][] walls = new boolean[40][30];
        #   Java requires explicit array type declarations and sizes.
        #   Python's list comprehension is more concise and readable.
        #
        # KEY CONCEPT: List comprehensions like [expr for _ in range(n)]
        # replace verbose Java loops for initializing 2D arrays.
        # ═══════════════════════════════════════════════════════

        # Allocate grids – indexed as [x][y] to match Java reference
        self._walls = [
            [False] * self._MAZE_HEIGHT for _ in range(self._MAZE_WIDTH)
        ]
        self._pellets = [
            [False] * self._MAZE_HEIGHT for _ in range(self._MAZE_WIDTH)
        ]

        # Border walls – top / bottom
        for x in range(self._MAZE_WIDTH):
            self._walls[x][0] = True
            self._walls[x][self._MAZE_HEIGHT - 1] = True

        # Border walls – left / right
        for y in range(self._MAZE_HEIGHT):
            self._walls[0][y] = True
            self._walls[self._MAZE_WIDTH - 1][y] = True

        # Internal walls: horizontal rows at y=10 and y=20, x in [5, 15)
        for x in range(5, 15):
            self._walls[x][10] = True
            self._walls[x][20] = True

        # Internal wall: vertical column at x=20, y in [5, 25)
        for y in range(5, 25):
            self._walls[20][y] = True

        # ═══════════════════════════════════════════════════════
        # EDUCATIONAL NOTE: Collision Detection
        # ═══════════════════════════════════════════════════════
        # Pellets are placed on every open (non-wall) interior tile.
        # Later, collision detection in game_logic.py checks whether
        # Pacman's grid position matches a pellet tile. This simple
        # "same tile = collision" approach works because movement is
        # tile-based (discrete), not pixel-based (continuous).
        #
        # Compare with:
        #   Java (Swing) → The same grid-based check, but Java would
        #   typically use nested for-loops with int i/j counters.
        #   Python's range() + boolean expressions are more compact.
        #
        # KEY CONCEPT: Grid-based collision is the simplest form --
        # two objects collide when they occupy the same (x, y) cell.
        # ═══════════════════════════════════════════════════════

        # Pellets on every open interior tile except Pacman start (5, 5)
        for x in range(1, self._MAZE_WIDTH - 1):
            for y in range(1, self._MAZE_HEIGHT - 1):
                if not self._walls[x][y] and not (x == 5 and y == 5):
                    self._pellets[x][y] = True

    # ------------------------------------------------------------------
    # Public query helpers
    # ------------------------------------------------------------------

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Collision Detection
    # ═══════════════════════════════════════════════════════
    # is_wall() is called by EVERY entity before moving. It treats
    # out-of-bounds coordinates as walls (fail-safe boundary check).
    # This single method centralizes all wall collision logic.
    #
    # Compare with:
    #   Java (Swing) → Same logic, but in Java you would write:
    #   if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return true;
    #   Python uses English-like 'or' instead of '||' and does not
    #   need explicit return type declarations (though type hints
    #   like -> bool are optional and used here for clarity).
    #
    # KEY CONCEPT: Centralizing boundary checks in one method
    # prevents off-by-one bugs across Pacman and Ghost movement.
    # ═══════════════════════════════════════════════════════

    def is_wall(self, x: int, y: int) -> bool:
        """Return True if (x, y) is a wall **or** out of bounds."""
        if x < 0 or x >= self._MAZE_WIDTH or y < 0 or y >= self._MAZE_HEIGHT:
            return True
        return self._walls[x][y]

    def has_pellet(self, x: int, y: int) -> bool:
        """Return True if there is an uneaten pellet at (x, y)."""
        if x < 0 or x >= self._MAZE_WIDTH or y < 0 or y >= self._MAZE_HEIGHT:
            return False
        return self._pellets[x][y]

    def remove_pellet(self, x: int, y: int) -> None:
        """Remove the pellet at (x, y) if within bounds."""
        if 0 <= x < self._MAZE_WIDTH and 0 <= y < self._MAZE_HEIGHT:
            self._pellets[x][y] = False

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Rendering/Drawing
    # ═══════════════════════════════════════════════════════
    # Properties like width/height let the rendering layer
    # (game_panel.py) iterate over the grid without knowing
    # internal constants. Python's @property decorator turns
    # a method into a read-only attribute access (maze.width).
    #
    # Compare with:
    #   Java (Swing) → public int getWidth() { return MAZE_WIDTH; }
    #   Java uses explicit getter methods. Python's @property
    #   gives the same encapsulation with cleaner call syntax:
    #   maze.width instead of maze.getWidth().
    #
    # KEY CONCEPT: @property is Python's idiomatic replacement for
    # Java-style getter/setter methods.
    # ═══════════════════════════════════════════════════════

    @property
    def width(self) -> int:
        return self._MAZE_WIDTH

    @property
    def height(self) -> int:
        return self._MAZE_HEIGHT
