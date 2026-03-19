# Ghost AI Movement -- Cross-Language Comparison

## Introduction

Ghost AI is the engine of challenge in Pac-Man. In the classic 1980 arcade game, each ghost has a unique personality: Blinky chases directly, Pinky ambushes ahead, Inky uses a complex targeting formula, and Clyde alternates between chasing and fleeing. All five Packman implementations use a simpler approach -- **random walk** -- where each ghost picks a random direction every N frames and moves there if the tile is not a wall.

This document compares the random-walk AI implementation across all five languages, focusing on the frame-counter throttling mechanism, the random direction selection, and the wall validation.

---

## 1. Frame-Counter Throttling

Ghosts move slower than Pacman. While Pacman moves every frame (60 tiles/second at 60 FPS), ghosts only attempt a move every 20 frames (3 moves/second). This speed differential is achieved with a simple modulo check on a frame counter.

**Java:**
```java
// java/src/main/java/com/packman/Ghost.java
private int moveCounter = 0;

public void update(Maze maze) {
    moveCounter++;
    if (moveCounter % 20 == 0) {
        // ... pick direction and move
    }
}
```

**Python:**
```python
# python/ghost.py
self._move_counter: int = 0

def update(self, maze: Maze) -> None:
    self._move_counter += 1
    if self._move_counter % 20 == 0:
        # ... pick direction and move
```

**JavaScript:**
```javascript
// javascript/ghost.js
const GHOST_MOVE_INTERVAL_FRAMES = 20;

update(maze) {
    this._moveCounter++;
    if (this._moveCounter % GHOST_MOVE_INTERVAL_FRAMES === 0) {
        // ... pick direction and move
    }
}
```

**TypeScript:**
```typescript
// typescript/src/ghost.ts
const GHOST_MOVE_INTERVAL_FRAMES = 20;

public update(maze: Maze): void {
    this._moveCounter++;
    if (this._moveCounter % GHOST_MOVE_INTERVAL_FRAMES === 0) {
        // ... pick direction and move
    }
}
```

**C++:**
```cpp
// cpp/ghost.cpp
void Ghost::update(const Maze& maze) {
    moveCounter++;
    if (moveCounter % 20 == 0) {
        // ... pick direction and move
    }
}
```

**Analysis:** All five use the exact same pattern: increment a counter, check with modulo. JavaScript and TypeScript extract the interval into a named constant (`GHOST_MOVE_INTERVAL_FRAMES`), which is slightly more maintainable. Java, Python, and C++ hardcode the value `20`.

The modulo approach assumes a fixed frame rate (60 FPS). If the frame rate drops, ghosts effectively slow down further. A time-based approach (checking elapsed milliseconds) would be more robust but adds complexity.

---

## 2. Random Direction Selection

Each ghost picks one of four cardinal directions at random.

**Java:**
```java
// java/src/main/java/com/packman/Ghost.java
int direction = (int) (Math.random() * 4);

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
```

**Python:**
```python
# python/ghost.py
direction = random.randint(0, 3)

if direction == 0:  # Left
    if not maze.is_wall(self._grid_x - 1, self._grid_y):
        self._grid_x -= 1
elif direction == 1:  # Right
    if not maze.is_wall(self._grid_x + 1, self._grid_y):
        self._grid_x += 1
elif direction == 2:  # Up
    if not maze.is_wall(self._grid_x, self._grid_y - 1):
        self._grid_y -= 1
elif direction == 3:  # Down
    if not maze.is_wall(self._grid_x, self._grid_y + 1):
        self._grid_y += 1
```

**JavaScript:**
```javascript
// javascript/ghost.js
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const dirIndex = Math.floor(Math.random() * 4);
const [dx, dy] = DIRECTIONS[dirIndex];
const newX = this._gridX + dx;
const newY = this._gridY + dy;

if (!maze.isWall(newX, newY)) {
    this._gridX = newX;
    this._gridY = newY;
}
```

**TypeScript:**
```typescript
// typescript/src/ghost.ts
const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
] as const;

const dirIndex: number = Math.floor(Math.random() * 4);
const [dx, dy] = DIRECTIONS[dirIndex];
const newX: number = this._gridX + dx;
const newY: number = this._gridY + dy;

if (!maze.isWall(newX, newY)) {
    this._gridX = newX;
    this._gridY = newY;
}
```

**C++:**
```cpp
// cpp/ghost.cpp
int direction = std::rand() % 4;

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
```

---

## 3. Architecture Comparison

Two distinct approaches are visible in the code above:

### Switch/If-Else Approach (Java, Python, C++)

These three implementations use a switch statement (Java, C++) or if/elif chain (Python) to map an integer to a direction. Each case contains its own wall check and position update. This is straightforward but verbose -- adding 8-directional movement would require doubling the cases.

### Direction Vector Array Approach (JavaScript, TypeScript)

These two implementations use a pre-defined `DIRECTIONS` array of `[dx, dy]` pairs. The random index selects a direction vector, which is destructured and applied in a single code path. This is more elegant and scales naturally to any number of directions.

