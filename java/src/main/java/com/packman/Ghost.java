package com.packman;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Ghost Entity — NPC with Autonomous Movement
// ═══════════════════════════════════════════════════════
// Unlike Pacman (player-controlled), Ghost moves on its own.
// It has the same grid position and tile size, plus RGB color
// values to distinguish the four ghosts (Blinky, Pinky, Inky,
// Clyde). The moveCounter throttles movement speed so ghosts
// don't move every single frame.
//
// NOTE: Color is stored as raw RGB integers instead of java.awt.Color
// so this entity class has ZERO rendering imports. The rendering
// layer (GamePanel) reconstructs the Color from RGB when drawing.
//
// Compare with:
//   Python (Pygame) → class Ghost(pygame.sprite.Sprite): with
//                      self.color = (r, g, b) tuple and self.move_timer
//   JavaScript (Canvas) → class Ghost { r; g; b; moveTimer; update() }
//   TypeScript → class Ghost with readonly color: {r:number,g:number,b:number}
//   C++ (SDL2) → struct Ghost { int x, y; uint8_t r, g, b; int timer; }
//
// KEY CONCEPT: NPCs (non-player characters) share the same base
// properties as the player (position, size) but replace player
// input with AI logic. Keeping rendering imports out of entity
// classes improves testability and separation of concerns.
// ═══════════════════════════════════════════════════════
public class Ghost {
    private int gridX;
    private int gridY;
    private int size;
    private int colorR;
    private int colorG;
    private int colorB;
    private int moveCounter = 0;

    public Ghost(int x, int y, int size, int r, int g, int b) {
        this.gridX = x;
        this.gridY = y;
        this.size = size;
        this.colorR = r;
        this.colorG = g;
        this.colorB = b;
    }

    // ═══════════════════════════════════════════════════════
    // EDUCATIONAL NOTE: Ghost AI — Random Movement Pattern
    // ═══════════════════════════════════════════════════════
    // This is the simplest possible ghost AI: every 20 frames,
    // pick a random direction (0-3) and move there if it's not
    // a wall. This creates unpredictable but not very threatening
    // ghost behavior.
    //
    // The moveCounter acts as a SPEED LIMITER: ghosts only attempt
    // to move every 20th frame (about 3 times per second at 60 FPS).
    // Pacman moves every frame, so the player is much faster.
    //
    // In the real Pac-Man (1980), each ghost has unique AI:
    //   - Blinky (red): Chases Pac-Man directly (shortest path)
    //   - Pinky (pink): Aims 4 tiles AHEAD of Pac-Man
    //   - Inky (cyan): Uses Blinky's position + Pac-Man's to calculate target
    //   - Clyde (orange): Chases when far, scatters when close
    //
    // Compare with:
    //   Python (Pygame) → random.choice([(0,1),(0,-1),(1,0),(-1,0)])
    //   JavaScript (Canvas) → const dir = Math.floor(Math.random() * 4)
    //   TypeScript → Same as JS; const dir: number = Math.floor(...)
    //   C++ (SDL2) → int dir = rand() % 4; (or std::uniform_int_distribution)
    //
    // KEY CONCEPT: Game AI ranges from trivial (random) to complex
    // (A* pathfinding, behavior trees, utility AI). Start simple
    // and add complexity only when gameplay demands it. Random
    // movement is a valid "dumb AI" baseline for prototyping.
    // ═══════════════════════════════════════════════════════
    public void update(Maze maze) {
        // Simple ghost movement pattern
        moveCounter++;
        if (moveCounter % 20 == 0) {
            int direction = (int) (Math.random() * 4);

            // ═══════════════════════════════════════════════════════
            // EDUCATIONAL NOTE: Object Movement — Direction Switch
            // ═══════════════════════════════════════════════════════
            // The switch maps a random integer to one of 4 directions.
            // Each case checks the wall BEFORE moving — same "look
            // before you leap" pattern as Pacman.update().
            //
            // A cleaner approach would use direction vectors:
            //   int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
            //   int[] d = dirs[direction];
            //   if (!maze.isWall(gridX+d[0], gridY+d[1])) { ... }
            //
            // Compare with:
            //   Python (Pygame) → directions = [(-1,0),(1,0),(0,-1),(0,1)]
            //                      dx, dy = random.choice(directions)
            //   JavaScript (Canvas) → const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
            //                          const [dx,dy] = dirs[Math.floor(Math.random()*4)]
            //   TypeScript → type Dir = [number, number]; const dirs: Dir[] = ...
            //   C++ (SDL2) → std::pair<int,int> dirs[] = {{-1,0},{1,0},{0,-1},{0,1}};
            //
            // KEY CONCEPT: Direction vectors (dx, dy pairs) are cleaner
            // than switch statements for movement. They scale to 8-dir
            // movement and make code shorter. But switch is fine for
            // learning — clarity over cleverness.
            // ═══════════════════════════════════════════════════════
            switch (direction) {
                case 0: // Left
                    if (!maze.isWall(gridX - 1, gridY)) gridX--;
                    break;
                case 1: // Right
                    if (!maze.isWall(gridX + 1, gridY)) gridX++;
                    break;
                case 2: // Up
                    if (!maze.isWall(gridX, gridY - 1)) gridY--;
                    break;
                case 3: // Down
                    if (!maze.isWall(gridX, gridY + 1)) gridY++;
                    break;
            }
        }
    }

    public int getSize() {
        return size;
    }

    public int getColorR() {
        return colorR;
    }

    public int getColorG() {
        return colorG;
    }

    public int getColorB() {
        return colorB;
    }

    public int getGridX() {
        return gridX;
    }

    public int getGridY() {
        return gridY;
    }
}
