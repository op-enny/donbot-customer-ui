'use client';

import { useState, useEffect } from 'react';
import { Home, ShoppingCart, Heart, User, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocaleStore } from '@/lib/store/localeStore';
import { useMarketCartStore } from '@/lib/store/marketCartStore';

export function MarketBottomNav() {
  const pathname = usePathname();
  const { t } = useLocaleStore();
  const cartItemCount = useMarketCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!mounted) return null;

  // Use 0 for SSR, actual count after hydration
  const displayBadge = mounted ? cartItemCount : 0;

  const navItems = [
    { icon: Home, label: t('home'), href: '/' },
    { icon: Search, label: t('search') || 'Search', href: '/search' },
    { icon: ShoppingCart, label: t('cart'), href: '/cart', badge: displayBadge },
    { icon: User, label: t('profile'), href: '/profile' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-around" role="menubar">
          {navItems.map(({ icon: Icon, label, href, badge }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 transition-all"
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                aria-label={badge ? `${label} (${badge} items)` : label}
              >
                <div
                  className={`relative ${
                    isActive
                      ? 'w-12 h-12 rounded-full flex items-center justify-center bg-green-600 text-white shadow-lg scale-110 transition-all'
                      : 'w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 border-2 border-gray-300 text-gray-600 hover:text-gray-800 transition-all'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`}
                    aria-hidden="true"
                  />
                  {badge !== undefined && badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-green-600' : 'text-gray-500'
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
