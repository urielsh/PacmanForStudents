# Product Requirements Document (PRD)
# Educational Multi-Language Pacman

## 1. Overview

**Product Name:** Educational Multi-Language Pacman
**Version:** 1.0
**Date:** 2026-03-16

### 1.1 Purpose
An educational platform that implements the classic Pacman game in multiple programming languages. Learners select a language from a terminal menu, play the same Pacman game, and study how core game engine concepts are implemented differently across languages.

### 1.2 Problem Statement
Learning game development across multiple languages is fragmented — tutorials differ in scope, style, and game mechanics, making it hard to compare how languages handle the same problems. This project provides a single, consistent Pacman game implemented identically in 5 languages, with rich educational annotations at every decision point.

### 1.3 Target Audience
- Computer science students learning multiple languages
- Self-taught developers exploring game development fundamentals
- Educators teaching comparative programming or game engine concepts

---

## 2. Goals & Success Criteria

| Goal | Success Metric |
|------|---------------|
| Learners understand game loop patterns across languages | Each implementation has annotated game loop with cross-language references |
| All 5 implementations are playable and behave identically | Same maze, scoring, ghost behavior, and timing across all languages |
| Zero-friction setup per language | Each language has a single `run.sh` that handles build + launch |
| Launcher provides guided learning experience | TUI menu with prerequisite checks, descriptions, and educational submenu |

---

## 3. Supported Languages

| # | Language | Framework | Why (Educational Value) |
|---|----------|-----------|------------------------|
| 1 | **Java** | Swing | OOP class hierarchy, threading model, AWT/Swing event dispatch |
| 2 | **Python** | Pygame | Dynamic typing, simple game loop, beginner-friendly contrast to Java |
| 3 | **JavaScript** | HTML5 Canvas | Event-driven, `requestAnimationFrame`, browser runtime, no compilation |
| 4 | **TypeScript** | HTML5 Canvas | Same Canvas API as JS but with static types — teaches type system value |
| 5 | **C++** | SDL2 | Manual memory, pointers, header/source separation, compilation, low-level control |

---

## 4. Features

### 4.1 Terminal Launcher (Python curses TUI)
- **FR-1:** ASCII art Pacman title screen
- **FR-2:** Arrow-key navigable menu listing all 5 language implementations
- **FR-3:** Prerequisite status indicator per language (green = ready, red = missing dependency)
- **FR-4:** Brief educational blurb displayed when a language is highlighted
- **FR-5:** Press Enter to launch the selected language's `run.sh`
- **FR-6:** "Educational Comparisons" submenu that opens cross-language docs in the terminal
- **FR-7:** Prerequisite auto-detection:
  - Java: `java`, `mvn`
  - Python: `python3`, `pygame` module
  - JavaScript: browser available (`xdg-open` / `open`)
  - TypeScript: `npx`
  - C++: `g++`, `libsdl2-dev`

### 4.2 Game Behavior (Consistent Across All Languages)
- **FR-8:** 40x30 tile grid, tile size 20px, window 800x600
- **FR-9:** 60 FPS game loop
- **FR-10:** Pacman controlled by arrow keys, grid-based movement
- **FR-11:** Pacman checks wall collisions before moving
- **FR-12:** 4 ghosts (Blinky/Red, Pinky/Pink, Inky/Cyan, Clyde/Magenta)
- **FR-13:** Ghost random movement every 20 frames, respecting walls
- **FR-14:** Pellet collection scoring (10 points per pellet)
- **FR-15:** Ghost collision detection (game over on contact)
- **FR-16:** Score display on screen
- **FR-17:** Maze layout: border walls + internal walls (horizontal walls at rows 10 & 20 from x=5-14, vertical wall at column 20 from y=5-24)

### 4.3 Educational Content

#### Layer 1: Inline Code Annotations
- **FR-18:** Every source file contains structured comment blocks at key game engine points
- **FR-19:** Annotations use a consistent format with section headers and cross-language references
- **FR-20:** Six annotated concepts per file where applicable:
  1. Game Loop Timing
  2. Rendering / Drawing
  3. Input Handling
  4. Object Movement
  5. Collision Detection
  6. Ghost AI

