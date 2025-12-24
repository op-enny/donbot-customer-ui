'use client';

import { useSyncExternalStore } from 'react';
import { VerticalProvider, type Vertical } from '@/contexts/vertical-context';
import { EatHeader } from '@/components/eat/EatHeader';
import { EatBottomNav } from '@/components/eat/EatBottomNav';
import { MarketHeader } from '@/components/market/MarketHeader';
import { MarketBottomNav } from '@/components/market/MarketBottomNav';
import { OrderStatusWatcher } from '@/components/shared/OrderStatusWatcher';

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

  // Check cookie for development
  const cookieVertical = getCookie('vertical');
  if (cookieVertical === 'market') return 'market';

  // Check URL param for development
  const urlParams = new URLSearchParams(window.location.search);
  const paramVertical = urlParams.get('vertical');
  if (paramVertical === 'market') return 'market';

  return 'eat'; // Default
}

// Use useSyncExternalStore for hydration-safe mounted detection
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface VerticalLayoutProps {
  children: React.ReactNode;
}

export function VerticalLayout({ children }: VerticalLayoutProps) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const vertical = mounted ? getVerticalFromHost() : 'eat';

  // During SSR, render eat layout as default
  if (!mounted) {
    return (
      <VerticalProvider vertical="eat">
        <div className="min-h-screen bg-background">
          <OrderStatusWatcher vertical="eat" />
          <EatHeader />
          <main className="pb-24">{children}</main>
          <EatBottomNav />
        </div>
      </VerticalProvider>
    );
  }

  // After hydration, render based on detected vertical
  const isMarket = vertical === 'market';

  return (
    <VerticalProvider vertical={vertical}>
      <div className={`min-h-screen bg-background ${isMarket ? 'market-theme' : 'eat-theme'}`}>
        <OrderStatusWatcher vertical={vertical} />
        {isMarket ? <MarketHeader /> : <EatHeader />}
        <main className="pb-24">{children}</main>
        {isMarket ? <MarketBottomNav /> : <EatBottomNav />}
      </div>
    </VerticalProvider>
  );
}
