# pygbag-compatible async adaptation of python/main.py
# This file replaces main.py when building for the web via pygbag.
# The key changes are:
#   1. Import asyncio
#   2. Make main() async
#   3. Add `await asyncio.sleep(0)` at the end of each game loop iteration
#      so the browser event loop can process frames and input events.
#   4. Use asyncio.run(main()) as the entry point

import asyncio
import pygame

from game_panel import GamePanel, FPS
from game_logic import GameLogic
from pacman import Pacman
from ghost import Ghost

TILE_SIZE = 20


async def main() -> None:
    """Entry point: initialise pygame, create game objects, run async loop."""
    pygame.init()

    panel = GamePanel()
    game_logic = GameLogic()
    pacman = Pacman(5, 5, TILE_SIZE)

    # Ghost positions and colours match the Java reference (GamePanel.java)
    ghosts: list[Ghost] = [
        Ghost(10, 10, TILE_SIZE, 255, 0, 0),      # Blinky  (red)
        Ghost(10, 11, TILE_SIZE, 255, 184, 255),   # Pinky   (pink)
        Ghost(11, 10, TILE_SIZE, 0, 255, 255),     # Inky    (cyan)
        Ghost(11, 11, TILE_SIZE, 255, 0, 255),     # Clyde   (magenta)
    ]

    # ---- Main game loop (async for pygbag) ----
    while panel.running:
        panel.handle_input(pacman)
        panel.update(pacman, ghosts, game_logic)
        panel.draw(panel.screen, pacman, ghosts, game_logic)
        panel.clock.tick(FPS)
        # Yield control to the browser event loop. pygbag requires this
        # await at the end of every iteration so that the browser can
        # render the canvas and process user input between frames.
        await asyncio.sleep(0)

    pygame.quit()


asyncio.run(main())
