import sys
import os

# Add the parent directory so we can import the game modules directly.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from maze import Maze


class TestBorderWallsExist:
    """Border tiles at all four corners must be walls."""

    def test_border_walls_exist(self):
        maze = Maze()
        assert maze.is_wall(0, 0), "Top-left corner should be a wall"
        assert maze.is_wall(39, 0), "Top-right corner should be a wall"
        assert maze.is_wall(0, 29), "Bottom-left corner should be a wall"
        assert maze.is_wall(39, 29), "Bottom-right corner should be a wall"


class TestInternalWalls:
    """Specific internal wall tiles defined by the maze layout."""

    def test_internal_walls(self):
        maze = Maze()
        # Horizontal rows at y=10 and y=20, x in [5, 15)
        assert maze.is_wall(5, 10)
        assert maze.is_wall(14, 10)
        assert maze.is_wall(5, 20)
        assert maze.is_wall(14, 20)
        # Vertical column at x=20, y in [5, 25)
        assert maze.is_wall(20, 5)
        assert maze.is_wall(20, 24)


class TestOpenSpace:
    """(5, 5) is the Pacman start position and must NOT be a wall."""

    def test_open_space(self):
        maze = Maze()
        assert not maze.is_wall(5, 5), "(5,5) should be open space"


class TestOutOfBoundsIsWall:
    """Coordinates outside the 40x30 grid are treated as walls."""

    def test_out_of_bounds_is_wall(self):
        maze = Maze()
        assert maze.is_wall(-1, 0), "x=-1 should be treated as a wall"
        assert maze.is_wall(40, 0), "x=40 should be treated as a wall"
        assert maze.is_wall(0, -1), "y=-1 should be treated as a wall"
        assert maze.is_wall(0, 30), "y=30 should be treated as a wall"


class TestPelletsOnOpenTiles:
    """Every non-wall, non-start tile should have a pellet initially."""

    def test_pellets_on_open_tiles(self):
        maze = Maze()
        for x in range(1, maze.width - 1):
            for y in range(1, maze.height - 1):
                if not maze.is_wall(x, y) and not (x == 5 and y == 5):
                    assert maze.has_pellet(x, y), (
                        f"Open tile ({x},{y}) should have a pellet"
                    )


class TestNoPelletOnWall:
    """Wall tiles must never contain pellets."""

    def test_no_pellet_on_wall(self):
        maze = Maze()
        for x in range(maze.width):
            for y in range(maze.height):
                if maze.is_wall(x, y):
                    assert not maze.has_pellet(x, y), (
                        f"Wall ({x},{y}) should not have a pellet"
                    )


class TestRemovePellet:
    """remove_pellet() should clear the pellet at a given position."""

    def test_remove_pellet(self):
        maze = Maze()
        # (2, 2) is an interior open tile with a pellet
        assert maze.has_pellet(2, 2), "Pellet should exist at (2,2) initially"
        maze.remove_pellet(2, 2)
        assert not maze.has_pellet(2, 2), "Pellet should be removed at (2,2)"
