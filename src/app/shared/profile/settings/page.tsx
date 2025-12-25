'use client';

import { useLocaleStore } from '@/lib/store/localeStore';
import { clearSecureUserInfo } from '@/lib/utils/crypto';
import { useState } from 'react';

export default function ProfileSettingsPage() {
  const t = useLocaleStore((state) => state.t);
  const [deleteNotice, setDeleteNotice] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('settings_privacy_title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('settings_privacy_intro')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="font-semibold text-gray-900">{t('privacy_storage_title')}</h2>
          <p className="text-sm text-gray-600 mt-2">{t('privacy_storage_body')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="font-semibold text-gray-900">{t('privacy_retention_title')}</h2>
          <p className="text-sm text-gray-600 mt-2">{t('privacy_retention_body')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="font-semibold text-gray-900">{t('privacy_delete_title')}</h2>
          <p className="text-sm text-gray-600 mt-2">{t('privacy_delete_body')}</p>
          <button
            type="button"
            onClick={() => {
              clearSecureUserInfo();
              setDeleteNotice(t('privacy_delete_success'));
            }}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            {t('privacy_delete_cta')}
          </button>
          {deleteNotice && (
            <p className="mt-2 text-sm text-green-600">{deleteNotice}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="font-semibold text-gray-900">{t('privacy_contact_title')}</h2>
          <p className="text-sm text-gray-600 mt-2">{t('privacy_contact_body')}</p>
        </div>
      </div>
    </div>
  );
}
