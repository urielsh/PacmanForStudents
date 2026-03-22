/**
 * CodePanel.tsx - Displays a single code block with line numbers and annotations.
 *
 * Features:
 * - Monospace code display with dark background
 * - Line number gutter
 * - Highlighted annotation lines with tooltip on hover
 * - Scrollable container
 * - Language badge in header
 */

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

export interface Annotation {
  line: number;
  text: string;
}

export interface CodePanelProps {
  code: string;
  language: string;
  fileName: string;
  annotations?: Annotation[];
  onScroll?: (scrollTop: number) => void;
  scrollTop?: number;
}

export interface CodePanelHandle {
  setScrollTop: (top: number) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  java: '#f89820',
  python: '#3776ab',
  javascript: '#f7df1e',
  typescript: '#3178c6',
  cpp: '#00599c',
};

const LANGUAGE_LABELS: Record<string, string> = {
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  cpp: 'C++',
};

const CodePanel = forwardRef<CodePanelHandle, CodePanelProps>(function CodePanel(
  { code, language, fileName, annotations = [], onScroll },
  ref
) {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isExternalScroll = useRef(false);

  useImperativeHandle(ref, () => ({
    setScrollTop(top: number) {
      if (scrollRef.current) {
        isExternalScroll.current = true;
        scrollRef.current.scrollTop = top;
        // Reset external scroll flag after the scroll event has been processed
        requestAnimationFrame(() => {
          isExternalScroll.current = false;
        });
      }
    },
  }));

  const handleScroll = useCallback(() => {
    if (scrollRef.current && !isExternalScroll.current && onScroll) {
      onScroll(scrollRef.current.scrollTop);
    }
  }, [onScroll]);

  const lines = code.split('\n');
  const annotationMap = new Map(annotations.map((a) => [a.line, a.text]));
  const langColor = LANGUAGE_COLORS[language] || '#888';
  const langLabel = LANGUAGE_LABELS[language] || language;

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-gray-700 bg-gray-950 min-w-0 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: langColor }}
          />
          <span
            className="text-xs font-bold tracking-wide flex-shrink-0"
            style={{ color: langColor }}
          >
            {langLabel}
          </span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono truncate ml-2">{fileName}</span>
      </div>

      {/* Code area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-auto flex-1"
        style={{ maxHeight: '480px' }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const annotation = annotationMap.get(lineNum);
              const isAnnotated = !!annotation;
              const isHovered = hoveredAnnotation === lineNum;

              return (
                <tr
                  key={i}
                  className={`
                    group relative
                    ${isAnnotated ? 'bg-yellow-900/20 hover:bg-yellow-900/40' : 'hover:bg-gray-800/50'}
                    transition-colors duration-100
                  `}
                  onMouseEnter={() => isAnnotated && setHoveredAnnotation(lineNum)}
                  onMouseLeave={() => setHoveredAnnotation(null)}
                >
                  {/* Line number */}
                  <td
                    className={`
                      select-none text-right pr-3 pl-3 py-0 font-mono text-[11px] align-top
                      border-r border-gray-800
                      ${isAnnotated ? 'text-yellow-500' : 'text-gray-600'}
                    `}
                    style={{ width: '1%', whiteSpace: 'nowrap', userSelect: 'none' }}
                  >
                    {lineNum}
                    {isAnnotated && (
                      <span className="ml-1 text-yellow-500 text-[9px]">*</span>
                    )}
                  </td>

                  {/* Code line */}
                  <td className="py-0 pl-4 pr-4 font-mono text-[12px] text-gray-200 whitespace-pre relative">
                    {line || '\u00A0'}

                    {/* Annotation tooltip */}
                    {isAnnotated && isHovered && (
                      <div className="absolute left-4 top-full z-50 mt-1 px-3 py-2 bg-gray-800 border border-yellow-600/50 rounded-md shadow-xl max-w-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-500 text-[10px] mt-0.5 flex-shrink-0">NOTE</span>
                          <span className="text-gray-300 text-[11px] leading-relaxed">{annotation}</span>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default CodePanel;
