# ADR-002: Per-Language WASM Compilation Strategy

**Status:** Accepted
**Date:** 2026-03-19
**Author:** System Architect

## Decision

Adopt a per-language WASM compilation strategy, selecting the toolchain that is the best fit for each language ecosystem represented in the Packman project:

| Language | Toolchain | Output Size | Notes |
|----------|-----------|-------------|-------|
| C++ | Emscripten | ~300KB | Mature SDL2 support, direct WASM compilation |
| Python | pygbag | ~18MB | Packages CPython interpreter + Pygame as WASM |
| Java | CheerpJ 3 | ~30MB (CDN) | Runs unmodified Swing bytecode in browser |

Each game variant will be compiled to WASM independently and loaded on demand within its own iframe (see ADR-003).

## Rationale

There is no single universal WASM toolchain that handles C++, Python, and Java equally well. Each language has a fundamentally different runtime model, and the most reliable path to browser execution is to use the toolchain purpose-built for each ecosystem.

### C++ with Emscripten

Emscripten is the reference compiler for C/C++ to WebAssembly. It has been in active development since 2012 and has mature, battle-tested support for SDL2, OpenGL ES, and POSIX APIs. The Packman C++ implementation uses SDL2 for rendering, which Emscripten translates directly to HTML5 Canvas/WebGL calls. The compiled output is approximately 300KB (gzipped), making it the lightest of the three variants. Emscripten's `emrun` tool provides a local development server, and the output is a standard `.wasm` + `.js` loader pair that integrates cleanly with any web page.

### Python with pygbag

pygbag packages a CPython interpreter and the Pygame library as a WebAssembly module, allowing unmodified Pygame scripts to run in the browser. The total bundle size is approximately 18MB, which is large but acceptable given that it includes the full CPython runtime and standard library. pygbag handles the async event loop adaptation required to run Pygame's blocking game loop in the browser's cooperative multitasking model. The alternative -- manually porting Python game logic to JavaScript -- would be prohibitively expensive and defeat the educational purpose of showing the same game in multiple languages.

### Java with CheerpJ 3

CheerpJ 3 runs unmodified Java bytecode (`.class` / `.jar` files) in the browser by providing a JVM implementation compiled to WebAssembly. It supports Swing/AWT for GUI rendering, which the Packman Java implementation uses. The runtime is approximately 30MB but is loaded from CheerpJ's CDN with aggressive caching, so repeat visits incur minimal transfer cost. CheerpJ requires no modifications to the Java source code or build process -- the same `.jar` produced by `javac`/`maven` runs directly in the browser.

## Alternatives Considered

### TeaVM (Java to WASM/JS)

TeaVM compiles Java bytecode ahead-of-time to JavaScript or WebAssembly, producing smaller output than CheerpJ. However, TeaVM does not support Swing/AWT, which the Packman Java implementation relies on for its GUI. Using TeaVM would require rewriting the Java rendering layer to use HTML5 Canvas via TeaVM's DOM API, fundamentally altering the codebase and undermining the educational goal of showing idiomatic Java.

### Pyodide (Python in WASM)

Pyodide packages CPython as WASM and provides excellent NumPy/SciPy support, but it does not include Pygame and has no built-in mechanism for running Pygame's event loop in the browser. Pygame's SDL2 dependency requires native code compilation that Pyodide's package build system does not support. pygbag was built specifically to solve this problem.

### GraalWasm / JWebAssembly (Java)

GraalWasm can execute WASM modules within GraalVM but does not compile Java to WASM for browser execution. JWebAssembly compiles Java bytecode to WASM but is experimental and lacks Swing/AWT support. Neither is production-ready for the Packman use case.

### Unified approach: Rewrite all variants in C++ or Rust

Rewriting the Python and Java implementations in C++ or Rust would allow a single Emscripten/wasm-pack toolchain, but this would eliminate the educational value of comparing idiomatic implementations across languages, which is the core purpose of the Packman project.

## Tradeoffs

- **Bundle size disparity** -- The C++ variant loads in under 300KB, while the Python variant is ~18MB and the Java variant pulls ~30MB from CDN. Users on slow connections will experience noticeably different load times. Mitigation: lazy-load game iframes only when the user clicks "Play", show a loading indicator with progress.
- **Build complexity** -- Three different toolchains mean three different build pipelines, each with its own dependencies (Emscripten SDK, pygbag CLI, CheerpJ CDN script tag). CI must install and cache all three. The build matrix is wider than a single-toolchain approach.
- **Update cadence** -- Each toolchain follows its own release schedule. A breaking change in Emscripten, pygbag, or CheerpJ could affect one variant without affecting the others. Pinning versions in CI and testing each variant independently mitigates this risk.
- **Runtime behavior differences** -- Each WASM runtime has different performance characteristics, memory models, and error reporting. Debugging an issue in the pygbag CPython runtime is fundamentally different from debugging Emscripten-compiled C++. The team must maintain familiarity with all three toolchains.
- **CheerpJ CDN dependency** -- The Java variant depends on CheerpJ's CDN being available. If the CDN goes down, the Java game will not load. Mitigation: self-hosting the CheerpJ runtime is possible but increases storage and maintenance burden.
