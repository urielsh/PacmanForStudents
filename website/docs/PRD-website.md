# Product Requirements Document: Packman Educational Website

**Product Name:** Packman Educational Website
**Version:** 1.0
**Date:** 2026-03-19
**Author:** Product Management
**Status:** Draft

---

## 1. Overview

### 1.1 Purpose

The Packman Educational Website is a browser-based platform that hosts the Pacman game playable in all five language implementations (JavaScript, TypeScript, C++/WASM, Python/WASM, Java/CheerpJ) alongside an interactive cross-language code comparison widget. It transforms the existing multi-language Pacman repository into an accessible, web-based learning experience that requires no local installation.

### 1.2 Problem Statement

The current Packman project requires users to clone a repository, install language-specific toolchains (JDK, Pygame, SDL2, Node.js, g++), and run shell scripts to experience the game or study the code. This friction excludes learners who lack the technical setup skills or the hardware to install five different development environments. Additionally, the cross-language comparison documents (Markdown files in `docs/`) are static and require readers to manually jump between files -- there is no interactive, side-by-side view that highlights corresponding code across languages.

### 1.3 Target Audience

| Audience | Description | Primary Need |
|----------|-------------|--------------|
| **CS students** | Undergraduate or bootcamp students learning 2+ languages simultaneously | Play the same game in different languages and compare implementations without local setup |
| **Self-taught developers** | Developers learning game development or a new language | Interactive code exploration with annotations explaining idiomatic patterns |
| **Educators** | Professors and instructors teaching comparative programming or game engine courses | A sharable URL they can assign as coursework or use in live demos during lectures |

---

## 2. Goals and Success Metrics

| Goal | Success Metric | Target |
|------|---------------|--------|
| Remove setup friction | Percentage of users who play the game without local installation | 100% (all games playable in-browser) |
| Enable cross-language learning | Average time spent on code comparison pages per session | > 3 minutes |
| Fast page loads | Lighthouse performance score on landing page | >= 90 |
| Mobile accessibility | Percentage of pages scoring >= 90 on Lighthouse mobile audit | 100% of non-game pages |
| Attract organic traffic | Monthly unique visitors within 6 months of launch | 500+ |
| Educator adoption | Number of external links/embeds from educational institutions | >= 3 within 12 months |
| Low operational cost | Monthly hosting cost | $0 (OCI Always Free tier) |
| Reliable uptime | Monthly uptime percentage | >= 99.5% |

---

## 3. User Stories

### Game Play

**US-WEB-01:** As a CS student, I want to play the Pacman game directly in my browser by selecting a language implementation, so that I can experience how the same game feels when built with different technologies without installing anything locally.

**US-WEB-02:** As a self-taught developer, I want to switch between language implementations on the play page (e.g., from JavaScript to C++/WASM) without leaving the page, so that I can compare runtime performance and rendering behavior side by side.

**US-WEB-03:** As a player, I want arrow key inputs to be captured by the game canvas and not scroll the surrounding page, so that the gameplay experience is not disrupted by unintended page scrolling.

### Code Comparison

**US-WEB-04:** As a CS student, I want to view the same game concept (e.g., ghost AI, collision detection) implemented in two or more languages displayed side by side with syntax highlighting, so that I can directly compare how each language solves the same problem.

**US-WEB-05:** As a learner, I want to hover over a line of code in one language panel and see the corresponding lines highlighted in the other language panels, so that I can trace the same logic across implementations.

**US-WEB-06:** As an educator, I want to link directly to a specific comparison topic (e.g., `/compare/ghost-ai`) and share that URL with students, so that I can assign targeted reading for a specific lecture topic.

### Architecture and Deep Dives

**US-WEB-07:** As an advanced learner, I want to view an architecture page that explains the shared game specification, the file structure, and the design decisions made across all five implementations, so that I can understand the project holistically before diving into individual languages.

**US-WEB-08:** As a student studying a specific language, I want to read a dedicated deep-dive page for that language (e.g., `/languages/java`) that covers its framework, idioms, build system, and annotated highlights, so that I can deepen my understanding of that particular implementation.

### Responsive Design and Accessibility

**US-WEB-09:** As a mobile user, I want the landing page, architecture page, and language deep-dive pages to be fully readable on a 375px-wide screen, so that I can study the educational content on my phone during a commute.

**US-WEB-10:** As a tablet user visiting the code comparison page, I want the language panels to stack vertically on screens narrower than 768px, so that the code remains readable without horizontal scrolling.

### Performance and Reliability

**US-WEB-11:** As a visitor on a slow connection, I want to see a loading indicator with an estimated bundle size when a WASM game (Python ~18MB, Java ~30MB) is being fetched, so that I understand why the game is taking time to load and can decide whether to wait.

