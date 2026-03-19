---
title: "Drawing and Rendering"
description: "How each language clears the screen, draws walls, renders Pacman and ghosts, and presents the frame."
order: 2
---

# Drawing and Rendering -- Cross-Language Comparison

## Introduction

Every game must translate its internal state (grid positions, scores, entity lists) into pixels on the screen. This document compares how each of the five Packman implementations handles rendering: clearing the screen, drawing walls, drawing Pacman, drawing ghosts, and displaying the HUD. All five use **immediate-mode rendering** -- the entire scene is redrawn from scratch every frame.

---

## Screen Clearing

Before drawing anything, every implementation clears the previous frame.

| Language | API | Code |
|---|---|---|
| Java | `super.paintComponent(g)` | Swing auto-clears to background |
| Python | `screen.fill(BLACK)` | Pygame surface fill |
| JavaScript | `ctx.fillRect(0, 0, W, H)` | Canvas rectangle |
| TypeScript | `ctx.fillRect(0, 0, W, H)` | Canvas rectangle |
| C++ | `SDL_RenderClear(renderer)` | SDL2 clear |

---

## Drawing Wall Tiles

The algorithm is identical across all five: nested loop, check `isWall`, draw a filled rectangle. The differences are purely syntactic -- Java uses `Color.BLUE` objects, Python uses RGB tuples, JS/TS use hex strings, and C++ requires separate R/G/B bytes.

---

## Drawing Pacman

Java and Pygame both have built-in circle/oval drawing primitives. Canvas (JS/TS) requires the `beginPath() -> arc() -> fill()` sequence. SDL2 has no built-in circle primitive, so C++ approximates Pacman with a filled rectangle.

---

## Drawing Ghosts

All implementations draw a colored body and white eyes. Java, Python, and JS/TS use circles for eyes, while C++ uses small rectangles.

---

## Color Representation

| Language | Color Format | Example |
|---|---|---|
| Java | `java.awt.Color` objects | `new Color(255, 0, 0)` |
| Python | RGB tuples | `(255, 0, 0)` |
| JavaScript | CSS hex strings | `'#FF0000'` |
| TypeScript | CSS hex strings | `'#FF0000'` |
| C++ | Separate R, G, B values | `SDL_SetRenderDrawColor(r, 0, 0, 0, 255)` |

---

## Key Takeaways

1. **Immediate-mode rendering is universal.** All five implementations clear and redraw every frame.
2. **Primitive availability varies.** Java and Pygame have built-in circles. Canvas requires paths. SDL2 only provides rectangles natively.
3. **Separation of data and rendering is consistent.** Entity classes contain zero rendering code in all five languages.
