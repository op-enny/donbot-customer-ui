# Customer UI - Local Storage Strategy

## Overview

Store customer profile data and order history in browser `localStorage` to improve UX for repeat customers while maintaining GDPR compliance.

---

## Storage Schema

### 1. Customer Profile (`donbot_customer_profile`)

**Purpose:** Auto-fill checkout form on repeat orders

```typescript
interface CustomerProfile {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_addresses: DeliveryAddress[];
  preferred_payment_method: 'cash_on_delivery' | 'card_on_delivery' | 'online';
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

interface DeliveryAddress {
  id: string; // UUID
  label: string; // "Home", "Work", "Other"
  address: string; // "Musterstr. 123, 50667 Köln"
  is_default: boolean;
  last_used_at: string; // ISO timestamp
}
```

**Example:**
```json
{
  "customer_name": "Max Mustermann",
  "customer_phone": "+49 171 1234567",
  "customer_email": "max@example.com",
  "delivery_addresses": [
    {
      "id": "addr-001",
      "label": "Home",
      "address": "Musterstr. 123, 50667 Köln",
      "is_default": true,
      "last_used_at": "2025-12-01T10:30:00Z"
    },
    {
      "id": "addr-002",
      "label": "Work",
      "address": "Arbeitstr. 45, 50668 Köln",
      "is_default": false,
      "last_used_at": "2025-11-28T12:15:00Z"
    }
  ],
  "preferred_payment_method": "cash_on_delivery",
  "created_at": "2025-11-01T14:20:00Z",
  "updated_at": "2025-12-01T10:30:00Z"
}
```

**Retention:** 90 days from last update

---

### 2. Order History (`donbot_order_history`)

**Purpose:** Show recent orders with tracking links

```typescript
interface OrderHistoryEntry {
  order_id: string; // UUID from backend
  order_number: string; // "LIM-2025-000017"
  restaurant_slug: string; // "limon-grillhaus"
  restaurant_name: string; // "Limon Grillhaus"
  tracking_token: string; // For order tracking
  total_amount: number;
  delivery_method: 'pickup' | 'delivery';
  payment_method: string;
  status: OrderStatus;
  created_at: string; // ISO timestamp
  estimated_ready_time?: string;
  items_summary: string; // "2x Döner im Brot, 1x Pizza Margherita"
  expires_at: string; // created_at + 7 days (tracking token expiry)
}

type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'ready' |
                   'out_for_delivery' | 'completed' | 'cancelled';
```

**Example:**
```json
[
  {
    "order_id": "9422d36d-562a-47cd-a5d6-46175d4dbb62",
    "order_number": "LIM-2025-000017",
    "restaurant_slug": "limon-grillhaus",
    "restaurant_name": "Limon Grillhaus",
    "tracking_token": "e86a405af84ec40d5299e76db5a3aac7...",
    "total_amount": 13.00,
    "delivery_method": "pickup",
    "payment_method": "cash_on_delivery",
    "status": "new",
    "created_at": "2025-12-01T08:50:40Z",
    "estimated_ready_time": "2025-12-01T10:10:40Z",
    "items_summary": "2x Döner im Brot",
    "expires_at": "2025-12-08T08:50:40Z"
  },
  {
    "order_id": "prev-order-id",
    "order_number": "LIM-2025-000015",
    "restaurant_slug": "limon-grillhaus",
    "restaurant_name": "Limon Grillhaus",
    "tracking_token": "expired-token",
    "total_amount": 18.50,
    "delivery_method": "delivery",
    "payment_method": "cash_on_delivery",
    "status": "completed",
    "created_at": "2025-11-28T19:30:00Z",
    "items_summary": "1x Pizza Margherita, 1x Pommes",
    "expires_at": "2025-12-05T19:30:00Z"
  }
]
```

**Retention:**
- Active orders (not completed/cancelled): Keep for 7 days
- Completed/cancelled orders: Keep for 90 days
- Auto-cleanup on page load

---

### 3. Recent Restaurants (`donbot_recent_restaurants`)

**Purpose:** Quick access to recently ordered restaurants

```typescript
interface RecentRestaurant {
  slug: string;
  name: string;
  logo_url: string | null;
  last_ordered_at: string; // ISO timestamp
  order_count: number; // How many orders from this restaurant
}
```

**Example:**
```json
[
  {
    "slug": "limon-grillhaus",
    "name": "Limon Grillhaus",
    "logo_url": "https://res.cloudinary.com/.../logo.png",
    "last_ordered_at": "2025-12-01T08:50:40Z",
    "order_count": 5
  }
]
```

