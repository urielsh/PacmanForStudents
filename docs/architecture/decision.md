# Architecture Decision Record (ADR)

## ADR-001: Sequential Language Phases

**Decision**: Implement languages sequentially (Java -> Python -> JS -> TS -> C++).

**Rationale**: Educational annotations require cross-references to all prior languages. Parallel implementation would force a second pass. Sequential also lets each implementation learn from prior patterns.

**Alternatives**: (A) All 5 in parallel — faster but no cross-refs on first pass. (B) Grouped by similarity — partial parallelism but still breaks cross-ref ordering.

**Tradeoff**: Longer timeline (~19d vs ~10d), mitigated by intra-phase parallelism.

---

## ADR-002: Hardcoded Constants with JSON Reference

**Decision**: Each language hardcodes game constants with a `// Source of truth: shared/game_constants.json` comment.

**Rationale**: Runtime JSON loading adds I/O, path resolution, and parsing overhead in every language (C++ would need a JSON library). Self-contained files serve the educational goal better.

**Alternatives**: (A) Load JSON at runtime. (B) Code generation script.

**Tradeoff**: Manual sync if constants change (acceptable — constants are frozen by PRD).

---

## ADR-003: Keep JUnit 4

**Decision**: Keep JUnit 4 for Java tests.

**Rationale**: Already configured in pom.xml. Small test suite (~20 tests). JUnit 4 is more widely known by students.

**Alternatives**: Upgrade to JUnit 5 (Jupiter).

**Tradeoff**: Missing JUnit 5 features — negligible at this scale.

---

## ADR-004: Raw tsc, No Bundler for TypeScript

**Decision**: Use `tsc` to compile TypeScript to JS, serve as static files.

**Rationale**: Bundlers obscure the educational goal. Raw output is transparent — students see exactly what TS compiles to.

**Alternatives**: Vite, Webpack, esbuild.

**Tradeoff**: No hot-reload, manual `<script>` ordering. Acceptable for 6 files.

---

## ADR-005: CMake for C++

**Decision**: CMake 3.16+ for C++ build.

**Rationale**: `find_package(SDL2)` and `FetchContent` for GoogleTest are industry-standard patterns worth teaching. Cross-platform SDL2 discovery.

**Alternatives**: Plain Makefile, Meson.

**Tradeoff**: CMake verbosity, mitigated by heavy comments.

---

## ADR-006: Random Ghost AI

**Decision**: Keep random movement per PRD (direction change every 20 frames).

**Rationale**: Identical and trivial across all 5 languages. Keeps focus on language differences, not algorithm differences. Chase AI offered as a README exercise.

**Alternatives**: Classic ghost personalities (pathfinding, target tiles).

**Tradeoff**: Less engaging gameplay — acceptable since learning is the product.

---

## ADR-007: Method Parameter for Maze Reference

**Decision**: Pass `Maze` to `Pacman.update(Maze maze)` as method parameter, matching `Ghost.update(Maze maze)`.

**Rationale**: Consistency with existing Ghost API. Avoids initialization order issues with constructor injection.

**Alternatives**: (A) Constructor injection. (B) Mediator pattern.

**Tradeoff**: Maze must be passed every frame. Simple and consistent.

---

## Class Interface Contracts (All Languages)

### Maze
```
- constructor(): initializes walls (border + internal) and pellets
- isWall(x, y) -> bool: returns true if wall or out-of-bounds
- hasPellet(x, y) -> bool: returns true if pellet at position
- removePellet(x, y): removes pellet at position
- draw(graphics, tileSize): renders walls and pellets
```

### Pacman
```
- constructor(x, y, size): sets start position
- setDirection(dx, dy): queues next direction
- update(maze): moves if target tile is not a wall
- draw(graphics): renders yellow circle
- getGridX() -> int, getGridY() -> int: position getters
```

### Ghost
```
- constructor(x, y, size, color): sets start position and color
- update(maze): random direction every N frames, respects walls
- draw(graphics): renders colored rectangle with eyes
- getGridX() -> int, getGridY() -> int: position getters
```

### GameLogic
```
- constructor(): creates Maze instance
- checkCollisions(pacman, ghosts): pellet scoring + ghost death
- getMaze() -> Maze: maze getter
- getScore() -> int: score getter
- isGameOver() -> bool: game state getter
```

### GamePanel / Main Entry
```
- constructor(): initializes all game objects
- startGame(): begins game loop
- update(): checks gameOver, updates pacman + ghosts, checks collisions
- render(graphics): draws maze, pacman, ghosts, HUD
- handleInput(key): maps keys to pacman.setDirection()
```

### Critical Rule
**Any entity that moves on the grid MUST accept Maze as a dependency and call isWall() before moving. Boundary-only checks are NEVER sufficient.**
