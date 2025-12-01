# Routing Fix - Dynamic Slug Conflict

**Issue:** 404 errors when navigating to `/profile`, `/search`, `/favorites`
**Root Cause:** Dynamic `[slug]` route catching all paths
**Date:** 2025-12-01
**Status:** FIXED ✅

---

## Problem

### Error
```
GET /public/restaurants/profile/menu → 404 Not Found
GET /public/restaurants/search/menu → 404 Not Found
GET /public/restaurants/favorites/menu → 404 Not Found
```

### Root Cause

Next.js routing hierarchy:
```
app/
├── [slug]/page.tsx        ← Catches ALL routes (including /profile, /search, etc.)
├── cart/page.tsx          ← Specific route (takes precedence)
├── checkout/page.tsx      ← Specific route (takes precedence)
└── orders/[id]/page.tsx   ← Specific route (takes precedence)
```

**Problem:** The `[slug]` dynamic route was designed to catch restaurant slugs like `/limon-grillhaus`, but it also caught navigation links like `/profile`, `/search`, `/favorites`.

**When user clicked "Profile" in BottomNav:**
1. Router navigated to `/profile`
2. `[slug]/page.tsx` caught it (thinking "profile" is a restaurant slug)
3. Page tried to load `/public/restaurants/profile/menu`
4. Backend returned 404 (no restaurant named "profile")
5. Frontend showed error

---

## Solution

Create explicit pages for all BottomNav routes **before** the dynamic `[slug]` route in the routing hierarchy.

### Next.js Routing Priority

Next.js matches routes in this order:
1. **Exact matches** (`/profile/page.tsx`)
2. **Dynamic segments** (`/[slug]/page.tsx`)
3. **Catch-all** (`/[...slug]/page.tsx`)

By creating explicit pages, they take precedence over the dynamic route.

---

## Files Created

### 1. `/app/profile/page.tsx`
**Purpose:** User profile page
**Features:**
- User info card
- Menu items: Orders, Addresses, Payment, Settings
- App info (version, terms, privacy)
- Sign in/out buttons

### 2. `/app/search/page.tsx`
**Purpose:** Restaurant search
**Features:**
- Search bar with filters
- Cuisine category filters
- Popular categories (Pizza, Döner, Burgers)
- Search results (coming soon)

### 3. `/app/favorites/page.tsx`
**Purpose:** Saved restaurants
**Features:**
- List of favorited restaurants
- Empty state with CTA
- Restaurant cards with ratings, delivery time
- Heart icon to unfavorite

### 4. `/app/orders/page.tsx`
**Purpose:** Order history list
**Features:**
- All orders from last 7 days
- Order cards with status, items, price
- Track order button for active orders
- Reorder button for completed orders

---

## Routing Structure (After Fix)

```
app/
├── page.tsx                    → Home (/)
├── search/page.tsx             → Search (/search) ✅ NEW
├── cart/page.tsx               → Cart (/cart)
├── checkout/page.tsx           → Checkout (/checkout)
├── favorites/page.tsx          → Favorites (/favorites) ✅ NEW
├── profile/page.tsx            → Profile (/profile) ✅ NEW
├── orders/
│   ├── page.tsx                → Order history (/orders) ✅ NEW
│   └── [id]/page.tsx           → Order tracking (/orders/:id)
└── [slug]/page.tsx             → Restaurant menu (/:slug)
```

**Routing Priority:**
1. `/search` → `search/page.tsx` (exact match)
2. `/profile` → `profile/page.tsx` (exact match)
3. `/favorites` → `favorites/page.tsx` (exact match)
4. `/orders` → `orders/page.tsx` (exact match)
5. `/limon-grillhaus` → `[slug]/page.tsx` (dynamic match)

---

## BottomNav Links (All Working)

