#include <gtest/gtest.h>
#include "../maze.h"

TEST(MazeTest, DimensionsAreCorrect) {
    Maze maze;
    EXPECT_EQ(maze.getWidth(), 40);
    EXPECT_EQ(maze.getHeight(), 30);
}

TEST(MazeTest, BordersAreWalls) {
    Maze maze;
    // Top and bottom borders
    for (int x = 0; x < maze.getWidth(); ++x) {
        EXPECT_TRUE(maze.isWall(x, 0));
        EXPECT_TRUE(maze.isWall(x, maze.getHeight() - 1));
    }
    // Left and right borders
    for (int y = 0; y < maze.getHeight(); ++y) {
        EXPECT_TRUE(maze.isWall(0, y));
        EXPECT_TRUE(maze.isWall(maze.getWidth() - 1, y));
    }
}

TEST(MazeTest, OutOfBoundsIsWall) {
    Maze maze;
    EXPECT_TRUE(maze.isWall(-1, 0));
    EXPECT_TRUE(maze.isWall(0, -1));
    EXPECT_TRUE(maze.isWall(maze.getWidth(), 0));
    EXPECT_TRUE(maze.isWall(0, maze.getHeight()));
}

TEST(MazeTest, InteriorHasOpenCells) {
    Maze maze;
    // Cell (5,5) is Pacman's start — should not be a wall
    EXPECT_FALSE(maze.isWall(5, 5));
}

TEST(MazeTest, PelletsOnOpenCells) {
    Maze maze;
    // Interior non-wall cell (other than Pacman start) should have a pellet
    // Cell (2, 2) is interior and not on a wall line
    EXPECT_TRUE(maze.hasPellet(2, 2));
}

TEST(MazeTest, NoPelletOnPacmanStart) {
    Maze maze;
    EXPECT_FALSE(maze.hasPellet(5, 5));
}

TEST(MazeTest, NoPelletOnWall) {
    Maze maze;
    EXPECT_FALSE(maze.hasPellet(0, 0));
}

TEST(MazeTest, RemovePellet) {
    Maze maze;
    EXPECT_TRUE(maze.hasPellet(2, 2));
    maze.removePellet(2, 2);
    EXPECT_FALSE(maze.hasPellet(2, 2));
}

TEST(MazeTest, RemovePelletOutOfBoundsNoOp) {
    Maze maze;
    // Should not crash
    maze.removePellet(-1, -1);
    maze.removePellet(100, 100);
}
