'use client';

import { useState, useEffect } from 'react';
import { User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useMarketCartStore } from '@/lib/store/marketCartStore';
import { useOrderHistoryStore } from '@/lib/store/orderHistoryStore';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function MarketHeader() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useMarketCartStore((state) => state.getTotalItems());
  const orders = useOrderHistoryStore((state) => state.orders);

  const activeOrdersCount = orders.filter(
    (o) => !['delivered', 'cancelled', 'rejected', 'completed'].includes(o.status.toLowerCase())
  ).length;

  // Only render cart badge after hydration to avoid SSR mismatch
  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Brand */}
          <Link href="/market" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-foreground font-[var(--font-brand)]">
                Sipariso
              </span>
              <span className="rounded-full bg-[#22C55E] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                Market
              </span>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Language Selector */}
          {mounted && <LanguageSelector />}

          {/* Cart Icon with Badge */}
          <Link
            href="/market/cart"
            className="flex-shrink-0 relative w-10 h-10 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-green-700" />
            {mounted && totalItems > 0 && (
              <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {totalItems > 9 ? '9+' : totalItems}
              </div>
            )}
          </Link>

          {/* Profile Icon */}
          <Link href="/shared/profile" className="flex-shrink-0 relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <User className="w-5 h-5 text-foreground" />
            {mounted && activeOrdersCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {activeOrdersCount}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