#### Layer 2: Per-Language README
- **FR-21:** Each language directory contains a `README.md` with:
  - What makes this language's approach unique
  - Prerequisites and setup instructions
  - Architecture overview (same structure, language-specific implementation)
  - "Things to Notice" — 3-5 idiomatic highlights
  - Exercises (e.g., "Modify ghost AI to chase Pacman", "Add power pellets")

#### Layer 3: Cross-Language Comparison Docs
- **FR-22:** Six deep-dive documents in `docs/`:
  - `01_game_loop.md` — Game loop patterns across all 5 languages
  - `02_rendering.md` — Drawing/rendering approaches
  - `03_input_handling.md` — Keyboard input systems
  - `04_collision_detection.md` — Collision detection implementations
  - `05_ghost_ai.md` — AI movement patterns
  - `06_state_management.md` — Game state management
- **FR-23:** Each doc shows side-by-side code snippets from all 5 languages with analysis
- **FR-24:** Each doc ends with "Key Takeaways" and discussion questions

### 4.4 Shared Game Specification
- **FR-25:** `shared/maze_layout.json` defines the canonical maze (walls, pellet positions, ghost starts, Pacman start)
- **FR-26:** `shared/game_constants.json` defines shared constants (tile size, FPS, scoring, ghost interval)
- **FR-27:** All implementations either load these JSON files or hardcode the same values with a comment referencing the JSON as source of truth

---

## 5. Repository Structure

```
Packman/
├── README.md                          # Main educational guide & learning path
├── PRD.md                             # This document
├── launcher.py                        # Python curses TUI menu
├── setup.sh                           # Prerequisite checker/installer
├── .gitignore                         # Updated for all languages
│
├── shared/
│   ├── maze_layout.json               # Canonical maze definition
│   └── game_constants.json            # Shared game constants
│
├── java/
│   ├── pom.xml
│   ├── README.md
│   ├── run.sh
│   └── src/main/java/com/packman/
│       ├── PacmanGame.java
│       ├── GamePanel.java
│       ├── Pacman.java
│       ├── Ghost.java
│       ├── Maze.java
│       └── GameLogic.java
│
├── python/
│   ├── requirements.txt               # pygame
│   ├── README.md
│   ├── run.sh
│   ├── main.py
│   ├── game_panel.py
│   ├── pacman.py
│   ├── ghost.py
│   ├── maze.py
│   └── game_logic.py
│
├── javascript/
│   ├── README.md
│   ├── run.sh
│   ├── index.html
│   ├── game.js
│   ├── pacman.js
│   ├── ghost.js
│   ├── maze.js
│   └── game_logic.js
│
├── typescript/
│   ├── README.md
│   ├── run.sh
│   ├── tsconfig.json
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── game.ts
│       ├── pacman.ts
│       ├── ghost.ts
│       ├── maze.ts
│       └── game_logic.ts
│
├── cpp/
│   ├── README.md
│   ├── run.sh
│   ├── CMakeLists.txt
│   ├── main.cpp
│   ├── game_panel.cpp / game_panel.h
│   ├── pacman.cpp / pacman.h
│   ├── ghost.cpp / ghost.h
│   ├── maze.cpp / maze.h
│   └── game_logic.cpp / game_logic.h
│
└── docs/
    ├── 01_game_loop.md
    ├── 02_rendering.md
    ├── 03_input_handling.md
    ├── 04_collision_detection.md
    ├── 05_ghost_ai.md
    └── 06_state_management.md
```

---

## 6. User Stories

### Launcher
- **US-1:** As a learner, I can run `python3 launcher.py` and see a menu of available languages so I can choose which implementation to explore.
- **US-2:** As a learner, I can see which languages have their prerequisites installed so I know what I can run immediately.
- **US-3:** As a learner, I can read a brief description of each language's educational focus before launching it.
- **US-4:** As a learner, I can access cross-language comparison documents from the launcher menu.

### Gameplay
- **US-5:** As a player, I can play Pacman in any of the 5 languages and experience the same maze, controls, and scoring.
- **US-6:** As a player, I can move Pacman with arrow keys and collect pellets for points.
- **US-7:** As a player, I see a game over state when a ghost catches Pacman.

