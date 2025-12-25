'use client';

import { useSyncExternalStore } from 'react';
import { VerticalProvider, type Vertical } from '@/contexts/vertical-context';
import { EatHeader } from '@/components/eat/EatHeader';
import { EatBottomNav } from '@/components/eat/EatBottomNav';
import { MarketHeader } from '@/components/market/MarketHeader';
import { MarketBottomNav } from '@/components/market/MarketBottomNav';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function getVerticalFromHost(): Vertical {
  if (typeof window === 'undefined') return 'eat';

  const host = window.location.hostname;
  if (host.startsWith('market.')) return 'market';
  if (host.startsWith('eat.') || host.startsWith('yemek.')) return 'eat';

  const cookieVertical = getCookie('vertical');
  if (cookieVertical === 'market') return 'market';

  const urlParams = new URLSearchParams(window.location.search);
  const paramVertical = urlParams.get('vertical');
  if (paramVertical === 'market') return 'market';

  return 'eat';
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const vertical = mounted ? getVerticalFromHost() : 'eat';
  const isMarket = vertical === 'market';

  // SSR fallback
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

  return (
    <VerticalProvider vertical={vertical}>
      <div className={`min-h-screen bg-background ${isMarket ? 'market-theme' : 'eat-theme'}`}>
        {isMarket ? <MarketHeader /> : <EatHeader />}
        <main className="pb-24">{children}</main>
        {isMarket ? <MarketBottomNav /> : <EatBottomNav />}
      </div>
    </VerticalProvider>
  );
}
