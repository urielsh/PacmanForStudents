package com.packman;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class GameLogicTest {

    private GameLogic gameLogic;
    private static final int TILE_SIZE = 20;

    @Before
    public void setUp() {
        gameLogic = new GameLogic();
    }

    @Test
    public void testInitialScoreZero() {
        assertEquals("Initial score should be 0", 0, gameLogic.getScore());
    }

    @Test
    public void testInitialGameNotOver() {
        assertFalse("Game should not be over initially", gameLogic.isGameOver());
    }

    @Test
    public void testPelletScoring() {
        Maze maze = gameLogic.getMaze();

        // (1,1) has a pellet (open tile, not Pacman start)
        assertTrue("(1,1) should have a pellet", maze.hasPellet(1, 1));

        // Place Pacman at (1,1) — directly on the pellet
        Pacman pacman = new Pacman(1, 1, TILE_SIZE);
        Ghost[] ghosts = new Ghost[0]; // no ghosts

        gameLogic.checkCollisions(pacman, ghosts);

        assertEquals("Score should be 10 after collecting one pellet", 10, gameLogic.getScore());
        assertFalse("Pellet at (1,1) should be removed", maze.hasPellet(1, 1));
    }

    @Test
    public void testGhostCollisionGameOver() {
        // Place Pacman and a ghost at the same position
        Pacman pacman = new Pacman(5, 5, TILE_SIZE);
        Ghost ghost = new Ghost(5, 5, TILE_SIZE, 255, 0, 0);
        Ghost[] ghosts = new Ghost[] { ghost };

        gameLogic.checkCollisions(pacman, ghosts);

        assertTrue("Game should be over when Pacman and ghost are at the same position", gameLogic.isGameOver());
    }
}
