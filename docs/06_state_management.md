# Game State Management -- Cross-Language Comparison

## Introduction

Game state encompasses everything that defines the current snapshot of a game: entity positions, the score, whether the game is over, the maze layout, and which pellets have been eaten. How this state is organized, accessed, and protected varies significantly across programming paradigms.

This document compares how each of the five Packman implementations manages game state, focusing on data ownership, encapsulation, access patterns, and the separation between logic and rendering.

---

## 1. State Ownership Architecture

All five implementations follow the same layered ownership model:

```
GameLogic (or main)
  |-- Maze (walls, pellets)
  |-- Pacman (position, direction)
  |-- Ghost[] (position, color, move counter)
  |-- score: int
  |-- gameOver: bool
```

However, **who creates and owns the entities** differs.

**Java -- GamePanel creates, GameLogic does not own entities:**
```java
// java/src/main/java/com/packman/GamePanel.java
public class GamePanel extends JPanel implements KeyListener {
    private Pacman pacman;
    private Ghost[] ghosts;
    private GameLogic gameLogic;

    public GamePanel() {
        gameLogic = new GameLogic();           // Owns maze + score + gameOver
        pacman = new Pacman(5, 5, TILE_SIZE);  // Panel owns Pacman
        initializeGhosts();                     // Panel owns Ghosts
    }
}
```

**Python -- main() creates everything, passes to panel:**
```python
# python/main.py
panel = GamePanel()
game_logic = GameLogic()
pacman = Pacman(5, 5, TILE_SIZE)
ghosts: list[Ghost] = [
    Ghost(10, 10, TILE_SIZE, 255, 0, 0),
    Ghost(10, 11, TILE_SIZE, 255, 184, 255),
    Ghost(11, 10, TILE_SIZE, 0, 255, 255),
    Ghost(11, 11, TILE_SIZE, 255, 0, 255),
]
```

**JavaScript/TypeScript -- GameLogic owns everything:**
```javascript
// javascript/game_logic.js
class GameLogic {
    constructor() {
        this._maze = new Maze();
        this._pacman = new Pacman();
        this._ghosts = [
            new Ghost(10, 10, 'Blinky', '#FF0000'),
            new Ghost(10, 11, 'Pinky', '#FFB8FF'),
            new Ghost(11, 10, 'Inky', '#00FFFF'),
            new Ghost(11, 11, 'Clyde', '#FF00FF'),
        ];
        this._score = 0;
        this._gameOver = false;
    }
}
```

**C++ -- GameLogic owns everything (value semantics):**
```cpp
// cpp/game_logic.cpp
GameLogic::GameLogic()
    : score(0), gameOver(false)
{
    ghosts.emplace_back(10, 10, "Blinky", "#FF0000");
    ghosts.emplace_back(10, 11, "Pinky",  "#FFB8FF");
    ghosts.emplace_back(11, 10, "Inky",   "#00FFFF");
    ghosts.emplace_back(11, 11, "Clyde",  "#FF00FF");
}
```

**Analysis:** JavaScript, TypeScript, and C++ use the cleanest model: `GameLogic` owns all game state. Java splits ownership between `GamePanel` (entities) and `GameLogic` (maze + score). Python pushes ownership to the module level (`main()`), which is the most flexible but least encapsulated.

---

## 2. Encapsulation and Access Patterns

### Java -- Private Fields with Getters

```java
// java/src/main/java/com/packman/Pacman.java
public class Pacman {
    private int gridX;
    private int gridY;
    private int size;
    // ...
    public int getGridX() { return gridX; }
    public int getGridY() { return gridY; }
    public int getSize() { return size; }
}
```

### Python -- Private Convention with @property

```python
# python/pacman.py
class Pacman:
    def __init__(self, x: int, y: int, size: int):
        self._grid_x: int = x
        self._grid_y: int = y
        self._size: int = size

    @property
    def grid_x(self) -> int:
        return self._grid_x

    @property
    def grid_y(self) -> int:
        return self._grid_y
```

### JavaScript -- Underscore Convention with get Accessor

