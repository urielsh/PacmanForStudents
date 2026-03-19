# Game Loop Patterns -- Cross-Language Comparison

## Introduction

The game loop is the heartbeat of every game. It controls when input is read, when game state updates, when frames are rendered, and how fast all of this happens. Each language and framework provides different primitives for timing and scheduling, yet the fundamental pattern -- **poll, update, render, wait** -- remains the same.

This document compares the game loop implementation across all five Packman implementations: Java (Swing), Python (Pygame), JavaScript (Canvas), TypeScript (Canvas), and C++ (SDL2).

---

## 1. Java -- `System.nanoTime()` Delta Accumulator

Java uses a dedicated `Thread` with a nano-second precision delta accumulator to achieve a fixed 60 FPS timestep.

```java
// java/src/main/java/com/packman/GamePanel.java
private void gameLoop() {
    Thread gameThread = new Thread(() -> {
        long lastTime = System.nanoTime();
        double amountOfUpdates = 60.0;
        double ns = 1000000000 / amountOfUpdates;
        double delta = 0;

        while (running) {
            long now = System.nanoTime();
            delta += (now - lastTime) / ns;
            lastTime = now;

            if (delta >= 1) {
                update();
                repaint();
                delta--;
            }
        }
    });
    gameThread.start();
}
```

**Key characteristics:**
- Runs on a separate thread (not the EDT).
- Uses nanosecond precision for timing.
- Accumulates fractional frames in a `delta` variable to handle imprecise sleep.
- `repaint()` schedules a call to `paintComponent()` on the EDT.

---

## 2. Python -- `pygame.time.Clock.tick()`

Python's game loop is the most explicit and readable: a `while` loop with `clock.tick(FPS)` at the end.

```python
# python/main.py
while panel.running:
    panel.handle_input(pacman)
    panel.update(pacman, ghosts, game_logic)
    panel.draw(panel.screen, pacman, ghosts, game_logic)
    panel.clock.tick(FPS)
```

The clock is initialized during panel construction:

```python
# python/game_panel.py
self._clock: pygame.time.Clock = pygame.time.Clock()
```

**Key characteristics:**
- Single-threaded, blocking loop.
- `clock.tick(60)` sleeps for the remainder of the frame to maintain 60 FPS.
- The entire poll-update-render-wait cycle is visible in four lines.
- No manual time math -- Pygame handles the delay calculation internally.

---

## 3. JavaScript -- `requestAnimationFrame` with Throttle

JavaScript delegates loop scheduling to the browser via `requestAnimationFrame`, then manually throttles to 60 FPS.

```javascript
// javascript/game.js
const TARGET_FPS    = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~16.67 ms
let lastFrameTime = 0;

function gameLoop(timestamp) {
    if (!running) return;

    var elapsed = timestamp - lastFrameTime;
    if (elapsed < FRAME_INTERVAL) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

    gameLogic.update();

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawMaze(gameLogic.maze);
    drawPacman(gameLogic.pacman);
    drawGhosts(gameLogic.ghosts);
    drawHUD(gameLogic.score);

    if (gameLogic.gameOver) {
        drawGameOver();
        running = false;
        return;
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**Key characteristics:**
- Non-blocking, callback-based.
- The browser calls `gameLoop` before each repaint (~60 Hz, vsync-aligned).
- Manual throttle prevents running faster than 60 FPS on high-refresh monitors.
- Automatically pauses when the tab is hidden (saves CPU/battery).

---

## 4. TypeScript -- Typed `requestAnimationFrame`

TypeScript uses the identical `requestAnimationFrame` pattern with added type annotations.

```typescript
// typescript/src/game.ts
function gameLoop(timestamp: number): void {
    if (!running) return;

    const elapsed: number = timestamp - lastFrameTime;
    if (elapsed < FRAME_INTERVAL) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

    gameLogic.update();

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawMaze(gameLogic.maze);
    drawPacman(gameLogic.pacman);
    drawGhosts(gameLogic.ghosts);
    drawHUD(gameLogic.score);

    if (gameLogic.gameOver) {
        drawGameOver();
        running = false;
        return;
    }
    requestAnimationFrame(gameLoop);
}
```

**Key characteristics:**
- Structurally identical to JavaScript.
- `timestamp: number` prevents accidentally comparing it to a `Date` object.
- The compiler catches misspellings like `requestAnimationFarme` at build time.

---

## 5. C++ -- `SDL_Delay` Frame Cap

C++ uses an explicit `while` loop in `main()` with `SDL_GetTicks()` for timing and `SDL_Delay()` to cap the frame rate.

```cpp
// cpp/main.cpp
static const int TARGET_FPS = 60;
static const int FRAME_DELAY = 1000 / TARGET_FPS; // ~16 ms

