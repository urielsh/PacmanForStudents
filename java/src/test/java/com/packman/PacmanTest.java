package com.packman;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class PacmanTest {

    private Pacman pacman;
    private Maze maze;
    private static final int TILE_SIZE = 20;

    @Before
    public void setUp() {
        maze = new Maze();
        pacman = new Pacman(5, 5, TILE_SIZE);
    }

    @Test
    public void testInitialPosition() {
        assertEquals("Pacman should start at gridX=5", 5, pacman.getGridX());
        assertEquals("Pacman should start at gridY=5", 5, pacman.getGridY());
    }

    @Test
    public void testCannotMoveIntoWall() {
        // From (5,5), moving left 5 times will reach the border wall at x=0.
        // First, move Pacman to (1,1) which is adjacent to the top-left border.
        Pacman wallPacman = new Pacman(1, 1, TILE_SIZE);

        // Set direction to move left (into the border wall at x=0)
        wallPacman.setDirection(-1, 0);
        wallPacman.update(maze);

        // Position should remain unchanged — wall at (0,1)
        assertEquals("Pacman should not move into wall (x should stay 1)", 1, wallPacman.getGridX());
        assertEquals("Pacman y should stay 1", 1, wallPacman.getGridY());
    }

    @Test
    public void testCanMoveIntoOpenSpace() {
        // (5,5) is open; moving right to (6,5) which is also open (not a wall)
        assertFalse("(6,5) should be open", maze.isWall(6, 5));

        pacman.setDirection(1, 0);
        pacman.update(maze);

        assertEquals("Pacman should have moved right to x=6", 6, pacman.getGridX());
        assertEquals("Pacman y should remain 5", 5, pacman.getGridY());
    }

    @Test
    public void testDirectionQueuing() {
        // Set initial direction to move right
        pacman.setDirection(1, 0);
        pacman.update(maze);
        assertEquals("After first move right, x=6", 6, pacman.getGridX());

        // Queue a downward direction — (6,6) is open
        assertFalse("(6,6) should be open for downward move", maze.isWall(6, 6));
        pacman.setDirection(0, 1);
        pacman.update(maze);

        assertEquals("After queued down, x should stay 6", 6, pacman.getGridX());
        assertEquals("After queued down, y should be 6", 6, pacman.getGridY());
    }
}
