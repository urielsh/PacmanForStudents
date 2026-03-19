# Acceptance Criteria: Packman Educational Website

**Version:** 1.0
**Date:** 2026-03-19
**Format:** Given / When / Then (Gherkin-style)
**Reference:** PRD-website.md

---

## 1. Game Playability

### AC-1.1: JavaScript game loads and is playable

```
GIVEN the user navigates to /play
  AND selects the "JavaScript" tab
WHEN the game iframe finishes loading
THEN the Pacman game renders on an 800x600 canvas
  AND the game is controllable with arrow keys
  AND pellet collection increments the score by 10 per pellet
  AND ghost collision triggers a game-over state
```

### AC-1.2: TypeScript game loads and is playable

```
GIVEN the user navigates to /play
  AND selects the "TypeScript" tab
WHEN the game iframe finishes loading
THEN the Pacman game renders on an 800x600 canvas
  AND the game behavior is identical to the JavaScript version
  AND the score display reflects the current score via PostMessage
```

### AC-1.3: C++ WASM game loads and is playable

```
GIVEN the user navigates to /play
  AND selects the "C++" tab
WHEN the Emscripten WASM module finishes loading (~300KB)
THEN the Pacman game renders on the canvas inside the iframe
  AND the game plays at 60 FPS with the same maze layout, scoring, and ghost behavior as other implementations
  AND the parent page receives "game_ready" via PostMessage when the module is initialized
```

### AC-1.4: Python WASM game loads and is playable

```
GIVEN the user navigates to /play
  AND selects the "Python" tab
WHEN the pygbag WASM bundle finishes loading (~18MB)
THEN the Pacman game renders using the Pygame-to-Canvas bridge
  AND the game is controllable with arrow keys
  AND the maze layout, pellet count, ghost positions, and scoring match the shared specification in game_constants.json
```

### AC-1.5: Java game loads and is playable via CheerpJ

```
GIVEN the user navigates to /play
  AND selects the "Java" tab
WHEN the CheerpJ 3 runtime loads from CDN (~30MB)
  AND the Pacman .jar file is loaded
THEN the Swing-based Pacman game renders inside the iframe
  AND the game is controllable with arrow keys
  AND ghost behavior matches the random-walk AI specification (move every 20 frames, respect walls)
```

### AC-1.6: Language switching preserves page context

```
GIVEN the user is on /play with the JavaScript game active and a score of 50
WHEN the user clicks the "TypeScript" tab
THEN the JavaScript game iframe is unloaded
  AND the TypeScript game iframe loads in its place
  AND the score display resets to 0
  AND no page navigation occurs (the URL remains /play)
```

---

## 2. Code Comparison Widget

### AC-2.1: Widget displays correct code for selected languages and concept

```
GIVEN the user navigates to /compare/ghost-ai
WHEN the page loads with default languages (JavaScript and Python)
THEN the left panel displays the ghost AI code snippet from javascript/ghost.js
  AND the right panel displays the ghost AI code snippet from python/ghost.py
  AND both snippets are syntax-highlighted
  AND the code matches the actual source files in the repository at the line ranges specified in the snippet metadata
```

### AC-2.2: Language dropdown changes displayed code

```
GIVEN the user is on /compare/collision-detection with JavaScript (left) and Python (right)
WHEN the user changes the left panel dropdown to "C++"
THEN the left panel updates to show the collision detection snippet from cpp/game_logic.cpp
  AND the syntax highlighting changes to C++ grammar
  AND the right panel remains unchanged (Python)
```

### AC-2.3: Cross-language line highlighting on hover

```
GIVEN the user is on /compare/game-loop with JavaScript (left) and Java (right)
  AND the correspondingLines mapping exists for both snippets
WHEN the user hovers over line 5 in the JavaScript panel
THEN the corresponding lines in the Java panel (as defined by the correspondingLines mapping) are highlighted with a visible background color
  AND when the user moves the mouse away from line 5, the highlight is removed
```

### AC-2.4: Scroll sync between panels

```
GIVEN the user is on a compare page with two panels displayed side by side
  AND the scroll-sync toggle is enabled (on by default)
WHEN the user scrolls the left panel down by 200px
THEN the right panel scrolls proportionally to maintain alignment
  AND when the user disables the scroll-sync toggle and scrolls the left panel, the right panel does not move
```

### AC-2.5: Language toggle covers all 5 languages

```
GIVEN the user is on any /compare/{topic} page
WHEN the user opens either language dropdown
THEN all 5 options are listed: JavaScript, TypeScript, Python, Java, C++
  AND selecting any combination of two different languages loads the correct snippets
  AND selecting the same language for both panels is prevented (dropdown disables the already-selected language)
```

### AC-2.6: Educational annotations are displayed

```
GIVEN the user is on /compare/ghost-ai with a language that has annotations for the ghost AI concept
WHEN the page loads
THEN the annotations extracted from the source file's EDUCATIONAL NOTE blocks are displayed as collapsible callout blocks
  AND each callout includes the concept title, explanation body, cross-language comparisons, and KEY CONCEPT summary
  AND the callout is collapsed by default and expands on click
```

