/**
 * CodeComparisonWidget.tsx - Main comparison widget that shows code panels side by side.
 *
 * Features:
 * - Shows code panels for selected languages (2-5 panels)
 * - Scroll sync: scrolling one panel scrolls all others
 * - Uses CodePanel and LanguageToggle components
 * - Responsive: stacks vertically on mobile, side-by-side on desktop
 */

import { useState, useCallback, useRef } from 'react';
import CodePanel from './CodePanel';
import LanguageToggle from './LanguageToggle';
import type { CodePanelHandle, Annotation } from './CodePanel';

export interface SnippetData {
  code: string;
  file: string;
  startLine: number;
  endLine: number;
  annotations: Annotation[];
}

export interface TopicSnippets {
  [language: string]: SnippetData;
}

interface CodeComparisonWidgetProps {
  topic: string;
  snippets: TopicSnippets;
}

const TOPIC_LABELS: Record<string, string> = {
  'game-loop': 'Game Loop',
  rendering: 'Rendering',
  'input-handling': 'Input Handling',
  'collision-detection': 'Collision Detection',
  'ghost-ai': 'Ghost AI',
  'state-management': 'State Management',
};

export default function CodeComparisonWidget({ topic, snippets }: CodeComparisonWidgetProps) {
  const [activeLangs, setActiveLangs] = useState<string[]>(['java', 'python']);
  const panelRefs = useRef<Map<string, CodePanelHandle>>(new Map());
  const isSyncing = useRef(false);

  const handleToggle = useCallback((langId: string) => {
    setActiveLangs((prev) => {
      if (prev.includes(langId)) {
        if (prev.length <= 2) return prev;
        return prev.filter((l) => l !== langId);
      }
      return [...prev, langId];
    });
  }, []);

  const handleScroll = useCallback(
    (scrollTop: number, sourceLang: string) => {
      if (isSyncing.current) return;
      isSyncing.current = true;

      // Sync all other panels to the same scroll position
      panelRefs.current.forEach((handle, lang) => {
        if (lang !== sourceLang) {
          handle.setScrollTop(scrollTop);
        }
      });

      requestAnimationFrame(() => {
        isSyncing.current = false;
      });
    },
    []
  );

  const registerRef = useCallback((lang: string, handle: CodePanelHandle | null) => {
    if (handle) {
      panelRefs.current.set(lang, handle);
    } else {
      panelRefs.current.delete(lang);
    }
  }, []);

  const availableLangs = activeLangs.filter((lang) => snippets[lang]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="font-heading text-pacman-yellow text-xs tracking-wide">
          INTERACTIVE CODE COMPARISON: {TOPIC_LABELS[topic] || topic}
        </h3>
      </div>

      {/* Language toggles */}
      <div className="mb-4">
        <LanguageToggle activeLangs={activeLangs} onToggle={handleToggle} />
      </div>

      {/* Code panels */}
      <div
        className={`
          grid gap-3
          ${availableLangs.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
          ${availableLangs.length === 3 ? 'grid-cols-1 md:grid-cols-3' : ''}
          ${availableLangs.length === 4 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4' : ''}
          ${availableLangs.length >= 5 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-5' : ''}
        `}
      >
        {availableLangs.map((lang) => {
          const snippet = snippets[lang];
          if (!snippet) return null;

          return (
            <CodePanel
              key={lang}
              ref={(handle) => registerRef(lang, handle)}
              code={snippet.code}
              language={lang}
              fileName={snippet.file}
              annotations={snippet.annotations}
              onScroll={(scrollTop) => handleScroll(scrollTop, lang)}
            />
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500/40" />
          Highlighted lines have annotations -- hover to see notes
        </span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">Scroll is synced across all panels</span>
      </div>
    </div>
  );
}
