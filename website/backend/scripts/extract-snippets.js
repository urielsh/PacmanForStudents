#!/usr/bin/env node
// ============================================================================
// extract-snippets.js -- Extracts EDUCATIONAL NOTE blocks from Packman source
// files across 5 languages and produces website/backend/data/snippets.json.
// ============================================================================

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'website', 'backend', 'data', 'snippets.json');

// Language source directories and file patterns (relative to PROJECT_ROOT)
const LANGUAGE_SOURCES = {
    java: {
        dir: 'java/src/main/java/com/packman',
        extensions: ['.java'],
        commentPrefix: '//',
    },
    python: {
        dir: 'python',
        extensions: ['.py'],
        commentPrefix: '#',
    },
    javascript: {
        dir: 'javascript',
        extensions: ['.js'],
        commentPrefix: '//',
    },
    typescript: {
        dir: 'typescript/src',
        extensions: ['.ts'],
        commentPrefix: '//',
    },
    cpp: {
        dir: 'cpp',
        extensions: ['.cpp', '.h'],
        commentPrefix: '//',
    },
};

// Mapping from concept name fragments to canonical topic slugs.
// Order matters: more specific patterns are checked first.
const TOPIC_MAPPINGS = [
    // Game loop
    { pattern: /game\s*loop\s*timing/i, topic: 'game-loop' },
    { pattern: /game\s*loop/i, topic: 'game-loop' },
    { pattern: /game\s*lifecycle\s*start/i, topic: 'game-loop' },
    { pattern: /update[- ]render\s*separation/i, topic: 'game-loop' },
    { pattern: /tick\s*orchestration/i, topic: 'game-loop' },
    { pattern: /fixed\s*frame\s*rate/i, topic: 'game-loop' },
    { pattern: /classic\s*game\s*loop/i, topic: 'game-loop' },
    { pattern: /frame[- ]counter\s*throttle/i, topic: 'game-loop' },

    // Rendering
    { pattern: /rendering/i, topic: 'rendering' },
    { pattern: /drawing/i, topic: 'rendering' },
    { pattern: /paint\s*component/i, topic: 'rendering' },
    { pattern: /hud/i, topic: 'rendering' },
    { pattern: /tile[- ]based\s*drawing/i, topic: 'rendering' },
    { pattern: /canvas\s*2d/i, topic: 'rendering' },
    { pattern: /sdl2\s*draw/i, topic: 'rendering' },
    { pattern: /alpha\s*blending/i, topic: 'rendering' },
    { pattern: /grid\s*data\s*structure/i, topic: 'rendering' },
    { pattern: /getter[- ]based\s*api/i, topic: 'rendering' },
    { pattern: /type\s*assertions/i, topic: 'rendering' },

    // Input handling
    { pattern: /input\s*handling/i, topic: 'input-handling' },
    { pattern: /input\s*buffer/i, topic: 'input-handling' },
    { pattern: /direction\s*buffer/i, topic: 'input-handling' },
    { pattern: /direction\s*queuing/i, topic: 'input-handling' },
    { pattern: /key\s*listener/i, topic: 'input-handling' },
    { pattern: /focus\s*&?\s*listeners/i, topic: 'input-handling' },
    { pattern: /typed\s*event\s*listeners/i, topic: 'input-handling' },
    { pattern: /sdl2\s*event/i, topic: 'input-handling' },

    // Collision detection
    { pattern: /collision\s*detect/i, topic: 'collision-detection' },
    { pattern: /pellet\s*collection/i, topic: 'collision-detection' },
    { pattern: /ghost\s*collision/i, topic: 'collision-detection' },
    { pattern: /wall\s*collision/i, topic: 'collision-detection' },
    { pattern: /wall\s*check/i, topic: 'collision-detection' },
    { pattern: /bounds[- ]check/i, topic: 'collision-detection' },
    { pattern: /boundary\s*check/i, topic: 'collision-detection' },
    { pattern: /grid[- ]based\s*collision/i, topic: 'collision-detection' },
    { pattern: /readonly\s*collections/i, topic: 'collision-detection' },
    { pattern: /wall\s*query/i, topic: 'collision-detection' },
    { pattern: /entity\s*vs.*entity/i, topic: 'collision-detection' },

    // Ghost AI
    { pattern: /ghost\s*ai/i, topic: 'ghost-ai' },
    { pattern: /random\s*movement/i, topic: 'ghost-ai' },
    { pattern: /random[- ]walk/i, topic: 'ghost-ai' },
    { pattern: /npc/i, topic: 'ghost-ai' },
    { pattern: /ghost\s*entity/i, topic: 'ghost-ai' },
    { pattern: /immutable\s*direction\s*tuples/i, topic: 'ghost-ai' },
    { pattern: /random\s*direction/i, topic: 'ghost-ai' },
    { pattern: /returning\s*const\s*references/i, topic: 'ghost-ai' },

    // State management
    { pattern: /state\s*manage/i, topic: 'state-management' },
    { pattern: /separation\s*of\s*concerns/i, topic: 'state-management' },
    { pattern: /game\s*logic\s*layer/i, topic: 'state-management' },
    { pattern: /component\s*composition/i, topic: 'state-management' },
    { pattern: /entry\s*point/i, topic: 'state-management' },
    { pattern: /thread\s*safety/i, topic: 'state-management' },
    { pattern: /entity\s*class/i, topic: 'state-management' },
    { pattern: /level\s*initialization/i, topic: 'state-management' },
    { pattern: /object\s*construction/i, topic: 'state-management' },
    { pattern: /composition.*owning/i, topic: 'state-management' },
    { pattern: /const.*overload/i, topic: 'state-management' },
    { pattern: /header.*source\s*separation/i, topic: 'state-management' },
    { pattern: /static\s*const\s*arrays/i, topic: 'state-management' },
    { pattern: /forward\s*declaration/i, topic: 'state-management' },
    { pattern: /sdl2\s*resource\s*ownership/i, topic: 'state-management' },
    { pattern: /static\s*utility\s*methods/i, topic: 'state-management' },
    { pattern: /member\s*initializer/i, topic: 'state-management' },
    { pattern: /emplace_back/i, topic: 'state-management' },
    { pattern: /range[- ]based\s*for/i, topic: 'state-management' },
    { pattern: /manual\s*resource\s*management/i, topic: 'state-management' },
    { pattern: /deterministic\s*cleanup/i, topic: 'state-management' },
    { pattern: /const\s*correctness/i, topic: 'state-management' },
    { pattern: /access\s*modifiers/i, topic: 'state-management' },
    { pattern: /underscore.*privates/i, topic: 'state-management' },
    { pattern: /readonly\s*parameter/i, topic: 'state-management' },
    { pattern: /string\s*parsing/i, topic: 'state-management' },

    // Object movement
    { pattern: /object\s*movement/i, topic: 'collision-detection' },
    { pattern: /grid[- ]based.*motion/i, topic: 'collision-detection' },
    { pattern: /direction\s*switch/i, topic: 'ghost-ai' },
];

