# Keyboard Input Handling -- Cross-Language Comparison

## Introduction

Input handling in games involves two challenges: (1) capturing raw keyboard events from the operating system, and (2) translating them into game-meaningful actions. All five Packman implementations use the same logical pattern -- arrow keys set a **buffered direction** that Pacman applies on the next update tick -- but the mechanism for capturing keyboard events differs significantly across frameworks.

This document compares the input model (push vs. pull), the event API, and the direction-buffering pattern across all five languages.

---

## 1. Java -- KeyListener (Observer Pattern)

Java Swing uses the **observer pattern**: the panel registers itself as a `KeyListener`, and Swing calls `keyPressed()` asynchronously on the Event Dispatch Thread.

```java
// java/src/main/java/com/packman/GamePanel.java
public class GamePanel extends JPanel implements KeyListener {

    public GamePanel() {
        setFocusable(true);    // CRITICAL: panel must have focus to receive key events
        addKeyListener(this);  // Register self as keyboard observer
        // ...
    }

    @Override
    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_LEFT) {
            pacman.setDirection(-1, 0);
        } else if (e.getKeyCode() == KeyEvent.VK_RIGHT) {
            pacman.setDirection(1, 0);
        } else if (e.getKeyCode() == KeyEvent.VK_UP) {
            pacman.setDirection(0, -1);
        } else if (e.getKeyCode() == KeyEvent.VK_DOWN) {
            pacman.setDirection(0, 1);
        }
    }

    @Override
    public void keyReleased(KeyEvent e) {}

    @Override
    public void keyTyped(KeyEvent e) {}
}
```

**Key characteristics:**
- Requires implementing three methods (`keyPressed`, `keyReleased`, `keyTyped`), even if only one is needed.
- `setFocusable(true)` is mandatory -- without it, the panel never receives key events.
- Uses integer key codes (`VK_LEFT`, `VK_RIGHT`, etc.).
- Events fire asynchronously; the listener is called by the framework.

---

## 2. Python -- `pygame.event.get()` (Polling)

Python uses explicit **polling**: every frame, the game loop drains the event queue and processes each event.

```python
# python/game_panel.py
def handle_input(self, pacman: Pacman) -> None:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            self._running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                pacman.set_direction(-1, 0)
            elif event.key == pygame.K_RIGHT:
                pacman.set_direction(1, 0)
            elif event.key == pygame.K_UP:
                pacman.set_direction(0, -1)
            elif event.key == pygame.K_DOWN:
                pacman.set_direction(0, 1)
            elif event.key == pygame.K_ESCAPE:
                self._running = False
```

**Key characteristics:**
- The game loop explicitly calls `pygame.event.get()` each frame.
- All events (keyboard, mouse, window close) come through the same queue.
- No interface to implement, no registration boilerplate.
- The `QUIT` event (window close) and `KEYDOWN` events are handled in the same loop.

---

## 3. JavaScript -- `addEventListener` (Push Model)

JavaScript uses DOM event listeners that fire **asynchronously** between animation frames.

```javascript
// javascript/game.js
document.addEventListener('keydown', function (e) {
    switch (e.key) {
        case 'ArrowLeft':
            gameLogic.pacman.setDirection(-1, 0);
            e.preventDefault();
            break;
        case 'ArrowRight':
            gameLogic.pacman.setDirection(1, 0);
            e.preventDefault();
            break;
        case 'ArrowUp':
            gameLogic.pacman.setDirection(0, -1);
            e.preventDefault();
            break;
        case 'ArrowDown':
            gameLogic.pacman.setDirection(0, 1);
            e.preventDefault();
            break;
    }
});
```

**Key characteristics:**
- Registered once at startup; the browser calls the handler asynchronously.
- Uses string-based key names (`'ArrowLeft'`, `'ArrowUp'`, etc.) -- more readable than integer codes.
- `e.preventDefault()` is critical: without it, arrow keys would scroll the page.
- The event handler is a closure with access to `gameLogic` via lexical scope.

---

## 4. TypeScript -- Typed `KeyboardEvent` Handler

TypeScript uses the identical DOM API with explicit type annotations on the event parameter.

```typescript
// typescript/src/game.ts
document.addEventListener('keydown', (e: KeyboardEvent): void => {
    switch (e.key) {
        case 'ArrowLeft':
            gameLogic.pacman.setDirection(-1, 0);
            e.preventDefault();
            break;
        case 'ArrowRight':
            gameLogic.pacman.setDirection(1, 0);
            e.preventDefault();
            break;
        case 'ArrowUp':
            gameLogic.pacman.setDirection(0, -1);
            e.preventDefault();
            break;
        case 'ArrowDown':
            gameLogic.pacman.setDirection(0, 1);
            e.preventDefault();
            break;
    }
});
```

**Key characteristics:**
- Structurally identical to JavaScript.
- The `(e: KeyboardEvent)` annotation ensures `e.key` is type-safe. Accessing `e.button` (a `MouseEvent` property) would be a compile error.
- The arrow function syntax `(e: KeyboardEvent): void =>` is slightly more concise than JS's `function (e)`.

---

## 5. C++ -- `SDL_PollEvent` (Polling with Unions)

C++ uses SDL2's C-style event polling with a union-based event structure.