while (gamePanel.isRunning()) {
    Uint32 frameStart = SDL_GetTicks();

    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        gamePanel.handleInput(event);
    }

    if (!gameLogic.isGameOver()) {
        gameLogic.update();
    }

    gamePanel.render();
    gamePanel.updateTitle(window);

    Uint32 frameTime = SDL_GetTicks() - frameStart;
    if (frameTime < static_cast<Uint32>(FRAME_DELAY)) {
        SDL_Delay(static_cast<Uint32>(FRAME_DELAY) - frameTime);
    }
}
```

**Key characteristics:**
- Full control over the loop -- you own the `while` statement.
- `SDL_GetTicks()` provides millisecond precision (less precise than Java's nanos).
- `SDL_Delay()` sleeps for the remaining frame budget.
- VSync is also enabled via `SDL_RENDERER_PRESENTVSYNC` as a backup.

---

## Analysis

| Aspect | Java | Python | JavaScript | TypeScript | C++ |
|---|---|---|---|---|---|
| **Loop mechanism** | Thread + delta accumulator | `while` + `clock.tick()` | `requestAnimationFrame` | `requestAnimationFrame` | `while` + `SDL_Delay` |
| **Timing precision** | Nanoseconds | Milliseconds (internal) | Sub-millisecond (DOMHighResTimeStamp) | Sub-millisecond | Milliseconds |
| **Threading model** | Separate game thread | Single thread | Single thread (event loop) | Single thread (event loop) | Single thread |
| **Who drives the loop** | Developer | Developer | Browser | Browser | Developer |
| **Tab-hidden behavior** | Keeps running | Keeps running | Auto-pauses | Auto-pauses | Keeps running |
| **Complexity** | High (manual delta math) | Low (one-liner tick) | Medium (throttle logic) | Medium (throttle logic) | Medium (manual delay math) |

**Pygame** provides the simplest timing model: a single `clock.tick(60)` call hides all the complexity. **Java** requires the most manual work with its nanosecond delta accumulator. **JavaScript/TypeScript** sit in the middle -- `requestAnimationFrame` is elegant but requires a manual throttle for consistent 60 FPS on high-refresh displays. **C++** is similar to Python in explicitness but gives finer control over the timing budget.

---

## Key Takeaways

1. **The pattern is universal.** Every implementation follows poll-update-render-wait, regardless of language. Understanding this pattern in one language transfers directly to all others.

2. **Frameworks trade control for simplicity.** Pygame's `clock.tick()` and the browser's `requestAnimationFrame` hide timing details. Java and C++ force you to implement the timing yourself, which is educational but more error-prone.

3. **Fixed timestep matters.** All five implementations target 60 FPS with some form of frame-rate limiting. Without it, the game would run at wildly different speeds on different hardware.

---

## Discussion Questions

1. What would happen in the Java implementation if `delta` were not decremented after each update? How would the game behave on a slow machine versus a fast one?

2. JavaScript's `requestAnimationFrame` automatically pauses when a browser tab is hidden. What are the gameplay implications of this behavior for a multiplayer game, and how would you work around it?

3. The C++ implementation uses `SDL_Delay()` which has approximately 1ms granularity. How might this imprecision manifest as visible stutter, and what alternative timing strategy could provide smoother results?
