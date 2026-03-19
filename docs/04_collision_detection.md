# Collision Detection -- Cross-Language Comparison

## Introduction

Collision detection in Packman answers two questions every frame: (1) "Can this entity move to the target tile?" (wall collision), and (2) "Is Pacman occupying the same tile as a ghost or pellet?" (entity collision). Because all movement is grid-based, collision detection reduces to simple integer comparisons -- no bounding boxes, no distance calculations, no floating-point math.

This document compares how each of the five implementations handles wall checking and entity-to-entity collision.

---

## 1. Wall Checking -- `isWall()`

Every entity calls the maze's `isWall()` method before moving. This is the "look before you leap" pattern: check the destination tile **before** updating position.

**Java:**
```java
// java/src/main/java/com/packman/Maze.java
public boolean isWall(int x, int y) {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
        return true;  // Out-of-bounds treated as wall
    }
    return walls[x][y];
}
```

**Python:**
```python
# python/maze.py
def is_wall(self, x: int, y: int) -> bool:
    if x < 0 or x >= self._MAZE_WIDTH or y < 0 or y >= self._MAZE_HEIGHT:
        return True
    return self._walls[x][y]
```

**JavaScript:**
```javascript
// javascript/maze.js
isWall(x, y) {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
        return true;
    }
    return this._walls[x][y];
}
```

**TypeScript:**
```typescript
// typescript/src/maze.ts
public isWall(x: number, y: number): boolean {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
        return true;
    }
    return this.walls[x][y];
}
```

**C++:**
```cpp
// cpp/maze.cpp
bool Maze::isWall(int x, int y) const {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) {
        return true;  // Out-of-bounds treated as wall
    }
    return walls[x][y];
}
```

**Analysis:** The implementation is virtually identical across all five languages. The critical design decision -- treating out-of-bounds coordinates as walls -- is shared by all. This eliminates the need for separate boundary checks in movement code: entities near the edge of the map automatically stop because `isWall()` returns `true`.

The consequence of NOT having this bounds check differs by language:
- **Java** would throw `ArrayIndexOutOfBoundsException`.
- **Python** would throw `IndexError` (or silently wrap with negative indices).
- **JavaScript** would return `undefined` (falsy), which would incorrectly allow movement through boundaries.
- **TypeScript** has the same runtime behavior as JavaScript despite compile-time checks.
- **C++** would trigger **undefined behavior** -- the most dangerous outcome, potentially corrupting memory.

---

## 2. Pacman's Movement Validation

Pacman uses `isWall()` to validate movement with a two-step fallback: try the buffered direction, then the current direction.

**Java:**
```java
// java/src/main/java/com/packman/Pacman.java
public void update(Maze maze) {
    int newX = gridX + nextDirX;
    int newY = gridY + nextDirY;
    if (isValidMove(newX, newY, maze)) {
        dirX = nextDirX;
        dirY = nextDirY;
        gridX = newX;
        gridY = newY;
    } else {
        newX = gridX + dirX;
        newY = gridY + dirY;
        if (isValidMove(newX, newY, maze)) {
            gridX = newX;
            gridY = newY;
        }
    }
}

private boolean isValidMove(int x, int y, Maze maze) {
    return !maze.isWall(x, y);
}
```

**C++:**
```cpp
// cpp/pacman.cpp
void Pacman::update(const Maze& maze) {
    int newX = gridX + nextDirX;
    int newY = gridY + nextDirY;
    if (isValidMove(newX, newY, maze)) {
        dirX = nextDirX;
        dirY = nextDirY;
        gridX = newX;
        gridY = newY;
    } else {
        newX = gridX + dirX;
        newY = gridY + dirY;
        if (isValidMove(newX, newY, maze)) {
            gridX = newX;
            gridY = newY;
        }
    }
}

bool Pacman::isValidMove(int x, int y, const Maze& maze) const {
    return !maze.isWall(x, y);
}
```

**Analysis:** Java and C++ use a separate `isValidMove()` helper that wraps the negation. Python, JavaScript, and TypeScript inline the `!maze.isWall()` check directly. The C++ version marks both the method and the Maze parameter as `const`, providing a compiler-enforced guarantee that this check has no side effects.

---

## 3. Pellet Collection (Trigger Collision)

When Pacman's grid position matches a pellet, the pellet is removed and the score increases.

**Java:**
```java
// java/src/main/java/com/packman/GameLogic.java
public void checkCollisions(Pacman pacman, Ghost[] ghosts) {
    int pacmanX = pacman.getGridX();
    int pacmanY = pacman.getGridY();

    if (maze.hasPellet(pacmanX, pacmanY)) {
        maze.removePellet(pacmanX, pacmanY);
        score += 10;
    }
    // ... ghost collision follows
}
```

**Python:**
```python
# python/game_logic.py
def check_collisions(self, pacman: Pacman, ghosts: list[Ghost]) -> None:
    pacman_x = pacman.grid_x
    pacman_y = pacman.grid_y

    if self._maze.has_pellet(pacman_x, pacman_y):
        self._maze.remove_pellet(pacman_x, pacman_y)
        self._score += 10
```