// ---------------------------------------------------------------------------
// Delimiter detection
// ---------------------------------------------------------------------------

const DELIMITER_RE = /[=]{5,}/;  // Five or more = characters on a line

function isDelimiterLine(line) {
    return DELIMITER_RE.test(line);
}

// ---------------------------------------------------------------------------
// Parse a single source file for educational note blocks
// ---------------------------------------------------------------------------

function parseFile(filePath, commentPrefix) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const notes = [];
    let i = 0;

    while (i < lines.length) {
        // Look for opening delimiter
        if (isDelimiterLine(lines[i])) {
            const blockStart = i; // line index of first ═══ delimiter

            // Next line should contain EDUCATIONAL NOTE: <concept>
            const titleLineIdx = i + 1;
            if (titleLineIdx >= lines.length) { i++; continue; }

            const titleLine = lines[titleLineIdx];
            const noteMatch = titleLine.match(/EDUCATIONAL\s+NOTE:\s*(.+)/i);
            if (!noteMatch) { i++; continue; }

            const conceptRaw = noteMatch[1].trim();

            // Find the closing delimiter
            let closingIdx = -1;
            for (let j = titleLineIdx + 1; j < lines.length; j++) {
                if (isDelimiterLine(lines[j])) {
                    closingIdx = j;
                    break;
                }
            }
            if (closingIdx === -1) { i++; continue; }

            // Extract KEY CONCEPT text from within the note block
            let keyConcept = null;
            for (let k = titleLineIdx + 1; k < closingIdx; k++) {
                const kcMatch = lines[k].match(/KEY\s+CONCEPT:\s*(.+)/i);
                if (kcMatch) {
                    // Collect the KEY CONCEPT text (may span multiple lines)
                    let kcText = kcMatch[1].trim();
                    for (let m = k + 1; m < closingIdx; m++) {
                        const stripped = lines[m].replace(/^\s*(?:\/\/|#)\s?/, '').trim();
                        if (stripped && !stripped.match(/^[=]+$/) && !stripped.match(/^Compare with/i)) {
                            kcText += ' ' + stripped;
                        } else {
                            break;
                        }
                    }
                    keyConcept = kcText;
                    break;
                }
            }

            notes.push({
                concept: conceptRaw,
                keyConcept: keyConcept,
                blockStartLine: blockStart + 1, // 1-indexed
                blockEndLine: closingIdx + 1,   // 1-indexed
            });

            i = closingIdx + 1;
        } else {
            i++;
        }
    }

    return { lines, notes };
}

// ---------------------------------------------------------------------------
// Map concept name to topic
// ---------------------------------------------------------------------------

function mapToTopic(conceptName) {
    for (const mapping of TOPIC_MAPPINGS) {
        if (mapping.pattern.test(conceptName)) {
            return mapping.topic;
        }
    }
    return null; // no match
}

// ---------------------------------------------------------------------------
// Find the enclosing function/method/class around a note block
// ---------------------------------------------------------------------------

function findEnclosingBlock(lines, noteBlockStart, noteBlockEnd, lang) {
    // noteBlockStart and noteBlockEnd are 0-indexed line numbers
    // We search upward from the note to find the start of the enclosing
    // function/method/class, then downward to find its end.

    const braceLanguages = ['java', 'javascript', 'typescript', 'cpp'];
    const useBraces = braceLanguages.includes(lang);

    if (useBraces) {
        return findBraceBlock(lines, noteBlockStart, noteBlockEnd);
    } else {
        // Python -- use indentation
        return findPythonBlock(lines, noteBlockStart, noteBlockEnd);
    }
}

function findBraceBlock(lines, noteStart, noteEnd) {
    // Search upward from the note for a function/method/class declaration
    let funcStartLine = noteStart;

    // Look upward for a line that looks like a function/method/class start
    for (let i = noteStart - 1; i >= 0; i--) {
        const line = lines[i].trim();

        // Skip empty lines and comments
        if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue;

        // Check for function/method/class declarations
        if (line.match(/^(public|private|protected|static|void|int|bool|boolean|class|function|const|let|var|export|async|override|@Override)/i) ||
            line.match(/^\w+.*\(/) ||  // function/method call pattern
            line.match(/^\w+\s+\w+.*{/) || // class/method opening
            line.match(/^}/) // end of previous block
        ) {
            // Found a significant code line
            if (line.match(/^}/)) {
                // End of previous block -- our block starts after this
                funcStartLine = i + 1;
                break;
            }
            funcStartLine = i;
            break;
        }
    }

    // Search downward from the note for the end of the enclosing block
    // Track brace depth from the function start
    let funcEndLine = noteEnd;
    let braceDepth = 0;
    let foundOpenBrace = false;

    for (let i = funcStartLine; i < lines.length; i++) {
        const line = lines[i];
        // Count braces (simplistic -- doesn't handle strings/comments)
        for (const ch of line) {
            if (ch === '{') {
                braceDepth++;
                foundOpenBrace = true;
            } else if (ch === '}') {
                braceDepth--;
                if (foundOpenBrace && braceDepth <= 0) {
                    funcEndLine = i;
                    return { startLine: funcStartLine + 1, endLine: funcEndLine + 1 }; // 1-indexed
                }
            }
        }
    }

    // Fallback: return a reasonable range around the note
    return { startLine: funcStartLine + 1, endLine: Math.min(noteEnd + 10, lines.length) };
}

function findPythonBlock(lines, noteStart, noteEnd) {
    // Find the enclosing function/class by checking indentation
    let funcStartLine = noteStart;

    // The note's indentation level
    const noteIndent = (lines[noteStart].match(/^(\s*)/) || ['', ''])[1].length;

    // Search upward for a def/class at a lesser or equal indentation
    for (let i = noteStart - 1; i >= 0; i--) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) continue;

        const indent = (line.match(/^(\s*)/) || ['', ''])[1].length;
        if (indent < noteIndent && (trimmed.startsWith('def ') || trimmed.startsWith('class ') || trimmed.startsWith('@'))) {
            funcStartLine = i;
            break;
        }
        if (indent === 0 && (trimmed.startsWith('def ') || trimmed.startsWith('class '))) {
            funcStartLine = i;
            break;
        }
    }

    // Search downward for the end of the block (next line at same or lesser indentation)
    const funcIndent = (lines[funcStartLine].match(/^(\s*)/) || ['', ''])[1].length;
    let funcEndLine = noteEnd;

    for (let i = noteEnd + 1; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) continue;

        const indent = (line.match(/^(\s*)/) || ['', ''])[1].length;
        if (indent <= funcIndent && (trimmed.startsWith('def ') || trimmed.startsWith('class ') || trimmed.startsWith('@') || trimmed.startsWith('if __name__'))) {
            funcEndLine = i - 1;
            // Skip trailing blank lines
            while (funcEndLine > noteEnd && !lines[funcEndLine].trim()) {
                funcEndLine--;
            }
            break;
        }
        funcEndLine = i;
    }

    return { startLine: funcStartLine + 1, endLine: funcEndLine + 1 }; // 1-indexed
}

