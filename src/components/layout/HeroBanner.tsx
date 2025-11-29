'use client';

import { MapPin } from 'lucide-react';
import { useState } from 'react';

export function HeroBanner() {
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = () => {
    setIsLoading(true);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // TODO: Reverse geocode to get address
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable location services.');
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="bg-[#D32F2F] text-white py-12 px-4 shadow-md">
      <div className="container mx-auto text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
          Hungry? We've got you!
        </h1>
        <p className="text-white/95 text-lg mb-8">
          Order from the best restaurants near you
        </p>

        <button
          onClick={requestLocation}
          disabled={isLoading}
          className="bg-white text-[#D32F2F] hover:bg-gray-50 active:bg-gray-100 transition-all px-8 py-4 rounded-full font-bold text-lg shadow-xl flex items-center gap-3 mx-auto disabled:opacity-50 hover:scale-105 transform"
        >
          <MapPin className="w-6 h-6" />
          {isLoading
            ? 'Getting your location...'
            : location
            ? `📍 ${location}`
            : 'Find restaurants near me'}
        </button>

        {location && (
          <p className="text-sm text-white/90 mt-4 font-medium">
            Showing restaurants within 5 km
          </p>
        )}
      </div>
    </div>
  );
}