| Icon | Label | Route | Status |
|------|-------|-------|--------|
| 🏠 | Home | `/` | ✅ Working |
| 🔍 | Search | `/search` | ✅ Fixed |
| 🛒 | Cart | `/cart` | ✅ Working |
| ❤️ | Favorites | `/favorites` | ✅ Fixed |
| 👤 | Profile | `/profile` | ✅ Fixed |

---

## Testing

### Before Fix
```bash
# Navigate to /profile
✗ 404: Restaurant 'profile' not found
✗ Console: GET /public/restaurants/profile/menu → 404

# Navigate to /search
✗ 404: Restaurant 'search' not found
✗ Console: GET /public/restaurants/search/menu → 404

# Navigate to /favorites
✗ 404: Restaurant 'favorites' not found
✗ Console: GET /public/restaurants/favorites/menu → 404
```

### After Fix
```bash
# Navigate to /profile
✅ Profile page loads
✅ No API errors

# Navigate to /search
✅ Search page loads
✅ No API errors

# Navigate to /favorites
✅ Favorites page loads
✅ No API errors

# Navigate to /orders
✅ Orders page loads
✅ No API errors

# Navigate to /limon-grillhaus
✅ Restaurant menu loads
✅ API: GET /public/restaurants/limon-grillhaus/menu → 200
```

---

## Alternative Solutions (Considered but Not Used)

### ❌ Option 1: Middleware to Block Specific Slugs

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const reservedSlugs = ['profile', 'search', 'favorites', 'orders', 'cart'];

  if (reservedSlugs.includes(pathname.split('/')[1])) {
    return NextResponse.rewrite(new URL(`${pathname}`, request.url));
  }
}
```

**Rejected because:**
- More complex
- Requires middleware configuration
- Harder to maintain

### ❌ Option 2: Catch-All Route with Manual Routing

```typescript
// app/[...slug]/page.tsx
export default function DynamicPage({ params }) {
  const slug = params.slug[0];

  if (slug === 'profile') return <ProfilePage />;
  if (slug === 'search') return <SearchPage />;
  // ...
}
```

**Rejected because:**
- Anti-pattern in Next.js
- Loses automatic code splitting
- Hard to maintain

### ✅ Option 3: Explicit Pages (Chosen)

**Benefits:**
- Standard Next.js pattern
- Automatic code splitting
- Clear routing hierarchy
- Easy to maintain
- Better for SEO

---

## Future-Proofing

### Reserved Slugs

These slugs should **never** be used as restaurant slugs in the database:

```typescript
const RESERVED_SLUGS = [
  'search',
  'profile',
  'favorites',
  'orders',
  'cart',
  'checkout',
  'settings',
  'help',
  'about',
  'terms',
  'privacy',
  'admin',
  'api',
];
```

### Database Validation

Add validation to restaurant creation:

```typescript
// backend/src/admin/dto/create-restaurant.dto.ts
@IsNotIn([
  'search', 'profile', 'favorites', 'orders',
  'cart', 'checkout', 'settings', 'help', ...
])
slug: string;
```

### Frontend Validation

Add check in slug generation:

```typescript
function generateSlug(name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  if (RESERVED_SLUGS.includes(slug)) {
    return `${slug}-restaurant`; // Append suffix
  }

  return slug;
}
```

---

## Summary

**Problem:** Dynamic `[slug]` route was catching navigation links intended for specific pages

**Solution:** Created explicit pages (`/profile`, `/search`, `/favorites`, `/orders`) to take precedence over dynamic route

**Result:**
- ✅ All BottomNav links working
- ✅ No more 404 errors
- ✅ Restaurant slugs still work correctly
- ✅ Proper Next.js routing hierarchy

**Status:** RESOLVED ✅

**Commit Message:**
```
fix(routing): add explicit pages to prevent slug route conflicts

- Add /profile, /search, /favorites, /orders pages
- Fix 404 errors when navigating via BottomNav
- Ensure dynamic [slug] route only matches restaurants
- All navigation links now working correctly
```
