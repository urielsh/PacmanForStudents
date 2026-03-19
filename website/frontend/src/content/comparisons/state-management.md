---
title: "Game State Management"
description: "Data ownership, encapsulation patterns, access modifiers, and logic-rendering separation."
order: 6
---

# Game State Management -- Cross-Language Comparison

## Introduction

Game state encompasses everything that defines the current snapshot of a game: entity positions, the score, whether the game is over, the maze layout, and which pellets have been eaten. How this state is organized, accessed, and protected varies significantly across programming paradigms.

---

## State Ownership

All five follow the same layered model, but **who owns the entities** differs:

| Language | Owner | Style |
|---|---|---|
| Java | Split: GamePanel owns entities, GameLogic owns maze+score | Divided ownership |
| Python | Module-level (`main()`) | Most flexible, least encapsulated |
| JavaScript | GameLogic owns everything | Cleanest model |
| TypeScript | GameLogic owns everything | Cleanest model |
| C++ | GameLogic owns everything (value semantics) | Cleanest model |

---

## Encapsulation

| Language | Enforcement | Can be Bypassed? |
|---|---|---|
| Java | Compile-time + runtime | Yes (reflection) |
| Python | Convention only (`_` prefix) | Yes (direct access) |
| JavaScript | Convention only (`_` prefix) | Yes (direct access) |
| TypeScript | Compile-time only | Yes (erased at runtime) |
| C++ | Compile-time + link-time | No (without UB) |

---

## Logic-Rendering Separation

A consistent principle across all five: **entity classes have zero rendering imports.** The rendering layer reads state through getters/properties. You could swap the rendering layer without modifying any game logic code.

---

## Key Takeaways

1. **Centralized state ownership produces cleaner architecture.** The JS/TS/C++ approach is most cohesive.
2. **Encapsulation strength varies, but the pattern is universal.** Every implementation uses private-ish fields with public getters.
3. **Value semantics in C++ demand extra care.** The `auto&` requirement in range-for loops and `const&` parameters are consequences of C++'s value-by-default model.