### AC-2.7: "View on GitHub" link is correct

```
GIVEN the user is on /compare/collision-detection viewing the Python snippet
WHEN the user clicks "View on GitHub"
THEN a new tab opens to the GitHub repository URL for python/game_logic.py
  AND the URL includes a line range fragment (#L52-L68) matching the snippet's startLine and endLine
```

---

## 3. Responsive Design

### AC-3.1: Landing page at 375px (mobile)

```
GIVEN the user opens the landing page on a 375px-wide viewport
WHEN the page renders
THEN the hero section is fully visible without horizontal scrolling
  AND the language cards stack vertically (one per row)
  AND all text is readable without zooming (minimum 16px body text)
  AND the navigation is collapsed into a hamburger menu
  AND tapping the hamburger menu reveals the full navigation links
```

### AC-3.2: Code comparison at 768px (tablet)

```
GIVEN the user opens /compare/game-loop on a 768px-wide viewport
WHEN the page renders
THEN the two code panels stack vertically (top and bottom) instead of side by side
  AND each panel occupies the full width of the content area
  AND the code is horizontally scrollable if lines exceed the panel width
  AND the language dropdowns remain functional above each panel
```

### AC-3.3: Full layout at 1024px (desktop)

```
GIVEN the user opens /compare/ghost-ai on a 1024px-wide viewport
WHEN the page renders
THEN the two code panels display side by side, each occupying approximately 50% of the content width
  AND the scroll-sync toggle is visible between or above the panels
  AND the navigation displays as a horizontal menu bar (not hamburger)
```

### AC-3.4: Play page responsive behavior

```
GIVEN the user opens /play on a viewport narrower than 768px
WHEN the page renders
THEN a message is displayed recommending landscape orientation or a desktop browser for the best gameplay experience
  AND the game iframe is still accessible below the message (not hidden)
  AND the language selector tabs wrap to multiple rows if needed
```

---

## 4. Performance

### AC-4.1: Lighthouse performance score >= 90

```
GIVEN the landing page (/) is deployed to the production environment
WHEN a Lighthouse audit is run in Chrome DevTools (Performance category, mobile preset)
THEN the Performance score is >= 90
  AND First Contentful Paint is < 1.8 seconds
  AND Largest Contentful Paint is < 2.5 seconds
  AND Cumulative Layout Shift is < 0.1
```

### AC-4.2: Minimal JavaScript on static pages

```
GIVEN the user navigates to the architecture page (/architecture)
WHEN the page is fully loaded
THEN the total JavaScript transferred is < 5KB (excluding any deferred island hydration)
  AND the page content is fully readable before any JavaScript executes
```

### AC-4.3: WASM lazy loading

```
GIVEN the user navigates to /play
WHEN the play page initially loads (before selecting a language tab)
THEN no WASM assets have been downloaded
  AND when the user selects the "C++" tab, the Emscripten WASM bundle begins downloading
  AND when the user switches to the "Python" tab, the C++ WASM is not re-downloaded (remains in browser cache) and the pygbag bundle begins downloading
```

### AC-4.4: Asset caching headers

```
GIVEN a static asset (JS, CSS, font, or image) is served by Nginx
WHEN the browser requests the asset
THEN the response includes a Cache-Control header with max-age=31536000 and immutable
  AND the filename contains a content hash (e.g., game.a1b2c3d4.js)
  AND WASM files are served with Content-Type: application/wasm
```

---

## 5. Keyboard Isolation

### AC-5.1: Arrow keys do not scroll page when game is focused

```
GIVEN the user is on /play with a game loaded in the iframe
WHEN the user clicks on the game canvas (iframe receives focus)
  AND the user presses the Up arrow key
THEN the parent page does not scroll
  AND the Pacman character moves up in the game
  AND the Down, Left, and Right arrow keys similarly control the game without scrolling the page
```

### AC-5.2: Keyboard focus can be released from the game

```
GIVEN the game iframe has focus and arrow keys are captured
WHEN the user presses the Escape key
THEN focus returns to the parent page
  AND subsequent arrow key presses scroll the page normally
  AND a visual indicator (e.g., border change or overlay message) shows that the game is no longer focused
```

### AC-5.3: Tab key navigates past the game iframe

```
GIVEN the user is navigating the play page with the Tab key
WHEN the user tabs into the game iframe area
THEN one additional Tab press moves focus past the iframe to the next focusable element on the page
  AND the user is not trapped inside the iframe (WCAG 2.1 SC 2.1.2 No Keyboard Trap)
```

---

## 6. WASM Loading Indicators

### AC-6.1: Loading indicator appears during WASM download

```
GIVEN the user is on /play and selects the "Python" tab
WHEN the pygbag WASM bundle begins downloading
THEN a loading overlay appears over the game area
  AND the overlay displays a spinner or progress animation
  AND the overlay displays text indicating the estimated bundle size (e.g., "Loading Python runtime (~18 MB)...")
  AND the overlay remains visible until the game iframe sends a "game_ready" PostMessage
```

### AC-6.2: Loading indicator shows progress for large bundles

