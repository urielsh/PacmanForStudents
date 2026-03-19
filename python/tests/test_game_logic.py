import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from game_logic import GameLogic
from pacman import Pacman
from ghost import Ghost


class TestInitialScoreZero:
    """Score should be zero when the game starts."""

    def test_initial_score_zero(self):
        logic = GameLogic()
        assert logic.score == 0


class TestInitialNotGameOver:
    """game_over should be False when the game starts."""

    def test_initial_not_game_over(self):
        logic = GameLogic()
        assert logic.game_over is False


class TestPelletScoring:
    """Collecting a pellet should add 10 points to the score."""

    def test_pellet_scoring(self):
        logic = GameLogic()
        maze = logic.maze

        # Place Pacman on a tile that has a pellet.
        # (2, 2) is an interior open tile with a pellet.
        assert maze.has_pellet(2, 2), "(2,2) should have a pellet initially"

        pacman = Pacman(2, 2, 20)
        logic.check_collisions(pacman, [])

        assert logic.score == 10, "Score should be 10 after collecting one pellet"
        assert not maze.has_pellet(2, 2), "Pellet should be removed after collection"

        # Move Pacman to another pellet tile (3, 2)
        assert maze.has_pellet(3, 2), "(3,2) should have a pellet"
        pacman2 = Pacman(3, 2, 20)
        logic.check_collisions(pacman2, [])

        assert logic.score == 20, "Score should be 20 after collecting two pellets"


class TestGhostCollisionGameOver:
    """Pacman sharing a tile with a ghost should trigger game over."""

    def test_ghost_collision_game_over(self):
        logic = GameLogic()
        pacman = Pacman(5, 5, 20)
        ghost = Ghost(5, 5, 20, 255, 0, 0)  # Same position as Pacman

        logic.check_collisions(pacman, [ghost])

        assert logic.game_over is True, "Game should be over after ghost collision"
