# Customer UI - Comprehensive Testing Plan 🧪

**Date:** 2025-11-29
**Status:** Ready for Full Testing
**Backend:** ✅ Running on http://localhost:3000
**Customer UI:** ✅ Running on http://localhost:3003

---

## 🎯 Testing Overview

### Services Running
| Service | Port | Status | URL |
|---------|------|--------|-----|
| Backend API | 3000 | ✅ Running | http://localhost:3000 |
| Customer UI | 3003 | ✅ Running | http://localhost:3003 |
| Restaurant Dashboard | 3001 | ⏸️ Stopped | http://localhost:3001 |
| Admin Panel | 3002 | ⏸️ Stopped | http://localhost:3002 |
| PostgreSQL | 5432 | ✅ Running | localhost:5432 |

### What's Implemented
✅ Home page with restaurant listing
✅ Restaurant menu page with categories
✅ Menu item customization modal
✅ Shopping cart (add, update, remove)
✅ Cart page with order summary
✅ Checkout page (exists)
✅ Order tracking page (exists)
✅ Zustand state management
✅ localStorage persistence

---

## 📋 Test Scenarios

### **Test 1: Home Page & Restaurant Discovery**

#### **1.1 Basic Page Load**
- [ ] Open http://localhost:3003
- [ ] Header displays with "DonBot" logo
- [ ] Search bar visible
- [ ] Cart icon visible (no badge initially)
- [ ] Hero banner shows with red background
- [ ] "Hungry? We've got you!" headline visible
- [ ] Geolocation button present

#### **1.2 Geolocation Feature**
- [ ] Click "Use my current location" button
- [ ] Browser prompts for location permission
- [ ] After allowing: Latitude and longitude displayed
- [ ] After denying: Fallback message shown

#### **1.3 Category Tabs**
- [ ] Horizontal scrollable tabs visible
- [ ] Categories: Nearby, Top Rated, Fast Delivery, Free Delivery, Popular
- [ ] "Nearby" tab is active (red background)
- [ ] Other tabs inactive (transparent background)
- [ ] Tabs are clickable (visual state changes)

#### **1.4 Restaurant Cards**
- [ ] 4 mock restaurants displayed:
  - Limon Grillhaus (Turkish Grill)
  - Pizza Italiana (Italian Pizza)
  - Sushi Garden (Japanese Sushi)
  - Burger Palace (American Burgers)
- [ ] Each card shows:
  - Restaurant image (placeholder gradient)
  - Restaurant name
  - Cuisine type
  - Rating (stars)
  - Minimum order (red circular badge, top-right)
  - Open/Closed status (green/red badge, bottom-left)
  - Delivery time
  - Delivery fee
  - Distance
- [ ] Cards arranged in 2-column grid (mobile)
- [ ] Hover effect: Shadow expands, text color changes

#### **1.5 Bottom Navigation**
- [ ] Fixed to bottom of screen
- [ ] 5 circular icons:
  - 🏠 Home (red circle, active)
  - 🔍 Search (white circle)
  - 🛒 Cart (white circle)
  - ❤️ Favorites (white circle)
  - 👤 Profile (white circle)
- [ ] Active icon has scale animation
- [ ] Icons are clickable

---

### **Test 2: Restaurant Menu Page**

#### **2.1 Navigate to Menu**
- [ ] Click on "Limon Grillhaus" card
- [ ] URL changes to `/limon-grillhaus`
- [ ] Page loads successfully

#### **2.2 Restaurant Header**
- [ ] Banner image displayed (gradient placeholder)
- [ ] Restaurant name: "Limon Grillhaus"
- [ ] Cuisine type: "Turkish Grill"
- [ ] Rating: 4.7⭐
- [ ] Delivery time: "30-40 min"
- [ ] Address: "Hauptstraße 123, Dresden"
- [ ] Green "OPEN" badge visible
- [ ] Minimum order: €15.00
- [ ] Delivery fee: €2.50
- [ ] Phone number: clickable link

#### **2.3 Category Tabs (Sticky)**
- [ ] Tabs visible: Döner & Dürüm, Pizza, Getränke
- [ ] "Döner & Dürüm" tab active (red)
- [ ] Tabs stick to top on scroll
- [ ] Tabs are clickable

#### **2.4 Menu Items Grid**
- [ ] Items displayed in 2-column grid (mobile)
- [ ] Each item shows:
  - Image (or emoji placeholder)
  - "🔥 Popular" badge (if is_popular)
  - Item name
  - Description
  - Price
  - Red "+" button
