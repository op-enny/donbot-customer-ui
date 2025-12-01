# Local Storage - Usage Guide

Complete guide for using the local storage system in the customer-ui.

---

## Quick Start

### 1. Auto-Cleanup on App Load

Add this to your root layout to enable automatic cleanup:

**File:** `src/app/layout.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { cleanupService } from '@/lib/storage';

export default function RootLayout({ children }: { children: React.Node }) {
  useEffect(() => {
    // Run auto-cleanup on app load (checks if needed)
    cleanupService.autoCleanup();
  }, []);

  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
```

---

## Customer Profile

### Using React Hook (Recommended)

```typescript
'use client';

import { useCustomerProfile } from '@/lib/storage/hooks';

export default function CheckoutForm() {
  const {
    profile,
    loading,
    updateProfile,
    addAddress,
    getAddresses,
    setPreferredPayment,
  } = useCustomerProfile();

  // Auto-fill form on mount
  useEffect(() => {
    if (profile) {
      setValue('customer_name', profile.customer_name);
      setValue('customer_phone', profile.customer_phone);
      setValue('customer_email', profile.customer_email || '');

      if (profile.preferred_payment_method) {
        setValue('payment_method', profile.preferred_payment_method);
      }
    }
  }, [profile]);

  // Save profile after successful order
  const handleOrderSuccess = (orderData) => {
    updateProfile({
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_email: orderData.customer_email,
    });

    // Save delivery address if new
    if (orderData.delivery_method === 'delivery') {
      const addresses = getAddresses();
      const addressExists = addresses.some(
        (addr) => addr.address === orderData.delivery_address
      );

      if (!addressExists) {
        addAddress({
          label: 'Home', // or let user choose
          address: orderData.delivery_address,
          is_default: addresses.length === 0,
        });
      }
    }

    // Save preferred payment method
    setPreferredPayment(orderData.payment_method);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form>
      {/* Form fields */}
    </form>
  );
}
```

### Using Direct API

```typescript
import { customerProfileStorage } from '@/lib/storage';

// Get profile
const profile = customerProfileStorage.getProfile();

// Save profile
customerProfileStorage.saveProfile({
  customer_name: 'Max Mustermann',
  customer_phone: '+49 171 1234567',
  customer_email: 'max@example.com',
});

// Update specific fields
customerProfileStorage.updateProfile({
  customer_email: 'newemail@example.com',
});

// Add delivery address
customerProfileStorage.addDeliveryAddress({
  label: 'Home',
  address: 'Musterstr. 123, 50667 Köln',
  is_default: true,
});

// Get default address
const defaultAddr = customerProfileStorage.getDefaultAddress();

// Clear profile
customerProfileStorage.clearProfile();
```

---

## Delivery Address Management

### Address Selector Component

```typescript
'use client';

import { useState } from 'react';
import { useCustomerProfile } from '@/lib/storage/hooks';

export function AddressSelector() {
  const { getAddresses, setDefaultAddress, removeAddress, addAddress } = useCustomerProfile();
  const [showAddNew, setShowAddNew] = useState(false);

  const addresses = getAddresses();

  return (
    <div className="space-y-4">
      <h3>Lieferadresse wählen</h3>

      {/* Existing addresses */}
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`p-4 border rounded ${addr.is_default ? 'border-blue-500' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{addr.label}</p>
              <p className="text-sm text-gray-600">{addr.address}</p>
              {addr.is_default && (
                <span className="text-xs text-blue-600">Standard</span>
              )}
            </div>

            <div className="flex gap-2">
              {!addr.is_default && (
                <button
                  onClick={() => setDefaultAddress(addr.id)}
                  className="text-sm text-blue-600"
                >
                  Als Standard setzen
                </button>
              )}
              <button
                onClick={() => removeAddress(addr.id)}
                className="text-sm text-red-600"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add new address */}
      {showAddNew && (
        <div className="p-4 border rounded">
          <input
            type="text"
            placeholder="Adresse Label (z.B. 'Home')"
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Vollständige Adresse"
            className="w-full mb-2 p-2 border rounded"
          />
          <button
            onClick={(e) => {
              const label = e.target.form[0].value;
              const address = e.target.form[1].value;

              addAddress({
                label,
                address,
                is_default: addresses.length === 0,
              });

              setShowAddNew(false);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Adresse speichern
          </button>
        </div>
      )}

      <button
        onClick={() => setShowAddNew(true)}
        className="text-blue-600 text-sm"
      >
        + Neue Adresse hinzufügen
      </button>
    </div>
  );
}
```

---

## Order History

### Using React Hook (Recommended)

```typescript
'use client';

