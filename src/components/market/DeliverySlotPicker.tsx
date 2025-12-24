'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { businessesApi, type DeliverySlot } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface DeliverySlotPickerProps {
  businessSlug: string;
  selectedSlotId?: string | null;
  onSelect: (slotId: string) => void;
}

export function DeliverySlotPicker({
  businessSlug,
  selectedSlotId,
  onSelect,
}: DeliverySlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: slots, isLoading, error } = useQuery({
    queryKey: ['delivery-slots', businessSlug, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      return businessesApi.getDeliverySlots(
        businessSlug,
        format(selectedDate, 'yyyy-MM-dd')
      );
    },
  });

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const formatTimeSlot = (slot: DeliverySlot) => {
    // Format: "18:00 - 19:00"
    return `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-lg">Delivery Time</h3>
      </div>

      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dates.map((date) => {
          const isSelected = selectedDate.toDateString() === date.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={cn(
                'flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all min-w-[80px]',
                isSelected
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white border-gray-200 hover:border-green-300'
              )}
            >
              <div className="text-xs font-medium">
                {isToday ? 'Today' : format(date, 'EEE', { locale: de })}
              </div>
              <div className="font-bold">{format(date, 'd')}</div>
              <div className="text-xs">{format(date, 'MMM')}</div>
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          Failed to load delivery slots. Please try again.
        </div>
      ) : slots?.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <Clock className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-muted-foreground">
            No delivery slots available for this date
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try selecting a different day
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {slots?.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const isFull = !slot.is_available;
            const spotsLeft = slot.max_orders - slot.current_orders;

            return (
              <button
                key={slot.id}
                onClick={() => !isFull && onSelect(slot.id)}
                disabled={isFull}
                className={cn(
                  'p-3 rounded-xl border-2 text-left transition-all relative',
                  isFull && 'opacity-50 cursor-not-allowed bg-gray-50',
                  isSelected
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                )}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className="font-semibold text-sm">
                  {formatTimeSlot(slot)}
                </div>

                {isFull ? (
                  <div className="text-xs text-red-500 mt-1">Fully booked</div>
                ) : spotsLeft <= 3 ? (
                  <div className="text-xs text-orange-500 mt-1">
                    Only {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1">
                    Available
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected slot summary */}
      {selectedSlotId && slots && (
        <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
          <p className="text-sm text-green-800">
            <strong>Selected:</strong>{' '}
            {format(selectedDate, 'EEEE, d MMMM', { locale: de })} •{' '}
            {slots.find((s) => s.id === selectedSlotId) &&
              formatTimeSlot(slots.find((s) => s.id === selectedSlotId)!)}
          </p>
        </div>
      )}
    </div>
  );
}
