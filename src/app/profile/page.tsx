'use client';

import { User, MapPin, CreditCard, Bell, Lock, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLocaleStore } from '@/lib/store/localeStore';

export default function ProfilePage() {
  const t = useLocaleStore((state) => state.t);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('profile')}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('guest_user')}</h2>
              <p className="text-sm text-gray-600">{t('not_logged_in')}</p>
            </div>
          </div>
          <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors">
            {t('sign_in_register')}
          </button>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <Link
            href="/orders"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">{t('my_orders')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/profile/addresses"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">{t('saved_addresses')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/profile/payment"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">{t('payment_methods')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/profile/settings"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">{t('settings_privacy')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('about')}</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>{t('version')}</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>{t('terms_of_service')}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="flex justify-between">
              <span>{t('privacy_policy')}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="flex justify-between">
              <span>{t('contact_support')}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-600 hover:bg-primary/10 font-semibold py-3 rounded-xl transition-colors shadow-md">
            <LogOut className="w-5 h-5" />
            {t('sign_out')}
          </button>
        </div>
      </div>
    </div>
  );
}