```javascript
// javascript/pacman.js
class Pacman {
    constructor() {
        this._gridX = PACMAN_START_X;
        this._gridY = PACMAN_START_Y;
    }
    get gridX() { return this._gridX; }
    get gridY() { return this._gridY; }
}
```

### TypeScript -- private Keyword with get Accessor

```typescript
// typescript/src/pacman.ts
export class Pacman {
    private _gridX: number;
    private _gridY: number;

    public get gridX(): number { return this._gridX; }
    public get gridY(): number { return this._gridY; }
}
```

### C++ -- Private Fields with const Getters

```cpp
// cpp/pacman.h / pacman.cpp
class Pacman {
private:
    int gridX;
    int gridY;
public:
    int getGridX() const;
    int getGridY() const;
};
```

**Encapsulation comparison:**

| Language | Enforcement | Access Syntax | Can be Bypassed? |
|---|---|---|---|
| Java | Compile-time + runtime | `pacman.getGridX()` | Yes (reflection) |
| Python | Convention only (`_` prefix) | `pacman.grid_x` (property) | Yes (direct `_grid_x` access) |
| JavaScript | Convention only (`_` prefix) | `pacman.gridX` (getter) | Yes (direct `_gridX` access) |
| TypeScript | Compile-time only | `pacman.gridX` (getter) | Yes (erased at runtime) |
| C++ | Compile-time + link-time | `pacman.getGridX()` | No (without undefined behavior) |

C++ provides the strongest encapsulation: `private` fields are genuinely inaccessible without invoking undefined behavior. Java is close behind with runtime enforcement. TypeScript provides compile-time safety but no runtime protection. Python and JavaScript rely entirely on developer discipline.

---

## 3. Game State: Score and Game Over

**Java:**
```java
// java/src/main/java/com/packman/GameLogic.java
public class GameLogic {
    private int score = 0;
    private boolean gameOver = false;

    public int getScore() { return score; }
    public boolean isGameOver() { return gameOver; }
}
```

**Python:**
```python
# python/game_logic.py
class GameLogic:
    def __init__(self):
        self._score: int = 0
        self._game_over: bool = False

    @property
    def score(self) -> int:
        return self._score

    @property
    def game_over(self) -> bool:
        return self._game_over
```

**TypeScript:**
```typescript
// typescript/src/game_logic.ts
export class GameLogic {
    private _score: number;
    private _gameOver: boolean;

    public get score(): number { return this._score; }
    public get gameOver(): boolean { return this._gameOver; }
}
```

**C++:**
```cpp
// cpp/game_logic.cpp
int GameLogic::getScore() const { return score; }
bool GameLogic::isGameOver() const { return gameOver; }
```

**Analysis:** All five expose score and game-over state as read-only to external code. Only the collision detection method (internal to `GameLogic`) can modify these values. The naming conventions differ: Java uses `isGameOver()` (JavaBeans convention for booleans), Python uses `game_over` (snake_case property), JS/TS uses `gameOver` (camelCase getter), and C++ uses `isGameOver()` (similar to Java).

---

## 4. Collection Types for Ghosts

| Language | Type | Mutability |
|---|---|---|
| Java | `Ghost[]` (fixed-size array) | Elements mutable, size fixed |
| Python | `list[Ghost]` (dynamic list) | Fully mutable |
| JavaScript | `Array` (dynamic) | Fully mutable |
| TypeScript | `readonly Ghost[]` | Elements readable, no push/pop/splice |
| C++ | `std::vector<Ghost>` | Fully mutable, value semantics |

TypeScript stands out with `readonly Ghost[]`, which prevents the renderer from accidentally adding or removing ghosts at compile time:

```typescript
// typescript/src/game_logic.ts
private readonly _ghosts: readonly Ghost[];

public get ghosts(): readonly Ghost[] {
    return this._ghosts;
}
```

C++ provides a different kind of protection through `const` references:

```cpp
// cpp/game_logic.cpp
const std::vector<Ghost>& GameLogic::getGhosts() const {
    return ghosts;
}
```

The `const` return prevents mutation through the returned reference. Attempting `gameLogic.getGhosts().push_back(...)` on a const reference is a compile error.

---

## 5. Update Orchestration

All five implementations use a single `update()` method that orchestrates the frame sequence: Pacman moves, then ghosts move, then collisions are checked.

