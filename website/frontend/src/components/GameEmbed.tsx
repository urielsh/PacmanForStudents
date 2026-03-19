/**
 * GameEmbed.tsx - React island component for embedding playable Pacman games.
 *
 * Features:
 * - 5 language tabs (JavaScript, TypeScript, C++, Python, Java)
 * - Only JS and TS are enabled; others show "Coming Soon"
 * - Renders selected game in an iframe pointing to /game/{lang}/index.html
 * - Focus management with yellow glow border on click
 * - Keyboard instructions overlay
 * - Restart button that reloads the iframe
 *
 * Usage in Astro:
 *   import GameEmbed from '../components/GameEmbed.tsx';
 *   <GameEmbed client:load />
 */

import { useState, useRef, useCallback } from 'react';

interface LanguageTab {
  id: string;
  label: string;
  enabled: boolean;
  path: string;
}

const LANGUAGES: LanguageTab[] = [
  { id: 'js', label: 'JavaScript', enabled: true, path: '/game/js/index.html' },
  { id: 'ts', label: 'TypeScript', enabled: true, path: '/game/ts/index.html' },
  { id: 'cpp', label: 'C++', enabled: false, path: '/game/cpp/index.html' },
  { id: 'python', label: 'Python', enabled: false, path: '/game/python/index.html' },
  { id: 'java', label: 'Java', enabled: false, path: '/game/java/index.html' },
];

export default function GameEmbed() {
  const [activeTab, setActiveTab] = useState<string>('js');
  const [isFocused, setIsFocused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeKey = useRef(0);
  const [restartCounter, setRestartCounter] = useState(0);

  const activeLang = LANGUAGES.find((l) => l.id === activeTab)!;

  const handleTabClick = useCallback((lang: LanguageTab) => {
    if (!lang.enabled) return;
    setActiveTab(lang.id);
    setIsFocused(false);
    setShowInstructions(true);
  }, []);

  const handleIframeClick = useCallback(() => {
    setIsFocused(true);
    setShowInstructions(false);
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  }, []);

  const handleRestart = useCallback(() => {
    iframeKey.current += 1;
    setRestartCounter((c) => c + 1);
    setIsFocused(false);
    setShowInstructions(true);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Language tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => handleTabClick(lang)}
            disabled={!lang.enabled}
            className={`
              px-4 py-2 text-xs sm:text-sm font-heading tracking-wide rounded-t-lg
              transition-colors duration-200
              ${
                activeTab === lang.id
                  ? 'bg-wall-blue text-pacman-yellow border-2 border-b-0 border-wall-blue'
                  : lang.enabled
                    ? 'bg-transparent text-gray-400 border-2 border-transparent hover:text-pacman-yellow hover:border-wall-blue hover:border-b-0'
                    : 'bg-transparent text-gray-600 border-2 border-transparent cursor-not-allowed opacity-50'
              }
            `}
          >
            {lang.label}
            {!lang.enabled && (
              <span className="ml-1 text-[10px] text-gray-500 font-sans">(Soon)</span>
            )}
          </button>
        ))}
      </div>

      {/* Game container */}
      <div className="relative">
        {/* iframe wrapper with focus glow */}
        <div
          className={`
            relative rounded-lg overflow-hidden border-2 transition-all duration-300
            ${isFocused ? 'border-pacman-yellow shadow-[0_0_20px_rgba(255,255,0,0.3)]' : 'border-wall-blue'}
          `}
          onClick={handleIframeClick}
          role="button"
          tabIndex={-1}
          aria-label="Click to focus the game"
        >
          {activeLang.enabled ? (
            <iframe
              ref={iframeRef}
              key={`${activeTab}-${restartCounter}`}
              src={activeLang.path}
              title={`Pacman - ${activeLang.label}`}
              className="w-full bg-black"
              style={{ height: '640px', border: 'none' }}
              allow="keyboard-map"
            />
          ) : (
            <div className="w-full flex flex-col items-center justify-center bg-pacman-black" style={{ height: '640px' }}>
              <div className="text-4xl mb-4 opacity-40">&#128679;</div>
              <p className="font-heading text-gray-500 text-sm mb-2">COMING SOON</p>
              <p className="text-gray-600 text-xs">
                The {activeLang.label} version is not yet playable in the browser.
              </p>
            </div>
          )}

          {/* Keyboard instructions overlay */}
          {showInstructions && activeLang.enabled && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center cursor-pointer">
              <div className="text-pacman-yellow text-5xl mb-6 animate-chomp">&#9679;</div>
              <p className="font-heading text-pacman-yellow text-sm mb-4">CLICK TO PLAY</p>
              <div className="flex flex-col items-center gap-2 text-gray-400 text-xs">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-300 font-mono">&#8593;</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-300 font-mono">&#8592;</kbd>
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-300 font-mono">&#8595;</kbd>
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-300 font-mono">&#8594;</kbd>
                </div>
                <p className="mt-2 text-gray-500">Arrow keys to move Pacman</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls bar below game */}
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-gray-500 text-xs">
            {activeLang.enabled
              ? isFocused
                ? 'Game focused -- use arrow keys to play'
                : 'Click the game area to start playing'
              : `${activeLang.label} -- browser version coming soon`
            }
          </p>
          {activeLang.enabled && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-heading text-gray-400 border border-gray-700 rounded hover:text-pacman-yellow hover:border-pacman-yellow transition-colors duration-200"
              title="Restart game"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              RESTART
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
