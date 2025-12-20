'use client';

import { useState, useEffect } from 'react';
import { User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cartStore';
import { useOrderHistoryStore } from '@/lib/store/orderHistoryStore';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
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
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-foreground font-[var(--font-brand)]">
                Sipariso
              </span>
              <span className="rounded-full bg-[#FFBE0B] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                Eat
              </span>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Language Selector */}
          {mounted && <LanguageSelector />}

          {/* Cart Icon with Badge */}
          <Link
            href="/cart"
            className="flex-shrink-0 relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {mounted && totalItems > 0 && (
              <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {totalItems > 9 ? '9+' : totalItems}
              </div>
            )}
          </Link>

          {/* Profile Icon */}
          <Link href="/profile" className="flex-shrink-0 relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
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
