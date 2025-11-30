'use client';

import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cartStore';

interface Modifier {
  id: string;
  name: string;
  price_modifier: number;
  is_available: boolean;
}

interface ModifierGroup {
  id: string;
  name: string;
  selection_type: 'single' | 'multiple';
  required: boolean;
  min_selections?: number;
  max_selections?: number;
  modifiers: Modifier[];
}

interface ItemModalProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url: string | null;
    category: string;
    modifier_groups?: ModifierGroup[];
  };
  restaurantId?: string;
  restaurantName?: string;
  restaurantSlug?: string;
  isOpen: boolean;
  onClose: () => void;
}



export function ItemModal({
  item,
  restaurantId = '1',
  restaurantName = 'Limon Grillhaus',
  restaurantSlug = 'limon-grillhaus',
  isOpen,
  onClose,
}: ItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const addItem = useCartStore((state) => state.addItem);
  const modifierGroups = item.modifier_groups || [];

  if (!isOpen) return null;

  const handleOptionSelect = (groupKey: string, optionId: string, type: 'single' | 'multiple') => {
    setSelectedOptions((prev) => {
      if (type === 'single') {
        return { ...prev, [groupKey]: [optionId] };
      } else {
        const current = prev[groupKey] || [];
        if (current.includes(optionId)) {
          return { ...prev, [groupKey]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [groupKey]: [...current, optionId] };
        }
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = item.price * quantity;

    // Add modifier prices
    modifierGroups.forEach((group) => {
      const selected = selectedOptions[group.id] || [];
      selected.forEach((modifierId) => {
        const modifier = group.modifiers.find((mod) => mod.id === modifierId);
        if (modifier && modifier.price_modifier > 0) {
          total += modifier.price_modifier * quantity;
        }
      });
    });

    return total;
  };

  const handleAddToCart = () => {
    // Add item to cart using Zustand store
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        price: calculateTotalPrice() / quantity, // Price per item (including extras)
        quantity,
        options: selectedOptions,
        specialInstructions: specialInstructions || undefined,
        image_url: item.image_url,
      },
      restaurantId,
      restaurantName,
      restaurantSlug
    );

    // Close modal
    onClose();
  };

  const isValid = () => {
    // Check if all required modifier groups are selected
    return modifierGroups.every((group) => {
      if (!group.required) return true;
      const selected = selectedOptions[group.id] || [];
      return selected.length > 0;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Customize your order</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Image & Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} width={96} height={96} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <p className="text-lg font-bold text-[#D32F2F]">€{item.price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Modifiers */}
        <div className="p-6 space-y-6">
          {modifierGroups.map((group) => (
            <div key={group.id}>
              <div className="mb-3">
                <h4 className="text-base font-semibold text-gray-900">
                  {group.name}
                  {group.required && <span className="text-[#D32F2F] ml-1">*</span>}
                </h4>
                <p className="text-sm text-gray-600">
                  {group.selection_type === 'single' ? 'Select one' : 'Select multiple'}
                </p>
              </div>

              <div className="space-y-2">
                {group.modifiers.map((modifier) => {
                  const isSelected = (selectedOptions[group.id] || []).includes(modifier.id);

                  return (
                    <button
                      key={modifier.id}
                      onClick={() => handleOptionSelect(group.id, modifier.id, group.selection_type)}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-[#D32F2F] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isSelected ? 'text-[#D32F2F]' : 'text-gray-900'}`}>
                          {modifier.name}
                        </span>
                        {modifier.price_modifier > 0 && (
                          <span className="text-sm text-gray-600">+€{modifier.price_modifier.toFixed(2)}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">Special Instructions</h4>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests? (e.g., extra spicy, no onions)"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D32F2F] focus:outline-none resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer - Quantity & Add to Cart */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 font-medium">Quantity</span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>

              <span className="text-xl font-bold text-gray-900 w-8 text-center">{quantity}</span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isValid()}
            className="w-full bg-[#D32F2F] hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full flex items-center justify-center gap-3 transition-colors shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart - €{calculateTotalPrice().toFixed(2)}</span>
          </button>

          {!isValid() && (
            <p className="text-sm text-[#D32F2F] text-center mt-2">
              Please select all required options
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
