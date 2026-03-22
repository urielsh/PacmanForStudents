/**
 * LanguageToggle.tsx - Row of toggleable language badges.
 *
 * Features:
 * - 5 language badges with theme colors (Java, Python, JavaScript, TypeScript, C++)
 * - Active languages are highlighted; inactive are dimmed
 * - At least 2 languages must remain active at all times
 * - Clicking an active badge deactivates it (unless only 2 remain)
 * - Clicking an inactive badge activates it
 */

import { useCallback } from 'react';

interface Language {
  id: string;
  label: string;
  color: string;
  bgActive: string;
  bgInactive: string;
}

const LANGUAGES: Language[] = [
  {
    id: 'java',
    label: 'Java',
    color: '#f89820',
    bgActive: 'bg-orange-900/40 border-orange-500',
    bgInactive: 'bg-gray-900/50 border-gray-700',
  },
  {
    id: 'python',
    label: 'Python',
    color: '#3776ab',
    bgActive: 'bg-blue-900/40 border-blue-500',
    bgInactive: 'bg-gray-900/50 border-gray-700',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#f7df1e',
    bgActive: 'bg-yellow-900/40 border-yellow-500',
    bgInactive: 'bg-gray-900/50 border-gray-700',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    color: '#3178c6',
    bgActive: 'bg-sky-900/40 border-sky-500',
    bgInactive: 'bg-gray-900/50 border-gray-700',
  },
  {
    id: 'cpp',
    label: 'C++',
    color: '#00599c',
    bgActive: 'bg-indigo-900/40 border-indigo-500',
    bgInactive: 'bg-gray-900/50 border-gray-700',
  },
];

export interface LanguageToggleProps {
  activeLangs: string[];
  onToggle: (langId: string) => void;
}

export default function LanguageToggle({ activeLangs, onToggle }: LanguageToggleProps) {
  const handleClick = useCallback(
    (langId: string) => {
      const isActive = activeLangs.includes(langId);
      // Prevent deactivating if only 2 remain
      if (isActive && activeLangs.length <= 2) return;
      onToggle(langId);
    },
    [activeLangs, onToggle]
  );

  return (
    <div className="flex flex-wrap gap-2">
      {LANGUAGES.map((lang) => {
        const isActive = activeLangs.includes(lang.id);
        const canDeactivate = isActive && activeLangs.length > 2;

        return (
          <button
            key={lang.id}
            onClick={() => handleClick(lang.id)}
            title={
              isActive
                ? canDeactivate
                  ? `Hide ${lang.label}`
                  : `${lang.label} (minimum 2 languages required)`
                : `Show ${lang.label}`
            }
            className={`
              px-3 py-1.5 rounded-md border text-xs font-bold tracking-wide
              transition-all duration-200 select-none
              ${isActive ? lang.bgActive : lang.bgInactive}
              ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'}
              ${isActive && !canDeactivate ? 'cursor-default' : 'cursor-pointer'}
            `}
            style={{
              color: isActive ? lang.color : '#6b7280',
            }}
          >
            {lang.label}
          </button>
        );
      })}
      <span className="self-center text-[10px] text-gray-600 ml-1">
        {activeLangs.length}/5 languages
      </span>
    </div>
  );
}
