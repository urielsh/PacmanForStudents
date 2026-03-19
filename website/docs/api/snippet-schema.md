# CodeSnippet Schema

> API contract for the code comparison widget's data model.
> Version: 1.0 | Status: Draft

## Overview

The `CodeSnippet` interface represents a single extracted code fragment from one of the five Packman language implementations. Snippets are produced at build time by a static extraction script and consumed by the frontend `CodeCompare` widget to render side-by-side, syntax-highlighted, annotated code blocks with cross-language line linking.

---

## TypeScript Interface

```typescript
/**
 * Supported languages in the Packman project.
 * Each maps to a top-level directory in the repository.
 */
type PackmanLanguage = 'java' | 'python' | 'javascript' | 'typescript' | 'cpp';

/**
 * Educational concept categories that align with the six annotated
 * concepts defined in the PRD (Section 4.3, FR-20).
 */
type GameConcept =
  | 'game-loop'
  | 'rendering'
  | 'input-handling'
  | 'collision-detection'
  | 'ghost-ai'
  | 'state-management';

/**
 * A single code snippet extracted from a Packman source file.
 * Produced at build time; consumed by the CodeCompare widget.
 */
interface CodeSnippet {
  /** Which language implementation this snippet comes from. */
  language: PackmanLanguage;

  /**
   * The educational concept this snippet illustrates.
   * Used to group snippets across languages for side-by-side comparison.
   */
  concept: GameConcept;

  /**
   * Path to the source file, relative to the repository root.
   * Examples: 'javascript/ghost.js', 'java/src/main/java/com/packman/Ghost.java'
   */
  filePath: string;

  /**
   * 1-based line number where the snippet begins in the source file.
   * Inclusive. Used for "View in GitHub" deep links.
   */
  startLine: number;

  /**
   * 1-based line number where the snippet ends in the source file.
   * Inclusive. Must be >= startLine.
   */
  endLine: number;

  /**
   * Raw source code text extracted from filePath between startLine
   * and endLine (inclusive). Leading common indentation is stripped
   * (dedented) so the snippet renders cleanly in the widget.
   */
  code: string;

  /**
   * Pre-rendered HTML produced by Shiki at build time.
   * Uses the theme configured in the build script (default: 'github-dark').
   * The widget renders this directly via dangerouslySetInnerHTML — the
   * build script is the trusted source, so no runtime sanitization is needed.
   */
  highlightedHtml: string;

  /**
   * Educational annotations extracted from EDUCATIONAL NOTE comment blocks
   * in the source file. Each entry is the full text content of one
   * annotation block (header + body + KEY CONCEPT), with comment
   * delimiters and decoration lines removed.
   *
   * Extraction regex targets blocks matching:
   *   // EDUCATIONAL NOTE: <title>
   *   // <body lines...>
   *   // KEY CONCEPT: <summary>
   *
   * Empty array if no annotations exist within the startLine..endLine range.
   */
  annotations: string[];

  /**
   * Maps from a target language to an array of 1-based line numbers
   * in THAT language's equivalent snippet that correspond to lines
   * in THIS snippet. Used by the widget to highlight matching lines
   * when the user hovers or clicks a line in one language panel.
   *
   * Keys are PackmanLanguage values (excluding this snippet's own language).
   * Values are arrays of line numbers (1-based, relative to the target
   * snippet's startLine, not the full file).
   *
   * Example: if this snippet is the JavaScript game loop (lines 275-307
   * of game.js), correspondingLines might map 'python' -> [45, 46, 47]
   * to indicate that lines 45-47 of the Python game loop snippet
   * implement the same logic.
   */
  correspondingLines: Record<string, number[]>;
}
```

---

## Example JSON Payloads

### Example 1: JavaScript Ghost AI snippet

```json
{
  "language": "javascript",
  "concept": "ghost-ai",
  "filePath": "javascript/ghost.js",
  "startLine": 71,
  "endLine": 84,
  "code": "update(maze) {\n    this._moveCounter++;\n    if (this._moveCounter % GHOST_MOVE_INTERVAL_FRAMES === 0) {\n        const dirIndex = Math.floor(Math.random() * 4);\n        const [dx, dy] = DIRECTIONS[dirIndex];\n        const newX = this._gridX + dx;\n        const newY = this._gridY + dy;\n\n        if (!maze.isWall(newX, newY)) {\n            this._gridX = newX;\n            this._gridY = newY;\n        }\n    }\n}",
  "highlightedHtml": "<pre class=\"shiki github-dark\" style=\"background-color:#24292e\"><code><span class=\"line\"><span style=\"color:#B392F0\">update</span><span style=\"color:#E1E4E8\">(</span><span style=\"color:#FFAB70\">maze</span><span style=\"color:#E1E4E8\">) {</span></span>\n...</code></pre>",
  "annotations": [
    "Ghost AI\nThis is a \"random walk\" AI: the ghost picks one of four directions at random and moves there if the tile is not a wall. If the chosen direction IS a wall, the ghost simply stays put for that interval. This is the simplest possible ghost AI \u2014 no pathfinding, no chase logic, no state machine (scatter/chase/frightened modes).\n\nCompare with:\n  Java \u2192 Uses Random.nextInt(4) for the same random selection; Java's strong typing requires explicit casting but the algorithm is identical.\n  Python \u2192 Uses random.randint(0, 3) or random.choice(); Python's destructuring (dx, dy = DIRECTIONS[i]) mirrors the JS destructuring const [dx, dy] = DIRECTIONS[dirIndex].\n\nKEY CONCEPT: JavaScript uses Math.floor(Math.random() * 4) because Math.random() returns a float in [0, 1). There is no built-in randint() like Python or nextInt(n) like Java \u2014 you must scale and floor manually (or use a library)."
  ],
  "correspondingLines": {
    "java": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    "python": [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "typescript": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    "cpp": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
}
```

