package com.packman;

import javax.swing.*;

// ═══════════════════════════════════════════════════════
// EDUCATIONAL NOTE: Application Entry Point & Window Creation
// ═══════════════════════════════════════════════════════
// This is the main class that bootstraps the game. In Java Swing,
// the entry point creates a JFrame (window) and adds a JPanel
// (drawing surface) to it. The game logic lives in GamePanel.
//
// Compare with:
//   Python (Pygame) → pygame.init(); screen = pygame.display.set_mode((w,h))
//   JavaScript (Canvas) → document.getElementById('canvas') in HTML, no main()
//   TypeScript → Same as JS but with typed canvas: HTMLCanvasElement
//   C++ (SDL2) → SDL_Init(); SDL_CreateWindow(); SDL_CreateRenderer()
//
// KEY CONCEPT: Every game needs a window/surface to draw on. Each
// framework has its own initialization ritual, but the pattern is
// always: create window → attach drawing surface → start loop.
// ═══════════════════════════════════════════════════════
public class PacmanGame {
    public static void main(String[] args) {
        // ═══════════════════════════════════════════════════════
        // EDUCATIONAL NOTE: Thread Safety with SwingUtilities
        // ═══════════════════════════════════════════════════════
        // SwingUtilities.invokeLater() ensures all UI creation happens
        // on the Event Dispatch Thread (EDT). Swing is NOT thread-safe,
        // so all GUI operations must happen on the EDT.
        //
        // Compare with:
        //   Python (Pygame) → Not needed; Pygame is single-threaded
        //   JavaScript (Canvas) → Not needed; JS is single-threaded (event loop)
        //   TypeScript → Same as JS; single-threaded event loop
        //   C++ (SDL2) → Not needed if all SDL calls are on the main thread
        //
        // KEY CONCEPT: Java Swing requires explicit thread management
        // for GUI updates. Most other game frameworks avoid this by
        // being inherently single-threaded or handling it internally.
        // ═══════════════════════════════════════════════════════
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Pacman Game");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setResizable(false);

            // ═══════════════════════════════════════════════════════
            // EDUCATIONAL NOTE: Component Composition Pattern
            // ═══════════════════════════════════════════════════════
            // The GamePanel (a JPanel subclass) is added to the JFrame.
            // This separates window management from game rendering.
            // pack() sizes the JFrame to fit the panel's preferred size.
            //
            // Compare with:
            //   Python (Pygame) → No separation; the display IS the surface
            //   JavaScript (Canvas) → <canvas> element in DOM, JS draws on it
            //   TypeScript → Same pattern as JS with typed references
            //   C++ (SDL2) → SDL_Window holds SDL_Renderer; similar separation
            //
            // KEY CONCEPT: Separating the window container from the
            // drawing surface is a common pattern that keeps rendering
            // code isolated and testable.
            // ═══════════════════════════════════════════════════════
            GamePanel gamePanel = new GamePanel();
            frame.add(gamePanel);

            frame.pack();
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);

            // ═══════════════════════════════════════════════════════
            // EDUCATIONAL NOTE: Game Lifecycle Start
            // ═══════════════════════════════════════════════════════
            // startGame() kicks off the game loop AFTER the window is
            // visible. Order matters: the panel must be displayable
            // before we start rendering frames to it.
            //
            // Compare with:
            //   Python (Pygame) → while True: loop starts after display.set_mode()
            //   JavaScript (Canvas) → requestAnimationFrame(gameLoop) after DOM ready
            //   TypeScript → Same as JS; typically called after window.onload
            //   C++ (SDL2) → Main while loop starts after SDL_CreateRenderer()
            //
            // KEY CONCEPT: Always initialize your display/window BEFORE
            // starting the game loop. Drawing to a non-existent surface
            // causes crashes or silent failures.
            // ═══════════════════════════════════════════════════════
            gamePanel.startGame();
        });
    }
}
