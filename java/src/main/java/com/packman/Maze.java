package com.packman;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: The Maze — Tile-Based Level Data
// ═══════════════════════════════════════════════════════
// The Maze stores level layout as two 2D boolean arrays:
//   - walls[x][y]: true if this tile is a wall
//   - pellets[x][y]: true if this tile has an uneaten pellet
//
// This is a "data-driven" level: the maze structure is defined
// by arrays, not hard-coded drawing commands. You could load
// these arrays from a file to support multiple levels.
//
// NOTE: This class has ZERO rendering imports. It is a pure data
// model — the rendering layer (GamePanel) reads wall/pellet state
// via isWall()/hasPellet() and draws the maze itself. This
// separation of concerns keeps the Maze testable without a GUI.
//
// Compare with:
//   Python (Pygame) → maze = [[1,1,1,...],[1,0,0,...]] — list of lists
//   JavaScript (Canvas) → const maze = [[1,1,1,...],[1,0,0,...]] — 2D array
//   TypeScript → const maze: number[][] = [[1,1,...],[1,0,...]]
//   C++ (SDL2) → int maze[HEIGHT][WIDTH] or std::vector<std::vector<int>>
//
// KEY CONCEPT: 2D arrays are the most common representation for
// tile-based levels. Each cell holds a tile type (wall, floor,
// pellet, etc.). Professional games use tile map editors like
// Tiled and load level data from JSON/XML files.
// ═══════════════════════════════════════════════════════
public class Maze {
    private static final int MAZE_WIDTH = 40;
    private static final int MAZE_HEIGHT = 30;
    private boolean[][] walls;
    private boolean[][] pellets;

    public Maze() {
        initializeMaze();
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Level Initialization — Building the Map
    // ═══════════════════════════════════════════════════════
    // initializeMaze() programmatically creates the level:
    //   1. Border walls around the edges (containment)
    //   2. Internal wall segments (corridors and rooms)
    //   3. Pellets on every open tile (except Pacman's start)
    //
    // This procedural approach works for simple levels. Real games
    // typically load level data from external files so level designers
    // can create content without changing code.
    //
    // Compare with:
    //   Python (Pygame) → Read a text file: '#' = wall, '.' = pellet, ' ' = empty
    //   JavaScript (Canvas) → JSON.parse(levelData) or import level from .json
    //   TypeScript → import levelData from './level1.json' with typed LevelData
    //   C++ (SDL2) → std::ifstream + parse CSV/text, or use TMX (Tiled format)
    //
    // KEY CONCEPT: Hardcoded levels are fine for prototypes, but
    // external level files (JSON, CSV, Tiled TMX) enable rapid
    // iteration and let non-programmers design levels.
    // ═══════════════════════════════════════════════════════
    private void initializeMaze() {
        walls = new boolean[MAZE_WIDTH][MAZE_HEIGHT];
        pellets = new boolean[MAZE_WIDTH][MAZE_HEIGHT];

        // Create border walls
        for (int x = 0; x < MAZE_WIDTH; x++) {
            walls[x][0] = true;
            walls[x][MAZE_HEIGHT - 1] = true;
        }

        for (int y = 0; y < MAZE_HEIGHT; y++) {
            walls[0][y] = true;
            walls[MAZE_WIDTH - 1][y] = true;
        }

        // Add some internal walls
        for (int x = 5; x < 15; x++) {
            walls[x][10] = true;
            walls[x][20] = true;
        }

        for (int y = 5; y < 25; y++) {
            walls[20][y] = true;
        }

        // Initialize pellets
        for (int x = 1; x < MAZE_WIDTH - 1; x++) {
            for (int y = 1; y < MAZE_HEIGHT - 1; y++) {
                if (!walls[x][y] && !(x == 5 && y == 5)) {
                    pellets[x][y] = true;
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Bounds Checking — Defensive Programming
    // ═══════════════════════════════════════════════════════
    // isWall() returns true for any coordinate outside the maze.
    // This treats out-of-bounds as walls, preventing array index
    // exceptions AND preventing entities from leaving the map.
    //
    // Compare with:
    //   Python (Pygame) → if 0 <= x < WIDTH and 0 <= y < HEIGHT: ...
    //                      Python would throw IndexError without this
    //   JavaScript (Canvas) → if (x >= 0 && x < W && y >= 0 && y < H) ...
    //                          JS would return undefined (no crash, but bugs)
    //   TypeScript → Same as JS; strict mode won't catch runtime bounds
    //   C++ (SDL2) → CRITICAL: C++ has no bounds checking — accessing
    //                out-of-bounds memory is undefined behavior (crashes,
    //                security vulnerabilities). Always validate!
    //
    // KEY CONCEPT: Treating out-of-bounds as "solid" is a common
    // game dev trick. It simplifies movement code because entities
    // near edges don't need special handling — the boundary check
    // in isWall() handles it universally.
    // ═══════════════════════════════════════════════════════
    public boolean isWall(int x, int y) {
        if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
            return true;
        }
        return walls[x][y];
    }

    public boolean hasPellet(int x, int y) {
        if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
            return false;
        }
        return pellets[x][y];
    }

    public void removePellet(int x, int y) {
        if (x >= 0 && x < MAZE_WIDTH && y >= 0 && y < MAZE_HEIGHT) {
            pellets[x][y] = false;
        }
    }

    public int getWidth() {
        return MAZE_WIDTH;
    }

    public int getHeight() {
        return MAZE_HEIGHT;
    }
}
