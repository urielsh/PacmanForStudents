/**
 * @process packman-multi-lang-edu
 * @description Multi-language educational Pacman game implementation with quality-gated phases
 * @inputs { targetQuality: number, maxIterations: number }
 * @outputs { success: boolean, phases: object, finalQuality: number }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

// ============================================================================
// MAIN PROCESS
// ============================================================================

export async function process(inputs, ctx) {
  const {
    targetQuality = 85,
    maxIterations = 3
  } = inputs;

  const phaseResults = {};

  // ==========================================================================
  // PHASE 1: RESTRUCTURE REPO & FIX JAVA
  // ==========================================================================

  // Step 1.1 + 1.2: Restructure repo and create shared specs
  const restructureResult = await ctx.task(restructureRepoTask, {
    description: 'Move Java code to java/ subdirectory, create skeleton dirs for python/, javascript/, typescript/, cpp/, shared/, docs/. Create java/run.sh. Update shared/maze_layout.json and shared/game_constants.json with canonical specs from PRD.'
  });

  // Step 1.3: Fix all 4 bugs in Java code
  const bugFixResult = await ctx.task(fixJavaBugsTask, {
    description: 'Fix 4 bugs: (1) Pacman.isValidMove must call maze.isWall, (2) Ghost movement must call maze.isWall, (3) GamePanel.update must check gameLogic.isGameOver(), (4) Pinky color must be new Color(0xFF, 0xB8, 0xFF).'
  });

  // Step 1.4: Add educational annotations
  const annotationsResult = await ctx.task(addJavaAnnotationsTask, {
    description: 'Add 6 educational annotation blocks per Java source file covering: Game Loop Timing, Rendering/Drawing, Input Handling, Object Movement, Collision Detection, Ghost AI.'
  });

  // Step 1.5: Write Java tests
  const javaTestsResult = await ctx.task(writeJavaTestsTask, {
    description: 'Write JUnit 4 tests for Maze, Pacman, Ghost, and GameLogic. Tests must verify wall collision enforcement, pellet scoring, ghost collision, and game over state.'
  });

  // Quality gate: build and test Java
  let javaQualityPassed = false;
  let javaIteration = 0;

  while (!javaQualityPassed && javaIteration < maxIterations) {
    javaIteration++;

    const javaBuildResult = await ctx.task(buildAndTestJavaTask, {
      iteration: javaIteration
    });

    const javaQualityScore = await ctx.task(qualityScoringTask, {
      phase: 'Phase 1: Java',
      language: 'java',
      buildResult: javaBuildResult,
      iteration: javaIteration,
      targetQuality,
      checks: ['build', 'tests', 'bug-fixes', 'annotations']
    });

    if (javaQualityScore.overallScore >= targetQuality) {
      javaQualityPassed = true;
    } else {
      const fixResult = await ctx.task(fixQualityIssuesTask, {
        phase: 'Phase 1: Java',
        language: 'java',
        feedback: javaQualityScore.recommendations,
        iteration: javaIteration
      });
    }
  }

  // Step 1.6: Write Java README
  const javaReadmeResult = await ctx.task(writeLanguageReadmeTask, {
    language: 'java',
    highlights: ['OOP class hierarchy', 'Swing event dispatch thread', 'AWT/Swing rendering pipeline', 'Timer-based game loop'],
    exercises: ['Modify ghost AI to chase Pacman', 'Add power pellets with timer', 'Implement multiple lives']
  });

  // CP-1 Breakpoint
  await ctx.breakpoint({
    question: 'Phase 1 complete (Java restructure + bug fixes + tests + annotations). Review and approve to proceed to Phase 2 (Python)?',
    title: 'Checkpoint 1: Java Foundation Review',
    context: {
      runId: ctx.runId,
      files: []
    }
  });

  phaseResults.phase1 = { javaQualityPassed, iterations: javaIteration };

  // ==========================================================================
  // PHASES 2-5: LANGUAGE IMPLEMENTATIONS
  // ==========================================================================

  const languages = [
    {
      name: 'python', phase: 2, framework: 'Pygame',
      highlights: ['Dynamic typing', 'Simple game loop', 'List comprehensions for maze', 'No compilation step'],
      exercises: ['Add ghost chase AI using Manhattan distance', 'Implement level progression', 'Add sound effects with pygame.mixer']
    },
    {
      name: 'javascript', phase: 3, framework: 'HTML5 Canvas',
      highlights: ['Event-driven with requestAnimationFrame', 'Browser runtime', 'Prototype-based OOP', 'No compilation'],
      exercises: ['Add touch controls for mobile', 'Implement local storage high scores', 'Add CSS animations for game over']
    },
    {
      name: 'typescript', phase: 4, framework: 'HTML5 Canvas + Types',
      highlights: ['Static type system on top of JS', 'Interfaces for game entities', 'Enums for directions/ghost names', 'Compile-time error catching'],
      exercises: ['Add generic type for grid positions', 'Implement discriminated union for game states', 'Add strict null checks']
    },
    {
      name: 'cpp', phase: 5, framework: 'SDL2',
      highlights: ['Manual memory management', 'Header/source separation', 'RAII pattern for SDL resources', 'CMake build system'],
      exercises: ['Implement smart pointers for game objects', 'Add move semantics for Ghost vector', 'Profile with valgrind and optimize']
    }
  ];

  for (const lang of languages) {
    // Implement game logic
    const logicResult = await ctx.task(implementGameLogicTask, {
      language: lang.name,
      phase: lang.phase,
      framework: lang.framework,
      priorLanguages: languages.filter(l => l.phase < lang.phase).map(l => l.name)
    });

    // Implement rendering and game loop
    const renderResult = await ctx.task(implementRenderingTask, {
      language: lang.name,
      phase: lang.phase,
      framework: lang.framework
    });

    // Add educational annotations
    const annotResult = await ctx.task(addLanguageAnnotationsTask, {
      language: lang.name,
      phase: lang.phase,
      priorLanguages: languages.filter(l => l.phase < lang.phase).map(l => l.name).concat(['java'])
    });

    // Build infrastructure (run.sh, config files)
    const infraResult = await ctx.task(buildLanguageInfraTask, {
      language: lang.name,
      phase: lang.phase,
      framework: lang.framework
    });

    // Write tests
    const testsResult = await ctx.task(writeLanguageTestsTask, {
      language: lang.name,
      phase: lang.phase,
      framework: lang.framework
    });

    // Quality convergence loop
    let langQualityPassed = false;
    let langIteration = 0;

    while (!langQualityPassed && langIteration < maxIterations) {
      langIteration++;

      const buildResult = await ctx.task(buildAndTestLanguageTask, {
        language: lang.name,
        iteration: langIteration
      });

      const qualityScore = await ctx.task(qualityScoringTask, {
        phase: `Phase ${lang.phase}: ${lang.name}`,
        language: lang.name,
        buildResult,
        iteration: langIteration,
        targetQuality,
        checks: ['build', 'tests', 'annotations', 'behavior-match']
      });

      if (qualityScore.overallScore >= targetQuality) {
        langQualityPassed = true;
      } else {
        const fixResult = await ctx.task(fixQualityIssuesTask, {
          phase: `Phase ${lang.phase}: ${lang.name}`,
          language: lang.name,
          feedback: qualityScore.recommendations,
          iteration: langIteration
        });
      }
    }

    // Write README
    const readmeResult = await ctx.task(writeLanguageReadmeTask, {
      language: lang.name,
      highlights: lang.highlights,
      exercises: lang.exercises
    });

    // Checkpoint breakpoint
    await ctx.breakpoint({
      question: `Phase ${lang.phase} complete (${lang.name}/${lang.framework}). Review and approve to proceed?`,
      title: `Checkpoint ${lang.phase}: ${lang.name} Review`,
      context: {
        runId: ctx.runId,
        files: []
      }
    });

    phaseResults[`phase${lang.phase}`] = { langQualityPassed, iterations: langIteration };
  }

  // ==========================================================================
  // PHASE 6: LAUNCHER & DOCUMENTATION
  // ==========================================================================

  // Parallel: launcher + comparison docs + setup script
  const [launcherResult, compDocsResult, setupResult] = await ctx.parallel.all([
    () => ctx.task(buildLauncherTask, {
      description: 'Build Python curses TUI launcher with ASCII art, arrow-key menu, prerequisite detection, language blurbs, and educational comparisons submenu.'
    }),
    () => ctx.task(writeComparisonDocsTask, {
      description: 'Write 6 cross-language comparison docs: game_loop, rendering, input_handling, collision_detection, ghost_ai, state_management. Each with side-by-side code from all 5 languages.'
    }),
    () => ctx.task(buildSetupScriptTask, {
      description: 'Create setup.sh prerequisite checker/installer for all 5 languages.'
    })
  ]);

  // Rewrite root README
  const rootReadmeResult = await ctx.task(writeRootReadmeTask, {
    description: 'Rewrite README.md as the main educational guide and learning path. Include project overview, how to use launcher, learning path, and links to all comparison docs.'
  });

  await ctx.breakpoint({
    question: 'Phase 6 complete (launcher + 6 comparison docs + setup script + root README). Review and approve for final verification?',
    title: 'Checkpoint 6: Documentation Review',
    context: {
      runId: ctx.runId,
      files: []
    }
  });

  phaseResults.phase6 = { launcher: true, docs: true };

  // ==========================================================================
  // PHASE 7: POLISH & FINAL VERIFICATION
  // ==========================================================================

  // Parallel: verify all 5 languages build and tests pass
  const [javaVerify, pythonVerify, jsVerify, tsVerify, cppVerify] = await ctx.parallel.all([
    () => ctx.task(buildAndTestLanguageTask, { language: 'java', iteration: 1 }),
    () => ctx.task(buildAndTestLanguageTask, { language: 'python', iteration: 1 }),
    () => ctx.task(buildAndTestLanguageTask, { language: 'javascript', iteration: 1 }),
    () => ctx.task(buildAndTestLanguageTask, { language: 'typescript', iteration: 1 }),
    () => ctx.task(buildAndTestLanguageTask, { language: 'cpp', iteration: 1 })
  ]);

  // Cross-language verification
  const crossLangResult = await ctx.task(crossLanguageVerificationTask, {
    verificationResults: { java: javaVerify, python: pythonVerify, javascript: jsVerify, typescript: tsVerify, cpp: cppVerify }
  });

  // Final architecture review
  const finalReview = await ctx.task(finalArchitectureReviewTask, {
    phaseResults,
    crossLangResult
  });

  // Final breakpoint
  await ctx.breakpoint({
    question: `All phases complete. Final quality assessment: ${finalReview.verdict}. Approve for final sign-off?`,
    title: 'Final Sign-Off: Packman Multi-Language Educational Game',
    context: {
      runId: ctx.runId,
      files: []
    }
  });

  phaseResults.phase7 = { crossLangResult, finalReview };

  return {
    success: true,
    phases: phaseResults,
    finalQuality: finalReview.overallScore || targetQuality,
    metadata: {
      processId: 'packman-multi-lang-edu',
      timestamp: ctx.now()
    }
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

// --- Phase 1 Tasks ---

export const restructureRepoTask = defineTask('restructure-repo', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Restructure repository and create shared specs',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'DevOps engineer for Pacman multi-language educational project',
      task: args.description,
      context: {
        currentStructure: 'Java code at src/main/java/com/packman/, pom.xml at root',
        targetStructure: 'java/ subdir with pom.xml and src/, plus python/, javascript/, typescript/, cpp/, shared/, docs/ dirs',
        sharedSpecs: 'shared/game_constants.json and shared/maze_layout.json already created'
      },
      instructions: [
        'Move src/ directory into java/src/',
        'Move pom.xml into java/pom.xml',
        'Create java/run.sh that runs: cd "$(dirname "$0")" && mvn -q compile exec:java -Dexec.mainClass="com.packman.PacmanGame"',
        'Create empty placeholder dirs: python/, javascript/, typescript/, cpp/',
        'Create docs/ directory if not exists',
        'Verify the restructured java build works: cd java && mvn compile',
        'Do NOT modify any Java source code in this task'
      ],
      outputFormat: 'JSON with summary of changes made and verification result'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-1', 'devops', 'restructure']
}));

export const fixJavaBugsTask = defineTask('fix-java-bugs', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix 4 Java bugs (wall collision, game-over, color)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Backend game engine developer',
      task: args.description,
      context: {
        bug1: 'Pacman.java:46-48 isValidMove() only checks boundaries, must call maze.isWall(). Change update() to accept Maze parameter. Change isValidMove to accept Maze and use !maze.isWall(x,y)',
        bug2: 'Ghost.java:25-37 boundary checks must become maze.isWall() calls. Replace gridX > 0 with !maze.isWall(gridX-1, gridY) etc.',
        bug3: 'GamePanel.java update() must check gameLogic.isGameOver() and return early if true',
        bug4: 'GamePanel.java line 31: Color.PINK must become new Color(0xFF, 0xB8, 0xFF) per PRD spec',
        callSite: 'GamePanel.java line 65: pacman.update() must become pacman.update(gameLogic.getMaze())'
      },
      instructions: [
        'Fix bug 1: Pacman.update() signature to update(Maze maze), isValidMove to accept Maze and use !maze.isWall(x,y)',
        'Fix bug 2: Ghost.update() replace all boundary checks with maze.isWall() calls',
        'Fix bug 3: Add if (gameLogic.isGameOver()) return; at top of GamePanel.update()',
        'Fix bug 4: Replace Color.PINK with new Color(0xFF, 0xB8, 0xFF) for Pinky ghost',
        'Update call site: pacman.update() to pacman.update(gameLogic.getMaze())',
        'Verify the code compiles after changes',
        'Make ONLY these specific changes, do not refactor or add features'
      ],
      outputFormat: 'JSON with summary of each bug fix and compilation result'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-1', 'backend', 'bug-fix']
}));

export const addJavaAnnotationsTask = defineTask('add-java-annotations', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Add educational annotations to Java source files',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Educational content developer for game programming',
      task: args.description,
      context: {
        annotationFormat: '// ═══════════════════════════════════════════════════════\n// EDUCATIONAL NOTE: [Concept Name]\n// ═══════════════════════════════════════════════════════\n// [Explanation]\n// Compare with: [Language] → [How that language does it]\n// KEY CONCEPT: [Core takeaway]\n// ═══════════════════════════════════════════════════════',
        concepts: ['Game Loop Timing', 'Rendering/Drawing', 'Input Handling', 'Object Movement', 'Collision Detection', 'Ghost AI'],
        files: ['PacmanGame.java', 'GamePanel.java', 'GameLogic.java', 'Pacman.java', 'Ghost.java', 'Maze.java']
      },
      instructions: [
        'Add 6 educational annotation blocks per file where applicable',
        'Use the exact annotation format provided',
        'Cross-reference with Python (Pygame), JavaScript (Canvas), TypeScript, and C++ (SDL2)',
        'Place annotations near the relevant code sections',
        'Do NOT modify any game logic or functionality',
        'Each annotation should teach a key game development concept'
      ],
      outputFormat: 'JSON with summary of annotations added per file'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-1', 'frontend', 'annotations']
}));

export const writeJavaTestsTask = defineTask('write-java-tests', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Write Java JUnit 4 test suite',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer for Pacman game',
      task: args.description,
      context: {
        testFramework: 'JUnit 4.13.2 (already in pom.xml)',
        testLocation: 'java/src/test/java/com/packman/',
        classesUnderTest: ['Maze', 'Pacman', 'Ghost', 'GameLogic']
      },
      instructions: [
        'Create MazeTest.java: test wall generation (borders, internal walls), isWall for known positions, hasPellet, removePellet',
        'Create PacmanTest.java: test wall collision rejection (Pacman cannot move into wall), boundary behavior, direction queueing',
        'Create GhostTest.java: test wall collision rejection, ghost cannot move into known wall tiles',
        'Create GameLogicTest.java: test pellet scoring (+10 per pellet), ghost collision triggers gameOver, gameOver stops updates',
        'All tests must actually verify the bug fixes (wall checking) are working',
        'Use @Test annotations, assertEquals, assertTrue, assertFalse',
        'Run mvn test to verify all tests pass'
      ],
      outputFormat: 'JSON with test files created and test execution results'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-1', 'qa', 'tests']
}));

export const buildAndTestJavaTask = defineTask('build-test-java', (args, taskCtx) => ({
  kind: 'agent',
  title: `Build and test Java (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Build engineer',
      task: 'Build the Java Pacman project and run all tests. Report results.',
      context: {
        buildDir: 'java/',
        buildCommand: 'cd java && mvn clean compile test',
        iteration: args.iteration
      },
      instructions: [
        'Run: cd java && mvn clean compile test',
        'Capture full build output and test results',
        'Report number of tests passed/failed',
        'Report any compilation errors',
        'Only report results, do NOT fix any issues'
      ],
      outputFormat: 'JSON with buildSuccess (boolean), testsPassed (number), testsFailed (number), errors (array of strings)'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['quality-gate', 'java', `iteration-${args.iteration}`]
}));

// --- Shared Tasks (used across phases) ---

export const qualityScoringTask = defineTask('quality-scorer', (args, taskCtx) => ({
  kind: 'agent',
  title: `Quality score: ${args.phase} (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior QA engineer and code reviewer',
      task: `Score the quality of ${args.phase} implementation across multiple dimensions`,
      context: {
        phase: args.phase,
        language: args.language,
        buildResult: args.buildResult,
        iteration: args.iteration,
        targetQuality: args.targetQuality,
        checksRequired: args.checks
      },
      instructions: [
        'Review build results: did it compile and all tests pass?',
        'Check if bug fixes are properly implemented (for Java phase)',
        'Verify educational annotations are present and correct',
        'Check separation of concerns (no rendering in logic files)',
        'Verify naming conventions match language idioms',
        'Score each dimension 0-100, compute weighted average',
        'Provide specific actionable recommendations for any score below target',
        'List critical issues that block proceeding'
      ],
      outputFormat: 'JSON with overallScore (number 0-100), scores (object), recommendations (array of strings), criticalIssues (array)'
    },
    outputSchema: {
      type: 'object',
      required: ['overallScore', 'recommendations'],
      properties: {
        overallScore: { type: 'number' },
        recommendations: { type: 'array', items: { type: 'string' } },
        criticalIssues: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['quality-scoring', args.language, `iteration-${args.iteration}`]
}));

export const fixQualityIssuesTask = defineTask('fix-quality-issues', (args, taskCtx) => ({
  kind: 'agent',
  title: `Fix quality issues: ${args.phase} (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior developer fixing quality issues',
      task: `Fix the quality issues identified in ${args.phase}`,
      context: {
        phase: args.phase,
        language: args.language,
        feedback: args.feedback,
        iteration: args.iteration
      },
      instructions: [
        'Address each recommendation from the quality scorer',
        'Fix any compilation or test failures',
        'Fix any missing or incorrect annotations',
        'Fix any separation of concerns violations',
        'Do NOT add new features or refactor beyond what is needed',
        'Verify fixes compile successfully'
      ],
      outputFormat: 'JSON with summary of fixes applied'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['fix', args.language, `iteration-${args.iteration}`]
}));

// --- Phase 2-5 Tasks ---

export const implementGameLogicTask = defineTask('implement-game-logic', (args, taskCtx) => ({
  kind: 'agent',
  title: `Implement ${args.language} game logic`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: `Game engine developer implementing Pacman in ${args.language}`,
      task: `Implement the game logic modules for ${args.language} (Maze, Pacman, Ghost, GameLogic). These must have ZERO rendering/GUI imports.`,
      context: {
        language: args.language,
        framework: args.framework,
        phase: args.phase,
        priorLanguages: args.priorLanguages,
        gameConstants: 'See shared/game_constants.json for all constants',
        mazeLayout: 'See shared/maze_layout.json for wall positions',
        contracts: 'See docs/architecture/decision.md for class interface contracts',
        referenceImpl: 'java/ directory has the reference implementation'
      },
      instructions: [
        `Create ${args.language}/ directory with game logic files`,
        'Implement Maze: constructor, isWall, hasPellet, removePellet (NO rendering)',
        'Implement Pacman: constructor, setDirection, update(maze) with wall checking, getGridX/Y (NO rendering)',
        'Implement Ghost: constructor, update(maze) with wall checking and random AI every 20 frames, getGridX/Y (NO rendering)',
        'Implement GameLogic: constructor, checkCollisions, getMaze, getScore, isGameOver',
        'ALL movement must check maze.isWall() before moving (critical rule)',
        'Use language-idiomatic naming conventions',
        'Match behavior exactly to Java reference implementation',
        'Hardcode constants with comment: // Source of truth: shared/game_constants.json'
      ],
      outputFormat: 'JSON with files created and summary'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: [`phase-${args.phase}`, 'backend', args.language]
}));

export const implementRenderingTask = defineTask('implement-rendering', (args, taskCtx) => ({
  kind: 'agent',
  title: `Implement ${args.language} rendering and game loop`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: `Frontend/UI developer implementing Pacman rendering in ${args.language}`,
      task: `Implement the rendering, input handling, and game loop for ${args.language} using ${args.framework}`,
      context: {
        language: args.language,
        framework: args.framework,
        windowSize: '800x600 pixels',
        tileSize: '20px',
        fps: 60,
        referenceImpl: 'java/ directory has the reference implementation'
      },
      instructions: [
        'Create main entry point file and rendering/game panel file',
        'Implement 60 FPS game loop',
        'Render maze (blue walls, white pellets), Pacman (yellow circle), ghosts (colored rectangles with white eyes)',
        'Handle arrow key input to set Pacman direction',
        'Display score HUD',
        'Check gameOver state to stop updates',
        'Ghost colors: Blinky=#FF0000, Pinky=#FFB8FF, Inky=#00FFFF, Clyde=#FF00FF',
        'Keep rendering separate from game logic (read state via getters)'
      ],
      outputFormat: 'JSON with files created and summary'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: [`phase-${args.phase}`, 'frontend', args.language]
}));

export const addLanguageAnnotationsTask = defineTask('add-lang-annotations', (args, taskCtx) => ({
  kind: 'agent',
  title: `Add educational annotations to ${args.language}`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Educational content developer for game programming',
      task: `Add 6 educational annotation blocks per source file in ${args.language}/ directory`,
      context: {
        language: args.language,
        priorLanguages: args.priorLanguages,
        annotationFormat: 'Use language-appropriate comment syntax with the EDUCATIONAL NOTE format from PRD section 8.4',
        concepts: ['Game Loop Timing', 'Rendering/Drawing', 'Input Handling', 'Object Movement', 'Collision Detection', 'Ghost AI']
      },
      instructions: [
        'Add 6 annotation blocks per file where applicable',
        `Cross-reference with: ${args.priorLanguages.join(', ')}`,
        'Use language-idiomatic comment syntax',
        'Place annotations near relevant code sections',
        'Do NOT modify game logic or functionality',
        'Highlight what makes this language approach unique'
      ],
      outputFormat: 'JSON with annotations added per file'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: [`phase-${args.phase}`, 'annotations', args.language]
}));

export const buildLanguageInfraTask = defineTask('build-lang-infra', (args, taskCtx) => ({
  kind: 'agent',
  title: `Build ${args.language} infrastructure`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'DevOps engineer setting up build infrastructure',
      task: `Create build configuration and run script for ${args.language}`,
      context: {
        language: args.language,
        framework: args.framework,
        stacks: {
          python: 'requirements.txt (pygame), run.sh, pyproject.toml (ruff)',
          javascript: 'run.sh (opens browser), package.json (Jest)',
          typescript: 'tsconfig.json, package.json (typescript, vitest), run.sh',
          cpp: 'CMakeLists.txt (SDL2 find_package, GoogleTest FetchContent), run.sh, .clang-tidy'
        }
      },
      instructions: [
        `Create ${args.language}/run.sh that builds (if needed) and launches the game`,
        'Create all necessary config files for the language',
        'Ensure run.sh is executable (chmod +x)',
        'Test that the build/run command works',
        'Add test runner configuration'
      ],
      outputFormat: 'JSON with files created'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: [`phase-${args.phase}`, 'devops', args.language]
}));

export const writeLanguageTestsTask = defineTask('write-lang-tests', (args, taskCtx) => ({
  kind: 'agent',
  title: `Write ${args.language} test suite`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer writing tests',
      task: `Write test suite for ${args.language} Pacman implementation`,
      context: {
        language: args.language,
        testFrameworks: {
          python: 'pytest',
          javascript: 'Jest with jsdom',
          typescript: 'Vitest with jsdom',
          cpp: 'GoogleTest'
        }
      },
      instructions: [
        'Write tests for Maze: wall generation, isWall, hasPellet, removePellet',
        'Write tests for Pacman: wall collision rejection, direction queueing',
        'Write tests for Ghost: wall collision rejection, movement interval',
        'Write tests for GameLogic: pellet scoring, ghost collision, game over',
        'All tests must verify wall checking works (critical)',
        'Run the test suite and report results'
      ],
      outputFormat: 'JSON with test files created and test results'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: [`phase-${args.phase}`, 'qa', args.language]
}));

export const buildAndTestLanguageTask = defineTask('build-test-lang', (args, taskCtx) => ({
  kind: 'agent',
  title: `Build and test ${args.language} (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Build engineer verifying language implementation',
      task: `Build and test the ${args.language} Pacman implementation`,
      context: {
        language: args.language,
        buildCommands: {
          java: 'cd java && mvn clean compile test',
          python: 'cd python && pip install -r requirements.txt -q && python -m pytest -v',
          javascript: 'cd javascript && npm install && npm test',
          typescript: 'cd typescript && npm install && npx tsc --noEmit && npm test',
          cpp: 'cd cpp && cmake -B build && cmake --build build && cd build && ctest --output-on-failure'
        }
      },
      instructions: [
        `Run the build and test commands for ${args.language}`,
        'Capture all output',
        'Report pass/fail status with details',
        'Do NOT fix any issues, only report'
      ],
      outputFormat: 'JSON with buildSuccess (boolean), testsPassed (number), testsFailed (number), errors (array)'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['quality-gate', args.language, `iteration-${args.iteration}`]
}));

export const writeLanguageReadmeTask = defineTask('write-lang-readme', (args, taskCtx) => ({
  kind: 'agent',
  title: `Write ${args.language} README`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Technical writer for educational game project',
      task: `Write README.md for the ${args.language}/ directory`,
      context: {
        language: args.language,
        highlights: args.highlights,
        exercises: args.exercises
      },
      instructions: [
        'Write what makes this language approach unique',
        'Include prerequisites and setup instructions',
        'Include architecture overview',
        'Include "Things to Notice" section with the provided highlights',
        'Include exercises section with the provided exercises',
        'Keep it educational and accessible'
      ],
      outputFormat: 'JSON with summary'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['readme', args.language]
}));

// --- Phase 6 Tasks ---

export const buildLauncherTask = defineTask('build-launcher', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Build Python curses TUI launcher',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Python developer building a TUI application',
      task: args.description,
      context: {
        requirements: 'FR-1 through FR-7 from PRD',
        features: ['ASCII art title', 'Arrow-key menu', 'Prerequisite detection', 'Language blurbs', 'Launch via subprocess', 'Educational comparisons submenu']
      },
      instructions: [
        'Create launcher.py at project root using Python curses',
        'Implement ASCII art Pacman title screen',
        'Arrow-key navigable menu listing 5 languages',
        'Green/red prerequisite status per language',
        'Brief educational blurb when language is highlighted',
        'Enter to launch selected language run.sh',
        'Educational Comparisons submenu opening docs/',
        'Auto-detect: java, mvn, python3, pygame, xdg-open, npx, g++, libsdl2-dev',
        'Test that launcher.py runs without errors'
      ],
      outputFormat: 'JSON with summary and test result'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-6', 'launcher']
}));

export const writeComparisonDocsTask = defineTask('write-comparison-docs', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Write 6 cross-language comparison docs',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Technical educator writing cross-language comparisons',
      task: args.description,
      context: {
        docs: [
          'docs/01_game_loop.md',
          'docs/02_rendering.md',
          'docs/03_input_handling.md',
          'docs/04_collision_detection.md',
          'docs/05_ghost_ai.md',
          'docs/06_state_management.md'
        ],
        languages: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++']
      },
      instructions: [
        'Write all 6 comparison documents',
        'Each doc shows side-by-side code snippets from all 5 languages',
        'Include analysis of how each language approaches the concept differently',
        'End each doc with Key Takeaways and discussion questions',
        'Pull actual code snippets from the implementations',
        'Keep content educational and accessible'
      ],
      outputFormat: 'JSON with docs created'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-6', 'documentation']
}));

export const buildSetupScriptTask = defineTask('build-setup-script', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Create setup.sh prerequisite checker',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'DevOps engineer',
      task: args.description,
      context: {
        prerequisites: {
          java: ['java', 'mvn'],
          python: ['python3', 'pip3', 'pygame module'],
          javascript: ['node', 'npm', 'browser (xdg-open)'],
          typescript: ['node', 'npm', 'npx'],
          cpp: ['g++', 'cmake', 'libsdl2-dev']
        }
      },
      instructions: [
        'Create setup.sh at project root',
        'Check each prerequisite and report status (green checkmark or red X)',
        'Offer to install missing dependencies where possible',
        'Make script executable'
      ],
      outputFormat: 'JSON with summary'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-6', 'devops']
}));

export const writeRootReadmeTask = defineTask('write-root-readme', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Rewrite root README.md',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Technical writer for educational project',
      task: args.description,
      context: {
        projectName: 'Educational Multi-Language Pacman',
        languages: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++']
      },
      instructions: [
        'Rewrite README.md as the main educational guide',
        'Include project overview and learning objectives',
        'Describe how to use the launcher',
        'Suggest a learning path through the languages',
        'Link to all 6 comparison docs',
        'Link to each language README',
        'Include quick start instructions'
      ],
      outputFormat: 'JSON with summary'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-6', 'documentation']
}));

// --- Phase 7 Tasks ---

export const crossLanguageVerificationTask = defineTask('cross-lang-verify', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Cross-language behavior verification',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer verifying cross-language consistency',
      task: 'Verify all 5 Pacman implementations have identical behavior',
      context: {
        verificationResults: args.verificationResults
      },
      instructions: [
        'Compare maze layouts across all 5 implementations (same walls, same pellets)',
        'Verify scoring logic is identical (10 points per pellet)',
        'Verify ghost timing is identical (move every 20 frames)',
        'Verify wall collision logic in all implementations',
        'Verify game over detection in all implementations',
        'Report any behavioral differences',
        'Check that all tests pass in all languages'
      ],
      outputFormat: 'JSON with verification results per language and any discrepancies found'
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-7', 'verification']
}));

export const finalArchitectureReviewTask = defineTask('final-arch-review', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Final architecture and clean code review',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Principal architect conducting final review',
      task: 'Conduct final architecture review of the entire Packman multi-language educational project',
      context: {
        phaseResults: args.phaseResults,
        crossLangResult: args.crossLangResult,
        cleanCodeStandards: [
          'Separation of concerns: logic files have ZERO rendering imports',
          'Naming: PascalCase classes, language-idiomatic methods, UPPER_SNAKE constants',
          'Documentation: file docstring + method docs + 6 annotations per file',
          'Testing: 5+ test files per language',
          'Wall collision: every movement checks maze.isWall()'
        ]
      },
      instructions: [
        'Review separation of concerns across all 5 implementations',
        'Verify naming conventions per language',
        'Check annotation quality and cross-reference accuracy',
        'Verify all PRD Section 11 acceptance criteria',
        'Provide final verdict and overall quality score',
        'List any remaining issues'
      ],
      outputFormat: 'JSON with verdict (string), overallScore (number), approved (boolean), issues (array)'
    },
    outputSchema: {
      type: 'object',
      required: ['verdict', 'overallScore', 'approved'],
      properties: {
        verdict: { type: 'string' },
        overallScore: { type: 'number' },
        approved: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['phase-7', 'final-review']
}));
