'use client';

import { Search, User, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-[#D32F2F] hover:text-red-700 transition-colors">
              DonBot
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Restaurant, cuisine, or dish"
              className="pl-10 h-10 bg-secondary/50 border-none"
            />
          </div>

          {/* Cart Icon with Badge */}
          <Link
            href="/cart"
            className="flex-shrink-0 relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {totalItems > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {totalItems > 9 ? '9+' : totalItems}
              </div>
            )}
          </Link>

          {/* Profile Icon */}
          <button className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <User className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
