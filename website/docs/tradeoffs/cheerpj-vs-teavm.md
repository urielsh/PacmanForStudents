# Tradeoff Analysis: CheerpJ vs TeaVM for Java-in-Browser

**Date:** 2026-03-19
**Status:** Decided
**Decision:** CheerpJ

---

## Context

The Packman Java implementation uses Swing (`JFrame`, `JPanel`, `Graphics2D`, `KeyListener`, `javax.swing.Timer`) for rendering. To run this in the browser, we need a technology that can execute Java bytecode and render the Swing UI to an HTML canvas or DOM element.

Two mature options exist: **CheerpJ** and **TeaVM**.

## Option A: CheerpJ

CheerpJ is a full JVM implementation compiled to WebAssembly. It runs unmodified Java bytecode in the browser, including complete Swing/AWT support rendered to an HTML5 canvas.

### How It Works

1. Load the CheerpJ runtime (~30 MB from their CDN).
2. Point it at the game's `.jar` file (~50 KB).
3. CheerpJ creates a virtual display canvas and runs the Swing application inside it.
4. No changes to any Java source file.

### Pros

| Advantage | Detail |
|---|---|
| **Zero Java code changes** | The existing `GamePanel.java`, `Ghost.java`, `Maze.java`, `Pacman.java`, and `PacmanGame.java` run unmodified. Not a single line of Java needs to change. |
| **Full Swing fidelity** | `Graphics2D` rendering, `KeyListener` input, `javax.swing.Timer` game loop -- all work exactly as they do on desktop. |
| **Educational transparency** | Students see the exact same Swing code running on desktop and in browser. The lesson is "this is real Swing" not "this is a Canvas port." |
| **Minimal integration code** | ~15 lines of HTML/JS to initialize CheerpJ and point it at the JAR. |
| **CDN-hosted runtime** | The 30 MB runtime is served from Leaning Technologies' CDN with edge caching, HTTP/2, and Brotli compression. We pay zero bandwidth for it. |
| **Active maintenance** | CheerpJ 3.x is actively developed and regularly updated. |

### Cons

| Disadvantage | Detail |
|---|---|
| **30 MB runtime download** | First-time visitors must download ~30 MB (compressed to ~10-12 MB with Brotli). On 4G this takes ~10-15 seconds. |
| **Third-party CDN dependency** | If Leaning Technologies' CDN goes down, the Java version breaks. No self-hosting option for the runtime. |
| **Performance overhead** | JVM interpretation in WASM adds ~3-5x overhead vs native Java. For a Pacman game this is irrelevant (the game uses <1% CPU even with the overhead). |
| **Closed-source runtime** | CheerpJ community edition is free for non-commercial use but the runtime itself is proprietary. |

## Option B: TeaVM

TeaVM is an ahead-of-time compiler that translates Java bytecode to JavaScript or WebAssembly. It produces lean, optimized output but only supports a subset of the Java standard library.

### How It Works

1. TeaVM compiles `.class` files to `.js` or `.wasm` at build time.
2. The output is a self-contained JS/WASM bundle (~200-500 KB for a small game).
3. The application must use TeaVM-compatible APIs for rendering (HTML5 Canvas via `JSBody` annotations or the TeaVM DOM API).

### Pros

| Advantage | Detail |
|---|---|
| **Tiny output** | ~200-500 KB total bundle. Loads in under 1 second on any connection. |
| **No runtime dependency** | Self-contained output. No third-party CDN needed. |
| **Good performance** | AOT compilation produces optimized JS/WASM. Near-native speed. |
| **Open source** | Apache 2.0 licensed. Full control over the toolchain. |

### Cons

| Disadvantage | Detail |
|---|---|
| **No Swing/AWT support** | TeaVM does not implement `javax.swing.*` or `java.awt.*`. These packages are not in its supported class library. |
| **Requires full UI rewrite** | `GamePanel.java` (the rendering core) would need to be rewritten to use HTML5 Canvas via TeaVM's JS interop (`@JSBody` annotations, `HTMLCanvasElement`, etc.). |
| **Estimated rewrite scope** | `GamePanel.java` (~200 lines of `Graphics2D` calls), `PacmanGame.java` (JFrame setup), keyboard handling -- approximately 300-400 lines of code to rewrite. |
| **Divergent codebases** | The "Java" version shown in the browser would no longer be the same code as the desktop version. Students would see TeaVM-specific Canvas code, not standard Swing. |
| **Breaks educational goal** | The whole point is to show "the same game in different languages." A TeaVM port is effectively a different program that happens to be written in Java. |
| **Build complexity** | Requires Maven/Gradle TeaVM plugin, `@JSBody` annotations, TeaVM-specific entry point. Adds significant build pipeline complexity. |

## Side-by-Side Comparison

| Criterion | CheerpJ | TeaVM |
|---|---|---|
| Java code changes required | **0 lines** | **~350 lines rewritten** |
| Bundle size | ~30 MB (CDN) | ~300 KB (self-hosted) |
| Swing support | Full | None |
| Build complexity | `javac` + `jar` (standard) | Maven + TeaVM plugin + JS interop |
| Runtime performance | Adequate (interpreted) | Excellent (AOT) |
| Educational value | High (real Swing code) | Low (TeaVM-specific Canvas code) |
| Third-party dependency | CheerpJ CDN | None |
| Desktop/browser code parity | **Identical** | **Divergent** |

## Analysis

The decision hinges on what Packman is trying to teach.

If the goal were "build the fastest possible browser game in Java," TeaVM would win. Its output is 100x smaller and runs faster.

But Packman's goal is **educational**: show students the same game implemented in multiple languages, and let them compare the code side by side. The Java implementation uses Swing because Swing is what Java students learn. The value is in seeing `Graphics2D.fillOval()` and `KeyListener` and `javax.swing.Timer` -- standard Java patterns that appear in textbooks.

A TeaVM port would replace all of that with `@JSBody(script = "canvas.getContext('2d').arc(...)")` calls. It would no longer be recognizable as "the Java version" -- it would be "the JavaScript version written in Java syntax." This fundamentally undermines the educational purpose.

The 30 MB download cost is real but acceptable:
- It is a one-time cost (cached after first load).
- It comes from CheerpJ's CDN, not our bandwidth.
- The C++ version loads instantly and can serve as the default first experience.
- A loading indicator makes the wait tolerable.

## Decision

**CheerpJ.**

Preserving the educational value of showing unmodified Swing code running in the browser outweighs the bundle size advantage of TeaVM. Students should see real `Graphics2D`, real `KeyListener`, real `javax.swing.Timer` -- not a Canvas wrapper that happens to compile from Java source files.

The 30 MB runtime is a one-time download, cached by the browser, served from a CDN we do not pay for. This is an acceptable cost for maintaining code authenticity.

### Implementation

```html
<script src="https://cjrtnc.leaningtech.com/3.0/cj3loader.js"></script>
<script>
  (async () => {
    await cheerpjInit();
    cheerpjCreateDisplay(800, 600, document.getElementById("java-game"));
    await cheerpjRunJar("/app/pacman.jar");
  })();
</script>
```

Total integration effort: ~15 lines of HTML/JS. Zero lines of Java changed.
