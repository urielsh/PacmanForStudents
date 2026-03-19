import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from maze import Maze
from ghost import Ghost


class TestInitialPosition:
    """Ghost should start at the coordinates passed to the constructor."""

    def test_initial_position(self):
        ghost = Ghost(15, 15, 20, 255, 0, 0)
        assert ghost.grid_x == 15
        assert ghost.grid_y == 15


class TestCannotMoveIntoWall:
    """Over many update cycles, the ghost should never occupy a wall tile."""

    def test_cannot_move_into_wall(self):
        maze = Maze()
        ghost = Ghost(10, 5, 20, 255, 0, 0)
        for _ in range(1000):
            ghost.update(maze)
            assert not maze.is_wall(ghost.grid_x, ghost.grid_y), (
                f"Ghost entered wall at ({ghost.grid_x}, {ghost.grid_y})"
            )


class TestMovesEvery20Frames:
    """Ghost should only attempt movement every 20 frames."""

    def test_moves_every_20_frames(self):
        maze = Maze()
        # Place ghost in an open area with room to move
        ghost = Ghost(10, 5, 20, 255, 0, 0)

        start_x, start_y = ghost.grid_x, ghost.grid_y

        # After 19 updates (frames 1-19), ghost should NOT have moved
        for _ in range(19):
            ghost.update(maze)
        assert ghost.grid_x == start_x and ghost.grid_y == start_y, (
            "Ghost should not move before frame 20"
        )

        # On the 20th update (frame 20), the ghost may move (random direction,
        # may still stay if it picks a wall). Run many 20-frame blocks and
        # confirm at least one produces movement.
        moved = False
        # Reset ghost to known position for clean test
        ghost = Ghost(10, 15, 20, 255, 0, 0)
        for attempt in range(50):
            before_x, before_y = ghost.grid_x, ghost.grid_y
            # Run exactly 20 updates to trigger one move attempt
            for _ in range(20):
                ghost.update(maze)
            if ghost.grid_x != before_x or ghost.grid_y != before_y:
                moved = True
                break

        assert moved, (
            "Ghost should have moved at least once over 50 twenty-frame blocks"
        )
