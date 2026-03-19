#include <gtest/gtest.h>
#include "../game_logic.h"

TEST(GameLogicTest, InitialScoreIsZero) {
    GameLogic logic;
    EXPECT_EQ(logic.getScore(), 0);
}

TEST(GameLogicTest, NotGameOverInitially) {
    GameLogic logic;
    EXPECT_FALSE(logic.isGameOver());
}

TEST(GameLogicTest, HasFourGhosts) {
    GameLogic logic;
    EXPECT_EQ(logic.getGhosts().size(), 4u);
}

TEST(GameLogicTest, GhostNames) {
    GameLogic logic;
    const auto& ghosts = logic.getGhosts();
    EXPECT_EQ(ghosts[0].getName(), "Blinky");
    EXPECT_EQ(ghosts[1].getName(), "Pinky");
    EXPECT_EQ(ghosts[2].getName(), "Inky");
    EXPECT_EQ(ghosts[3].getName(), "Clyde");
}

TEST(GameLogicTest, PelletCollection) {
    GameLogic logic;
    // Move Pacman to a cell with a pellet and update
    logic.getPacman().setDirection(1, 0); // right
    logic.update();
    // Pacman should have collected the pellet at (6,5) and scored 10
    EXPECT_EQ(logic.getScore(), 10);
}

TEST(GameLogicTest, MazeAccessible) {
    GameLogic logic;
    const Maze& maze = logic.getMaze();
    EXPECT_EQ(maze.getWidth(), 40);
    EXPECT_EQ(maze.getHeight(), 30);
}

TEST(GameLogicTest, UpdateDoesNotCrash) {
    GameLogic logic;
    // Run several update cycles without crashing
    for (int i = 0; i < 100; ++i) {
        logic.update();
    }
    EXPECT_GE(logic.getScore(), 0);
}
