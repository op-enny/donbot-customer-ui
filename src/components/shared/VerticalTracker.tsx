'use client';

import { useEffect } from 'react';
import { useVerticalStore, Vertical } from '@/lib/store/verticalStore';

interface VerticalTrackerProps {
  vertical: Vertical;
}

/**
 * Bu component layout içine eklendiğinde, kullanıcının son ziyaret ettiği
 * vertical'i store'a kaydeder. Profil sayfası bu bilgiyi kullanarak
 * doğru navigasyon linklerini gösterir.
 */
export function VerticalTracker({ vertical }: VerticalTrackerProps) {
  const setLastVertical = useVerticalStore((state) => state.setLastVertical);

  useEffect(() => {
    setLastVertical(vertical);
  }, [vertical, setLastVertical]);

  // Bu component görsel bir şey render etmez
  return null;
}
