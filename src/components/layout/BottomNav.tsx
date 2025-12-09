'use client';

import { Home, ShoppingCart, Heart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocaleStore } from '@/lib/store/localeStore';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocaleStore();

  const navItems = [
    { icon: Home, label: t('home'), href: '/' },
    { icon: ShoppingCart, label: t('cart'), href: '/cart' },
    { icon: Heart, label: t('favorites'), href: '/favorites' },
    { icon: User, label: t('profile'), href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 transition-all"
              >
                <div
                  className={
                    isActive
                      ? 'w-12 h-12 rounded-full flex items-center justify-center bg-[#D32F2F] text-white shadow-lg scale-110 transition-all'
                      : 'w-12 h-12 rounded-full flex items-center justify-center bg-white border-2 border-gray-300 text-gray-500 hover:text-gray-700 transition-all'
                  }
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-[#D32F2F]' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