```cpp
// cpp/game_panel.cpp
void GamePanel::handleInput(const SDL_Event& event) {
    if (event.type == SDL_QUIT) {
        running = false;
        return;
    }

    if (event.type == SDL_KEYDOWN) {
        switch (event.key.keysym.scancode) {
            case SDL_SCANCODE_UP:
                gameLogic.getPacman().setDirection(0, -1);
                break;
            case SDL_SCANCODE_DOWN:
                gameLogic.getPacman().setDirection(0, 1);
                break;
            case SDL_SCANCODE_LEFT:
                gameLogic.getPacman().setDirection(-1, 0);
                break;
            case SDL_SCANCODE_RIGHT:
                gameLogic.getPacman().setDirection(1, 0);
                break;
            case SDL_SCANCODE_ESCAPE:
                running = false;
                break;
            default:
                break;
        }
    }
}
```

The polling happens in `main.cpp`:

```cpp
// cpp/main.cpp
SDL_Event event;
while (SDL_PollEvent(&event)) {
    gamePanel.handleInput(event);
}
```

**Key characteristics:**
- `SDL_PollEvent` drains the OS event queue without blocking (returns 0 when empty).
- Uses **scancodes** (`SDL_SCANCODE_UP`) rather than key codes -- these refer to physical key positions, so controls work correctly on any keyboard layout.
- The inner `while` loop processes ALL queued events before the next frame, preventing input lag.
- `SDL_Event` is a C union: the `type` field determines which member is valid.

---

## Direction Buffering Pattern

All five implementations use the same direction-buffering strategy. Input sets a "next" direction; the actual direction change happens during `update()` only if the target tile is not a wall.

**Java:**
```java
// java/src/main/java/com/packman/Pacman.java
public void setDirection(int x, int y) {
    nextDirX = x;
    nextDirY = y;
}
```

**Python:**
```python
# python/pacman.py
def set_direction(self, dx: int, dy: int) -> None:
    self._next_dir_x = dx
    self._next_dir_y = dy
```

**JavaScript:**
```javascript
// javascript/pacman.js
setDirection(dx, dy) {
    this._nextDirX = dx;
    this._nextDirY = dy;
}
```

**TypeScript:**
```typescript
// typescript/src/pacman.ts
public setDirection(dx: number, dy: number): void {
    this._nextDirX = dx;
    this._nextDirY = dy;
}
```

**C++:**
```cpp
// cpp/pacman.cpp
void Pacman::setDirection(int dx, int dy) {
    nextDirX = dx;
    nextDirY = dy;
}
```

The buffered direction is consumed in `update()`, which tries the buffered direction first, then falls back to the current direction:

```python
# python/pacman.py (representative of all 5 implementations)
def update(self, maze: Maze) -> None:
    new_x = self._grid_x + self._next_dir_x
    new_y = self._grid_y + self._next_dir_y
    if not maze.is_wall(new_x, new_y):
        self._dir_x = self._next_dir_x
        self._dir_y = self._next_dir_y
        self._grid_x = new_x
        self._grid_y = new_y
    else:
        new_x = self._grid_x + self._dir_x
        new_y = self._grid_y + self._dir_y
        if not maze.is_wall(new_x, new_y):
            self._grid_x = new_x
            self._grid_y = new_y
```

---

## Comparison Summary

| Aspect | Java | Python | JavaScript | TypeScript | C++ |
|---|---|---|---|---|---|
| **Input model** | Push (observer) | Pull (polling) | Push (event listener) | Push (event listener) | Pull (polling) |
| **Key identifier** | Integer codes (`VK_LEFT`) | Integer codes (`K_LEFT`) | String names (`'ArrowLeft'`) | String names (`'ArrowLeft'`) | Scancodes (`SDL_SCANCODE_LEFT`) |
| **Registration** | `addKeyListener(this)` | N/A (poll each frame) | `document.addEventListener` | `document.addEventListener` | N/A (poll each frame) |
| **Threading** | EDT (async from game thread) | Same thread | Same thread (event loop) | Same thread (event loop) | Same thread |
| **Scroll prevention** | N/A (desktop app) | N/A (desktop app) | `e.preventDefault()` | `e.preventDefault()` | N/A (desktop app) |
| **Boilerplate** | 3 interface methods | Minimal | Minimal | Minimal | Minimal |

---

## Key Takeaways

1. **Push vs. Pull is a framework choice, not a language limitation.** Java and JS/TS use event callbacks (push), while Python and C++ poll the event queue each frame (pull). Both approaches work; the polling model gives the game loop explicit control over when input is processed.

2. **Direction buffering is universally necessary.** All five implementations store the *desired* direction separately from the *active* direction. This decouples the timing of user input from the timing of the game simulation, making controls feel responsive.

3. **Scancodes vs. key codes matter for accessibility.** C++ (SDL2) uses physical scancodes, which means controls work correctly regardless of keyboard layout (QWERTY, AZERTY, Dvorak). Java and Python use logical key codes, and JS/TS use string key names. For games with remappable controls, scancodes are the better foundation.

---

## Discussion Questions

1. Java requires `setFocusable(true)` before key events work. What analogous "gotcha" exists in each of the other four languages, and how do they manifest as bugs during development?

2. JavaScript and TypeScript handle input asynchronously between frames. In what scenario could this cause a race condition with the game loop, and why does direction buffering prevent it?

3. If you wanted to support simultaneous key presses (e.g., diagonal movement), how would the input handling code need to change in each language? Which framework makes this easiest?
