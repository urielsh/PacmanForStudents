# Drawing and Rendering -- Cross-Language Comparison

## Introduction

Every game must translate its internal state (grid positions, scores, entity lists) into pixels on the screen. This document compares how each of the five Packman implementations handles rendering: clearing the screen, drawing walls, drawing Pacman, drawing ghosts, and displaying the HUD. All five use **immediate-mode rendering** -- the entire scene is redrawn from scratch every frame.

---

## 1. Screen Clearing

Before drawing anything, every implementation clears the previous frame.

**Java (Swing):**
```java
// java/src/main/java/com/packman/GamePanel.java
@Override
protected void paintComponent(Graphics g) {
    super.paintComponent(g);  // Clears to panel's background color (BLACK)
    Graphics2D g2d = (Graphics2D) g;
    // ... drawing follows
}
```

**Python (Pygame):**
```python
# python/game_panel.py
screen.fill(BLACK)
```

**JavaScript (Canvas):**
```javascript
// javascript/game.js
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
```

**TypeScript (Canvas):**
```typescript
// typescript/src/game.ts
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
```

**C++ (SDL2):**
```cpp
// cpp/game_panel.cpp
SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
SDL_RenderClear(renderer);
```

**Analysis:** All five follow the same pattern -- fill the entire surface with black before redrawing. Java hides this inside `super.paintComponent()`. Pygame uses a dedicated `fill()` method. Canvas and SDL2 require explicit color-then-clear calls. C++ separates color setting from the clear operation, which is more verbose but gives explicit control over the alpha channel.

---

## 2. Drawing Wall Tiles

Walls are blue filled rectangles, one per grid cell.

**Java (Swing):**
```java
// java/src/main/java/com/packman/GamePanel.java
g2d.setColor(Color.BLUE);
for (int x = 0; x < mazeW; x++) {
    for (int y = 0; y < mazeH; y++) {
        if (maze.isWall(x, y)) {
            g2d.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}
```

**Python (Pygame):**
```python
# python/game_panel.py
for x in range(maze_w):
    for y in range(maze_h):
        if maze.is_wall(x, y):
            pygame.draw.rect(
                screen, BLUE,
                (x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE),
            )
```

**JavaScript (Canvas):**
```javascript
// javascript/game.js
ctx.fillStyle = '#0000FF';
for (var x = 0; x < mazeW; x++) {
    for (var y = 0; y < mazeH; y++) {
        if (maze.isWall(x, y)) {
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}
```

**TypeScript (Canvas):**
```typescript
// typescript/src/game.ts
ctx.fillStyle = '#0000FF';
for (let x = 0; x < mazeW; x++) {
    for (let y = 0; y < mazeH; y++) {
        if (maze.isWall(x, y)) {
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}
```

**C++ (SDL2):**
```cpp
// cpp/game_panel.cpp
SDL_SetRenderDrawColor(renderer, 0, 0, 255, 255);
for (int x = 0; x < maze.getWidth(); ++x) {
    for (int y = 0; y < maze.getHeight(); ++y) {
        if (maze.isWall(x, y)) {
            SDL_Rect rect = { x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE };
            SDL_RenderFillRect(renderer, &rect);
        }
    }
}
```

**Analysis:** The algorithm is identical across all five: nested loop, check `isWall`, draw a filled rectangle. The differences are purely syntactic:
- Java uses `Color.BLUE` objects and `Graphics2D` methods.
- Python uses RGB tuples and `pygame.draw.rect()`.
- JS/TS use CSS hex color strings and `ctx.fillRect()`.
- C++ requires creating an `SDL_Rect` struct and passing it by pointer.

---

## 3. Drawing Pacman

Pacman is drawn as a yellow shape at its grid position.

**Java (Swing):**
```java
// java/src/main/java/com/packman/GamePanel.java
g2d.setColor(Color.YELLOW);
g2d.fillOval(pacman.getGridX() * TILE_SIZE, pacman.getGridY() * TILE_SIZE,
        pacman.getSize(), pacman.getSize());
```

