'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useLocaleStore } from '@/lib/store/localeStore';
import { loadSecureUserInfo } from '@/lib/utils/crypto';

export default function ProfileAddressesPage() {
  const t = useLocaleStore((state) => state.t);
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadAddress = async () => {
      const secureData = await loadSecureUserInfo();
      setAddress(secureData?.deliveryAddress?.trim() || null);
    };

    loadAddress();
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('saved_addresses')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('saved_addresses_hint')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {address ? (
          <div className="bg-white rounded-2xl shadow-md p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{t('saved_address_primary')}</div>
              <div className="text-sm text-gray-700 mt-1">{address}</div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-5 text-sm text-gray-600">
            {t('saved_addresses_empty')}
          </div>
        )}
      </div>
    </div>
  );
}