**Retention:** 90 days from last order

---

## Implementation Plan

### Phase 1: Storage Service (Week 1)

**File:** `src/lib/storage/localStorageService.ts`

```typescript
// Type-safe wrapper around localStorage with expiration
class LocalStorageService {
  // Generic get/set with automatic JSON parsing
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void

  // Cleanup expired items
  cleanupExpired(): void
}
```

### Phase 2: Customer Profile (Week 1)

**File:** `src/lib/storage/customerProfile.ts`

```typescript
// Customer profile management
export const customerProfileStorage = {
  getProfile(): CustomerProfile | null
  saveProfile(data: Partial<CustomerProfile>): void
  updateProfile(updates: Partial<CustomerProfile>): void
  addDeliveryAddress(address: Omit<DeliveryAddress, 'id'>): void
  removeDeliveryAddress(id: string): void
  setDefaultAddress(id: string): void
  clearProfile(): void
}
```

### Phase 3: Order History (Week 1)

**File:** `src/lib/storage/orderHistory.ts`

```typescript
// Order history management
export const orderHistoryStorage = {
  getOrders(): OrderHistoryEntry[]
  addOrder(order: OrderHistoryEntry): void
  updateOrderStatus(orderId: string, status: OrderStatus): void
  removeOrder(orderId: string): void
  getActiveOrders(): OrderHistoryEntry[] // not completed/cancelled
  getOrdersByRestaurant(slug: string): OrderHistoryEntry[]
  cleanupExpired(): void // Remove orders older than 90 days
}
```

### Phase 4: Integration (Week 2)

1. **Checkout Form Auto-fill**
   - Load customer profile on mount
   - Pre-fill name, phone, email, address
   - Show address dropdown for delivery orders

2. **Order Confirmation**
   - Save order to history after successful creation
   - Store tracking token for future access

3. **Order History Page**
   - Display recent orders (last 7 days with active tracking)
   - Show order status badges
   - "Track Order" button with tracking link

4. **Navigation**
   - Add "My Orders" link to header/bottom nav
   - Badge showing active order count

---

## GDPR Compliance

### 1. User Consent

**Show privacy notice on first order:**
```
"Wir speichern deine Kontaktdaten lokal auf diesem Gerät,
um zukünftige Bestellungen zu vereinfachen.
Du kannst diese Daten jederzeit löschen."

[ ] Daten für schnellere Bestellungen speichern
```

### 2. Data Control

**Settings page with:**
- View stored data
- Clear customer profile
- Clear order history
- Clear all data
- Export data (JSON download)

### 3. Transparency

**File:** `src/components/settings/PrivacySettings.tsx`

```typescript
<div className="privacy-settings">
  <h3>Deine gespeicherten Daten</h3>

  <div className="data-summary">
    <p>Name: {profile?.customer_name}</p>
    <p>Gespeicherte Bestellungen: {orders.length}</p>
    <p>Letzte Aktualisierung: {formatDate(profile?.updated_at)}</p>
  </div>

  <button onClick={exportData}>Daten exportieren</button>
  <button onClick={clearProfile}>Profil löschen</button>
  <button onClick={clearOrders}>Bestellhistorie löschen</button>
  <button onClick={clearAll} className="danger">
    Alle Daten löschen
  </button>
</div>
```

---

## Auto-Cleanup Strategy

### Trigger Points

1. **On App Load** (`src/app/layout.tsx`)
   ```typescript
   useEffect(() => {
     cleanupExpiredData();
   }, []);
   ```

2. **After Order Creation**
   ```typescript
   // Remove orders older than 90 days
   orderHistoryStorage.cleanupExpired();
   ```

3. **Manual Cleanup** (Settings page)
   ```typescript
   <button onClick={cleanupAllExpired}>
     Abgelaufene Daten entfernen
   </button>
   ```

### Cleanup Logic

