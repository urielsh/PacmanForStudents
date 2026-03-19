# PostMessage Protocol

> API contract for communication between game iframes and the parent website.
> Version: 1.0 | Status: Draft

## Overview

Each Packman language implementation runs inside an `<iframe>` on the educational website. The PostMessage protocol defines the structured messages exchanged between the game iframe (child) and the parent website (host). This enables the website to display live score updates, react to game-over events, and send control commands without tight coupling to any specific game implementation.

All messages are sent via `window.postMessage()` and received via the `message` event. Messages are plain JSON-serializable objects with a `type` discriminator field.

---

## TypeScript Types

```typescript
// ============================================================
// Game -> Parent messages
// ============================================================

/**
 * Sent by the game on every score change (pellet collected).
 * The parent uses this to update a live scoreboard outside the iframe.
 */
interface ScoreUpdateMessage {
  type: 'score-update';

  /** Current total score. Non-negative integer. */
  score: number;

  /**
   * Number of pellets remaining on the board.
   * When this reaches 0, the player has won (all pellets collected).
   */
  pelletsRemaining: number;
}

/**
 * Sent by the game when it ends, either by ghost collision (loss)
 * or by collecting all pellets (win).
 */
interface GameOverMessage {
  type: 'game-over';

  /** True if the player collected all pellets; false if caught by a ghost. */
  won: boolean;

  /** The final score at the moment the game ended. Non-negative integer. */
  finalScore: number;
}

/**
 * Sent by the game once its initialization is complete and it is
 * ready to accept input and render frames. The parent should not
 * display the iframe or enable controls until this message arrives.
 */
interface GameReadyMessage {
  type: 'game-ready';

  /**
   * Which language implementation is running inside the iframe.
   * Matches the PackmanLanguage type from snippet-schema.md.
   */
  language: 'java' | 'python' | 'javascript' | 'typescript' | 'cpp';
}

/** Union of all messages the game iframe can send to the parent. */
type GameToParentMessage = ScoreUpdateMessage | GameOverMessage | GameReadyMessage;

// ============================================================
// Parent -> Game messages
// ============================================================

/**
 * Sent by the parent to request the game restart from the initial state.
 * The game must reset all state (score, pellets, positions, gameOver flag)
 * and send a new 'game-ready' message once reinitialized.
 */
interface RestartMessage {
  type: 'restart';
}

/** Union of all messages the parent can send to the game iframe. */
type ParentToGameMessage = RestartMessage;

// ============================================================
// Discriminated union helper (for exhaustive switch/case)
// ============================================================

type PackmanPostMessage = GameToParentMessage | ParentToGameMessage;
```

---

## Message Flow Diagram

```
Parent (website)                           Game (iframe)
     |                                          |
     |          <iframe src="...">              |
     |----------------------------------------->|
     |                                          |
     |                          [init complete] |
     |      { type: 'game-ready', language }    |
     |<-----------------------------------------|
     |                                          |
     |  [show iframe, enable restart button]    |
     |                                          |
     |                     [pellet collected]   |
     |  { type: 'score-update', score, ... }    |
     |<-----------------------------------------|
     |                                          |
     |                     [pellet collected]   |
     |  { type: 'score-update', score, ... }    |
     |<-----------------------------------------|
     |                                          |
     |                    [ghost catches pac]   |
     |  { type: 'game-over', won, finalScore }  |
     |<-----------------------------------------|
     |                                          |
     |  [user clicks "Play Again"]              |
     |         { type: 'restart' }              |
     |----------------------------------------->|
     |                                          |
     |                          [re-init done]  |
     |      { type: 'game-ready', language }    |
     |<-----------------------------------------|
```

---

## Example Payloads

### game-ready

```json
{
  "type": "game-ready",
  "language": "javascript"
}
```

### score-update

```json
{
  "type": "score-update",
  "score": 30,
  "pelletsRemaining": 1057
}
```

### game-over (loss)

```json
{
  "type": "game-over",
  "won": false,
  "finalScore": 250
}
```

### game-over (win)

```json
{
  "type": "game-over",
  "won": true,
  "finalScore": 10600
}
```

### restart

```json
{
  "type": "restart"
}
```

---

## Integration Guide

### Adding PostMessage to the JavaScript Game

The JavaScript game (`javascript/game.js`) needs three additions to participate in the protocol. These changes are minimal and do not alter game logic.

**1. Send `game-ready` after initialization:**

Add at the bottom of the IIFE, just before the first `requestAnimationFrame(gameLoop)` call:

```javascript
// --- PostMessage: notify parent that the game is ready ---
if (window.parent !== window) {
    window.parent.postMessage({ type: 'game-ready', language: 'javascript' }, '*');
}
```

**2. Send `score-update` when a pellet is collected:**

In `game_logic.js`, inside `_checkCollisions()`, after the score increment:

```javascript
// Pellet collection
if (this._maze.hasPellet(pacX, pacY)) {
    this._maze.removePellet(pacX, pacY);
    this._score += PELLET_POINTS;

    // PostMessage: notify parent of score change
    if (typeof window !== 'undefined' && window.parent !== window) {
        window.parent.postMessage({
            type: 'score-update',
            score: this._score,
            pelletsRemaining: this._maze.pelletCount,
        }, '*');
    }
}
```

