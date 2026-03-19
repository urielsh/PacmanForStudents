cmake_minimum_required(VERSION 3.14)
project(PacmanCpp VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find SDL2
find_package(SDL2 REQUIRED)

# Game executable
add_executable(pacman
    main.cpp
    game_panel.cpp
    game_logic.cpp
    maze.cpp
    pacman.cpp
    ghost.cpp
)
target_include_directories(pacman PRIVATE ${SDL2_INCLUDE_DIRS})
target_link_libraries(pacman PRIVATE ${SDL2_LIBRARIES})

# GoogleTest for unit tests
include(FetchContent)
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG v1.14.0
)
FetchContent_MakeAvailable(googletest)

enable_testing()

add_executable(pacman_tests
    tests/test_maze.cpp
    tests/test_pacman.cpp
    tests/test_ghost.cpp
    tests/test_game_logic.cpp
    maze.cpp
    pacman.cpp
    ghost.cpp
    game_logic.cpp
)
target_link_libraries(pacman_tests PRIVATE GTest::gtest_main)
include(GoogleTest)
gtest_discover_tests(pacman_tests)