```typescript
function cleanupExpiredData() {
  const now = new Date();
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000; // 90 days in ms

  // 1. Customer Profile (90 days since last update)
  const profile = customerProfileStorage.getProfile();
  if (profile) {
    const updatedAt = new Date(profile.updated_at);
    if (now.getTime() - updatedAt.getTime() > NINETY_DAYS) {
      customerProfileStorage.clearProfile();
      console.log('[Cleanup] Customer profile expired, removed');
    }
  }

  // 2. Order History (90 days since order creation)
  const orders = orderHistoryStorage.getOrders();
  orders.forEach(order => {
    const createdAt = new Date(order.created_at);
    if (now.getTime() - createdAt.getTime() > NINETY_DAYS) {
      orderHistoryStorage.removeOrder(order.order_id);
      console.log(`[Cleanup] Order ${order.order_number} expired, removed`);
    }
  });

  // 3. Recent Restaurants (90 days since last order)
  const restaurants = recentRestaurantsStorage.getAll();
  restaurants.forEach(restaurant => {
    const lastOrder = new Date(restaurant.last_ordered_at);
    if (now.getTime() - lastOrder.getTime() > NINETY_DAYS) {
      recentRestaurantsStorage.remove(restaurant.slug);
      console.log(`[Cleanup] Restaurant ${restaurant.name} expired, removed`);
    }
  });
}
```

---

## UI/UX Features

### 1. Checkout Form Enhancements

**Before (current):**
```
[ Empty form ]
Customer must type everything manually
```

**After (with local storage):**
```
✓ Name: Max Mustermann (saved)
✓ Phone: +49 171 1234567 (saved)
✓ Email: max@example.com (saved)

Delivery Address:
[ Dropdown: "Home - Musterstr. 123, 50667 Köln" ▼ ]
  - Home - Musterstr. 123, 50667 Köln
  - Work - Arbeitstr. 45, 50668 Köln
  + Neue Adresse hinzufügen

Payment Method:
(•) Bargeld bei Lieferung (saved preference)
( ) Karte bei Lieferung
( ) Online bezahlen
```

### 2. Order History Page

**File:** `src/app/orders/page.tsx`

```
┌─────────────────────────────────────┐
│ Meine Bestellungen                 │
├─────────────────────────────────────┤
│                                     │
│ Heute                               │
│ ┌─────────────────────────────────┐ │
│ │ LIM-2025-000017    [Neu]        │ │
│ │ Limon Grillhaus                 │ │
│ │ 2x Döner im Brot                │ │
│ │ 13,00 €  •  Abholung            │ │
│ │ Bereit um: 11:10                │ │
│ │                                 │ │
│ │ [Bestellung verfolgen]          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Gestern                             │
│ ┌─────────────────────────────────┐ │
│ │ LIM-2025-000015    [Abgeschl.]  │ │
│ │ Limon Grillhaus                 │ │
│ │ 1x Pizza Margherita, 1x Pommes  │ │
│ │ 18,50 €  •  Lieferung           │ │
│ │                                 │ │
│ │ [Erneut bestellen]              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Alle Bestellungen löschen]         │
└─────────────────────────────────────┘
```

### 3. Quick Reorder

**One-click reorder from order history:**

```typescript
function handleReorder(orderId: string) {
  const order = orderHistoryStorage.getOrderById(orderId);

  // 1. Fetch current menu to validate items
  const menu = await restaurantsApi.getMenu(order.restaurant_slug);

  // 2. Add items to cart (if still available)
  order.items.forEach(item => {
    const menuItem = menu.findItem(item.menu_item_id);
    if (menuItem?.is_available) {
      cartStore.addItem({
        ...menuItem,
        quantity: item.quantity,
        options: item.options
      });
    }
  });

  // 3. Navigate to cart
  router.push('/cart');
}
```

### 4. Header Badge

```tsx
<nav>
  <Link href="/">Menu</Link>
  <Link href="/cart">
    Warenkorb {cartItems > 0 && `(${cartItems})`}
  </Link>
  <Link href="/orders">
    Meine Bestellungen {activeOrders > 0 && <Badge>{activeOrders}</Badge>}
  </Link>
</nav>
```

---

## Security Considerations

### 1. No Sensitive Data
❌ **Never store:**
- Passwords
- Credit card numbers
- Full payment details
- Social security numbers

