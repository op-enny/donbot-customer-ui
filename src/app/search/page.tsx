'use client';

import { Search, MapPin, Filter } from 'lucide-react';
import { useState } from 'react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants, cuisines, or dishes..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D32F2F] focus:outline-none transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            <button className="px-4 py-2 rounded-full bg-[#D32F2F] text-white font-medium whitespace-nowrap">
              All
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-200">
              Turkish
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-200">
              Pizza
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-200">
              Burger
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-200">
              Asian
            </button>
            <button className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-200">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {searchQuery ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Searching for "{searchQuery}"
            </h2>
            <p className="text-gray-600">
              Search feature coming soon...
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Near You</h2>

            <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🍕</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Pizza Places</h3>
                <p className="text-sm text-gray-600">15 restaurants nearby</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🥙</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Döner & Kebab</h3>
                <p className="text-sm text-gray-600">8 restaurants nearby</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🍔</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Burgers</h3>
                <p className="text-sm text-gray-600">12 restaurants nearby</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
