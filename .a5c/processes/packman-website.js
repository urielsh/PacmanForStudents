/**
 * @process packman/website
 * @description Orchestrate building the Packman educational website with 7 agents in parallel.
 *              Hosts all 5 language implementations playable in-browser (JS/TS native, C++/Python/Java via WASM),
 *              interactive code comparison widget, and deploys to OCI VM.
 * @inputs { projectRoot: string, planFile: string }
 * @outputs { success: boolean, phases: array, deploymentUrl: string }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  const { projectRoot = '/home/urisha/Desktop/workspace/Packman', planFile = '' } = inputs;
  const websiteRoot = `${projectRoot}/website`;

  // ============================================================================
  // PHASE 1: FOUNDATION — PM + Architect (Sequential)
  // ============================================================================

  // 1a. Create directory structure + docs skeleton
  const scaffoldResult = await ctx.task(scaffoldDirectoriesTask, {
    projectRoot,
    websiteRoot
  });

  // 1b. Architect writes ADRs and tradeoff docs in parallel
  const [adrResult, tradeoffResult, contractsResult] = await ctx.parallel.all([
    () => ctx.task(writeADRsTask, { websiteRoot, projectRoot }),
    () => ctx.task(writeTradeoffsTask, { websiteRoot, projectRoot }),
    () => ctx.task(writeAPIContractsTask, { websiteRoot, projectRoot })
  ]);

  // 1c. PM writes PRD and acceptance criteria
  const prdResult = await ctx.task(writePRDTask, { websiteRoot, projectRoot });

  // Breakpoint: Review foundation docs
  await ctx.breakpoint({
    question: 'Phase 1 complete: Directory structure created, ADRs written, PRD defined. Review and approve to start parallel development?',
    title: 'Phase 1: Foundation Review',
    context: {
      runId: ctx.runId,
      files: [
        { path: `${websiteRoot}/docs/decisions/ADR-001-astro-framework.md`, format: 'markdown', label: 'ADR-001' },
        { path: `${websiteRoot}/docs/decisions/ADR-002-wasm-strategy.md`, format: 'markdown', label: 'ADR-002' }
      ]
    }
  });

  // ============================================================================
  // PHASE 2: PARALLEL DEVELOPMENT — Frontend + Backend + DevOps
  // ============================================================================

  // --- Wave 1: Scaffolding (all 3 agents in parallel) ---
  const [frontendScaffold, backendWave1, devopsWave1] = await ctx.parallel.all([
    () => ctx.task(frontendScaffoldTask, { websiteRoot, projectRoot }),
    () => ctx.task(backendCopyGamesTask, { websiteRoot, projectRoot }),
    () => ctx.task(devopsNginxTask, { websiteRoot, projectRoot })
  ]);

  // --- Wave 2: Core features (all 3 agents in parallel) ---
  const [frontendPages, backendWasm1, devopsCICD] = await ctx.parallel.all([
    () => ctx.task(frontendPagesTask, { websiteRoot, projectRoot }),
    () => ctx.task(backendCppWasmTask, { websiteRoot, projectRoot }),
    () => ctx.task(devopsCICDTask, { websiteRoot, projectRoot })
  ]);

  // --- Wave 3: Interactive features + more WASM (parallel) ---
  const [frontendComparison, backendWasm2] = await ctx.parallel.all([
    () => ctx.task(frontendComparisonWidgetTask, { websiteRoot, projectRoot }),
    () => ctx.task(backendPythonJavaWasmTask, { websiteRoot, projectRoot })
  ]);

  // --- Wave 4: Polish + final backend work (parallel) ---
  const [frontendPolish, backendFinal] = await ctx.parallel.all([
    () => ctx.task(frontendPolishTask, { websiteRoot, projectRoot }),
    () => ctx.task(backendSnippetsTask, { websiteRoot, projectRoot })
  ]);

  // Breakpoint: Review parallel development output
  await ctx.breakpoint({
    question: 'Phase 2 complete: Frontend built (Astro + React), WASM ports done, DevOps configs ready. Review and approve for QA?',
    title: 'Phase 2: Development Review',
    context: {
      runId: ctx.runId,
      files: [
        { path: `${websiteRoot}/frontend/package.json`, format: 'code', language: 'json', label: 'Frontend package.json' },
        { path: `${websiteRoot}/infrastructure/nginx/packman-edu.conf`, format: 'code', label: 'Nginx config' }
      ]
    }
  });

  // ============================================================================
  // PHASE 3: INTEGRATION — Integrator Agent
  // ============================================================================

  const integrationResult = await ctx.task(integrationVerifyTask, {
    websiteRoot,
    projectRoot
  });

  // Quality gate: build must succeed
  if (!integrationResult.buildSuccess) {
    // Fix iteration
    const fixResult = await ctx.task(integrationFixTask, {
      websiteRoot,
      projectRoot,
      errors: integrationResult.errors
    });
  }

  await ctx.breakpoint({
    question: `Phase 3 Integration: Build ${integrationResult.buildSuccess ? 'PASSED' : 'fixed'}. All game embeds verified. Proceed to QA?`,
    title: 'Phase 3: Integration Review',
    context: { runId: ctx.runId }
  });

  // ============================================================================
  // PHASE 4: QA — Quality Agent with iterative convergence
  // ============================================================================

  let qaIteration = 0;
  let qaScore = 0;
  const targetQuality = 85;
  const maxQAIterations = 3;

  while (qaScore < targetQuality && qaIteration < maxQAIterations) {
    qaIteration++;

    const qaResult = await ctx.task(qaTestingTask, {
      websiteRoot,
      projectRoot,
      iteration: qaIteration,
      previousFeedback: qaIteration > 1 ? `Score was ${qaScore}, needs improvement` : null
    });

    qaScore = qaResult.score || 0;

    if (qaScore < targetQuality && qaIteration < maxQAIterations) {
      // Fix issues found by QA
      const qaFixResult = await ctx.task(qaFixIssuesTask, {
        websiteRoot,
        projectRoot,
        issues: qaResult.issues || [],
        iteration: qaIteration
      });
    }
  }

  await ctx.breakpoint({
    question: `Phase 4 QA: Score ${qaScore}/${targetQuality} after ${qaIteration} iteration(s). Approve for deployment?`,
    title: 'Phase 4: QA Sign-off',
    context: { runId: ctx.runId }
  });

  // ============================================================================
  // PHASE 5: DEPLOYMENT — DevOps Agent
  // ============================================================================

  const deployResult = await ctx.task(deployToOCITask, {
    websiteRoot,
    projectRoot
  });

  await ctx.breakpoint({
    question: 'Phase 5: Deployment complete. Final sign-off for release?',
    title: 'Phase 5: Final Sign-off',
    context: { runId: ctx.runId }
  });

  return {
    success: true,
    phases: ['foundation', 'development', 'integration', 'qa', 'deployment'],
    qaScore,
    qaIterations: qaIteration,
    metadata: { processId: 'packman/website', timestamp: ctx.now() }
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

// --- Phase 1: Foundation Tasks ---

export const scaffoldDirectoriesTask = defineTask('scaffold-dirs', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Create website directory structure',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'DevOps engineer',
      task: `Create the complete directory structure for the Packman educational website at ${args.websiteRoot}. Create these directories: frontend/ (with src/layouts, src/pages, src/pages/compare, src/pages/languages, src/components, src/content/comparisons, src/content/languages, src/styles, public/game/js, public/game/ts, public/game/cpp, public/game/python, public/game/java, public/fonts), backend/ (with scripts, data, wasm/cpp, wasm/python, wasm/java), infrastructure/ (with nginx, ssl, vm, ci, monitoring), docs/ (with decisions, tradeoffs, api).`,
      context: { projectRoot: args.projectRoot, websiteRoot: args.websiteRoot },
      instructions: [
        'Create all directories using mkdir -p',
        'Create placeholder .gitkeep files in empty dirs',
        'Verify the full tree was created',
        'Return summary of directories created'
      ],
      outputFormat: 'JSON with properties: directoriesCreated (array of paths), success (boolean), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'summary'],
      properties: {
        success: { type: 'boolean' },
        directoriesCreated: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase1', 'scaffold']
}));

export const writeADRsTask = defineTask('write-adrs', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Architect: Write Architecture Decision Records',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'System Architect for the Packman educational website',
      task: `Write 4 Architecture Decision Records as markdown files in ${args.websiteRoot}/docs/decisions/. Each ADR must have: Decision, Rationale, Alternatives Considered, Tradeoffs.`,
      context: {
        projectRoot: args.projectRoot,
        decisions: [
          'ADR-001-astro-framework.md: Choose Astro 4 with React islands over Next.js/Hugo/SPA. Rationale: 90% static content, islands for interactive widgets only, no Node runtime in production.',
          'ADR-002-wasm-strategy.md: Use Emscripten for C++ (SDL2 support, ~300KB), pygbag for Python (CPython+Pygame WASM, ~18MB), CheerpJ 3 for Java (unmodified Swing bytecode, ~30MB CDN). Each is the best fit for its language ecosystem.',
          'ADR-003-iframe-isolation.md: Embed each game variant in its own iframe to prevent keyboard conflicts and namespace collisions. PostMessage for score communication.',
          'ADR-004-static-hosting.md: Pre-built static site served by Nginx on OCI VM. No app server, no DB. Let Encrypt for SSL.'
        ]
      },
      instructions: [
        'Create each ADR file with proper markdown structure',
        'Include Decision, Rationale, Alternatives Considered, Tradeoffs sections',
        'Be specific about technical details and version numbers',
        'Return summary of files created'
      ],
      outputFormat: 'JSON with properties: filesCreated (array), success (boolean), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        filesCreated: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase1', 'architect']
}));

export const writeTradeoffsTask = defineTask('write-tradeoffs', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Architect: Write tradeoff analysis docs',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'System Architect analyzing tradeoffs for the Packman educational website',
      task: `Write 4 tradeoff analysis documents as markdown in ${args.websiteRoot}/docs/tradeoffs/`,
      context: {
        files: [
          'wasm-bundle-sizes.md: Compare C++ Emscripten (~300KB) vs Python/pygbag (~18MB) vs Java/CheerpJ (~30MB CDN). Loading time impact, caching strategies, loading indicators.',
          'cheerpj-vs-teavm.md: CheerpJ runs unmodified Swing (zero code changes, 30MB runtime) vs TeaVM (compiles to JS, cant render Swing, needs rewrite). Decision: CheerpJ.',
          'iframe-vs-inline-game.md: Iframe isolates globals+keyboard perfectly but needs PostMessage. Inline requires refactoring all game entry points. Decision: iframe.',
          'static-vs-dynamic-site.md: Static = Nginx only, CDN-ready, no server process. Dynamic = user accounts possible but adds complexity. Decision: static (YAGNI).'
        ]
      },
      instructions: [
        'Create each tradeoff doc with clear pro/con analysis',
        'Include concrete numbers (bundle sizes, load times) where applicable',
        'State the final decision and reasoning',
        'Return summary'
      ],
      outputFormat: 'JSON with success, filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase1', 'architect']
}));

export const writeAPIContractsTask = defineTask('write-contracts', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Architect: Define API contracts',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'System Architect defining interface contracts for the Packman website',
      task: `Write 2 API contract documents in ${args.websiteRoot}/docs/api/`,
      context: {
        contracts: [
          'snippet-schema.md: Define the CodeSnippet TypeScript interface used by the comparison widget. Fields: language (java|python|javascript|typescript|cpp), concept (string), filePath (string), startLine (number), endLine (number), code (string), highlightedHtml (string), annotations (string[]), correspondingLines (Record<string, number[]>).',
          'postmessage-protocol.md: Define the PostMessage protocol between game iframes and the parent website. Events: score-update {type, score, pellets}, game-over {type, won, finalScore}, game-ready {type, language}.'
        ]
      },
      instructions: [
        'Write clear contract docs with TypeScript interfaces',
        'Include example payloads for each message type',
        'Specify direction (game→parent, parent→game)',
        'Return summary'
      ],
      outputFormat: 'JSON with success, filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase1', 'architect']
}));

export const writePRDTask = defineTask('write-prd', (args, taskCtx) => ({
  kind: 'agent',
  title: 'PM: Write website PRD and acceptance criteria',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Product Manager for the Packman educational website',
      task: `Write the PRD and acceptance criteria for the educational website in ${args.websiteRoot}/docs/. Create PRD-website.md and acceptance-criteria.md.`,
      context: {
        projectRoot: args.projectRoot,
        scope: 'Website that hosts Pacman game playable in all 5 languages (JS, TS, C++/WASM, Python/WASM, Java/CheerpJ) with interactive cross-language code comparison widget. Hosted on OCI VM.',
        targetAudience: 'CS students learning multiple languages, self-taught developers, educators',
        sitemap: '15 pages: landing, play, 6 compare topics, architecture, 5 language deep-dives'
      },
      instructions: [
        'Write PRD with overview, goals, user stories (As [role], I want [action], so [benefit])',
        'Define MVP scope vs Phase 2',
        'Write acceptance criteria in given/when/then format',
        'Cover: game playability, code comparison, responsive design, performance',
        'Return summary'
      ],
      outputFormat: 'JSON with success, filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase1', 'pm']
}));

// --- Phase 2: Frontend Tasks ---

export const frontendScaffoldTask = defineTask('frontend-scaffold', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Frontend: Init Astro + Tailwind + React + BaseLayout',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Frontend developer building an Astro 4 website with React islands and Tailwind CSS',
      task: `Initialize the Astro project in ${args.websiteRoot}/frontend/ and create the BaseLayout with dark Pacman theme.`,
      context: {
        projectRoot: args.projectRoot,
        websiteRoot: args.websiteRoot,
        theme: 'Dark Pacman: black background (#000), yellow accents (#FFFF00), ghost colors (red #FF0000, pink #FFB8FF, cyan #00FFFF, magenta #FF00FF), blue walls (#0000FF). Use "Press Start 2P" Google Font for headings, monospace for code.'
      },
      instructions: [
        'Run: cd ' + args.websiteRoot + '/frontend && npm create astro@latest . -- --template minimal --no-install --typescript strict',
        'Install deps: npm install @astrojs/react @astrojs/tailwind react react-dom tailwindcss',
        'Configure astro.config.mjs with React and Tailwind integrations',
        'Create tailwind.config.cjs with Pacman color palette and Press Start 2P font',
        'Create src/layouts/BaseLayout.astro with: dark background, responsive nav bar (Packman logo, links: Play, Compare, Architecture, Languages), footer',
        'Create src/styles/global.css with Tailwind directives and Pacman theme variables',
        'Verify: npm run build succeeds',
        'Return summary of what was created'
      ],
      outputFormat: 'JSON with success (boolean), filesCreated (string[]), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'frontend', 'wave1']
}));

export const frontendPagesTask = defineTask('frontend-pages', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Frontend: Landing page, content collections, language pages, GameEmbed, Play page',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Frontend developer building Astro pages and React components for the Packman educational website',
      task: `Build the landing page, content collections, language deep-dive pages, GameEmbed component, and Play page in ${args.websiteRoot}/frontend/`,
      context: {
        projectRoot: args.projectRoot,
        websiteRoot: args.websiteRoot,
        existingDocs: 'docs/01_game_loop.md through docs/06_state_management.md (6 comparison docs)',
        existingReadmes: 'java/README.md, python/README.md, javascript/README.md, typescript/README.md, cpp/README.md',
        gameFiles: 'public/game/js/ and public/game/ts/ should already be populated'
      },
      instructions: [
        'Create src/pages/index.astro: Landing page with Pacman-themed hero (CSS animation), 5 language cards with icons, learning path section, CTA buttons to /play and /compare',
        'Create src/components/Hero.astro and src/components/LanguageCard.astro',
        'Setup Astro content collections in src/content/config.ts for comparisons/ and languages/',
        'Copy the 6 docs/*.md files into src/content/comparisons/ (rename to slugified names)',
        'Copy the 5 per-language README.md files into src/content/languages/',
        'Create src/pages/languages/[lang].astro dynamic route rendering each language README',
        'Create src/components/GameEmbed.tsx: React component wrapping iframe with language selector tabs (JS/TS/C++/Python/Java), focus management (glow border), restart button, loading indicator, instructions overlay',
        'Create src/pages/play.astro using GameEmbed component',
        'Verify: npm run build succeeds with all pages',
        'Return summary'
      ],
      outputFormat: 'JSON with success, filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'frontend', 'wave2']
}));

export const frontendComparisonWidgetTask = defineTask('frontend-comparison', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Frontend: Code comparison widget + compare pages',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer building the interactive code comparison widget for the Packman educational website',
      task: `Build the CodeComparisonWidget React component and compare pages in ${args.websiteRoot}/frontend/`,
      context: {
        projectRoot: args.projectRoot,
        websiteRoot: args.websiteRoot,
        snippetsFile: `${args.websiteRoot}/backend/data/snippets.json`,
        topics: ['game-loop', 'rendering', 'input-handling', 'collision-detection', 'ghost-ai', 'state-management']
      },
      instructions: [
        'Create src/components/CodePanel.tsx: Single code panel with syntax highlighting (use Shiki or prism), line numbers, highlight overlays for corresponding lines',
        'Create src/components/LanguageToggle.tsx: Row of toggleable language badges (Java/Python/JS/TS/C++)',
        'Create src/components/CodeComparisonWidget.tsx: Multi-panel code comparison with scroll sync, language toggle, annotation callouts, diff view toggle. Loads snippets from a JSON prop. Uses client:load directive.',
        'Create src/pages/compare/index.astro: Comparison hub page with cards linking to all 6 topics',
        'Create src/pages/compare/[slug].astro: Dynamic route for each comparison topic, renders the markdown content + embeds CodeComparisonWidget as React island',
        'Create src/layouts/CompareLayout.astro: Extends BaseLayout with sidebar navigation for the 6 comparison topics',
        'If snippets.json does not exist yet, create a placeholder with sample data for testing',
        'Verify: npm run build succeeds',
        'Return summary'
      ],
      outputFormat: 'JSON with success, filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'frontend', 'wave3']
}));

export const frontendPolishTask = defineTask('frontend-polish', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Frontend: Architecture page, responsive design, polish',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Frontend developer polishing the Packman educational website',
      task: `Build the architecture page, add responsive design, and polish the website in ${args.websiteRoot}/frontend/`,
      context: {
        projectRoot: args.projectRoot,
        websiteRoot: args.websiteRoot,
        architectureDoc: `${args.projectRoot}/docs/architecture/decision.md`
      },
      instructions: [
        'Create src/components/ArchitectureDiagram.tsx: Mermaid.js class diagram showing the 6-class structure (Maze, Pacman, Ghost, GameLogic, GamePanel, Main) with language selector that swaps method signatures',
        'Create src/pages/architecture.astro: Architecture overview page with diagram and class contracts',
        'Add responsive breakpoints: mobile (375px) shows single code panel with tabs, tablet (768px) shows 2 panels, desktop (1024px+) shows 2-3 panels',
        'Create src/pages/404.astro: Pacman ghost themed 404 page',
        'Add Open Graph meta tags to BaseLayout for social sharing',
        'Add Astro View Transitions for smooth page navigation',
        'Verify responsive layout at 375px, 768px, 1024px breakpoints',
        'Verify: npm run build succeeds with zero warnings',
        'Return summary'
      ],
      outputFormat: 'JSON with success, filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'frontend', 'wave4']
}));

// --- Phase 2: Backend Tasks ---

export const backendCopyGamesTask = defineTask('backend-copy-games', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Backend: Copy JS/TS game files to frontend',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Backend engineer preparing game files for the Packman website',
      task: `Copy the JavaScript and TypeScript game files into the frontend public directory for iframe embedding.`,
      context: {
        projectRoot: args.projectRoot,
        jsSource: `${args.projectRoot}/javascript/`,
        tsSource: `${args.projectRoot}/typescript/`,
        jsTarget: `${args.websiteRoot}/frontend/public/game/js/`,
        tsTarget: `${args.websiteRoot}/frontend/public/game/ts/`
      },
      instructions: [
        'Copy all .js files and index.html from javascript/ to frontend/public/game/js/',
        'Build the TypeScript version: cd typescript && npm install && npm run build',
        'Copy index.html and dist/bundle.js from typescript/ to frontend/public/game/ts/',
        'Verify both game dirs have all needed files',
        'Test: open frontend/public/game/js/index.html in a browser check (just verify files exist)',
        'Return summary of files copied'
      ],
      outputFormat: 'JSON with success, filesCopied (array), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCopied: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'backend', 'wave1']
}));

export const backendCppWasmTask = defineTask('backend-cpp-wasm', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Backend: C++ Emscripten WASM port',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Backend engineer porting C++/SDL2 Pacman to WebAssembly via Emscripten',
      task: `Port the C++ Pacman game to run in the browser via Emscripten. Modify cpp/main.cpp to add an #ifdef __EMSCRIPTEN__ block and create build scripts.`,
      context: {
        projectRoot: args.projectRoot,
        cppDir: `${args.projectRoot}/cpp/`,
        wasmOutputDir: `${args.websiteRoot}/backend/wasm/cpp/`,
        gameOutputDir: `${args.websiteRoot}/frontend/public/game/cpp/`,
        mainCppPath: `${args.projectRoot}/cpp/main.cpp`,
        cmakePath: `${args.projectRoot}/cpp/CMakeLists.txt`
      },
      instructions: [
        'Read cpp/main.cpp to understand the current game loop structure',
        'Add #ifdef __EMSCRIPTEN__ block that replaces the blocking while loop with emscripten_set_main_loop(). Keep the original loop in the #else block so desktop still works.',
        'The callback function for emscripten_set_main_loop should do: poll events, update game logic, render frame',
        'Create website/backend/wasm/cpp/CMakeLists.emscripten.txt with Emscripten flags: -s USE_SDL=2 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1',
        'Create website/backend/wasm/cpp/shell.html - minimal HTML template for the Emscripten output',
        'Create website/backend/scripts/build-cpp-wasm.sh that: checks for emcc, runs emcmake cmake with the emscripten CMake file, builds, copies output to frontend/public/game/cpp/',
        'If Emscripten is installed, attempt the build. If not, create the scripts and files and note that Emscripten needs to be installed for the actual build.',
        'Return summary'
      ],
      outputFormat: 'JSON with success, filesCreated, filesModified, buildAttempted (boolean), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        filesCreated: { type: 'array' },
        filesModified: { type: 'array' },
        buildAttempted: { type: 'boolean' },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'backend', 'wave2']
}));

export const backendPythonJavaWasmTask = defineTask('backend-python-java-wasm', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Backend: Python pygbag + Java CheerpJ ports',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Backend engineer porting Python/Pygame and Java/Swing Pacman to run in browsers',
      task: `Create the Python pygbag async adaptation and Java CheerpJ loader for browser-playable versions.`,
      context: {
        projectRoot: args.projectRoot,
        pythonDir: `${args.projectRoot}/python/`,
        javaDir: `${args.projectRoot}/java/`,
        wasmDir: `${args.websiteRoot}/backend/wasm/`,
        gameDir: `${args.websiteRoot}/frontend/public/game/`
      },
      instructions: [
        'PYTHON PYGBAG:',
        '- Read python/main.py to understand the game loop',
        '- Create website/backend/wasm/python/web_main.py: Copy main.py content, make main() async, add "import asyncio", add "await asyncio.sleep(0)" inside the while loop',
        '- Create website/backend/wasm/python/pygbag.toml with pygbag config',
        '- Create website/backend/scripts/build-python-wasm.sh that runs pygbag --build',
        '',
        'JAVA CHEERPJ:',
        '- Create website/backend/wasm/java/cheerpj-loader.html: HTML page that loads CheerpJ 3 runtime from CDN and runs the Pacman JAR via <cheerpj-applet> tag',
        '- Create website/backend/scripts/build-java-jar.sh that runs mvn package to build the JAR',
        '- The loader should reference /game/java/pacman-1.0.jar',
        '',
        'Return summary of all files created'
      ],
      outputFormat: 'JSON with success, filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'backend', 'wave3']
}));

export const backendSnippetsTask = defineTask('backend-snippets', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Backend: Extract code snippets + build orchestration',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Backend engineer building the code snippet extraction pipeline for the Packman website',
      task: `Create the snippet extraction script and build orchestration for the website.`,
      context: {
        projectRoot: args.projectRoot,
        websiteRoot: args.websiteRoot,
        sourceFiles: 'All .java, .py, .js, .ts, .cpp, .h files across the 5 language directories',
        notePattern: 'EDUCATIONAL NOTE blocks delimited by ═══ lines'
      },
      instructions: [
        'Create website/backend/scripts/extract-snippets.ts (or .js): Node.js script that:',
        '  - Reads all source files from java/src, python/, javascript/, typescript/src/, cpp/',
        '  - Parses EDUCATIONAL NOTE comment blocks (between ═══ delimiter lines)',
        '  - Extracts: concept name, code around the note, file path, start/end lines',
        '  - Keys snippets by concept (game-loop, rendering, input-handling, collision-detection, ghost-ai, state-management) and language',
        '  - Outputs structured JSON to website/backend/data/snippets.json',
        '  - The JSON should match the CodeSnippet interface from the API contracts',
        'Create website/backend/scripts/build-all-games.sh that orchestrates: build-cpp-wasm.sh, build-python-wasm.sh, build-java-jar.sh, and copies JS/TS files',
        'Run the snippet extraction to generate snippets.json',
        'Return summary with count of snippets extracted per language'
      ],
      outputFormat: 'JSON with success, snippetsCount (object with language keys), filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        snippetsCount: { type: 'object' },
        filesCreated: { type: 'array' },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'backend', 'wave4']
}));

// --- Phase 2: DevOps Tasks ---

export const devopsNginxTask = defineTask('devops-nginx', (args, taskCtx) => ({
  kind: 'agent',
  title: 'DevOps: Nginx config + WASM headers + VM provision script',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'DevOps engineer configuring Nginx and OCI VM for the Packman educational website',
      task: `Create Nginx configuration, WASM security headers, and VM provisioning script in ${args.websiteRoot}/infrastructure/`,
      context: {
        websiteRoot: args.websiteRoot
      },
      instructions: [
        'Create infrastructure/nginx/packman-edu.conf: Full Nginx vhost config with HTTPS redirect, HTTP/2, root /var/www/packman-edu, try_files for Astro static pages, 30-day cache on static assets, gzip compression, WASM MIME type',
        'Create infrastructure/nginx/headers.conf: CORS headers, Cross-Origin-Opener-Policy same-origin, Cross-Origin-Embedder-Policy require-corp (needed for SharedArrayBuffer in WASM), X-Frame-Options SAMEORIGIN for /game/ paths',
        'Create infrastructure/vm/provision.sh: OCI VM setup script that installs Nginx, Certbot, creates web root /var/www/packman-edu, opens firewall ports 80/443, copies Nginx config',
        'Create infrastructure/ssl/setup-certbot.sh: Script to run certbot --nginx for the domain',
        'Create infrastructure/vm/deploy.sh: Manual rsync deploy script from local build to VM',
        'Create infrastructure/monitoring/healthcheck.sh: Simple HTTP check script',
        'Return summary of files created'
      ],
      outputFormat: 'JSON with success, filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'devops', 'wave1']
}));

export const devopsCICDTask = defineTask('devops-cicd', (args, taskCtx) => ({
  kind: 'agent',
  title: 'DevOps: GitHub Actions CI/CD pipeline',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'DevOps engineer creating CI/CD pipelines for the Packman educational website',
      task: `Create GitHub Actions workflows for building and deploying the website.`,
      context: {
        projectRoot: args.projectRoot,
        websiteRoot: args.websiteRoot,
        workflowsDir: `${args.projectRoot}/.github/workflows/`
      },
      instructions: [
        'Create infrastructure/ci/deploy.yml: GitHub Actions workflow triggered on push to main that: 1) Sets up Node 20, 2) Installs and builds the Astro frontend, 3) Copies game files into build output, 4) Deploys via rsync to OCI VM using secrets OCI_HOST and OCI_SSH_KEY',
        'Create infrastructure/ci/build-wasm.yml: Reusable workflow for building WASM artifacts (Emscripten for C++, pygbag for Python, Maven for Java JAR)',
        'Also copy deploy.yml to .github/workflows/deploy.yml so it is picked up by GitHub',
        'Update .gitignore to add website/frontend/node_modules/, website/frontend/dist/, website/backend/data/snippets.json',
        'Return summary'
      ],
      outputFormat: 'JSON with success, filesCreated, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase2', 'devops', 'wave2']
}));

// --- Phase 3: Integration Tasks ---

export const integrationVerifyTask = defineTask('integration-verify', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Integrator: Verify full build and data contracts',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Integration engineer verifying the Packman website build',
      task: `Run a full integration verification of the website.`,
      context: {
        websiteRoot: args.websiteRoot,
        projectRoot: args.projectRoot
      },
      instructions: [
        'Verify frontend builds: cd website/frontend && npm run build',
        'Verify snippets.json exists and has entries for all 5 languages',
        'Verify all game directories are populated: public/game/js/, public/game/ts/, public/game/cpp/, public/game/python/, public/game/java/',
        'Verify Nginx config is syntactically valid (if nginx is installed: nginx -t -c ...)',
        'Verify GitHub Actions workflow YAML is valid',
        'Check for broken imports or missing files',
        'Return detailed report with buildSuccess, gamesReady, snippetsValid, configsValid'
      ],
      outputFormat: 'JSON with buildSuccess (boolean), gamesReady (object), snippetsValid (boolean), errors (array), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['buildSuccess'],
      properties: {
        buildSuccess: { type: 'boolean' },
        gamesReady: { type: 'object' },
        snippetsValid: { type: 'boolean' },
        errors: { type: 'array' },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase3', 'integrator']
}));

export const integrationFixTask = defineTask('integration-fix', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Integrator: Fix build errors',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Integration engineer fixing build errors for the Packman website',
      task: `Fix the build errors found during integration verification.`,
      context: {
        websiteRoot: args.websiteRoot,
        projectRoot: args.projectRoot,
        errors: args.errors
      },
      instructions: [
        'Analyze each error and identify root cause',
        'Fix the issues in the relevant files',
        'Re-run the build to verify fixes',
        'Return summary of fixes applied'
      ],
      outputFormat: 'JSON with success, fixesApplied (array), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, fixesApplied: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase3', 'integrator']
}));

// --- Phase 4: QA Tasks ---

export const qaTestingTask = defineTask('qa-testing', (args, taskCtx) => ({
  kind: 'agent',
  title: `QA: Test all features (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer testing the Packman educational website',
      task: `Run comprehensive QA testing of the website. Score quality 0-100.`,
      context: {
        websiteRoot: args.websiteRoot,
        projectRoot: args.projectRoot,
        iteration: args.iteration,
        previousFeedback: args.previousFeedback
      },
      instructions: [
        'Build the site: cd website/frontend && npm run build',
        'Verify all 15 pages are generated in dist/',
        'Check each game directory has files: public/game/{js,ts,cpp,python,java}/',
        'Verify JS game index.html loads properly (check file exists and has canvas element)',
        'Verify code comparison widget component exists and imports correctly',
        'Check responsive CSS: look for mobile/tablet/desktop breakpoints in component files',
        'Check for accessibility: alt tags, ARIA labels, color contrast',
        'Check that all internal links in pages resolve to existing pages',
        'Check meta tags (OG tags, title, description) in BaseLayout',
        'Score 0-100 based on: completeness (40pts), code quality (20pts), responsive design (20pts), accessibility (20pts)',
        'List any issues found',
        'Return score, issues, and recommendations'
      ],
      outputFormat: 'JSON with score (number 0-100), issues (array of {severity, description, file}), recommendations (array), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['score'],
      properties: {
        score: { type: 'number' },
        issues: { type: 'array' },
        recommendations: { type: 'array' },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase4', 'qa']
}));

export const qaFixIssuesTask = defineTask('qa-fix', (args, taskCtx) => ({
  kind: 'agent',
  title: `QA: Fix issues from iteration ${args.iteration}`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Developer fixing QA issues for the Packman website',
      task: `Fix the issues identified by QA testing.`,
      context: {
        websiteRoot: args.websiteRoot,
        projectRoot: args.projectRoot,
        issues: args.issues,
        iteration: args.iteration
      },
      instructions: [
        'Review each issue and fix it',
        'Prioritize by severity (high > medium > low)',
        'Verify fixes dont break other functionality',
        'Return summary of fixes'
      ],
      outputFormat: 'JSON with success, fixesApplied (array), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, fixesApplied: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase4', 'qa']
}));

// --- Phase 5: Deployment Task ---

export const deployToOCITask = defineTask('deploy-oci', (args, taskCtx) => ({
  kind: 'agent',
  title: 'DevOps: Deploy to OCI VM',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'DevOps engineer deploying the Packman website to OCI VM',
      task: `Prepare the final deployment package and document the deployment steps for the OCI VM.`,
      context: {
        websiteRoot: args.websiteRoot,
        projectRoot: args.projectRoot
      },
      instructions: [
        'Build the production site: cd website/frontend && npm run build',
        'Copy all game files into the dist/game/ directory',
        'Create a deployment checklist document at website/docs/DEPLOYMENT.md',
        'Document: 1) VM prerequisites (Nginx, Certbot), 2) DNS setup, 3) First deploy steps, 4) SSL setup, 5) Verify deployment',
        'Verify the dist/ directory has all needed files',
        'Note: actual rsync to VM will be done manually by the user with the deploy.sh script',
        'Return summary with deployment readiness status'
      ],
      outputFormat: 'JSON with success, distSize (string), deploymentReady (boolean), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        distSize: { type: 'string' },
        deploymentReady: { type: 'boolean' },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase5', 'devops']
}));
