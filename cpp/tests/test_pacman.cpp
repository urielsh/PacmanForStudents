#include <gtest/gtest.h>
#include "../pacman.h"
#include "../maze.h"

TEST(PacmanTest, InitialPosition) {
    Pacman pac;
    EXPECT_EQ(pac.getGridX(), 5);
    EXPECT_EQ(pac.getGridY(), 5);
}

TEST(PacmanTest, MoveRight) {
    Pacman pac;
    Maze maze;
    pac.setDirection(1, 0);
    pac.update(maze);
    EXPECT_EQ(pac.getGridX(), 6);
    EXPECT_EQ(pac.getGridY(), 5);
}

TEST(PacmanTest, MoveDown) {
    Pacman pac;
    Maze maze;
    pac.setDirection(0, 1);
    pac.update(maze);
    EXPECT_EQ(pac.getGridX(), 5);
    EXPECT_EQ(pac.getGridY(), 6);
}

TEST(PacmanTest, CannotMoveIntoWall) {
    Pacman pac;
    Maze maze;
    // Move Pacman to position adjacent to a border wall
    // Position (1,1) is adjacent to wall at (0,1)
    // First navigate pacman to (1,1) by moving left several times
    pac.setDirection(-1, 0); // left
    for (int i = 0; i < 4; ++i) {
        pac.update(maze);
    }
    // Now at (1,5) — try to move further left into wall at (0,5)
    pac.setDirection(-1, 0);
    pac.update(maze);
    EXPECT_EQ(pac.getGridX(), 1); // Should not move into wall
}

TEST(PacmanTest, DirectionBuffering) {
    Pacman pac;
    Maze maze;
    pac.setDirection(1, 0); // right
    pac.update(maze);
    EXPECT_EQ(pac.getGridX(), 6);
    // Change to down, should apply on next update
    pac.setDirection(0, 1);
    pac.update(maze);
    EXPECT_EQ(pac.getGridX(), 6);
    EXPECT_EQ(pac.getGridY(), 6);
}
