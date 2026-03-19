# Source of truth: shared/game_constants.json

# ═══════════════════════════════════════════════════════
# EDUCATIONAL NOTE: Game Loop Timing
# ═══════════════════════════════════════════════════════
# This file is the ENTRY POINT -- equivalent to Java's main() method.
# Python scripts run top-to-bottom with no compilation step: just
# type "python main.py" and the game starts. No javac, no .class
# files, no JVM startup. This rapid iteration cycle is one of
# Python's biggest advantages for learning and prototyping.
#
# Compare with:
#   Java (Swing) → public static void main(String[] args) { ... }
#   Java requires a class wrapper, public static modifiers, and
#   compilation before running. Python's if __name__ == "__main__"
#   guard (at the bottom) serves the same purpose more simply.
#
# KEY CONCEPT: Python's "no compile" workflow lets you edit code
# and see results instantly -- ideal for game development iteration.
# ═══════════════════════════════════════════════════════

import pygame

from game_panel import GamePanel, FPS
from game_logic import GameLogic
from pacman import Pacman
from ghost import Ghost

TILE_SIZE = 20


def main() -> None:
    """Entry point: initialise pygame, create game objects, run loop."""
    pygame.init()

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Rendering/Drawing
    # ═══════════════════════════════════════════════════════
    # pygame.init() initializes ALL pygame subsystems (video, audio,
    # fonts, etc.) in a single call. GamePanel then creates the
    # display surface. Notice how objects are created with simple
    # constructor calls -- no "new" keyword needed in Python.
    #
    # Compare with:
    #   Java (Swing) → JFrame frame = new JFrame(); requires "new"
    #   keyword, and you must manually call setSize(), setVisible(),
    #   setDefaultCloseOperation(). Pygame bundles this into
    #   pygame.display.set_mode() inside GamePanel.__init__().
    #
    # KEY CONCEPT: Python omits the "new" keyword -- calling a
    # class name like GamePanel() directly creates an instance.
    # ═══════════════════════════════════════════════════════

    panel = GamePanel()
    game_logic = GameLogic()
    pacman = Pacman(5, 5, TILE_SIZE)

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Ghost AI
    # ═══════════════════════════════════════════════════════
    # Four ghosts are created with different colors but IDENTICAL
    # AI behavior (random movement). In classic Pac-Man, each ghost
    # has a unique personality (Blinky chases, Pinky ambushes, etc.).
    # Here, all four use the same random strategy from ghost.py.
    # Python's list literal makes creating all four objects concise.
    #
    # Compare with:
    #   Java (Swing) → Ghost[] ghosts = { new Ghost(10,10,...), ... };
    #   Java arrays are fixed-size and require type declarations.
    #   Python lists are dynamic, grow/shrink freely, and the
    #   list[Ghost] type hint is optional documentation only.
    #
    # KEY CONCEPT: Python lists are dynamic arrays -- no fixed size,
    # no type declaration required, and they support iteration,
    # slicing, and comprehensions out of the box.
    # ═══════════════════════════════════════════════════════

    # Ghost positions and colours match the Java reference (GamePanel.java)
    ghosts: list[Ghost] = [
        Ghost(10, 10, TILE_SIZE, 255, 0, 0),      # Blinky  (red)
        Ghost(10, 11, TILE_SIZE, 255, 184, 255),   # Pinky   (pink)
        Ghost(11, 10, TILE_SIZE, 0, 255, 255),     # Inky    (cyan)
        Ghost(11, 11, TILE_SIZE, 255, 0, 255),     # Clyde   (magenta)
    ]

    # ═══════════════════════════════════════════════════════
    # EDUCATIONAL NOTE: Game Loop Timing
    # ═══════════════════════════════════════════════════════
    # The game loop follows the classic pattern:
    #   1. handle_input()  -- read keyboard events
    #   2. update()        -- move entities, check collisions
    #   3. draw()          -- render the frame
    #   4. clock.tick(FPS) -- wait to maintain 60 frames/second
    #
    # clock.tick(60) sleeps just long enough to cap the frame rate.
    # Without it, the loop would run thousands of times per second,
    # wasting CPU and making the game unplayably fast.
    #
    # Compare with:
    #   Java (Swing) → new Timer(1000/60, actionListener).start()
    #   Java uses a Timer that fires every ~16ms. Python's while
    #   loop + clock.tick() is more explicit: you SEE the loop,
    #   you SEE the ordering, you control everything directly.
    #
    # KEY CONCEPT: Input -> Update -> Draw -> Wait is the universal
    # game loop structure used in virtually every 2D game engine.
    # ═══════════════════════════════════════════════════════

    # ---- Main game loop ----
    while panel.running:
        panel.handle_input(pacman)
        panel.update(pacman, ghosts, game_logic)
        panel.draw(panel.screen, pacman, ghosts, game_logic)
        panel.clock.tick(FPS)

    pygame.quit()


# ═══════════════════════════════════════════════════════
# EDUCATIONAL NOTE: Input Handling
# ═══════════════════════════════════════════════════════
# The if __name__ == "__main__" guard ensures main() only runs
# when this file is executed directly (python main.py), NOT when
# it is imported as a module. This is a Python idiom with no
# Java equivalent -- Java's main() is always an explicit entry
# point declared with public static void main(String[] args).
#
# Compare with:
#   Java (Swing) → No equivalent needed; the JVM finds main()
#   by class name. Python needs this guard because any .py file
#   can be both a runnable script AND an importable module.
#
# KEY CONCEPT: __name__ == "__main__" is Python's way of saying
# "only run this code if I am the script the user launched."
# ═══════════════════════════════════════════════════════

if __name__ == "__main__":
    main()
