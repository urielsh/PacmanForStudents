import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from maze import Maze
from pacman import Pacman


class TestInitialPosition:
    """Pacman should start at the coordinates passed to the constructor."""

    def test_initial_position(self):
        pacman = Pacman(5, 5, 20)
        assert pacman.grid_x == 5
        assert pacman.grid_y == 5


class TestCannotMoveIntoWall:
    """Setting direction toward a wall and updating should leave Pacman in place."""

    def test_cannot_move_into_wall(self):
        maze = Maze()
        # Start Pacman at (1, 1) -- surrounded by border wall on the left (x=0)
        pacman = Pacman(1, 1, 20)
        pacman.set_direction(-1, 0)  # Try to move left into wall at (0,1)
        pacman.update(maze)
        assert pacman.grid_x == 1, "Pacman should not move into a wall"
        assert pacman.grid_y == 1


class TestCanMoveIntoOpenSpace:
    """Setting direction to an open tile and updating should move Pacman."""

    def test_can_move_into_open_space(self):
        maze = Maze()
        # (5, 5) is open; (6, 5) is also open
        pacman = Pacman(5, 5, 20)
        pacman.set_direction(1, 0)  # Move right
        pacman.update(maze)
        assert pacman.grid_x == 6
        assert pacman.grid_y == 5


class TestDirectionQueuing:
    """Buffered next-direction should be applied when it becomes valid."""

    def test_direction_queuing(self):
        maze = Maze()
        # Start at (1, 1). Moving down is open (1,2), moving left is wall (0,1).
        pacman = Pacman(1, 1, 20)

        # Set current direction to down by updating once
        pacman.set_direction(0, 1)
        pacman.update(maze)
        assert pacman.grid_x == 1
        assert pacman.grid_y == 2  # moved down

        # Now queue right direction (1, 0). (2, 2) is open.
        pacman.set_direction(1, 0)
        pacman.update(maze)
        assert pacman.grid_x == 2, "Queued right direction should be applied"
        assert pacman.grid_y == 2