**US-WEB-12:** As a returning visitor, I want WASM assets to be served from browser cache on repeat visits, so that subsequent game loads are near-instant.

---

## 4. Sitemap

The website consists of 15 pages organized into four sections.

```
/                                   Landing page
/play                               Game player (all 5 languages)
/compare/game-loop                  Code comparison: Game Loop Timing
/compare/rendering                  Code comparison: Rendering / Drawing
/compare/input-handling             Code comparison: Input Handling
/compare/collision-detection        Code comparison: Collision Detection
/compare/ghost-ai                   Code comparison: Ghost AI
/compare/state-management           Code comparison: State Management
/architecture                       Architecture overview
/languages/javascript               Language deep-dive: JavaScript
/languages/typescript               Language deep-dive: TypeScript
/languages/python                   Language deep-dive: Python
/languages/java                     Language deep-dive: Java
/languages/cpp                      Language deep-dive: C++
```

### 4.1 Page Descriptions

#### Landing Page (`/`)

Hero section with animated Pacman sprite, tagline ("One game. Five languages. Learn by comparing."), and three call-to-action buttons: Play, Compare Code, Explore Architecture. Below the fold: grid of 5 language cards showing framework, test count, and a "Try it" link. Footer with GitHub link and project credits.

#### Play Page (`/play`)

Full-width game canvas embedded via iframe (see ADR-003). Language selector tabs above the canvas (JS, TS, C++, Python, Java). Score display below the canvas receiving PostMessage events from the game iframe. Loading indicator overlay shown while WASM bundles download. Keyboard focus management ensures arrow keys are captured by the iframe when the game is active.

#### Compare Pages (`/compare/{topic}`)

Two-panel (desktop) or stacked (mobile) code viewer powered by the CodeCompare widget. Left panel: language selector dropdown + syntax-highlighted code snippet. Right panel: same, defaulting to a different language. Hover-to-highlight cross-language line linking. Annotation callouts displayed inline or in a collapsible sidebar. Navigation links to previous/next comparison topic.

#### Architecture Page (`/architecture`)

Rendered Markdown content covering: repository structure, shared game specification (`game_constants.json`, `maze_layout.json`), file-to-file mapping across languages, educational annotation format, and design decisions. Embedded diagrams (Mermaid or static SVG) showing the game loop flow and class/module relationships.

#### Language Deep-Dive Pages (`/languages/{lang}`)

Rendered from each language's existing `README.md` content, enhanced with: framework overview, prerequisites (informational, not required for the web version), architecture notes, "Things to Notice" highlights with linked code snippets, and suggested exercises. Links to the relevant compare pages for cross-referencing.

---

## 5. Information Architecture

```
                        +------------------+
                        |   Landing Page   |
                        |       /          |
                        +--------+---------+
                                 |
              +------------------+------------------+
              |                  |                  |
     +--------v-------+  +------v--------+  +------v---------+
     |   Play Page    |  | Compare Index |  | Architecture   |
     |    /play       |  |   /compare/*  |  |  /architecture |
     +----------------+  +------+--------+  +----------------+
                                |
           +----------+---------+--------+---------+----------+
           |          |         |        |         |          |
     +-----v----+ +---v---+ +--v--+ +---v----+ +--v---+ +----v-----+
     |game-loop | |render | |input| |collisn | |ghost | |state-mgmt|
     +----------+ +-------+ +-----+ +--------+ +------+ +----------+

     +----------+-----------+-----------+-----------+----------+
     |          |           |           |           |          |
     | /langs/  | /langs/   | /langs/   | /langs/  | /langs/  |
     |   js     |   ts      |  python   |  java    |  cpp     |
     +----------+-----------+-----------+-----------+----------+
```

---

## 6. Feature Requirements

### 6.1 Game Embed Widget

| ID | Requirement |
|----|-------------|
| FR-WEB-01 | Each of the 5 language implementations loads and runs inside a sandboxed iframe |
| FR-WEB-02 | Language selector tabs allow switching between implementations without a full page reload |
| FR-WEB-03 | PostMessage protocol (see `postmessage-protocol.md`) relays score, game-over, game-ready, and game-error events from the iframe to the parent page |
| FR-WEB-04 | Loading overlay with spinner and bundle size estimate is displayed while WASM assets download |
| FR-WEB-05 | Arrow keys, WASD, and spacebar are captured by the game iframe when it has focus; the parent page does not scroll |
| FR-WEB-06 | A "Restart" button sends a restart command to the active game iframe |
| FR-WEB-07 | JS and TS implementations load from static HTML/JS bundles; C++ loads from Emscripten WASM (~300KB); Python loads via pygbag (~18MB); Java loads via CheerpJ (~30MB CDN) |

### 6.2 Code Comparison Widget (CodeCompare)