**Python (Pygame):**
```python
# python/game_panel.py
pac_center_x = pacman.grid_x * TILE_SIZE + TILE_SIZE // 2
pac_center_y = pacman.grid_y * TILE_SIZE + TILE_SIZE // 2
pygame.draw.circle(screen, YELLOW, (pac_center_x, pac_center_y), TILE_SIZE // 2)
```

**JavaScript (Canvas):**
```javascript
// javascript/game.js
ctx.fillStyle = '#FFFF00';
ctx.beginPath();
ctx.arc(
    pacman.gridX * TILE_SIZE + TILE_SIZE / 2,
    pacman.gridY * TILE_SIZE + TILE_SIZE / 2,
    8, 0, 2 * Math.PI
);
ctx.fill();
```

**TypeScript (Canvas):**
```typescript
// typescript/src/game.ts
function drawPacman(pacman: Pacman): void {
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(
        pacman.gridX * TILE_SIZE + TILE_SIZE / 2,
        pacman.gridY * TILE_SIZE + TILE_SIZE / 2,
        8, 0, 2 * Math.PI
    );
    ctx.fill();
}
```

**C++ (SDL2):**
```cpp
// cpp/game_panel.cpp
SDL_SetRenderDrawColor(renderer, 255, 255, 0, 255);
const int pacSize = 16;
const int offset = (TILE_SIZE - pacSize) / 2;
SDL_Rect rect = {
    pac.getGridX() * TILE_SIZE + offset,
    pac.getGridY() * TILE_SIZE + offset,
    pacSize, pacSize
};
SDL_RenderFillRect(renderer, &rect);
```

**Analysis:** Java and Pygame both have built-in circle/oval drawing primitives. Canvas (JS/TS) requires the `beginPath() -> arc() -> fill()` sequence. SDL2 has no built-in circle primitive, so C++ approximates Pacman with a smaller filled rectangle (16x16 inside a 20x20 tile). This is a notable limitation: SDL2's base API only draws rectangles. Drawing circles would require the SDL_gfx extension library or a manual midpoint circle algorithm.

---

## 4. Drawing Ghosts

Ghosts are drawn as colored rectangles with white "eyes."

**Java (Swing):**
```java
// java/src/main/java/com/packman/GamePanel.java
for (Ghost ghost : ghosts) {
    g2d.setColor(new Color(ghost.getColorR(), ghost.getColorG(), ghost.getColorB()));
    g2d.fillRect(ghost.getGridX() * TILE_SIZE, ghost.getGridY() * TILE_SIZE,
            ghost.getSize(), ghost.getSize());
    g2d.setColor(Color.WHITE);
    g2d.fillOval(ghost.getGridX() * TILE_SIZE + 5, ghost.getGridY() * TILE_SIZE + 5, 4, 4);
    g2d.fillOval(ghost.getGridX() * TILE_SIZE + 11, ghost.getGridY() * TILE_SIZE + 5, 4, 4);
}
```

**Python (Pygame):**
```python
# python/game_panel.py
for ghost in ghosts:
    color = (ghost.color_r, ghost.color_g, ghost.color_b)
    gx = ghost.grid_x * TILE_SIZE
    gy = ghost.grid_y * TILE_SIZE
    pygame.draw.rect(screen, color, (gx, gy, ghost.size, ghost.size))
    pygame.draw.circle(screen, WHITE, (gx + 7, gy + 7), 2)
    pygame.draw.circle(screen, WHITE, (gx + 13, gy + 7), 2)
```

**JavaScript (Canvas):**
```javascript
// javascript/game.js
ctx.fillStyle = ghost.color;
ctx.fillRect(gx + 1, gy + 1, 18, 18);
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.arc(gx + 7, gy + 7, 2, 0, 2 * Math.PI);
ctx.fill();
ctx.beginPath();
ctx.arc(gx + 13, gy + 7, 2, 0, 2 * Math.PI);
ctx.fill();
```

