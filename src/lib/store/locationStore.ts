import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  latitude: number;
  longitude: number;
  address: string;
  isSet: boolean;
  
  setLocation: (lat: number, lng: number, address: string) => void;
  clearLocation: () => void;
}

// Default location (Köln)
const DEFAULT_LAT = 50.9375;
const DEFAULT_LNG = 6.9603;
const DEFAULT_ADDRESS = 'Köln, Germany';

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LNG,
      address: DEFAULT_ADDRESS,
      isSet: false,

      setLocation: (latitude, longitude, address) => 
        set({ latitude, longitude, address, isSet: true }),
        
      clearLocation: () => 
        set({ 
          latitude: DEFAULT_LAT, 
          longitude: DEFAULT_LNG, 
          address: DEFAULT_ADDRESS, 
          isSet: false 
        }),
    }),
    {
      name: 'donbot_user_location',
    }
  )
);