| ID | Requirement |
|----|-------------|
| FR-WEB-08 | Widget displays code snippets from two languages side by side (desktop) or stacked (mobile) |
| FR-WEB-09 | Language dropdowns allow selecting any of the 5 languages for each panel |
| FR-WEB-10 | Code is syntax-highlighted using Shiki at build time (see `snippet-schema.md`) |
| FR-WEB-11 | Hovering a line in one panel highlights the corresponding lines in the other panel using the `correspondingLines` mapping |
| FR-WEB-12 | Scroll positions are synchronized between panels when sync-scroll toggle is enabled |
| FR-WEB-13 | Educational annotations from the source code are displayed as collapsible callout blocks adjacent to the relevant code lines |
| FR-WEB-14 | A "View on GitHub" link opens the source file at the correct line range in the repository |

### 6.3 Static Content Pages

| ID | Requirement |
|----|-------------|
| FR-WEB-15 | Landing page loads with zero client-side JavaScript (Astro static render), except for interactive islands |
| FR-WEB-16 | Architecture page renders Markdown content with Mermaid diagrams or static SVG images |
| FR-WEB-17 | Language deep-dive pages are generated from content collections (Astro content layer) sourced from per-language README files |
| FR-WEB-18 | All pages include consistent header navigation, breadcrumbs, and footer |
| FR-WEB-19 | Dark mode / light mode toggle persisted in localStorage |

### 6.4 Responsive Design

| ID | Requirement |
|----|-------------|
| FR-WEB-20 | All pages render correctly at 375px (mobile), 768px (tablet), and 1024px+ (desktop) breakpoints |
| FR-WEB-21 | Game canvas scales proportionally on tablets; on mobile (<768px), a message recommends landscape orientation or desktop for gameplay |
| FR-WEB-22 | Code comparison panels switch from side-by-side to stacked layout below 768px |
| FR-WEB-23 | Navigation collapses to a hamburger menu below 768px |

### 6.5 Performance

| ID | Requirement |
|----|-------------|
| FR-WEB-24 | Landing page achieves Lighthouse Performance score >= 90 |
| FR-WEB-25 | Total JavaScript shipped to non-interactive pages is < 5KB |
| FR-WEB-26 | WASM assets are loaded lazily -- only when the user navigates to the play page and selects a language |
| FR-WEB-27 | Static assets (JS, CSS, fonts, images) are served with immutable Cache-Control headers (max-age=31536000) using content-hashed filenames |
| FR-WEB-28 | WASM files are served with `application/wasm` MIME type and Brotli/gzip compression |

### 6.6 Infrastructure and CI/CD

| ID | Requirement |
|----|-------------|
| FR-WEB-29 | Site is served over HTTPS with a valid Let's Encrypt certificate, auto-renewed by Certbot |
| FR-WEB-30 | GitHub Actions workflow builds the Astro site and compiles WASM artifacts on push to `main` |
| FR-WEB-31 | GitHub Actions deploys the built artifacts to the OCI VM via SSH/SCP |
| FR-WEB-32 | Nginx serves the static site with gzip/Brotli compression, correct MIME types, and security headers (X-Content-Type-Options, CSP, X-Frame-Options) |
| FR-WEB-33 | Deployment is zero-downtime: new files are written to a staging directory and symlinked atomically |

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-WEB-01 | Pages must render meaningful content (above-the-fold text and navigation) within 1.5 seconds on a 3G connection |
| NFR-WEB-02 | The site must function with JavaScript disabled for all static content pages (progressive enhancement); game and code comparison widgets degrade to a message linking to the GitHub repository |
| NFR-WEB-03 | All images must include alt text; all interactive elements must be keyboard-navigable |
| NFR-WEB-04 | The site must pass WCAG 2.1 AA contrast requirements |
| NFR-WEB-05 | No user data is collected, stored, or transmitted; no cookies are set except for the theme preference in localStorage |
| NFR-WEB-06 | The site must work in the latest stable versions of Chrome, Firefox, Safari, and Edge |
| NFR-WEB-07 | Build time for the full site (Astro build + WASM compilation for all 3 variants) must complete in under 30 minutes in CI |

---

## 8. MVP Scope (Phase 1)

**Goal:** Launch a functional website with the two lightest game implementations and a subset of comparison topics.

| Deliverable | Details |
|-------------|---------|
| Landing page | Hero, language cards, CTAs, responsive layout |
| Play page with JS and TS | iframe-embedded games, language switcher tabs, score display, keyboard isolation |
| Code comparison: 3 topics | Game Loop, Ghost AI, Collision Detection (chosen for maximum educational contrast) |
| OCI deployment | Nginx, Let's Encrypt, GitHub Actions CI/CD pipeline |
| Basic responsive design | 375px, 768px, 1024px breakpoints |
| Lighthouse >= 90 | Landing page performance audit |