- [ ] At least 3 items visible:
  - Dönertasche groß + Käse (€8.00)
  - Döner Teller (€10.00)
  - Dürüm Vegetarisch (€7.00)

#### **2.5 Item Click**
- [ ] Click on "Dönertasche groß + Käse"
- [ ] Modal opens (full screen on mobile)
- [ ] Background darkened (overlay)

---

### **Test 3: Item Customization Modal**

#### **3.1 Modal Content**
- [ ] Item image displayed
- [ ] Item name: "Dönertasche groß + Käse"
- [ ] Item description visible
- [ ] Base price: €8.00
- [ ] Close button (X) in top-right

#### **3.2 Modifier Groups**
- [ ] **Salad** section visible
  - Label: "Salad (required)"
  - 3 options: Alles, Ohne Zwiebeln, Nur Fleisch & Soße
  - Radio buttons (single selection)
  - Price: €0.00 for all options
- [ ] **Sauce** section visible
  - Label: "Sauce (required)"
  - 4 options: Knoblauch, Scharf, Kräuter, Gemischt
  - Radio buttons (single selection)
  - Price: €0.00 for all options
- [ ] **Extras** section visible
  - Label: "Extras (optional)"
  - 3 options: Extra Käse (+€1.50), Extra Fleisch (+€2.00), Pommes (+€2.50)
  - Checkboxes (multiple selection)

#### **3.3 Special Instructions**
- [ ] Textarea visible
- [ ] Placeholder: "Any special requests?"
- [ ] Can type text (e.g., "Extra scharf bitte")

#### **3.4 Quantity Selector**
- [ ] Default quantity: 1
- [ ] "-" button disabled initially
- [ ] "+" button enabled
- [ ] Clicking "+" increases to 2, 3, etc.
- [ ] Clicking "-" decreases (minimum 1)

#### **3.5 Price Calculation**
- [ ] Initial price: €8.00
- [ ] Select "Alles" → Price unchanged
- [ ] Select "Knoblauch" → Price unchanged
- [ ] Click "Extra Käse" → Price: €9.50
- [ ] Click "Pommes" → Price: €12.00
- [ ] Increase quantity to 2 → Price: €24.00
- [ ] Total price displayed in "Add to Cart" button

#### **3.6 Validation**
- [ ] Initially, "Add to Cart" button disabled
- [ ] Select "Alles" (Salad required) → Still disabled
- [ ] Select "Knoblauch" (Sauce required) → Button enabled
- [ ] If required options missing: Red error message appears

#### **3.7 Add to Cart**
- [ ] Click "Add to Cart - €24.00"
- [ ] Modal closes
- [ ] Cart badge appears in header with "2"
- [ ] Success feedback (console log or toast)

---

### **Test 4: Shopping Cart**

#### **4.1 Cart Badge**
- [ ] After adding item, badge appears on cart icon
- [ ] Badge shows "2" (quantity of added item)
- [ ] Badge is red circle with white text
- [ ] Badge positioned top-right of cart icon

#### **4.2 Navigate to Cart**
- [ ] Click cart icon in header
- [ ] URL changes to `/cart`
- [ ] Cart page loads

#### **4.3 Cart Page Content**
- [ ] Page title: "Your Cart"
- [ ] Subtitle: "from Limon Grillhaus"
- [ ] "Clear Cart" button visible (top-right)

#### **4.4 Cart Item Display**
- [ ] Item card shows:
  - Thumbnail image (80×80px)
  - Item name: "Dönertasche groß + Käse"
  - Selected options:
    - Salad: Alles
    - Sauce: Knoblauch
    - Extras: Extra Käse, Pommes
  - Special instructions: "Extra scharf bitte"
  - Quantity controls: "-" button, "2", "+" button
  - Unit price: €12.00
  - Total price: €24.00
  - Remove button (trash icon)

#### **4.5 Quantity Adjustment**
- [ ] Click "+" button
- [ ] Quantity increases to 3
- [ ] Total price updates to €36.00
- [ ] Subtotal updates to €36.00
- [ ] Final total updates to €38.50 (€36.00 + €2.50 delivery)
- [ ] Click "-" button twice
- [ ] Quantity decreases to 1
- [ ] Prices update accordingly

#### **4.6 Remove Item**
- [ ] Click trash icon
- [ ] Confirmation dialog (optional)
- [ ] Item removed from cart
- [ ] Cart badge in header disappears
- [ ] Empty cart state appears

