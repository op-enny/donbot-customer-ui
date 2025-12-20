'use client';

import Link from 'next/link';
import { useLocaleStore } from '@/lib/store/localeStore';

export default function OrderNotFound() {
  const { t } = useLocaleStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
      <div className="text-8xl mb-6">📦</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('order_not_found_title')}</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        {t('order_not_found_body')}
      </p>
      <div className="flex gap-4">
        <Link
          href="/orders"
          className="bg-[#D32F2F] hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg"
        >
          {t('view_order_history')}
        </Link>
        <Link
          href="/"
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-full transition-colors"
        >
          {t('back_to_home')}
        </Link>
      </div>
    </div>
  );
}