> Note: This requires adding a `pelletCount` getter to the `Maze` class that counts remaining `true` values in the pellets array.

**3. Send `game-over` when the game ends:**

In `game_logic.js`, at the point where `_gameOver` is set to `true`:

```javascript
// Ghost collision
for (const ghost of this._ghosts) {
    if (pacX === ghost.gridX && pacY === ghost.gridY) {
        this._gameOver = true;

        // PostMessage: notify parent of game over
        if (typeof window !== 'undefined' && window.parent !== window) {
            window.parent.postMessage({
                type: 'game-over',
                won: false,
                finalScore: this._score,
            }, '*');
        }
    }
}
```

**4. Listen for `restart` from the parent:**

In `game.js`, add a message listener inside the IIFE:

```javascript
// --- PostMessage: listen for restart command from parent ---
window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'restart') {
        // Re-initialize all game state
        gameLogic.reset();  // requires adding a reset() method to GameLogic
        running = true;
        lastFrameTime = 0;
        requestAnimationFrame(gameLoop);

        // Signal readiness again
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'game-ready', language: 'javascript' }, '*');
        }
    }
});
```

### Listening in GameEmbed.tsx (Parent Website)

The parent website uses a `GameEmbed` React component to host the iframe and process incoming messages.

```tsx
import { useEffect, useRef, useState, useCallback } from 'react';

interface GameEmbedProps {
  /** Which language game to load. Determines the iframe src. */
  language: 'java' | 'python' | 'javascript' | 'typescript' | 'cpp';
  /** Called whenever the game reports a score change. */
  onScoreUpdate?: (score: number, pelletsRemaining: number) => void;
  /** Called when the game ends. */
  onGameOver?: (won: boolean, finalScore: number) => void;
}

/**
 * Maps language identifiers to iframe source paths.
 * Java and Python run via WASM builds; JS/TS run natively.
 */
const GAME_SOURCES: Record<string, string> = {
  java: '/game/java/index.html',
  python: '/game/python/index.html',
  javascript: '/game/js/index.html',
  typescript: '/game/ts/index.html',
  cpp: '/game/cpp/index.html',
};

export function GameEmbed({ language, onScoreUpdate, onGameOver }: GameEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  // --- Listen for messages from the game iframe ---
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Security: verify the message comes from our own iframe
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
        return;
      }

      const data = event.data;
      if (!data || typeof data.type !== 'string') return;

      switch (data.type) {
        case 'game-ready':
          setReady(true);
          break;

        case 'score-update':
          onScoreUpdate?.(data.score, data.pelletsRemaining);
          break;

        case 'game-over':
          onGameOver?.(data.won, data.finalScore);
          break;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onScoreUpdate, onGameOver]);

  // --- Send restart command to the game iframe ---
  const restart = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      setReady(false);
      iframeRef.current.contentWindow.postMessage({ type: 'restart' }, '*');
    }
  }, []);

  return (
    <div className="game-embed">
      {!ready && <div className="game-loading">Loading game...</div>}
      <iframe
        ref={iframeRef}
        src={GAME_SOURCES[language]}
        width={800}
        height={600}
        style={{
          border: 'none',
          display: ready ? 'block' : 'none',
        }}
        title={`Packman - ${language}`}
        sandbox="allow-scripts allow-same-origin"
      />
      <button onClick={restart} disabled={!ready}>
        Restart
      </button>
    </div>
  );
}
```

---

## Security Considerations

### Origin Validation

In production, replace the wildcard `'*'` target origin with the actual website origin:

```javascript
// Game side (inside iframe)
window.parent.postMessage(message, 'https://packman.example.com');

// Parent side (GameEmbed.tsx)
if (event.origin !== 'https://packman.example.com') return;
```

### Iframe Sandbox

The `<iframe>` uses `sandbox="allow-scripts allow-same-origin"`. This:
- Allows the game JavaScript to execute (`allow-scripts`)
- Allows same-origin access for postMessage source verification (`allow-same-origin`)
- Blocks popups, form submission, top navigation, and other capabilities by default

### Message Validation

Both sides must validate incoming messages before acting on them:
- Check that `event.data` is an object with a string `type` field
- Check that `event.source` matches the expected iframe/parent window
- Ignore unknown `type` values silently (forward compatibility)

---

## Applicability to Other Languages

The PostMessage integration described above for JavaScript applies equally to all five language implementations, with language-specific adaptations:

| Language | PostMessage Mechanism |
|----------|-----------------------|
| **JavaScript** | Native `window.parent.postMessage()` as shown above |
| **TypeScript** | Same API; types provide compile-time safety for message shapes |
| **Java** | WASM build (via CheerpJ or TeaVM) exposes a JS interop layer; call `postMessage` through the interop bridge |
| **Python** | WASM build (via Pyodide) provides `js.window.parent.postMessage()` from Python code |
| **C++** | WASM build (via Emscripten) uses `EM_ASM` or `emscripten_run_script` to call `window.parent.postMessage()` |

Each language's `run.sh` for local development does not use iframes, so PostMessage calls should be guarded with `window.parent !== window` checks to avoid errors when running standalone.

---

## Versioning

This protocol is versioned alongside the website. New message types can be added without breaking existing consumers (additive change, minor version bump). Changing the shape of an existing message type is a breaking change (major version bump). The current version is `1.0`.
