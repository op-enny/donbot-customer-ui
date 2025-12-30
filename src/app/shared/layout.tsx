'use client';

import { useState, useEffect } from 'react';
import { VerticalProvider } from '@/contexts/vertical-context';
import { EatHeader } from '@/components/eat/EatHeader';
import { EatBottomNav } from '@/components/eat/EatBottomNav';
import { MarketHeader } from '@/components/market/MarketHeader';
import { MarketBottomNav } from '@/components/market/MarketBottomNav';
import { useVerticalStore } from '@/lib/store/verticalStore';

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const lastVertical = useVerticalStore((state) => state.lastVertical);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR fallback - varsayılan eat
  if (!mounted) {
    return (
      <VerticalProvider vertical="eat">
        <div className="min-h-screen bg-background">
          <EatHeader />
          <main className="pb-24">{children}</main>
          <EatBottomNav />
        </div>
      </VerticalProvider>
    );
  }

  const isMarket = lastVertical === 'market';

  return (
    <VerticalProvider vertical={lastVertical}>
      <div className={`min-h-screen bg-background ${isMarket ? 'market-theme' : 'eat-theme'}`}>
        {isMarket ? <MarketHeader /> : <EatHeader />}
        <main className="pb-24">{children}</main>
        {isMarket ? <MarketBottomNav /> : <EatBottomNav />}
      </div>
    </VerticalProvider>
  );
}
