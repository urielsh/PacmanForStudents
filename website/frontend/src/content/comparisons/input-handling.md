---
title: "Keyboard Input Handling"
description: "Push vs pull input models, key identifiers, and direction buffering across all five languages."
order: 3
---

# Keyboard Input Handling -- Cross-Language Comparison

## Introduction

Input handling in games involves two challenges: (1) capturing raw keyboard events from the operating system, and (2) translating them into game-meaningful actions. All five Packman implementations use the same logical pattern -- arrow keys set a **buffered direction** that Pacman applies on the next update tick -- but the mechanism for capturing keyboard events differs significantly across frameworks.

---

## Input Models

| Language | Model | Registration |
|---|---|---|
| Java | Push (observer) | `addKeyListener(this)` |
| Python | Pull (polling) | `pygame.event.get()` each frame |
| JavaScript | Push (event listener) | `document.addEventListener` |
| TypeScript | Push (event listener) | `document.addEventListener` |
| C++ | Pull (polling) | `SDL_PollEvent()` each frame |

---

## Key Identifiers

| Language | Type | Example |
|---|---|---|
| Java | Integer codes | `VK_LEFT` |
| Python | Integer codes | `K_LEFT` |
| JavaScript | String names | `'ArrowLeft'` |
| TypeScript | String names | `'ArrowLeft'` |
| C++ | Scancodes | `SDL_SCANCODE_LEFT` |

C++ uses physical scancodes, which means controls work correctly regardless of keyboard layout (QWERTY, AZERTY, Dvorak).

---

## Direction Buffering Pattern

All five implementations use the same direction-buffering strategy. Input sets a "next" direction; the actual direction change happens during `update()` only if the target tile is not a wall. This decouples the timing of user input from the timing of the game simulation.

---

## Key Takeaways

1. **Push vs. Pull is a framework choice, not a language limitation.** Both approaches work; the polling model gives explicit control over when input is processed.
2. **Direction buffering is universally necessary.** All five store the desired direction separately from the active direction.
3. **Scancodes vs. key codes matter for accessibility.** C++ uses physical scancodes for layout-independent controls.