**TypeScript adds immutability:**
```typescript
const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
] as const;
```

The `ReadonlyArray<readonly [number, number]>` type with `as const` makes this deeply immutable at compile time: you cannot push new entries, remove existing ones, or mutate the inner tuples. This is a zero-runtime-cost safety guarantee unique to TypeScript.

---

## 4. Random Number Generation

| Language | API | Example | Notes |
|---|---|---|---|
| Java | `Math.random()` | `(int)(Math.random() * 4)` | Returns `double` in [0, 1); multiply and cast |
| Python | `random.randint()` | `random.randint(0, 3)` | Inclusive both ends; cleanest API |
| JavaScript | `Math.random()` | `Math.floor(Math.random() * 4)` | Returns float in [0, 1); must floor |
| TypeScript | `Math.random()` | `Math.floor(Math.random() * 4)` | Same as JS |
| C++ | `std::rand()` | `std::rand() % 4` | C legacy; has modulo bias; requires `std::srand()` seed |

Python's `random.randint(0, 3)` is the most readable -- it directly expresses "pick an integer from 0 to 3." JavaScript and TypeScript require the `Math.floor(Math.random() * 4)` idiom, which is a common source of off-by-one errors. C++'s `std::rand() % 4` is the simplest syntax but has well-known quality issues (poor randomness, global state, modulo bias).

---

## 5. Ghost Initialization

All implementations create four ghosts with distinct visual identities but identical AI behavior.

**Java:**
```java
// java/src/main/java/com/packman/GamePanel.java
ghosts[0] = new Ghost(10, 10, TILE_SIZE, 255, 0, 0);        // Blinky (red)
ghosts[1] = new Ghost(10, 11, TILE_SIZE, 255, 184, 255);    // Pinky (pink)
ghosts[2] = new Ghost(11, 10, TILE_SIZE, 0, 255, 255);      // Inky (cyan)
ghosts[3] = new Ghost(11, 11, TILE_SIZE, 255, 0, 255);      // Clyde (magenta)
```

**JavaScript:**
```javascript
// javascript/game_logic.js
this._ghosts = [
    new Ghost(10, 10, 'Blinky', '#FF0000'),
    new Ghost(10, 11, 'Pinky', '#FFB8FF'),
    new Ghost(11, 10, 'Inky', '#00FFFF'),
    new Ghost(11, 11, 'Clyde', '#FF00FF'),
];
```

**C++:**
```cpp
// cpp/game_logic.cpp
ghosts.emplace_back(10, 10, "Blinky", "#FF0000");
ghosts.emplace_back(10, 11, "Pinky",  "#FFB8FF");
ghosts.emplace_back(11, 10, "Inky",   "#00FFFF");
ghosts.emplace_back(11, 11, "Clyde",  "#FF00FF");
```

**Analysis:** Java and Python store colors as separate R/G/B integers, keeping ghost classes free of rendering imports. JavaScript, TypeScript, and C++ store colors as hex strings and names, delegating color parsing to the rendering layer. C++ uses `emplace_back` for in-place construction within the vector, avoiding temporary object creation.

---

## 6. Ghost Behavior: Stuck in Corners

A notable consequence of the random-walk AI is that ghosts can get "stuck" in dead-end corridors. If a ghost is in a 1-tile-wide dead end, it has a 3/4 probability of choosing a blocked direction each turn, meaning it stays put 75% of the time. No implementation includes retry logic -- if the chosen direction is blocked, the ghost simply stands still.

This behavior is consistent across all five languages because the algorithm is identical. Improving it would require either:
- Retrying with a different random direction until a valid one is found.
- Weighting directions based on distance to Pacman.
- Implementing proper pathfinding (BFS, A*).

---

## Key Takeaways

1. **The direction vector array (JS/TS) is more elegant than switch statements (Java/Python/C++).** Using `DIRECTIONS[index]` with destructuring eliminates repetitive cases and scales naturally. The switch/case approach is fine for learning but becomes unwieldy with more complex movement.

2. **Frame-counter throttling is the simplest speed control.** All five implementations use the same `counter % interval` pattern. It assumes a fixed frame rate, which is acceptable for a simple game but would need replacement with delta-time scaling in a production engine.

3. **Random walk creates emergent difficulty.** Despite being the simplest possible AI, four ghosts moving unpredictably are genuinely challenging to dodge. The ghost-stuck-in-corners behavior actually adds variety to the gameplay.

---

## Discussion Questions

1. The classic Pac-Man gives each ghost a unique targeting algorithm. If you wanted to make Blinky (red) chase Pacman directly, what information would the ghost's `update()` method need access to, and how would each language provide that access?

2. C++ uses `std::rand() % 4` which has modulo bias (some values are slightly more likely than others). For a 4-direction game with only 4 possible values, does this bias matter in practice? At what scale would it become noticeable?

3. All implementations use a shared frame counter that increments forever. What happens when this integer overflows in each language? Which languages handle it gracefully, and which could produce bugs?
