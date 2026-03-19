# Educational Multi-Language Pacman

**One classic game, five languages, one learning journey.** Compare how Java, Python, JavaScript, TypeScript, and C++ each tackle the same game-engine problems -- from game loops to ghost AI -- with identical gameplay and shared specifications.

---

## Project Overview

This repository contains the classic Pacman game implemented from scratch in five programming languages. Every implementation shares the same maze layout, scoring rules, ghost behavior, and 60 FPS timing, making it possible to do true apples-to-apples comparisons of how each language and framework solves the same game-development challenges.

The project is designed for:

- **CS students** learning multiple languages who want a concrete, fun codebase to compare.
- **Self-taught developers** exploring game-development fundamentals.
- **Educators** teaching comparative programming or game-engine concepts.

Each language folder is self-contained with its own build system, tests, and `run.sh` launcher. A shared `game_constants.json` ensures every implementation uses identical parameters, and six cross-language comparison documents walk you through the key design topics side by side.

---

## Quick Start

### Option 1 -- Interactive TUI Launcher (recommended)

```bash
python3 launcher.py
```

This opens a terminal menu with arrow-key navigation, prerequisite status checks, educational blurbs, and one-key launch for each language.

### Option 2 -- Check Prerequisites First

```bash
bash setup.sh
```

The setup script scans your system for every dependency (JDK, Maven, Pygame, Node, npm, g++, SDL2, CMake, etc.) and prints a green/red status for each.

### Option 3 -- Run a Single Language Directly

```bash
cd java       && bash run.sh   # Java / Swing
cd python     && bash run.sh   # Python / Pygame
cd javascript && bash run.sh   # JavaScript / HTML5 Canvas
cd typescript && bash run.sh   # TypeScript / Canvas + Types
cd cpp        && bash run.sh   # C++ / SDL2
```

Each `run.sh` handles building (if needed) and launching the game in one step.

---

## Supported Languages

| Language | Framework | Tests | Status |
| ---------- | -------------- | --------------- | ------ |
| Java | Swing | 18 JUnit | Ready |
| Python | Pygame | 18 pytest | Ready |
| JavaScript | HTML5 Canvas | 38 Jest | Ready |
| TypeScript | Canvas + Types | 57 Vitest | Ready |
| C++ | SDL2 | 26 GoogleTest | Ready |

---

## Suggested Learning Path

The recommended order balances language complexity with conceptual progression:

1. **Python** -- Start here. Dynamic typing and Pygame's minimal boilerplate let you focus on the game-loop concept itself without wrestling with compilation or type systems.
2. **JavaScript** -- Move to the browser. You will see `requestAnimationFrame` replace `while True` loops, and learn how an event-driven runtime changes the game-loop structure.
3. **TypeScript** -- Same Canvas API as JavaScript, but now with static types. Compare the two side by side to understand the practical value of a type system.
4. **Java** -- Introduces OOP class hierarchies, Swing's event-dispatch thread, and a compiled build pipeline (Maven). A clear step up in ceremony.
5. **C++** -- The capstone. Manual memory management, header/source separation, CMake, and SDL2 give you low-level control and responsibility that the other languages abstract away.

After finishing each language, read the corresponding sections in the [Cross-Language Comparison Docs](#cross-language-comparison-docs) to reinforce what you observed.

---

## Cross-Language Comparison Docs

Six documents in `docs/` analyze how all five implementations handle core game-engine topics:

| # | Document | Topic |
| - | -------- | ----- |
| 1 | [docs/01_game_loop.md](docs/01_game_loop.md) | Game Loop Patterns |
| 2 | [docs/02_rendering.md](docs/02_rendering.md) | Drawing and Rendering |
| 3 | [docs/03_input_handling.md](docs/03_input_handling.md) | Keyboard Input Handling |
| 4 | [docs/04_collision_detection.md](docs/04_collision_detection.md) | Collision Detection |
| 5 | [docs/05_ghost_ai.md](docs/05_ghost_ai.md) | Ghost AI Movement |
| 6 | [docs/06_state_management.md](docs/06_state_management.md) | Game State Management |

An architecture decision record is also available at [docs/architecture/decision.md](docs/architecture/decision.md).

---

## Repository Structure

```
Packman/
├── launcher.py                 # TUI menu launcher (curses)
├── setup.sh                    # Prerequisite checker / installer
├── README.md                   # This file
├── PRD.md                      # Product requirements document
│
├── shared/                     # Shared specifications
│   ├── game_constants.json     # Grid size, FPS, scoring, ghost config
│   └── maze_layout.json        # Canonical maze used by all languages
│
├── docs/                       # Cross-language comparison guides
│   ├── 01_game_loop.md
│   ├── 02_rendering.md
│   ├── 03_input_handling.md
│   ├── 04_collision_detection.md
│   ├── 05_ghost_ai.md
│   ├── 06_state_management.md
│   └── architecture/
│       └── decision.md
│
├── java/                       # Java implementation (Swing)
│   ├── README.md
│   ├── run.sh
│   ├── pom.xml
│   └── src/
│
├── python/                     # Python implementation (Pygame)
│   ├── README.md
│   ├── run.sh
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── tests/
│
├── javascript/                 # JavaScript implementation (HTML5 Canvas)
│   ├── README.md
│   ├── run.sh
│   ├── package.json
│   └── index.html
│
├── typescript/                 # TypeScript implementation (Canvas + Types)
│   ├── README.md
│   ├── run.sh
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│
└── cpp/                        # C++ implementation (SDL2)
    ├── README.md
    ├── run.sh
    ├── CMakeLists.txt
    └── tests/
```

---

## Per-Language READMEs

Each language folder has its own README with setup instructions, architecture notes, and annotated code highlights:

- [java/README.md](java/README.md) -- Java / Swing
- [python/README.md](python/README.md) -- Python / Pygame
- [javascript/README.md](javascript/README.md) -- JavaScript / HTML5 Canvas
- [typescript/README.md](typescript/README.md) -- TypeScript / Canvas + Types
- [cpp/README.md](cpp/README.md) -- C++ / SDL2

---

## Game Specifications

All five implementations share these parameters (defined in [`shared/game_constants.json`](shared/game_constants.json)):

| Property | Value |
| -------- | ----- |
| Grid dimensions | 40 columns x 30 rows |
| Tile size | 20 px |
| Window size | 800 x 600 px |
| Frame rate | 60 FPS |
| Pellet score | 10 points each |
| Ghost count | 4 (Blinky, Pinky, Inky, Clyde) |
| Ghost move interval | Every 20 frames |
| Pacman start position | (5, 5) |
| Controls | Arrow keys |
| Win condition | Collect all pellets |
| Lose condition | Collide with any ghost |

The maze layout is stored in [`shared/maze_layout.json`](shared/maze_layout.json) and loaded identically by every implementation.

---

## Contributing

Contributions are welcome. To keep the educational value consistent:

1. **All five languages must stay in sync.** A gameplay change (new ghost behavior, new power-up, etc.) should be implemented across all five languages.
2. **Tests must pass.** Run each language's test suite before submitting a PR.
3. **Update the comparison docs.** If your change affects one of the six documented topics, update the corresponding `docs/` file to cover the new behavior in every language.

## License

This project is provided for educational purposes. See individual language directories for any framework-specific license requirements.