**JavaScript:**
```javascript
// javascript/game_logic.js
_checkCollisions() {
    const pacX = this._pacman.gridX;
    const pacY = this._pacman.gridY;

    if (this._maze.hasPellet(pacX, pacY)) {
        this._maze.removePellet(pacX, pacY);
        this._score += PELLET_POINTS;
    }
    // ...
}
```

**TypeScript:**
```typescript
// typescript/src/game_logic.ts
private checkCollisions(): void {
    const pacX: number = this._pacman.gridX;
    const pacY: number = this._pacman.gridY;

    if (this._maze.hasPellet(pacX, pacY)) {
        this._maze.removePellet(pacX, pacY);
        this._score += PELLET_POINTS;
    }
    // ...
}
```

**C++:**
```cpp
// cpp/game_logic.cpp
void GameLogic::checkCollisions() {
    int pacX = pacman.getGridX();
    int pacY = pacman.getGridY();

    if (maze.hasPellet(pacX, pacY)) {
        maze.removePellet(pacX, pacY);
        score += PELLET_POINTS;
    }
    // ...
}
```

**Analysis:** All five implementations are functionally identical: check for pellet at current position, remove it, add score. The JS and TS versions use a named constant `PELLET_POINTS = 10` while Java and Python hardcode the value. C++ also uses a constant. This is a minor style difference, not a structural one.

---

## 4. Ghost Collision (Game Over Trigger)

If any ghost occupies the same tile as Pacman, the game ends.

**Java:**
```java
// java/src/main/java/com/packman/GameLogic.java
for (Ghost ghost : ghosts) {
    if (pacmanX == ghost.getGridX() && pacmanY == ghost.getGridY()) {
        gameOver = true;
    }
}
```

**Python:**
```python
# python/game_logic.py
for ghost in ghosts:
    if pacman_x == ghost.grid_x and pacman_y == ghost.grid_y:
        self._game_over = True
```

**JavaScript:**
```javascript
// javascript/game_logic.js
for (const ghost of this._ghosts) {
    if (pacX === ghost.gridX && pacY === ghost.gridY) {
        this._gameOver = true;
    }
}
```

**TypeScript:**
```typescript
// typescript/src/game_logic.ts
for (const ghost of this._ghosts) {
    if (pacX === ghost.gridX && pacY === ghost.gridY) {
        this._gameOver = true;
    }
}
```

**C++:**
```cpp
// cpp/game_logic.cpp
for (const auto& ghost : ghosts) {
    if (pacX == ghost.getGridX() && pacY == ghost.getGridY()) {
        gameOver = true;
    }
}
```

**Analysis:** Again, virtually identical. Notable differences:
- JavaScript uses strict equality (`===`) to avoid type coercion.
- C++ uses `const auto&` to avoid copying Ghost objects during iteration.
- Python uses `and` instead of `&&`.
- None of the implementations break early after finding a collision -- they continue checking all ghosts. This is acceptable because the ghost array is small (4 elements), but for a large number of entities, an early `break` would be an optimization.

---

## 5. Collision Detection Centralization

All five implementations centralize collision logic in the `GameLogic` class rather than spreading it across entity classes.

| Language | Collision method | Location |
|---|---|---|
| Java | `checkCollisions(Pacman, Ghost[])` | `GameLogic.java` |
| Python | `check_collisions(Pacman, list[Ghost])` | `game_logic.py` |
| JavaScript | `_checkCollisions()` | `game_logic.js` (internal method) |
| TypeScript | `checkCollisions()` | `game_logic.ts` (private method) |
| C++ | `checkCollisions()` | `game_logic.cpp` (internal method) |

Java and Python pass entities as parameters; JS, TS, and C++ access them through the `GameLogic` instance's own fields. This is a design choice: the parameter-passing approach is more testable (you can pass mock objects), while the field-access approach is more encapsulated (collision logic is truly internal).

---

## Key Takeaways

1. **Grid-based collision is trivially simple.** Across all five languages, collision detection is just integer equality: `if (ax == bx && ay == by)`. There are no bounding boxes, no circle intersection tests, no floating-point edge cases. This simplicity is a direct benefit of grid-based movement.

2. **Bounds checking prevents language-specific failure modes.** The `isWall()` bounds guard is critical in every language, but the consequences of omitting it vary dramatically: from a clean exception (Java/Python) to silent bugs (JavaScript) to undefined behavior (C++).

3. **The "look before you leap" pattern is universal.** All five implementations check the destination tile before moving, rather than moving first and reverting if invalid. This pre-movement validation is simpler and avoids the need for rollback logic.

---

## Discussion Questions

1. The ghost collision loop does not `break` after finding a collision. In what scenario would adding an early break matter for performance, and is the readability trade-off worth it for a 4-ghost game?

2. JavaScript returns `undefined` for out-of-bounds array access, which is falsy. If the `isWall()` bounds check were removed, how would this manifest as a gameplay bug? Would Pacman be able to walk off the edge of the map?

3. All five implementations use the same grid-coordinate equality check for ghost collision. If you wanted to add a "near miss" mechanic (Pacman is safe if within 1 tile but not on the same tile), how would each `checkCollisions` method need to change?