✅ **Safe to store:**
- Name, phone, email (customer already knows)
- Delivery addresses (customer's own data)
- Order IDs and tracking tokens (public, time-limited)

### 2. Tracking Token Expiry

**Tracking tokens expire after 7 days** (backend enforces this)

```typescript
// Show warning if token expired
function OrderCard({ order }: { order: OrderHistoryEntry }) {
  const isExpired = new Date(order.expires_at) < new Date();

  return (
    <div className="order-card">
      {isExpired ? (
        <p className="text-muted">
          Tracking-Link abgelaufen (älter als 7 Tage)
        </p>
      ) : (
        <button onClick={() => trackOrder(order)}>
          Bestellung verfolgen
        </button>
      )}
    </div>
  );
}
```

### 3. XSS Protection

Always sanitize data before storing/displaying:

```typescript
import DOMPurify from 'isomorphic-dompurify';

function saveCustomerName(name: string) {
  const sanitized = DOMPurify.sanitize(name);
  customerProfileStorage.saveProfile({ customer_name: sanitized });
}
```

---

## Performance Optimization

### 1. Lazy Loading

```typescript
// Don't load order history until user visits /orders page
const orderHistory = useMemo(() => {
  if (pathname === '/orders') {
    return orderHistoryStorage.getOrders();
  }
  return [];
}, [pathname]);
```

### 2. Debounced Updates

```typescript
// Don't save on every keystroke, wait 500ms
const debouncedSave = useMemo(
  () => debounce((profile: CustomerProfile) => {
    customerProfileStorage.saveProfile(profile);
  }, 500),
  []
);
```

### 3. Storage Size Limits

```typescript
// Limit storage size to prevent bloat
const MAX_ORDER_HISTORY = 50; // Keep only last 50 orders
const MAX_ADDRESSES = 10; // Limit to 10 saved addresses

function addOrder(order: OrderHistoryEntry) {
  const orders = orderHistoryStorage.getOrders();

  if (orders.length >= MAX_ORDER_HISTORY) {
    // Remove oldest completed order
    const oldestCompleted = orders
      .filter(o => o.status === 'completed')
      .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];

    if (oldestCompleted) {
      orderHistoryStorage.removeOrder(oldestCompleted.order_id);
    }
  }

  orderHistoryStorage.addOrder(order);
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('orderHistoryStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add order to history', () => {
    const order = createMockOrder();
    orderHistoryStorage.addOrder(order);
    const orders = orderHistoryStorage.getOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0].order_id).toBe(order.order_id);
  });

  it('should cleanup expired orders', () => {
    const oldOrder = createMockOrder({
      created_at: '2024-01-01T00:00:00Z' // 90+ days ago
    });
    const recentOrder = createMockOrder({
      created_at: new Date().toISOString()
    });

    orderHistoryStorage.addOrder(oldOrder);
    orderHistoryStorage.addOrder(recentOrder);
    orderHistoryStorage.cleanupExpired();

    const orders = orderHistoryStorage.getOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0].order_id).toBe(recentOrder.order_id);
  });
});
```

---

## Migration Strategy

### Version 1 → Version 2 (Future)

If we need to change the storage schema later:

```typescript
const STORAGE_VERSION = 2;

function migrateStorage() {
  const version = localStorage.getItem('donbot_storage_version');

  if (!version || parseInt(version) < STORAGE_VERSION) {
    // Migrate from v1 to v2
    const oldProfile = localStorage.getItem('customer_profile'); // Old key
    if (oldProfile) {
      const migrated = migrateProfileV1toV2(JSON.parse(oldProfile));
      localStorage.setItem('donbot_customer_profile', JSON.stringify(migrated));
      localStorage.removeItem('customer_profile'); // Remove old
    }

    localStorage.setItem('donbot_storage_version', STORAGE_VERSION.toString());
  }
}
```

---

## Summary

### ✅ Benefits

1. **UX:** Auto-fill checkout form, one-click reorder
2. **Retention:** Users can track recent orders without account
3. **Performance:** Offline-first, no server dependency
4. **Privacy:** Client-side only, user controls data
5. **GDPR:** Auto-cleanup after 90 days, easy data export/delete

### 🎯 Key Features

- Customer profile with multiple delivery addresses
- Order history with tracking tokens (7-day validity)
- Recent restaurants list
- Auto-cleanup after 90 days
- GDPR-compliant data management
- Quick reorder functionality

### 📦 Storage Keys

```
donbot_customer_profile      (Customer info + addresses)
donbot_order_history         (Last 50 orders, max 90 days)
donbot_recent_restaurants    (Recently ordered from)
donbot_storage_version       (Schema version for migrations)
donbot_privacy_consent       (User accepted privacy notice)
```

### 🚀 Implementation Timeline

- **Week 1:** Storage services + customer profile
- **Week 2:** Order history + checkout integration
- **Week 3:** Order history page + settings
- **Week 4:** Testing + GDPR compliance

---

**Ready to implement?** This will significantly improve the UX for repeat customers! 🎉
