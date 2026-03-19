---
title: "Game Loop Patterns"
description: "How each language implements the poll-update-render-wait cycle that drives the game at 60 FPS."
order: 1
---

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
const FRAME_INTERVAL = 1000 / TARGET_FPS;
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
    // ... render
    requestAnimationFrame(gameLoop);
}
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
function gameLoop(timestamp: number): void {
    if (!running) return;
    const elapsed: number = timestamp - lastFrameTime;
    if (elapsed < FRAME_INTERVAL) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);
    gameLogic.update();
    // ... render
    requestAnimationFrame(gameLoop);
}
```

---

## 5. C++ -- `SDL_Delay` Frame Cap

C++ uses an explicit `while` loop in `main()` with `SDL_GetTicks()` for timing and `SDL_Delay()` to cap the frame rate.

```cpp
static const int TARGET_FPS = 60;
static const int FRAME_DELAY = 1000 / TARGET_FPS;

while (gamePanel.isRunning()) {
    Uint32 frameStart = SDL_GetTicks();
    // poll events, update, render...
    Uint32 frameTime = SDL_GetTicks() - frameStart;
    if (frameTime < static_cast<Uint32>(FRAME_DELAY)) {
        SDL_Delay(static_cast<Uint32>(FRAME_DELAY) - frameTime);
    }
}
```

---

## Analysis

| Aspect | Java | Python | JavaScript | TypeScript | C++ |
|---|---|---|---|---|---|
| **Loop mechanism** | Thread + delta accumulator | `while` + `clock.tick()` | `requestAnimationFrame` | `requestAnimationFrame` | `while` + `SDL_Delay` |
| **Timing precision** | Nanoseconds | Milliseconds (internal) | Sub-millisecond | Sub-millisecond | Milliseconds |
| **Threading model** | Separate game thread | Single thread | Single thread (event loop) | Single thread (event loop) | Single thread |
| **Who drives the loop** | Developer | Developer | Browser | Browser | Developer |

## Key Takeaways

1. **The pattern is universal.** Every implementation follows poll-update-render-wait, regardless of language.
2. **Frameworks trade control for simplicity.** Pygame's `clock.tick()` and the browser's `requestAnimationFrame` hide timing details.
3. **Fixed timestep matters.** All five implementations target 60 FPS with some form of frame-rate limiting.