**Out of MVP scope:** C++/Python/Java WASM ports, remaining 3 comparison topics, architecture page, language deep-dive pages, dark mode toggle, analytics.

**Estimated timeline:** 4 weeks from start.

---

## 9. Phase 2 Scope

**Goal:** Complete all five playable game implementations and the full educational content suite.

| Deliverable | Details |
|-------------|---------|
| C++ WASM port (Emscripten) | ~300KB bundle, iframe integration, loading indicator |
| Python WASM port (pygbag) | ~18MB bundle, loading progress bar, lazy load |
| Java WASM port (CheerpJ) | ~30MB CDN load, loading progress bar, lazy load |
| Remaining comparison topics | Rendering, Input Handling, State Management |
| Architecture page | Markdown + Mermaid diagrams, shared spec documentation |
| 5 language deep-dive pages | Generated from per-language READMEs with enhanced formatting |
| Dark mode toggle | localStorage-persisted, respects `prefers-color-scheme` |
| Analytics | Privacy-respecting analytics (Plausible or Umami self-hosted) |
| Cross-language line linking | Hover-to-highlight in CodeCompare widget |
| Scroll sync in CodeCompare | Toggleable synchronized scrolling between code panels |

**Estimated timeline:** 6 weeks after Phase 1 launch.

---

## 10. Technical Architecture Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Static site framework | Astro 4 with React islands | Zero JS by default; selective hydration for interactive widgets (ADR-001) |
| Interactive components | React 18 | Game embed widget, CodeCompare widget, score display |
| Styling | Tailwind CSS | Utility-first, purged at build time, responsive breakpoints |
| Syntax highlighting | Shiki (build-time) | Pre-rendered HTML, no runtime JS for code blocks |
| Game isolation | iframes with `sandbox` | DOM/JS isolation between WASM runtimes (ADR-003) |
| Game-to-page communication | PostMessage API | Structured protocol for score/lifecycle events |
| WASM: C++ | Emscripten | Mature SDL2-to-Canvas compilation (ADR-002) |
| WASM: Python | pygbag | Packages CPython + Pygame as WASM (ADR-002) |
| WASM: Java | CheerpJ 3 | Runs unmodified Swing bytecode in browser (ADR-002) |
| Hosting | Nginx on OCI VM | Static file serving, zero runtime dependencies (ADR-004) |
| SSL | Let's Encrypt + Certbot | Free automated certificate management |
| CI/CD | GitHub Actions | Build + deploy on push to `main` |
| Content authoring | Markdown + MDX | Content collections in Astro for comparison docs and deep-dives |

---

## 11. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Python WASM bundle (18MB) causes users to abandon loading | Users never experience the Python game | Medium | Lazy load with progress bar; display estimated load time; pre-cache in service worker on idle |
| CheerpJ CDN unavailability | Java game fails to load | Low | Monitor CDN status; fallback message with link to local Java setup instructions |
| Keyboard input conflicts between iframe and parent page | Arrows scroll the page during gameplay | Medium | Focus management: auto-focus iframe on game start; blur on Escape; `event.preventDefault()` in parent for arrow keys when game is active |
| WASM toolchain breaking changes in CI | Build pipeline fails | Medium | Pin all toolchain versions; test each variant independently; set up CI caching |
| Low mobile engagement with game pages | Mobile users bounce from play page | High | Clear messaging that games work best on desktop; ensure all non-game pages are fully mobile-optimized |

---

## 12. Dependencies

| Dependency | Owner | Notes |
|------------|-------|-------|
| Existing 5-language Pacman implementations | Packman core repo | Must be fully functional and annotated before website can extract snippets |
| `shared/game_constants.json` and `shared/maze_layout.json` | Packman core repo | Source of truth for game specification displayed on architecture page |
| Six cross-language comparison docs (`docs/01-06`) | Packman core repo | Content source for the six compare pages |
| Five per-language README files | Packman core repo | Content source for the five language deep-dive pages |
| EDUCATIONAL NOTE annotations in source files | Packman core repo | Extracted at build time by `extract-snippets.ts` for the CodeCompare widget |
| OCI Always Free VM | Infrastructure | Must be provisioned before first deployment |
| Domain name | Infrastructure | Must be registered and DNS configured before SSL setup |

---

## 13. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Should the play page allow two games to run side by side for real-time comparison, or is one-at-a-time with tab switching sufficient for MVP? | Decided: one-at-a-time for MVP; side-by-side is Phase 2 stretch goal |
| 2 | Should the CodeCompare widget support more than two languages simultaneously (e.g., three-panel view)? | Open |
| 3 | Should the site include a guided tutorial mode that walks users through the code comparison in a specific order? | Open |
| 4 | What domain name will the site use? | Open |
| 5 | Should analytics be added in Phase 1 or deferred to Phase 2? | Decided: Phase 2 |
