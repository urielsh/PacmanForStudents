---
title: "Collision Detection"
description: "Grid-based wall checking, pellet collection, and ghost collision -- identical algorithms, different syntax."
order: 4
---

# Collision Detection -- Cross-Language Comparison

## Introduction

Collision detection in Packman answers two questions every frame: (1) "Can this entity move to the target tile?" (wall collision), and (2) "Is Pacman occupying the same tile as a ghost or pellet?" (entity collision). Because all movement is grid-based, collision detection reduces to simple integer comparisons -- no bounding boxes, no distance calculations, no floating-point math.

---

## Wall Checking -- `isWall()`

Every entity calls the maze's `isWall()` method before moving. The implementation is virtually identical across all five languages. The critical design decision -- treating out-of-bounds coordinates as walls -- is shared by all.

The consequence of NOT having bounds checks differs by language:
- **Java** throws `ArrayIndexOutOfBoundsException`
- **Python** throws `IndexError` (or silently wraps with negative indices)
- **JavaScript** returns `undefined` (falsy), allowing movement through boundaries
- **C++** triggers **undefined behavior** -- the most dangerous outcome

---

## Pellet Collection

When Pacman's grid position matches a pellet, the pellet is removed and the score increases. All five implementations are functionally identical: check for pellet at current position, remove it, add score.

---

## Ghost Collision

If any ghost occupies the same tile as Pacman, the game ends. This is a simple integer equality check: `if (ax == bx && ay == by)`.

---

## Key Takeaways

1. **Grid-based collision is trivially simple.** No bounding boxes, no circle intersection tests, no floating-point edge cases.
2. **Bounds checking prevents language-specific failure modes.** The consequences of omitting it vary from clean exceptions to undefined behavior.
3. **The "look before you leap" pattern is universal.** All five check the destination tile before moving.
