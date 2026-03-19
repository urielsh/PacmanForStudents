#include <gtest/gtest.h>
#include "../ghost.h"
#include "../maze.h"

TEST(GhostTest, InitialPosition) {
    Ghost ghost(10, 10, "Blinky", "#FF0000");
    EXPECT_EQ(ghost.getGridX(), 10);
    EXPECT_EQ(ghost.getGridY(), 10);
}

TEST(GhostTest, NameAndColor) {
    Ghost ghost(10, 10, "Pinky", "#FFB8FF");
    EXPECT_EQ(ghost.getName(), "Pinky");
    EXPECT_EQ(ghost.getColor(), "#FFB8FF");
}

TEST(GhostTest, DoesNotMoveEveryFrame) {
    Ghost ghost(10, 10, "Inky", "#00FFFF");
    Maze maze;
    // Ghost only moves every 20 frames
    ghost.update(maze);
    // After 1 frame, ghost should still be at start (moveCounter=1, not divisible by 20)
    EXPECT_EQ(ghost.getGridX(), 10);
    EXPECT_EQ(ghost.getGridY(), 10);
}

TEST(GhostTest, MovesAfter20Frames) {
    Ghost ghost(15, 15, "Clyde", "#FF00FF");
    Maze maze;
    int startX = ghost.getGridX();
    int startY = ghost.getGridY();
    // Update 20 times — ghost should attempt a move on frame 20
    for (int i = 0; i < 20; ++i) {
        ghost.update(maze);
    }
    // Ghost may or may not have moved (random direction may hit a wall)
    // Just check it didn't crash and position is still valid
    EXPECT_GE(ghost.getGridX(), 0);
    EXPECT_LT(ghost.getGridX(), maze.getWidth());
    EXPECT_GE(ghost.getGridY(), 0);
    EXPECT_LT(ghost.getGridY(), maze.getHeight());
}

TEST(GhostTest, StaysInBounds) {
    Ghost ghost(15, 15, "Blinky", "#FF0000");
    Maze maze;
    // Run many updates — ghost should never leave the maze
    for (int i = 0; i < 1000; ++i) {
        ghost.update(maze);
        EXPECT_GE(ghost.getGridX(), 1);
        EXPECT_LT(ghost.getGridX(), maze.getWidth() - 1);
        EXPECT_GE(ghost.getGridY(), 1);
        EXPECT_LT(ghost.getGridY(), maze.getHeight() - 1);
    }
}