### Learning
- **US-8:** As a learner, I can read inline annotations in any source file to understand what each section of code does and how it compares to other languages.
- **US-9:** As a learner, I can read per-language READMEs to understand what makes each language's approach unique.
- **US-10:** As a learner, I can read cross-language comparison docs to see the same concept (e.g., game loop) implemented in all 5 languages side-by-side.
- **US-11:** As a learner, I can complete exercises suggested in each README to deepen my understanding.

---

## 7. Non-Functional Requirements

- **NFR-1:** Each language implementation must be self-contained — runnable from its own directory without dependencies on other languages.
- **NFR-2:** Each `run.sh` script handles build (if needed) and launch in a single command.
- **NFR-3:** No external game assets required — all rendering uses primitive shapes (rectangles, ovals).
- **NFR-4:** Code prioritizes readability over performance — this is an educational project.
- **NFR-5:** Consistent file naming across languages (1:1 mapping of game components to files).

---

## 8. Technical Specifications

### 8.1 Game Constants
| Constant | Value |
|----------|-------|
| Grid width | 40 tiles |
| Grid height | 30 tiles |
| Tile size | 20 pixels |
| Window width | 800 pixels |
| Window height | 600 pixels |
| FPS | 60 |
| Pellet score | 10 points |
| Ghost move interval | Every 20 frames |
| Pacman start position | (5, 5) |
| Ghost start positions | Blinky (10,10), Pinky (10,11), Inky (11,10), Clyde (11,11) |

### 8.2 Ghost Colors
| Ghost | Color |
|-------|-------|
| Blinky | Red (#FF0000) |
| Pinky | Pink (#FFB8FF) |
| Inky | Cyan (#00FFFF) |
| Clyde | Magenta (#FF00FF) |

### 8.3 Maze Layout
- Border walls on all 4 edges
- Horizontal walls: row 10 and row 20, from column 5 to column 14
- Vertical wall: column 20, from row 5 to row 24
- Pellets on all non-wall, non-Pacman-start tiles

### 8.4 Educational Annotation Format
```
// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: [Concept Name]
// ═══════════════════════════════════════════════════════
// [Explanation of what this code does in this language]
//
// Compare with:
//   [Language] → [How that language does it differently]
//   [Language] → [How that language does it differently]
//
// KEY CONCEPT: [Core takeaway]
// ═══════════════════════════════════════════════════════
```

---

## 9. Implementation Phases

| Phase | Description | Deliverables |
|-------|-------------|-------------|
| **1** | Restructure repo & annotate Java | `java/` directory, `shared/` JSON files, wall-collision bugfixes |
| **2** | Python/Pygame implementation | `python/` directory with all 6 modules + README |
| **3** | JavaScript/Canvas implementation | `javascript/` directory with HTML + 5 JS files + README |
| **4** | TypeScript implementation | `typescript/` directory with typed source + build config + README |
| **5** | C++/SDL2 implementation | `cpp/` directory with headers/sources + CMakeLists + README |
| **6** | Launcher & documentation | `launcher.py`, 6 comparison docs, root README rewrite |
| **7** | Polish & verification | Test all implementations, `setup.sh`, `.gitignore` update |

---

## 10. Known Issues to Fix (from existing Java code)

1. **Pacman does not check walls** — `Pacman.java` validates grid boundaries but never calls `maze.isWall()`. Pacman can walk through internal walls.
2. **Ghosts do not check walls** — `Ghost.java` random movement ignores wall positions. Ghosts can overlap with walls.
3. Both bugs must be fixed in the Java implementation and all other implementations must include proper wall checking from the start.

---

## 11. Acceptance Criteria

- [ ] `python3 launcher.py` displays TUI menu with all 5 languages
- [ ] Each language shows correct prerequisite status in launcher
- [ ] `cd java && bash run.sh` — playable Pacman game
- [ ] `cd python && bash run.sh` — playable Pacman game, same behavior as Java
- [ ] `cd javascript && bash run.sh` — opens browser with playable Pacman game
- [ ] `cd typescript && bash run.sh` — compiles and runs in browser
- [ ] `cd cpp && bash run.sh` — compiles with SDL2 and runs
- [ ] All 5 implementations have identical maze layout, scoring, and ghost behavior
- [ ] Every source file contains educational annotations with cross-language references
- [ ] Each language directory has a README with educational content and exercises
- [ ] 6 cross-language comparison documents exist in `docs/`
- [ ] `shared/maze_layout.json` and `game_constants.json` define canonical game spec
