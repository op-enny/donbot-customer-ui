'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLocaleStore, SupportedLocale, t } from '@/lib/store/localeStore';

const LOCALE_OPTIONS: { code: SupportedLocale; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

export function LanguageSelector() {
  const { locale, setLocale } = useLocaleStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLocale = LOCALE_OPTIONS.find((opt) => opt.code === locale) || LOCALE_OPTIONS[0];

  const handleSelect = (code: SupportedLocale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={t('language', locale)}
      >
        <span className="text-xl">{currentLocale.flag}</span>
        <Globe className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {LOCALE_OPTIONS.map((option) => (
            <button
              key={option.code}
              onClick={() => handleSelect(option.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                option.code === locale ? 'bg-gray-50 dark:bg-gray-800 font-medium' : ''
              }`}
            >
              <span className="text-xl">{option.flag}</span>
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