#### **4.7 Empty Cart State**
- [ ] Shopping bag icon (gray)
- [ ] Message: "Your cart is empty"
- [ ] Description: "Add items from menu to get started"
- [ ] "Browse Restaurants" button
- [ ] Button links back to home page

#### **4.8 Order Summary**
- [ ] Add items back to cart
- [ ] Order summary card shows:
  - Subtotal: €24.00
  - Delivery Fee: €2.50
  - Total: €26.50 (bold, red)
  - "Proceed to Checkout" button (red)
  - "Continue Shopping" link (gray)

#### **4.9 Clear Cart**
- [ ] Click "Clear Cart" button
- [ ] Confirmation dialog appears
- [ ] Click "OK" → All items removed
- [ ] Empty state shown
- [ ] Click "Cancel" → Cart unchanged

---

### **Test 5: Restaurant Locking**

#### **5.1 Add Item from Restaurant A**
- [ ] Go to home page
- [ ] Click "Limon Grillhaus"
- [ ] Add "Dönertasche" to cart
- [ ] Cart badge shows "1"

#### **5.2 Try Adding from Restaurant B**
- [ ] Go back to home page
- [ ] Click "Pizza Italiana"
- [ ] Click on a pizza item
- [ ] Select options and click "Add to Cart"

#### **5.3 Restaurant Lock Alert**
- [ ] Alert dialog appears
- [ ] Message: "Your cart contains items from Limon Grillhaus. Clear cart and add items from Pizza Italiana?"
- [ ] Two buttons: "Cancel" and "OK"

#### **5.4 Cancel Action**
- [ ] Click "Cancel"
- [ ] Modal closes
- [ ] Cart unchanged (still has Limon items)
- [ ] Badge still shows previous count

#### **5.5 Confirm Clear**
- [ ] Try again
- [ ] Click "OK"
- [ ] Old cart cleared
- [ ] New item added from Pizza Italiana
- [ ] Badge updates with new item count
- [ ] Cart page shows "from Pizza Italiana"

---

### **Test 6: localStorage Persistence**

#### **6.1 Add Items to Cart**
- [ ] Add 2-3 items with different options
- [ ] Cart badge shows correct count

#### **6.2 Refresh Page**
- [ ] Press Cmd+R (Mac) or Ctrl+R (Windows)
- [ ] Page reloads
- [ ] Cart badge still visible with same count

#### **6.3 Navigate Away and Back**
- [ ] Click logo to go home
- [ ] Click cart icon
- [ ] Items still in cart
- [ ] All details preserved (options, quantity, instructions)

#### **6.4 Close Browser Tab**
- [ ] Close entire browser tab
- [ ] Reopen http://localhost:3003
- [ ] Cart badge visible
- [ ] Items still in cart

#### **6.5 Test localStorage in DevTools**
- [ ] Open browser DevTools (F12)
- [ ] Go to Application tab → Local Storage
- [ ] Find key: `cart-store`
- [ ] Value shows JSON with cart items
- [ ] Manually delete key
- [ ] Refresh page → Cart empty

---

### **Test 7: Checkout Flow** (If Implemented)

#### **7.1 Navigate to Checkout**
- [ ] Add items to cart
- [ ] Go to cart page
- [ ] Click "Proceed to Checkout"
- [ ] URL changes to `/checkout`

#### **7.2 Checkout Form**
- [ ] Form displays with fields:
  - Name (required)
  - Phone (required)
  - Email (optional)
  - Address (required for delivery)
- [ ] Delivery method selection:
  - Pickup (radio)
  - Delivery (radio)
- [ ] Payment method selection:
  - Cash (radio)
  - Card on delivery (radio)
  - Online payment (disabled/grayed out)

#### **7.3 Form Validation**
- [ ] Submit without filling → Error messages appear
- [ ] Fill required fields → Errors disappear
- [ ] Phone format validated (e.g., +49...)
- [ ] Email format validated (if filled)

#### **7.4 Order Review**
- [ ] Cart summary displayed
- [ ] Items list with quantities
- [ ] Total amount displayed
- [ ] Restaurant name shown
- [ ] Delivery/pickup method shown

#### **7.5 Submit Order**
- [ ] Click "Place Order" button
- [ ] Loading state (spinner or disabled button)
- [ ] API call to `POST /public/restaurants/:slug/orders`
- [ ] On success: Redirect to order confirmation
- [ ] On error: Error message displayed

