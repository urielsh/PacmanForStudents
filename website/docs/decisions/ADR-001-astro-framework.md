# ADR-001: Astro 4 with React Islands as Site Framework

**Status:** Accepted
**Date:** 2026-03-19
**Author:** System Architect

## Decision

Use Astro 4 as the static site framework with React islands for interactive components. The site will be built entirely at compile time, producing plain HTML/CSS with zero client-side JavaScript by default. React components will be hydrated selectively using Astro's `client:*` directives only where interactivity is required -- specifically the game embed widgets and the code comparison tool.

## Rationale

The Packman educational website is approximately 90% static content: rendered markdown explanations, syntax-highlighted code blocks, architecture diagrams, and navigation. Only a small number of components require client-side interactivity:

- **Game embed widget** -- loads and controls WASM game instances inside iframes.
- **Code comparison tool** -- allows users to switch between language implementations with tabbed/side-by-side views.
- **Score display** -- receives PostMessage events from game iframes and renders live score data.

Astro's island architecture is purpose-built for this content profile. Static content ships as zero-JS HTML, while interactive widgets are hydrated independently. This results in:

- **Minimal JavaScript payload** -- only the ~15-40KB of React needed for interactive islands, versus 200KB+ for a full React SPA runtime.
- **Fast initial page load** -- static HTML renders immediately; islands hydrate asynchronously without blocking the page.
- **No Node.js runtime in production** -- the build output is plain HTML/CSS/JS files served directly by Nginx, eliminating server-side runtime dependencies and attack surface.
- **First-class markdown support** -- Astro's built-in content collections handle markdown with frontmatter, code syntax highlighting (Shiki), and MDX support out of the box.

## Alternatives Considered

### Next.js (App Router / Static Export)

Next.js can produce static exports, but its architecture is fundamentally oriented toward server-side rendering and API routes. Using `output: 'export'` disables many Next.js features (middleware, ISR, API routes, image optimization), leaving a framework fighting against its own design. The client-side React hydration model also means the full React runtime ships to every page, even those with no interactivity. The framework's complexity (server components, client components, route groups, parallel routes) is unnecessary overhead for a documentation-style site.

### Hugo

Hugo is an excellent static site generator with extremely fast builds, but it lacks a component model for embedding interactive widgets. Integrating React components into Hugo templates requires manual script injection, custom shortcodes with ad-hoc JavaScript, and a parallel build pipeline (e.g., Webpack/Vite alongside Hugo). There is no first-class mechanism for selective hydration or component-level interactivity. For a purely static site, Hugo would be the right choice, but the interactive game embeds push the requirements beyond what Hugo handles cleanly.

### Plain React SPA (Vite + React Router)

A single-page application built with React and Vite would provide full interactivity everywhere, but at the cost of shipping the entire React runtime, router, and application bundle to every visitor. For a site that is 90% static educational content, this means downloading and executing hundreds of kilobytes of JavaScript to render what is fundamentally static HTML. Client-side routing also complicates SEO, breaks progressive enhancement, and produces a blank page if JavaScript fails to load. The development experience is familiar, but the tradeoffs are unfavorable for this content profile.

## Tradeoffs

- **Learning curve** -- Astro's island model and `.astro` file syntax are less widely known than Next.js or plain React. Contributors must understand the `client:load`, `client:idle`, and `client:visible` hydration directives.
- **Ecosystem size** -- Astro's plugin and theme ecosystem is smaller than Next.js. Some integrations (analytics, CMS adapters) may require more manual setup.
- **Build-time only** -- All page content must be available at build time. There is no server-side rendering for dynamic content. This is acceptable for our use case (static educational content) but would be a limitation if requirements changed to include user accounts, dynamic content, or personalization.
- **Island boundaries** -- Interactive components cannot easily share state with each other across island boundaries without explicit coordination (e.g., custom events, shared stores via nanostores). The game embed and score display components will need a PostMessage-based communication pattern rather than shared React context.
