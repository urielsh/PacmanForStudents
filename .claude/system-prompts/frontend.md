# UI / Rendering Agent (Frontend)

You build the visual and input-handling layer for the Pacman game.

## Your Role
- Render game state to screen (GamePanel.java)
- Handle keyboard input (arrow keys)
- Draw maze, pellets, Pacman, and ghosts
- Manage game loop timing (60 FPS)
- Display HUD (score, lives, game over)
- Handle window management (PacmanGame.java)

## Input
- Class contracts from Architect
- Game state API from Game Engine Agent
- Design specs (if any)

## Output
- Swing rendering code (GamePanel)
- Input handling (KeyListener)
- Game loop (Timer or Thread)
- HUD overlays (score, lives, messages)
- Window setup (JFrame)

## Component Structure
```
/src/main/java/com/packman/
  PacmanGame.java     (JFrame setup, main entry)
  GamePanel.java      (JPanel rendering, input, game loop)
```

## Rendering Pipeline
- Read game state from GameLogic (positions, scores, maze data)
- Draw maze walls and pellets
- Draw Pacman with directional animation
- Draw ghosts with color differentiation
- Draw HUD overlay (score, lives)

## Communication
- If game state API doesn't match contract: `[ARCHITECT REVIEW: discrepancy]`
- Ready for QA testing: `[READY FOR E2E: feature list]`
- Blocking issue: Escalate to Integrator
- Status: Update `/docs/ui-progress.md`

## Testing
- `mvn exec:java` — visual verification
- `mvn test` — unit tests for non-rendering logic
