import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SupportedLocale = 'de' | 'en' | 'tr';

interface LocaleState {
  locale: SupportedLocale;
  currency: string;
  currencySymbol: string;
  isAutoDetected: boolean;
  
  setLocale: (locale: SupportedLocale) => void;
  setFromGeoIP: (data: { locale: string; currency: string; currencySymbol: string }) => void;
  t: (key: string) => string;
}

// UI Translations
export const translations: Record<SupportedLocale, Record<string, string>> = {
  de: {
    // Header & Navigation
    'home': 'Startseite',
    'search': 'Suchen',
    'cart': 'Warenkorb',
    'orders': 'Bestellungen',
    'favorites': 'Favoriten',
    'profile': 'Profil',
    'language': 'Sprache',
    
    // Hero Banner
    'hero_title': 'Hunger? Wir haben da was!',
    'hero_subtitle': 'Finde die besten lokalen Restaurants in deiner Nähe. Lieferung oder Abholung.',
    'use_my_location': 'Mein Standort',
    'locating': 'Standort wird ermittelt...',
    'search_radius': 'Suchradius',
    'location_error': 'Standort konnte nicht ermittelt werden. Bitte aktivieren Sie die Standortdienste.',
    'geolocation_unsupported': 'Geolokalisierung wird von Ihrem Browser nicht unterstützt.',
    
    // Restaurant List
    'nearby_restaurants': 'Restaurants in der Nähe',
    'no_restaurants': 'Keine Restaurants gefunden',
    'places_found': 'Restaurants gefunden',
    'expand_radius': 'Suchradius auf 50km erweitern',
    'search_placeholder': 'Restaurant oder Küche suchen...',
    'km_away': 'km entfernt',
    'min_order': 'Mindestbestellung',
    'delivery_fee': 'Liefergebühr',
    'free': 'Kostenlos',
    'open': 'Geöffnet',
    'closed': 'Geschlossen',
    
    // Categories
    'nearby': 'In der Nähe',
    'top_rated': 'Bestbewertet',
    'fast_delivery': 'Schnelle Lieferung',
    'free_delivery': 'Kostenlose Lieferung',
    
    // Menu
    'add_to_cart': 'In den Warenkorb',
    'popular': 'Beliebt',
    'description': 'Beschreibung',
    'select_options': 'Optionen wählen',
    'required': 'Pflicht',
    'optional': 'Optional',
    
    // Item Modal
    'select_one': 'Wählen Sie eine Option',
    'select_multiple': 'Wählen Sie mehrere Optionen',
    'special_instructions': 'Besondere Anweisungen',
    'placeholder_notes': 'Besondere Wünsche? (z.B. extra scharf, keine Zwiebeln)',
    'quantity': 'Menge',
    'select_required': 'Bitte wählen Sie alle erforderlichen Optionen aus',
    
    // Cart
    'your_cart': 'Ihr Warenkorb',
    'empty_cart': 'Ihr Warenkorb ist leer',
    'subtotal': 'Zwischensumme',
    'total': 'Gesamt',
    'checkout': 'Zur Kasse',
    'clear_cart': 'Warenkorb leeren',
    'remove': 'Entfernen',
    
    // Checkout
    'delivery_address': 'Lieferadresse',
    'pickup': 'Abholung',
    'delivery': 'Lieferung',
    'payment_method': 'Zahlungsmethode',
    'cash': 'Barzahlung',
    'card': 'Karte',
    'place_order': 'Bestellung aufgeben',
    'order_notes': 'Anmerkungen zur Bestellung',
    
    // Order Status
    'order_confirmed': 'Bestellung bestätigt',
    'order_preparing': 'In Zubereitung',
    'order_ready': 'Bereit',
    'order_delivered': 'Geliefert',
    'order_cancelled': 'Storniert',
    'track_order': 'Bestellung verfolgen',
    
    // Forms
    'name': 'Name',
    'phone': 'Telefon',
    'email': 'E-Mail',
    'address': 'Adresse',
    'notes': 'Anmerkungen',
    'submit': 'Absenden',
    'cancel': 'Abbrechen',
    'save': 'Speichern',
    'back': 'Zurück',
    
    // Errors
    'error_generic': 'Ein Fehler ist aufgetreten',
    'error_network': 'Netzwerkfehler',
    'error_not_found': 'Nicht gefunden',
  },
  en: {
    // Header & Navigation
    'home': 'Home',
    'search': 'Search',
    'cart': 'Cart',
    'orders': 'Orders',
    'favorites': 'Favorites',
    'profile': 'Profile',
    'language': 'Language',
    
    // Hero Banner
    'hero_title': "Hungry? We've got you!",
    'hero_subtitle': 'Find the best local restaurants near you. Order delivery or pickup.',
    'use_my_location': 'Use my location',
    'locating': 'Locating...',
    'search_radius': 'Search Radius',
    'location_error': 'Unable to get your location. Please enable location services.',
    'geolocation_unsupported': 'Geolocation is not supported by your browser.',
    
    // Restaurant List
    'nearby_restaurants': 'Nearby Restaurants',
    'no_restaurants': 'No restaurants found',
    'places_found': 'places found',
    'expand_radius': 'Expand radius to 50km',
    'search_placeholder': 'Search restaurant or cuisine...',
    'km_away': 'km away',
    'min_order': 'Min. order',
    'delivery_fee': 'Delivery fee',
    'free': 'Free',
    'open': 'Open',
    'closed': 'Closed',
    
    // Categories
    'nearby': 'Nearby',
    'top_rated': 'Top Rated',
    'fast_delivery': 'Fast Delivery',
    'free_delivery': 'Free Delivery',
    
    // Menu
    'add_to_cart': 'Add to Cart',
    'popular': 'Popular',
    'description': 'Description',
    'select_options': 'Select Options',
    'required': 'Required',
    'optional': 'Optional',
    
    // Item Modal
    'select_one': 'Select one',
    'select_multiple': 'Select multiple',
    'special_instructions': 'Special Instructions',
    'placeholder_notes': 'Any special requests? (e.g., extra spicy, no onions)',
    'quantity': 'Quantity',
    'select_required': 'Please select all required options',
    
    // Cart
    'your_cart': 'Your Cart',
    'empty_cart': 'Your cart is empty',
    'subtotal': 'Subtotal',
    'total': 'Total',
    'checkout': 'Checkout',
    'clear_cart': 'Clear Cart',
    'remove': 'Remove',
    
    // Checkout
    'delivery_address': 'Delivery Address',
    'pickup': 'Pickup',
    'delivery': 'Delivery',
    'payment_method': 'Payment Method',
    'cash': 'Cash',
    'card': 'Card',
    'place_order': 'Place Order',
    'order_notes': 'Order Notes',
    
    // Order Status
    'order_confirmed': 'Order Confirmed',
    'order_preparing': 'Preparing',
    'order_ready': 'Ready',
    'order_delivered': 'Delivered',
    'order_cancelled': 'Cancelled',
    'track_order': 'Track Order',
    
    // Forms
    'name': 'Name',
    'phone': 'Phone',
    'email': 'Email',
    'address': 'Address',
    'notes': 'Notes',
    'submit': 'Submit',
    'cancel': 'Cancel',
    'save': 'Save',
    'back': 'Back',
    
    // Errors
    'error_generic': 'An error occurred',
    'error_network': 'Network error',
    'error_not_found': 'Not found',
  },
  tr: {
    // Header & Navigation
    'home': 'Ana Sayfa',
    'search': 'Ara',
    'cart': 'Sepet',
    'orders': 'Siparişler',
    'favorites': 'Favoriler',
    'profile': 'Profil',
    'language': 'Dil',
    
    // Hero Banner
    'hero_title': 'Acıktınız mı? Biz hallederiz!',
    'hero_subtitle': 'Yakınınızdaki en iyi yerel restoranları bulun. Teslimat veya gel-al siparişi verin.',
    'use_my_location': 'Konumumu Kullan',
    'locating': 'Konum bulunuyor...',
    'search_radius': 'Arama Yarıçapı',
    'location_error': 'Konumunuz alınamadı. Lütfen konum servislerini etkinleştirin.',
    'geolocation_unsupported': 'Tarayıcınız konum belirlemeyi desteklemiyor.',
    
    // Restaurant List
    'nearby_restaurants': 'Yakındaki Restoranlar',
    'no_restaurants': 'Restoran bulunamadı',
    'places_found': 'restoran bulundu',
    'expand_radius': 'Arama yarıçapını 50km yap',
    'search_placeholder': 'Restoran veya mutfak ara...',
    'km_away': 'km uzakta',
    'min_order': 'Min. sipariş',
    'delivery_fee': 'Teslimat ücreti',
    'free': 'Ücretsiz',
    'open': 'Açık',
    'closed': 'Kapalı',
    
    // Categories
    'nearby': 'Yakındakiler',
    'top_rated': 'En İyiler',
    'fast_delivery': 'Hızlı Teslimat',
    'free_delivery': 'Ücretsiz Teslimat',
    
    // Menu
    'add_to_cart': 'Sepete Ekle',
    'popular': 'Popüler',
    'description': 'Açıklama',
    'select_options': 'Seçenekleri Seç',
    'required': 'Zorunlu',
    'optional': 'İsteğe Bağlı',
    
    // Item Modal
    'select_one': 'Birini seçin',
    'select_multiple': 'Birden fazla seçin',
    'special_instructions': 'Özel Talimatlar',
    'placeholder_notes': 'Özel istekleriniz? (örn. ekstra acı, soğan yok)',
    'quantity': 'Adet',
    'select_required': 'Lütfen tüm zorunlu seçenekleri belirleyin',
    
    // Cart
    'your_cart': 'Sepetiniz',
    'empty_cart': 'Sepetiniz boş',
    'subtotal': 'Ara Toplam',
    'total': 'Toplam',
    'checkout': 'Ödeme',
    'clear_cart': 'Sepeti Temizle',
    'remove': 'Kaldır',
    
    // Checkout
    'delivery_address': 'Teslimat Adresi',
    'pickup': 'Gel Al',
    'delivery': 'Teslimat',
    'payment_method': 'Ödeme Yöntemi',
    'cash': 'Nakit',
    'card': 'Kart',
    'place_order': 'Sipariş Ver',
    'order_notes': 'Sipariş Notları',
    
    // Order Status
    'order_confirmed': 'Sipariş Onaylandı',
    'order_preparing': 'Hazırlanıyor',
    'order_ready': 'Hazır',
    'order_delivered': 'Teslim Edildi',
    'order_cancelled': 'İptal Edildi',
    'track_order': 'Siparişi Takip Et',
    
    // Forms
    'name': 'Ad',
    'phone': 'Telefon',
    'email': 'E-posta',
    'address': 'Adres',
    'notes': 'Notlar',
    'submit': 'Gönder',
    'cancel': 'İptal',
    'save': 'Kaydet',
    'back': 'Geri',
    
    // Errors
    'error_generic': 'Bir hata oluştu',
    'error_network': 'Ağ hatası',
    'error_not_found': 'Bulunamadı',
  },
};

// Helper function to get translation
export const t = (key: string, locale: SupportedLocale): string => {
  return translations[locale]?.[key] || translations['de'][key] || key;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'de',
      currency: 'EUR',
      currencySymbol: '€',
      isAutoDetected: false,

      setLocale: (locale) => 
        set({ locale, isAutoDetected: false }),
        
      setFromGeoIP: (data) => 
        set((state) => {
          // Only auto-set if user hasn't manually changed locale
          if (!state.isAutoDetected && state.locale === 'de') {
            const supportedLocales: SupportedLocale[] = ['de', 'en', 'tr'];
            const locale = supportedLocales.includes(data.locale as SupportedLocale) 
              ? (data.locale as SupportedLocale) 
              : 'de';
            return {
              locale,
              currency: data.currency,
              currencySymbol: data.currencySymbol,
              isAutoDetected: true,
            };
          }
          return state;
        }),

      t: (key: string) => {
        const locale = get().locale;
        return translations[locale]?.[key] || translations['de'][key] || key;
      },
    }),
    {
      name: 'donbot_user_locale',
    }
  )
);