---

### **Test 8: Order Tracking** (If Implemented)

#### **8.1 Access Order Page**
- [ ] After placing order, redirected to `/orders/{orderId}`
- [ ] Order ID visible in URL
- [ ] Tracking token in query param: `?token=xxx`

#### **8.2 Order Details**
- [ ] Order number displayed (e.g., "LIM-2025-000001")
- [ ] Restaurant name
- [ ] Customer name, phone, address
- [ ] Items list with quantities and options
- [ ] Total amount
- [ ] Payment method
- [ ] Order timestamp

#### **8.3 Order Status**
- [ ] Current status badge:
  - NEW (red)
  - CONFIRMED (blue)
  - PREPARING (yellow)
  - READY (green)
  - COMPLETED (gray)
- [ ] Estimated ready time (if available)
- [ ] Status timeline/progress bar

#### **8.4 Real-time Updates**
- [ ] Page polls backend every 5-10 seconds
- [ ] Status updates automatically
- [ ] No page refresh needed

---

### **Test 9: Responsive Design**

#### **9.1 Mobile (< 640px)**
- [ ] Test on iPhone SE (375px)
- [ ] Header: Logo + search + cart stacked properly
- [ ] Restaurant cards: 1 column
- [ ] Menu items: 1 column
- [ ] Modal: Full screen
- [ ] Bottom nav: 5 icons fit without overflow

#### **9.2 Tablet (640px - 1024px)**
- [ ] Test on iPad (768px)
- [ ] Restaurant cards: 2 columns
- [ ] Menu items: 2 columns
- [ ] Modal: Centered with padding

#### **9.3 Desktop (> 1024px)**
- [ ] Test on laptop (1440px)
- [ ] Restaurant cards: 3-4 columns
- [ ] Menu items: 3-4 columns
- [ ] Modal: Max-width centered
- [ ] Header: Proper spacing

---

### **Test 10: Backend Integration** (Mock Data vs Real API)

#### **10.1 Current State (Mock Data)**
- [ ] Home page shows 4 hardcoded restaurants
- [ ] Menu page shows hardcoded items
- [ ] No real API calls

#### **10.2 Test Real API Endpoints**

**Test Restaurant Endpoint:**
```bash
curl http://localhost:3000/public/restaurants/limon-grillhaus | jq
```
- [ ] Returns restaurant data
- [ ] Has fields: id, name, slug, cuisine_type, address, phone, etc.

**Test Menu Endpoint:**
```bash
curl http://localhost:3000/public/restaurants/limon-grillhaus/menu | jq
```
- [ ] Returns menu items array
- [ ] Has fields: id, name, description, price, category, etc.

**Test Order Creation:**
```bash
curl -X POST http://localhost:3000/public/restaurants/limon-grillhaus/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test Customer",
    "customer_phone": "+4917012345678",
    "customer_email": "test@example.com",
    "delivery_address": "Teststraße 1, 01234 Dresden",
    "delivery_method": "delivery",
    "payment_method": "cash",
    "items": [{
      "menu_item_id": "...",
      "quantity": 1,
      "modifiers": [],
      "special_instructions": ""
    }]
  }' | jq
```
- [ ] Returns order object with tracking token
- [ ] Order saved to database

#### **10.3 Replace Mock Data (Future)**
- [ ] Update `src/app/page.tsx` to call `restaurantsApi.getNearbyRestaurants()`
- [ ] Update `src/app/[slug]/page.tsx` to call:
  - `restaurantsApi.getRestaurant(slug)`
  - `restaurantsApi.getMenu(slug)`
- [ ] Test with real Limon Grillhaus data

---

### **Test 11: Error Handling**

#### **11.1 Network Errors**
- [ ] Stop backend server
- [ ] Try loading menu page
- [ ] Error message displayed
- [ ] "Try again" button available

#### **11.2 404 Errors**
- [ ] Navigate to `/nonexistent-restaurant`
- [ ] "Restaurant not found" message
- [ ] Link back to home page

#### **11.3 Validation Errors**
- [ ] Try adding item without required options
- [ ] Error message: "Please select required options"
- [ ] Button stays disabled

#### **11.4 Cart Errors**
- [ ] Manually corrupt localStorage (bad JSON)
- [ ] Page loads without crashing
- [ ] Cart resets to empty state

---

### **Test 12: Performance**

