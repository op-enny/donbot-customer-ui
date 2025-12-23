'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocaleStore } from '@/lib/store/localeStore';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const { t } = useLocaleStore();

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
      <div className="text-8xl mb-6">🍽️</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('page_not_found_title')}</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        {t('page_not_found_body')}
      </p>
      <Link
        href="/"
        className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
      >
        {t('back_to_home')}
      </Link>
    </div>
  );
}