**C++ (SDL2):**
```cpp
// cpp/game_panel.cpp
SDL_SetRenderDrawColor(renderer, r, g, b, 255);
SDL_Rect body = { ghost.getGridX() * TILE_SIZE + bodyOffset,
                  ghost.getGridY() * TILE_SIZE + bodyOffset,
                  ghostSize, ghostSize };
SDL_RenderFillRect(renderer, &body);

// Eyes: two white 4x4 rectangles
SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
SDL_Rect leftEye = { body.x + 3, body.y + 3, eyeSize, eyeSize };
SDL_RenderFillRect(renderer, &leftEye);
SDL_Rect rightEye = { body.x + ghostSize - 3 - eyeSize, body.y + 3, eyeSize, eyeSize };
SDL_RenderFillRect(renderer, &rightEye);
```

**Analysis:** All implementations draw a colored body and white eyes. Java, Python, and JS/TS use circles for eyes, while C++ uses small rectangles (again, SDL2 lacks a built-in circle primitive). The C++ version also adds pupils (dark-blue 2x2 rectangles inside the eyes), adding an extra level of detail that the other implementations skip.

---

## 5. Color Representation

| Language | Color Format | Example |
|---|---|---|
| Java | `java.awt.Color` objects | `new Color(255, 0, 0)` |
| Python | RGB tuples | `(255, 0, 0)` |
| JavaScript | CSS hex strings | `'#FF0000'` |
| TypeScript | CSS hex strings | `'#FF0000'` |
| C++ | Separate R, G, B `Uint8` values | `SDL_SetRenderDrawColor(r, 0, 0, 0, 255)` |

C++ notably requires a `parseHexColor()` utility function to convert the `"#RRGGBB"` strings stored in the Ghost class into the separate R/G/B bytes that SDL2 expects:

```cpp
// cpp/game_panel.cpp
void GamePanel::parseHexColor(const std::string& hex, Uint8& r, Uint8& g, Uint8& b) {
    if (hex.size() == 7 && hex[0] == '#') {
        unsigned int rgb = 0;
        std::istringstream iss(hex.substr(1));
        iss >> std::hex >> rgb;
        r = static_cast<Uint8>((rgb >> 16) & 0xFF);
        g = static_cast<Uint8>((rgb >> 8) & 0xFF);
        b = static_cast<Uint8>(rgb & 0xFF);
    }
}
```

---

## 6. Frame Presentation (Double Buffering)

| Language | Presentation Call | Mechanism |
|---|---|---|
| Java | `repaint()` triggers `paintComponent()` | Swing automatic double-buffering |
| Python | `pygame.display.flip()` | Explicit buffer swap |
| JavaScript | Implicit (after JS returns to event loop) | Canvas auto-presents |
| TypeScript | Implicit (same as JS) | Canvas auto-presents |
| C++ | `SDL_RenderPresent(renderer)` | Explicit buffer swap |

---

## Key Takeaways

1. **Immediate-mode rendering is universal.** All five implementations clear the screen and redraw everything each frame. The rendering APIs differ in syntax, but the pattern (set color, draw shape, repeat) is remarkably consistent.

2. **Primitive availability varies.** Java and Pygame have built-in circle drawing. Canvas requires a path-based workflow (beginPath/arc/fill). SDL2 only provides rectangles natively, forcing C++ to use rectangles for everything or bring in additional libraries.

3. **Separation of data and rendering is consistent.** In all five languages, the entity classes (Pacman, Ghost, Maze) contain zero rendering code. The renderer reads entity state through getters/properties and draws them. This model-view separation is a fundamental architectural principle that transcends language choice.

---

## Discussion Questions

1. The C++ implementation draws Pacman as a rectangle rather than a circle because SDL2 lacks a circle primitive. What are the trade-offs of adding the SDL_gfx library versus keeping the dependency footprint minimal?

2. All five implementations redraw the entire maze (1,200 tiles) every frame. What optimization could be applied to avoid re-rendering static walls, and which languages/frameworks make this easiest to implement?

3. JavaScript and TypeScript use CSS hex color strings (`'#FF0000'`) while Java uses `Color` objects and Python uses tuples. Which representation is most ergonomic for a game that needs to support themes with swappable color palettes?