// ---------------------------------------------------------------------------
// Select the BEST note per topic per language
// ---------------------------------------------------------------------------

// For each topic, we prefer the note whose concept name most directly matches
// the topic. We score notes and pick the best.
function scoreConcept(concept, topic) {
    const topicWords = topic.split('-');
    let score = 0;
    const lower = concept.toLowerCase();

    for (const word of topicWords) {
        if (lower.includes(word)) score += 10;
    }

    // Penalise very generic names
    if (lower.length < 20) score += 5;
    if (lower.length > 60) score -= 3;

    return score;
}

// ---------------------------------------------------------------------------
// Generate annotations from KEY CONCEPT text
// ---------------------------------------------------------------------------

function generateAnnotations(codeLines, keyConcept, blockStartLine) {
    const annotations = [];

    if (!keyConcept) return annotations;

    // Split code lines and look for notable patterns to annotate
    for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i].trim();
        // Skip empty and comment-only lines
        if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('/*') || line.startsWith('*')) continue;

        // Annotate key structural lines (first few significant lines)
        if (annotations.length < 5) {
            // Look for recognizable patterns
            if (line.match(/(function|def |class |public |private |void |while|for |if |switch|case )/)) {
                // Create a brief annotation from the code pattern
                let text = '';
                if (line.match(/while\s*\(/)) text = 'Loop condition controls game lifecycle';
                else if (line.match(/for\s*[\(|]/)) text = 'Iteration over game entities';
                else if (line.match(/if\s*\(/)) text = 'Conditional game logic branch';
                else if (line.match(/switch\s*\(/)) text = 'Direction dispatch via switch/case';
                else if (line.match(/function\s+\w+|def\s+\w+/)) text = 'Function/method definition';
                else if (line.match(/class\s+\w+/)) text = 'Class definition';

                if (text) {
                    annotations.push({ line: i + 1, text: text }); // 1-indexed within snippet
                }
            }
        }
    }

    // Always add the KEY CONCEPT as the last annotation
    if (keyConcept) {
        annotations.push({ line: 1, text: keyConcept });
    }

    return annotations;
}

// ---------------------------------------------------------------------------
// Main extraction logic
// ---------------------------------------------------------------------------

function extractSnippets() {
    const allNotes = {}; // topic -> language -> [{ note, file, lines, code }]

    for (const [lang, config] of Object.entries(LANGUAGE_SOURCES)) {
        const absDir = path.join(PROJECT_ROOT, config.dir);

        if (!fs.existsSync(absDir)) {
            console.warn(`WARNING: Directory not found: ${absDir}`);
            continue;
        }

        const files = fs.readdirSync(absDir)
            .filter(f => config.extensions.some(ext => f.endsWith(ext)))
            .filter(f => !f.includes('.test.'));  // Skip test files

        for (const file of files) {
            const filePath = path.join(absDir, file);
            const { lines, notes } = parseFile(filePath, config.commentPrefix);

            for (const note of notes) {
                const topic = mapToTopic(note.concept);
                if (!topic) {
                    // Try to assign to a reasonable topic based on file context
                    continue;
                }

                // Find enclosing code block
                const blockBounds = findEnclosingBlock(
                    lines,
                    note.blockStartLine - 1,  // convert back to 0-indexed
                    note.blockEndLine - 1,
                    lang
                );

                // Extract the code
                const codeLines = lines.slice(blockBounds.startLine - 1, blockBounds.endLine);
                // Strip comment-only lines that are the educational note itself
                const filteredCode = codeLines.filter(line => {
                    return !isDelimiterLine(line) &&
                           !line.match(/EDUCATIONAL\s+NOTE:/i) &&
                           !line.match(/^\s*(?:\/\/|#)\s*Compare with:/i);
                });

                const code = filteredCode.join('\n');

                // Generate annotations
                const annotations = generateAnnotations(
                    filteredCode,
                    note.keyConcept,
                    blockBounds.startLine
                );

                if (!allNotes[topic]) allNotes[topic] = {};
                if (!allNotes[topic][lang]) allNotes[topic][lang] = [];

                allNotes[topic][lang].push({
                    concept: note.concept,
                    code: code,
                    file: file,
                    startLine: blockBounds.startLine,
                    endLine: blockBounds.endLine,
                    annotations: annotations,
                    score: scoreConcept(note.concept, topic),
                });
            }
        }
    }

    // For each topic+language, pick the best (highest-scoring) note
    const result = {};
    const TOPICS = ['game-loop', 'rendering', 'input-handling', 'collision-detection', 'ghost-ai', 'state-management'];

    for (const topic of TOPICS) {
        result[topic] = {};
        if (!allNotes[topic]) continue;

        for (const lang of Object.keys(LANGUAGE_SOURCES)) {
            const candidates = allNotes[topic][lang];
            if (!candidates || candidates.length === 0) continue;

            // Sort by score descending, pick best
            candidates.sort((a, b) => b.score - a.score);
            const best = candidates[0];

            result[topic][lang] = {
                code: best.code,
                file: best.file,
                startLine: best.startLine,
                endLine: best.endLine,
                annotations: best.annotations,
            };
        }
    }

    return result;
}

// ---------------------------------------------------------------------------
// Run and output
// ---------------------------------------------------------------------------

function main() {
    console.log('=== Packman Snippet Extraction ===');
    console.log(`Project root: ${PROJECT_ROOT}`);
    console.log(`Output file:  ${OUTPUT_FILE}`);
    console.log('');

    const snippets = extractSnippets();

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the output
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(snippets, null, 2) + '\n', 'utf-8');

    // Print summary
    const summary = {};
    let totalSnippets = 0;

    const TOPICS = ['game-loop', 'rendering', 'input-handling', 'collision-detection', 'ghost-ai', 'state-management'];
    for (const topic of TOPICS) {
        const topicData = snippets[topic] || {};
        const langs = Object.keys(topicData);
        console.log(`  ${topic}: ${langs.length} languages [${langs.join(', ')}]`);
        for (const lang of langs) {
            if (!summary[lang]) summary[lang] = 0;
            summary[lang]++;
            totalSnippets++;
        }
    }

    console.log('');
    console.log('Per-language counts:');
    for (const [lang, count] of Object.entries(summary)) {
        console.log(`  ${lang}: ${count} snippets`);
    }
    console.log('');
    console.log(`Total: ${totalSnippets} snippets across ${Object.keys(summary).length} languages`);
    console.log(`Written to: ${OUTPUT_FILE}`);

    // Output machine-readable JSON summary to stdout
    const resultSummary = {
        success: true,
        snippetsCount: summary,
        totalSnippets: totalSnippets,
        topics: TOPICS.map(t => ({
            topic: t,
            languages: Object.keys(snippets[t] || {}),
        })),
    };

    console.log('\n--- JSON SUMMARY ---');
    console.log(JSON.stringify(resultSummary));
}

main();
