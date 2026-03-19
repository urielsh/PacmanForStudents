package com.packman;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class GhostTest {

    private Maze maze;
    private static final int TILE_SIZE = 20;

    @Before
    public void setUp() {
        maze = new Maze();
    }

    @Test
    public void testInitialPosition() {
        Ghost ghost = new Ghost(15, 15, TILE_SIZE, 255, 0, 0);
        assertEquals("Ghost should start at gridX=15", 15, ghost.getGridX());
        assertEquals("Ghost should start at gridY=15", 15, ghost.getGridY());
    }

    @Test
    public void testCannotMoveIntoWall() {
        // Place ghost at (1,1), surrounded by border wall on left (x=0) and top (y=0).
        // After 20 updates, the ghost attempts to move. Even if it picks left or up,
        // it should not enter the wall. We run enough updates to ensure at least one
        // move attempt happens, and verify it never goes out of bounds.
        Ghost ghost = new Ghost(1, 1, TILE_SIZE, 255, 0, 0);

        for (int i = 0; i < 200; i++) {
            ghost.update(maze);
            // Ghost should never be on a wall tile
            assertFalse(
                "Ghost should never occupy a wall tile, but was at (" + ghost.getGridX() + "," + ghost.getGridY() + ")",
                maze.isWall(ghost.getGridX(), ghost.getGridY())
            );
        }
    }

    @Test
    public void testGhostMovesEvery20Frames() {
        // Place ghost in an open area with room to move
        Ghost ghost = new Ghost(10, 15, TILE_SIZE, 255, 175, 175);

        int startX = ghost.getGridX();
        int startY = ghost.getGridY();

        // First 19 updates: moveCounter goes 1..19, none divisible by 20 -> no movement
        for (int i = 0; i < 19; i++) {
            ghost.update(maze);
        }
        assertEquals("Ghost should not have moved in first 19 frames (x)", startX, ghost.getGridX());
        assertEquals("Ghost should not have moved in first 19 frames (y)", startY, ghost.getGridY());

        // Run many batches of 20 to statistically confirm movement eventually occurs.
        // After enough 20-frame cycles, the ghost should have moved at least once.
        boolean moved = false;
        for (int cycle = 0; cycle < 50; cycle++) {
            ghost.update(maze); // This is frame 20, 40, 60, ...
            if (ghost.getGridX() != startX || ghost.getGridY() != startY) {
                moved = true;
                break;
            }
            // Run 19 more frames to reach the next move attempt
            for (int i = 0; i < 19; i++) {
                ghost.update(maze);
            }
        }
        assertTrue("Ghost should have moved at least once after many 20-frame cycles", moved);
    }
}