**Java:**
```java
// java/src/main/java/com/packman/GamePanel.java
private void update() {
    if (gameLogic.isGameOver()) return;
    pacman.update(gameLogic.getMaze());
    for (Ghost ghost : ghosts) {
        ghost.update(gameLogic.getMaze());
    }
    gameLogic.checkCollisions(pacman, ghosts);
}
```

**Python:**
```python
# python/game_panel.py
def update(self, pacman, ghosts, game_logic):
    if game_logic.game_over:
        return
    pacman.update(game_logic.maze)
    for ghost in ghosts:
        ghost.update(game_logic.maze)
    game_logic.check_collisions(pacman, ghosts)
```

**TypeScript:**
```typescript
// typescript/src/game_logic.ts
public update(): void {
    if (this._gameOver) return;
    this._pacman.update(this._maze);
    for (const ghost of this._ghosts) {
        ghost.update(this._maze);
    }
    this.checkCollisions();
}
```

**C++:**
```cpp
// cpp/game_logic.cpp
void GameLogic::update() {
    if (gameOver) return;
    pacman.update(maze);
    for (auto& ghost : ghosts) {
        ghost.update(maze);
    }
    checkCollisions();
}
```

**Analysis:** The update order is deterministic and identical across all five: Pacman first, then all ghosts, then collision check. This ordering matters -- if collisions were checked between ghost moves, a ghost that moved into Pacman's old position could trigger a false positive.

C++ requires `auto&` (reference) in the range-for loop to avoid copying each Ghost. In Java, Python, and JS/TS, loop variables are always references to the original objects. This is a common C++ pitfall: writing `for (auto ghost : ghosts)` would copy each ghost, and the `update()` call would modify the copy rather than the original.

---

## 6. Logic-Rendering Separation

A consistent architectural principle across all five implementations: **entity classes have zero rendering imports.** The rendering layer reads state through getters/properties and handles all drawing.

| Language | Entity classes import rendering? | How renderer accesses state |
|---|---|---|
| Java | No `java.awt` imports in Pacman/Ghost/Maze | `getGridX()`, `getGridY()`, etc. |
| Python | No `pygame` imports in Pacman/Ghost/Maze | `@property` accessors |
| JavaScript | No Canvas/DOM references in entity files | `get gridX()` accessors |
| TypeScript | No Canvas/DOM imports in entity modules | `get gridX()` accessors |
| C++ | No SDL2 includes in entity headers | `getGridX() const` methods |

This separation means you could theoretically replace the rendering layer (e.g., swap Swing for JavaFX, or Canvas for WebGL) without modifying any game logic code.

---

## Key Takeaways

1. **Centralized state ownership produces cleaner architecture.** The JS/TS/C++ approach (GameLogic owns all entities) is more cohesive than Java's split ownership (GamePanel owns entities, GameLogic owns maze) or Python's module-level ownership. When one class owns all state, the data flow is unambiguous.

2. **Encapsulation strength varies, but the pattern is universal.** Every implementation uses private-ish fields with public getters. The enforcement ranges from convention-only (Python/JS) to compiler-enforced (Java/TS/C++), but the intent is the same: prevent external code from directly mutating game state.

3. **Value semantics in C++ demand extra care.** The `auto&` requirement in range-for loops, `const&` parameter passing, and `emplace_back` for in-place construction are all consequences of C++'s value-by-default model. Other languages use reference semantics for objects, avoiding these pitfalls but giving up the performance and lifetime-safety guarantees that value semantics provide.

---

## Discussion Questions

1. Python's `@property` decorator and JavaScript's `get` accessor both create the illusion of direct attribute access while actually calling a method. What are the advantages and disadvantages of this approach compared to Java's explicit `getGridX()` style?

2. TypeScript's `readonly Ghost[]` prevents mutation at compile time but is erased at runtime. In what scenario could this discrepancy between compile-time and runtime behavior cause a bug, and how would you guard against it?

3. The Java implementation splits entity ownership between `GamePanel` and `GameLogic`. If you were refactoring the Java version, would you move entity creation into `GameLogic` (matching JS/TS/C++) or keep the current split? What are the trade-offs for testability?
