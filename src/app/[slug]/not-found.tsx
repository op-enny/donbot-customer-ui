'use client';

import Link from 'next/link';
import { useLocaleStore } from '@/lib/store/localeStore';

export default function RestaurantNotFound() {
  const { t } = useLocaleStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
      <div className="text-8xl mb-6">🏪</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('restaurant_not_found_title')}</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        {t('restaurant_not_found_body')}
      </p>
      <Link
        href="/"
        className="bg-[#D32F2F] hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
      >
        {t('browse_restaurants')}
      </Link>
    </div>
  );
}