### Example 2: Python collision detection snippet

```json
{
  "language": "python",
  "concept": "collision-detection",
  "filePath": "python/game_logic.py",
  "startLine": 52,
  "endLine": 68,
  "code": "def _check_collisions(self):\n    pac_x = self._pacman.grid_x\n    pac_y = self._pacman.grid_y\n\n    # Pellet collection\n    if self._maze.has_pellet(pac_x, pac_y):\n        self._maze.remove_pellet(pac_x, pac_y)\n        self._score += PELLET_POINTS\n\n    # Ghost collision\n    for ghost in self._ghosts:\n        if pac_x == ghost.grid_x and pac_y == ghost.grid_y:\n            self._game_over = True",
  "highlightedHtml": "<pre class=\"shiki github-dark\" style=\"background-color:#24292e\"><code>...</code></pre>",
  "annotations": [
    "Collision Detection\nGrid-based collision detection is the simplest possible approach: two entities collide if and only if they occupy the same (x, y) tile. No bounding boxes, no hitboxes, no pixel-perfect checks \u2014 just integer equality.\n\nKEY CONCEPT: Python uses == which works correctly for integer comparison. For grid-based games, this O(ghosts) collision check is far simpler than AABB or circle intersection tests needed in continuous-movement games."
  ],
  "correspondingLines": {
    "java": [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13],
    "javascript": [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13],
    "typescript": [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13],
    "cpp": [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13]
  }
}
```

---

## Build-Time Extraction Script

The `CodeSnippet` data is produced entirely at build time by `website/backend/scripts/extract-snippets.ts`. No runtime parsing or syntax highlighting occurs in the browser.

### Pipeline

```
Source files (java/, python/, javascript/, typescript/, cpp/)
    |
    v
[1. Discovery] -- Glob for source files matching known extensions
    |
    v
[2. Annotation Scan] -- Regex parse EDUCATIONAL NOTE blocks, record line ranges
    |
    v
[3. Concept Tagging] -- Map each annotation's title to a GameConcept enum value
    |
    v
[4. Snippet Extraction] -- Read raw source lines (startLine..endLine), dedent
    |
    v
[5. Shiki Highlighting] -- Run Shiki with 'github-dark' theme, produce HTML
    |
    v
[6. Line Mapping] -- Align corresponding snippets across languages by concept,
                      using heuristic AST diff or manual mapping file
    |
    v
[7. Output] -- Write JSON files to website/backend/data/snippets/
```

### Step Details

**Step 1 -- Discovery.**
The script scans these directories and extensions:
| Directory | Extensions |
|-----------|------------|
| `java/src/main/java/com/packman/` | `.java` |
| `python/` | `.py` |
| `javascript/` | `.js` (excluding `node_modules/`, `*.test.js`) |
| `typescript/src/` | `.ts` |
| `cpp/` | `.cpp`, `.h` |

**Step 2 -- Annotation Scan.**
Each source file is scanned for comment blocks matching:
```
// EDUCATIONAL NOTE: <Title>
```
The block extends from the opening decorator line (`// ===...`) to the closing decorator line. The script records:
- The concept title (e.g., "Ghost AI")
- The start and end line numbers of the surrounding code (the function or block the annotation describes, not the comment itself)
- The full annotation text with comment delimiters stripped

**Step 3 -- Concept Tagging.**
Title-to-concept mapping:
| Annotation Title | `GameConcept` Value |
|-----------------|---------------------|
| Game Loop Timing | `game-loop` |
| Rendering/Drawing | `rendering` |
| Input Handling | `input-handling` |
| Collision Detection | `collision-detection` |
| Ghost AI | `ghost-ai` |
| Object Movement | `state-management` |

**Step 4 -- Snippet Extraction.**
Raw lines are read from the source file. The minimum leading whitespace across all non-empty lines is removed (dedent). Trailing whitespace is trimmed.

**Step 5 -- Shiki Highlighting.**
The `shiki` library (v1.x) is invoked with:
```typescript
const html = await codeToHtml(code, {
  lang: shikiLanguageId, // 'java', 'python', 'javascript', 'typescript', 'cpp'
  theme: 'github-dark',
});
```
The resulting HTML string is stored directly in `highlightedHtml`.

**Step 6 -- Line Mapping.**
For each concept, the script groups snippets by language and builds `correspondingLines` entries. Initial implementation uses a manual mapping file at `website/backend/data/line-mappings.json`. Future versions may use tree-sitter AST matching.

**Step 7 -- Output.**
Each concept produces one JSON file containing an array of `CodeSnippet` objects (one per language):
```
website/backend/data/snippets/
  game-loop.json
  rendering.json
  input-handling.json
  collision-detection.json
  ghost-ai.json
  state-management.json
```

These files are imported by the Astro/Next.js frontend at build time and embedded in the static site.

---

## Validation Rules

| Field | Constraint |
|-------|-----------|
| `language` | Must be one of the five `PackmanLanguage` values |
| `concept` | Must be one of the six `GameConcept` values |
| `filePath` | Must be a relative path from the repo root; file must exist |
| `startLine` | Must be >= 1 |
| `endLine` | Must be >= `startLine` |
| `code` | Must not be empty; must match the content of `filePath` at lines `startLine..endLine` |
| `highlightedHtml` | Must be valid HTML; must start with `<pre` |
| `annotations` | Each entry must be non-empty; array may be empty |
| `correspondingLines` | Keys must be valid `PackmanLanguage` values excluding `language`; values must be non-empty arrays of positive integers |

---

## Versioning

This schema is versioned alongside the website. Breaking changes (field removals, type changes) increment the major version. Additive changes (new optional fields) increment the minor version. The current version is `1.0`.