import { useOrderHistory } from '@/lib/storage/hooks';

export default function MyOrdersPage() {
  const {
    orders,
    loading,
    getOrdersGroupedByDate,
    getActiveOrders,
    getStatistics,
    isTrackingExpired,
  } = useOrderHistory();

  const groupedOrders = getOrdersGroupedByDate();
  const activeOrders = getActiveOrders();
  const stats = getStatistics();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Meine Bestellungen</h1>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">Aktive Bestellungen</p>
          <p className="text-2xl font-bold">{stats.active_orders}</p>
        </div>
        <div className="p-4 bg-green-50 rounded">
          <p className="text-sm text-gray-600">Abgeschlossen</p>
          <p className="text-2xl font-bold">{stats.completed_orders}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded">
          <p className="text-sm text-gray-600">Gesamt ausgegeben</p>
          <p className="text-2xl font-bold">{stats.total_spent.toFixed(2)} €</p>
        </div>
      </div>

      {/* Grouped orders */}
      {Object.entries(groupedOrders).map(([dateLabel, orders]) => (
        <div key={dateLabel} className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{dateLabel}</h2>

          {orders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              isExpired={isTrackingExpired(order.order_id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Save Order After Creation

```typescript
'use client';

import { useOrderHistory } from '@/lib/storage/hooks';
import { ordersApi } from '@/lib/api';

export function CheckoutPage() {
  const { addOrder } = useOrderHistory();

  const handleSubmitOrder = async (orderData) => {
    try {
      // Create order via API
      const order = await ordersApi.createOrder('limon-grillhaus', orderData);

      // Save to local storage
      addOrder({
        order_id: order.id,
        order_number: order.order_number,
        restaurant_slug: 'limon-grillhaus',
        restaurant_name: 'Limon Grillhaus',
        tracking_token: order.tracking_token,
        total_amount: order.total_amount,
        delivery_method: order.delivery_method,
        payment_method: order.payment_method,
        status: order.status,
        created_at: order.created_at,
        estimated_ready_time: order.estimated_ready_time,
        items_summary: formatItemsSummary(order.items), // Helper function
        expires_at: calculateExpiryDate(order.created_at), // created_at + 7 days
      });

      // Redirect to order tracking
      router.push(`/orders/${order.id}?token=${order.tracking_token}`);
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  return <form onSubmit={handleSubmitOrder}>{/* ... */}</form>;
}

// Helper functions
function formatItemsSummary(items: any[]): string {
  return items
    .map((item) => `${item.quantity}x ${item.menu_item_name}`)
    .join(', ');
}

function calculateExpiryDate(createdAt: string): string {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}
```

### Order Tracking with Status Updates

```typescript
'use client';

import { useEffect } from 'react';
import { useOrderHistory } from '@/lib/storage/hooks';
import { ordersApi } from '@/lib/api';

export function OrderTrackingPage({ orderId, token }: { orderId: string; token: string }) {
  const { getOrderById, updateOrder } = useOrderHistory();
  const localOrder = getOrderById(orderId);

  // Poll for order updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updated = await ordersApi.trackOrder(orderId, token);

        // Update local storage with latest status
        updateOrder(orderId, {
          status: updated.status,
          estimated_ready_time: updated.estimated_ready_time,
        });
      } catch (error) {
        console.error('Failed to fetch order updates:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, token]);

  return (
    <div>
      <h1>Bestellung {localOrder?.order_number}</h1>
      <p>Status: {localOrder?.status}</p>
      {/* ... */}
    </div>
  );
}
```

---

## Order Card Component

```typescript
'use client';

import { formatDistance } from 'date-fns';
import { de } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrderCardProps {
  order: OrderHistoryEntry;
  isExpired: boolean;
}

export function OrderCard({ order, isExpired }: OrderCardProps) {
  const statusColors = {
    new: 'bg-blue-500',
    confirmed: 'bg-yellow-500',
    preparing: 'bg-orange-500',
    ready: 'bg-green-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-500',
  };

  const statusLabels = {
    new: 'Neu',
    confirmed: 'Bestätigt',
    preparing: 'In Vorbereitung',
    ready: 'Bereit',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{order.order_number}</span>
            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{order.restaurant_name}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{order.total_amount.toFixed(2)} €</p>
          <p className="text-sm text-gray-600">
            {order.delivery_method === 'delivery' ? 'Lieferung' : 'Abholung'}
          </p>
        </div>
      </div>

      <p className="text-sm mb-2">{order.items_summary}</p>

      <p className="text-xs text-gray-500 mb-3">
        {formatDistance(new Date(order.created_at), new Date(), {
          addSuffix: true,
          locale: de,
        })}
      </p>

      <div className="flex gap-2">
        {!isExpired && order.status !== 'completed' && order.status !== 'cancelled' && (
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              window.location.href = `/orders/${order.order_id}?token=${order.tracking_token}`;
            }}
          >
            Bestellung verfolgen
          </Button>
        )}

        {isExpired && (
          <p className="text-sm text-gray-500">
            Tracking-Link abgelaufen (älter als 7 Tage)
          </p>
        )}

        {order.status === 'completed' && (
          <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
            Erneut bestellen
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## GDPR Compliance - Settings Page

```typescript
'use client';

import { useCustomerProfile, useOrderHistory } from '@/lib/storage/hooks';
import { cleanupService } from '@/lib/storage';
import { Button } from '@/components/ui/button';

export default function PrivacySettingsPage() {
  const { profile, clearProfile, getProfileAge } = useCustomerProfile();
  const { orders, clearHistory, getStatistics } = useOrderHistory();
  const stats = getStatistics();
  const cleanupStats = cleanupService.getCleanupStats();

  const handleExportData = () => {
    cleanupService.downloadDataExport();
  };

  const handleClearAll = () => {
    if (confirm('Alle gespeicherten Daten wirklich löschen?')) {
      cleanupService.clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Datenschutz & Einstellungen</h1>

      {/* Data Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-3">Deine gespeicherten Daten</h2>

        {profile ? (
          <>
            <p className="text-sm">
              <strong>Name:</strong> {profile.customer_name}
            </p>
            <p className="text-sm">
              <strong>Telefon:</strong> {profile.customer_phone}
            </p>
            <p className="text-sm">
              <strong>E-Mail:</strong> {profile.customer_email || '-'}
            </p>
            <p className="text-sm">
              <strong>Gespeicherte Adressen:</strong> {profile.delivery_addresses.length}
            </p>
            <p className="text-sm">
              <strong>Profilalter:</strong> {getProfileAge()} Tage
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600">Kein Profil gespeichert</p>
        )}

        <p className="text-sm mt-2">
          <strong>Bestellungen:</strong> {stats.total_orders}
        </p>
        <p className="text-sm">
          <strong>Gesamt ausgegeben:</strong> {stats.total_spent.toFixed(2)} €
        </p>
        <p className="text-sm">
          <strong>Speichergröße:</strong> {cleanupStats.storage_size}
        </p>
        <p className="text-sm">
          <strong>Letzte Bereinigung:</strong>{' '}
          {cleanupStats.last_cleanup
            ? new Date(cleanupStats.last_cleanup).toLocaleDateString('de-DE')
            : 'Noch nie'}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={handleExportData} variant="outline" className="w-full">
          Daten exportieren (JSON)
        </Button>

        <Button onClick={clearProfile} variant="outline" className="w-full">
          Profil löschen
        </Button>

        <Button onClick={clearHistory} variant="outline" className="w-full">
          Bestellhistorie löschen
        </Button>

        <Button
          onClick={() => cleanupService.forceCleanup()}
          variant="outline"
          className="w-full"
        >
          Abgelaufene Daten bereinigen
        </Button>

        <Button onClick={handleClearAll} variant="destructive" className="w-full">
          Alle Daten löschen
        </Button>
      </div>

      {/* Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Hinweis zum Datenschutz</h3>
        <p className="text-sm text-gray-700">
          Alle Daten werden nur auf deinem Gerät gespeichert. DonBot hat keinen Zugriff auf
          diese Daten. Die Daten werden nach 90 Tagen automatisch gelöscht.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Tracking-Tokens für Bestellungen sind nur 7 Tage gültig.
        </p>
      </div>
    </div>
  );
}
```

---

## Testing

### Unit Tests (example with Jest)

```typescript
import { customerProfileStorage } from '@/lib/storage';

describe('customerProfileStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and retrieve customer profile', () => {
    const profile = {
      customer_name: 'Test User',
      customer_phone: '+49 171 1234567',
      customer_email: 'test@example.com',
    };

    customerProfileStorage.saveProfile(profile);
    const retrieved = customerProfileStorage.getProfile();

    expect(retrieved?.customer_name).toBe(profile.customer_name);
    expect(retrieved?.customer_phone).toBe(profile.customer_phone);
  });

  it('should add and retrieve delivery address', () => {
    const address = {
      label: 'Home',
      address: 'Musterstr. 123',
      is_default: true,
    };

    customerProfileStorage.addDeliveryAddress(address);
    const addresses = customerProfileStorage.getDeliveryAddresses();

    expect(addresses).toHaveLength(1);
    expect(addresses[0].label).toBe('Home');
    expect(addresses[0].is_default).toBe(true);
  });

  it('should set default address', () => {
    customerProfileStorage.addDeliveryAddress({
      label: 'Home',
      address: 'Addr 1',
      is_default: false,
    });

    customerProfileStorage.addDeliveryAddress({
      label: 'Work',
      address: 'Addr 2',
      is_default: false,
    });

    const addresses = customerProfileStorage.getDeliveryAddresses();
    customerProfileStorage.setDefaultAddress(addresses[1].id);

    const defaultAddr = customerProfileStorage.getDefaultAddress();
    expect(defaultAddr?.label).toBe('Work');
  });
});
```

---

## Summary

### ✅ Features Implemented

1. **Customer Profile Storage**
   - Name, phone, email
   - Multiple delivery addresses with labels
   - Preferred payment/delivery methods
   - 90-day retention

2. **Order History**
   - Last 50 orders
   - Tracking tokens (7-day validity)
   - Order status updates
   - Grouped by date display
   - Statistics and analytics

3. **Auto-Cleanup**
   - Daily cleanup checks
   - 90-day expiration for profiles
   - 90-day expiration for orders
   - Manual cleanup trigger

4. **GDPR Compliance**
   - Data export (JSON)
   - Right to erasure (clear all data)
   - Transparent storage info
   - Client-side only

5. **React Hooks**
   - `useCustomerProfile()` for reactive profile access
   - `useOrderHistory()` for reactive order access

### 🎯 Next Steps

1. Install dependencies: `cd customer-ui && npm install`
2. Add auto-cleanup to `app/layout.tsx`
3. Update checkout form to use `useCustomerProfile()`
4. Update order confirmation to save to `useOrderHistory()`
5. Create order history page (`app/orders/page.tsx`)
6. Create privacy settings page (`app/settings/privacy/page.tsx`)

**Local storage is now fully implemented and ready to use!** 🎉