```
GIVEN the user selects the "Java" tab on /play
WHEN the CheerpJ runtime is loading from CDN
THEN the loading overlay displays a progress bar or percentage if the download size is deterministic
  AND if progress cannot be determined (CDN streaming), an indeterminate spinner is shown with the estimated total size
```

### AC-6.3: Error state when WASM fails to load

```
GIVEN the user selects the "C++" tab on /play
WHEN the Emscripten WASM module fails to load (network error, 404, or runtime initialization failure)
  AND the game iframe sends a "game_error" PostMessage
THEN the loading overlay is replaced with an error message
  AND the error message includes: a description of what went wrong, a "Retry" button, and a link to the GitHub repository for running the game locally
```

### AC-6.4: JS/TS load without WASM indicator

```
GIVEN the user selects the "JavaScript" tab on /play
WHEN the game iframe loads (no WASM required)
THEN the game appears within 2 seconds on a broadband connection
  AND no "Loading WASM" overlay is shown (a brief standard loading state is acceptable)
  AND the game iframe sends a "game_ready" PostMessage upon initialization
```

---

## 7. SSL / HTTPS

### AC-7.1: All traffic served over HTTPS

```
GIVEN the site is deployed to the production OCI VM
WHEN a user navigates to the site using HTTP (port 80)
THEN the request is redirected to HTTPS (port 443) with a 301 permanent redirect
  AND the HTTPS response includes a valid TLS certificate
  AND the certificate is issued by Let's Encrypt
```

### AC-7.2: Certificate auto-renewal

```
GIVEN the Let's Encrypt certificate is within 30 days of expiration
WHEN the Certbot renewal cron job / systemd timer runs
THEN the certificate is renewed automatically
  AND Nginx reloads to serve the new certificate
  AND no manual intervention is required
```

### AC-7.3: Security headers are present

```
GIVEN the user requests any page over HTTPS
WHEN the response is received
THEN the following headers are present:
  - Strict-Transport-Security: max-age=63072000; includeSubDomains
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN (for the top-level site; game iframes are same-origin)
  - Content-Security-Policy: appropriate policy allowing scripts, styles, WASM execution, and CheerpJ CDN
  AND no sensitive information is leaked in response headers (no Server version disclosure)
```

---

## 8. CI/CD Auto-Deploy

### AC-8.1: Push to main triggers build and deploy

```
GIVEN a developer pushes a commit to the main branch
WHEN GitHub Actions receives the push event
THEN the CI workflow triggers
  AND the Astro site is built (astro build)
  AND the WASM artifacts are compiled (Emscripten for C++, pygbag for Python, CheerpJ assets for Java)
  AND all build artifacts are copied to the OCI VM via SSH/SCP
  AND Nginx serves the updated site within 5 minutes of the push
```

### AC-8.2: Build failure prevents deployment

```
GIVEN a developer pushes a commit to main that introduces a build error
WHEN GitHub Actions runs the build step
  AND the Astro build or any WASM compilation step fails
THEN the deploy step is skipped
  AND the currently deployed site remains unchanged
  AND the developer is notified of the failure via GitHub Actions status
```

### AC-8.3: Zero-downtime deployment

```
GIVEN the CI/CD pipeline has successfully built new artifacts
WHEN the deploy step copies files to the OCI VM
THEN the new files are written to a staging directory (not the live directory)
  AND an atomic symlink swap points the Nginx document root to the new staging directory
  AND at no point during the deployment does a user receive a 404, 500, or partial page
```

### AC-8.4: Pull request does not auto-deploy

```
GIVEN a developer opens a pull request against main
WHEN GitHub Actions runs
THEN the build step runs (to verify the PR builds successfully)
  AND the deploy step does NOT run
  AND the production site remains unchanged
```

---

## 9. Cross-Cutting Concerns

### AC-9.1: All 5 games produce identical gameplay

```
GIVEN the same sequence of inputs (e.g., Right x3, Down x5, Left x2)
WHEN applied to each of the 5 language implementations starting from the initial game state
THEN Pacman's final grid position is the same in all 5 implementations
  AND the score is the same in all 5 implementations
  AND the maze layout (wall positions, initial pellet positions) is identical across all 5
```

### AC-9.2: Navigation between sections is consistent

```
GIVEN the user is on any page of the site
WHEN the user looks at the header navigation
THEN links to Play, Compare, Architecture, and Languages are visible (or accessible via hamburger menu on mobile)
  AND clicking any navigation link loads the correct page without a full browser reload (Astro view transitions or standard navigation)
```

### AC-9.3: Browser compatibility

```
GIVEN the user accesses the site using the latest stable version of Chrome, Firefox, Safari, or Edge
WHEN any page is loaded
THEN the page renders correctly without layout breakage, missing content, or JavaScript errors in the console
  AND WASM games load and run in all four browsers
```

### AC-9.4: No data collection

```
GIVEN the user visits any page on the site
WHEN the page loads and the user interacts with it
THEN no cookies are set (except localStorage for theme preference)
  AND no analytics scripts execute (until Phase 2 analytics is implemented)
  AND no user data is transmitted to any third-party service
  AND no personal information is collected or stored
```
