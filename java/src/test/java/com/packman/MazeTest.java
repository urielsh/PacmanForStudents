package com.packman;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class MazeTest {

    private Maze maze;

    @Before
    public void setUp() {
        maze = new Maze();
    }

    // --- Border walls ---

    @Test
    public void testBorderWallsExist() {
        // Four corners of the 40x30 maze
        assertTrue("Top-left corner should be a wall", maze.isWall(0, 0));
        assertTrue("Top-right corner should be a wall", maze.isWall(39, 0));
        assertTrue("Bottom-left corner should be a wall", maze.isWall(0, 29));
        assertTrue("Bottom-right corner should be a wall", maze.isWall(39, 29));
    }

    // --- Internal walls ---

    @Test
    public void testInternalWallsExist() {
        // Horizontal wall segments: x in [5,15) at y=10 and y=20
        assertTrue("(5,10) should be a wall", maze.isWall(5, 10));
        assertTrue("(14,10) should be a wall", maze.isWall(14, 10));
        assertTrue("(5,20) should be a wall", maze.isWall(5, 20));
        assertTrue("(14,20) should be a wall", maze.isWall(14, 20));

        // Vertical wall segment: x=20, y in [5,25)
        assertTrue("(20,5) should be a wall", maze.isWall(20, 5));
        assertTrue("(20,24) should be a wall", maze.isWall(20, 24));
    }

    // --- Open space ---

    @Test
    public void testOpenSpaceNotWall() {
        // Pacman start position (5,5) should be open
        assertFalse("(5,5) — Pacman start — should NOT be a wall", maze.isWall(5, 5));
    }

    // --- Out of bounds treated as wall ---

    @Test
    public void testOutOfBoundsIsWall() {
        assertTrue("(-1,0) out of bounds should be wall", maze.isWall(-1, 0));
        assertTrue("(40,0) out of bounds should be wall", maze.isWall(40, 0));
        assertTrue("(0,-1) out of bounds should be wall", maze.isWall(0, -1));
        assertTrue("(0,30) out of bounds should be wall", maze.isWall(0, 30));
    }

    // --- Pellets on open tiles ---

    @Test
    public void testPelletsOnOpenTiles() {
        // (1,1) is inside the border and not an internal wall, so it should have a pellet
        assertFalse("(1,1) should not be a wall", maze.isWall(1, 1));
        assertTrue("(1,1) open tile should have a pellet", maze.hasPellet(1, 1));

        // Another interior open tile
        assertFalse("(10,5) should not be a wall", maze.isWall(10, 5));
        assertTrue("(10,5) open tile should have a pellet", maze.hasPellet(10, 5));
    }

    // --- No pellet on wall ---

    @Test
    public void testNoPelletOnWall() {
        // Border wall
        assertFalse("Wall tile (0,0) should NOT have a pellet", maze.hasPellet(0, 0));
        // Internal wall
        assertFalse("Wall tile (5,10) should NOT have a pellet", maze.hasPellet(5, 10));
    }

    // --- removePellet ---

    @Test
    public void testRemovePellet() {
        // (1,1) starts with a pellet
        assertTrue("(1,1) should have pellet before removal", maze.hasPellet(1, 1));

        maze.removePellet(1, 1);

        assertFalse("(1,1) should NOT have pellet after removal", maze.hasPellet(1, 1));
    }
}