#### **12.1 Page Load Times**
- [ ] Home page loads < 1 second
- [ ] Menu page loads < 1 second
- [ ] Cart page loads < 500ms
- [ ] Modal opens < 300ms

#### **12.2 Animations**
- [ ] Smooth hover effects (no jank)
- [ ] Modal transitions smooth
- [ ] Cart badge appears/disappears smoothly

#### **12.3 Memory Leaks**
- [ ] Open DevTools → Performance tab
- [ ] Record session while navigating
- [ ] No major memory spikes
- [ ] No errors in console

---

## 🐛 Known Issues / Limitations

### **1. Mock Data**
- Home page uses hardcoded restaurants (not from API)
- Menu page uses hardcoded items (not from API)
- **Solution:** Connect to real backend endpoints (1-2 hours)

### **2. Category Filtering Not Functional**
- Category tabs are visual only
- Clicking tabs doesn't filter restaurants/menu items
- **Solution:** Add filtering logic (30 minutes)

### **3. Search Not Implemented**
- Search bar is placeholder only
- No search functionality
- **Solution:** Add search logic + backend endpoint (2 hours)

### **4. No Modifiers from Backend**
- Modifiers hardcoded in modal
- Backend has modifier groups but not connected
- **Solution:** Fetch modifiers from `/menu` endpoint (1 hour)

### **5. Geolocation Shows Coordinates**
- Shows lat/long instead of address
- No reverse geocoding
- **Solution:** Integrate Google Maps API (1 hour)

### **6. No Real-time Order Updates**
- Order tracking uses polling (every 5s)
- WebSocket not implemented
- **Solution:** Add WebSocket support (3-4 hours)

### **7. No User Authentication**
- No login/signup for customers
- Orders are anonymous (just name/phone)
- **Intentional:** MVP design (guest checkout only)

### **8. No Favorites**
- Favorites icon in bottom nav not functional
- **Future feature:** Week 8-10

### **9. No Profile Page**
- Profile icon not functional
- **Future feature:** Week 8-10

---

## ✅ Testing Checklist Summary

- [ ] **Test 1:** Home Page & Restaurant Discovery (5 tests)
- [ ] **Test 2:** Restaurant Menu Page (5 tests)
- [ ] **Test 3:** Item Customization Modal (7 tests)
- [ ] **Test 4:** Shopping Cart (9 tests)
- [ ] **Test 5:** Restaurant Locking (5 tests)
- [ ] **Test 6:** localStorage Persistence (5 tests)
- [ ] **Test 7:** Checkout Flow (5 tests)
- [ ] **Test 8:** Order Tracking (4 tests)
- [ ] **Test 9:** Responsive Design (3 tests)
- [ ] **Test 10:** Backend Integration (3 tests)
- [ ] **Test 11:** Error Handling (4 tests)
- [ ] **Test 12:** Performance (3 tests)

**Total:** 58 test scenarios

---

## 🚀 Quick Start Testing

### **Option 1: Full Manual Testing** (2-3 hours)
Go through all 58 test scenarios above

### **Option 2: Critical Path Testing** (30 minutes)
Focus on main user flow:
1. Open home page
2. Click restaurant card
3. Click menu item
4. Customize with modifiers
5. Add to cart
6. View cart
7. Adjust quantity
8. Clear cart
9. Test persistence (refresh page)

### **Option 3: Integration Testing** (1 hour)
Connect to real backend and test:
1. Fetch real restaurant data
2. Fetch real menu items
3. Create actual order
4. Track order status

---

## 📊 Expected Results

### **✅ Working Features**
- Home page with restaurant listing
- Menu page with items
- Item customization modal
- Cart management (add, update, remove, clear)
- Restaurant locking
- localStorage persistence
- Responsive design
- Smooth animations

### **⚠️ Partially Working**
- Geolocation (shows coordinates, not address)
- Category tabs (visual only, no filtering)

### **❌ Not Implemented**
- Real API integration (using mock data)
- Search functionality
- Favorites
- Profile page
- User authentication

---

## 🎯 Next Steps After Testing

1. **Document bugs found** → Create issue list
2. **Connect to real backend** → Replace mock data
3. **Implement checkout** → Complete order submission flow
4. **Add order tracking** → Real-time status updates
5. **Polish UI/UX** → Fix any visual bugs
6. **Deploy to production** → Host on Vercel/Netlify

---

**Ready to test!** 🧪

Open: http://localhost:3003

Start with Test 1 (Home Page) and work your way down! 🚀
