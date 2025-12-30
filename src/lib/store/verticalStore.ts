import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Vertical = 'eat' | 'market';

interface VerticalState {
  // Son ziyaret edilen vertical
  lastVertical: Vertical;

  // Vertical'i güncelle
  setLastVertical: (vertical: Vertical) => void;

  // Helper: Vertical'a göre base path döndür
  getBasePath: () => string;

  // Helper: Verilen path'i vertical prefix ile döndür
  getVerticalPath: (path: string) => string;
}

export const useVerticalStore = create<VerticalState>()(
  persist(
    (set, get) => ({
      lastVertical: 'eat', // Varsayılan eat

      setLastVertical: (vertical) => set({ lastVertical: vertical }),

      getBasePath: () => {
        const vertical = get().lastVertical;
        return vertical === 'eat' ? '/eat' : '/market';
      },

      getVerticalPath: (path: string) => {
        const basePath = get().getBasePath();
        // Path zaten / ile başlıyorsa düzelt
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${basePath}${cleanPath}`;
      },
    }),
    {
      name: 'donbot_last_vertical',
    }
  )
);

// Helper hook: Profil sayfalarında kullanmak için navigasyon linkleri
export function useVerticalNavigation() {
  const { lastVertical, getBasePath, getVerticalPath } = useVerticalStore();

  return {
    vertical: lastVertical,
    homePath: getBasePath(),
    cartPath: getVerticalPath('/cart'),
    favoritesPath: getVerticalPath('/favorites'),
    ordersPath: getVerticalPath('/orders'),
    // Profil kendi içinde shared kalabilir
    profilePath: '/shared/profile',
    addressesPath: '/shared/profile/addresses',
    settingsPath: '/shared/profile/settings',
  };
}
