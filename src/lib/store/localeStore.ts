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
    'use_my_location': 'Standort verwenden',
    'locating': 'Standort wird gesucht...',
    'location_selected': 'Standort',
    'search_radius': 'Suchradius',
    'search_cta': 'Suchen',
    'search_placeholder_hero': 'Restaurant oder Gericht suchen...',
    'location_error': 'Standort konnte nicht ermittelt werden. Bitte prüfen Sie die Standortberechtigung.',
    'geolocation_unsupported': 'Geolokalisierung wird von Ihrem Browser nicht unterstützt.',
    'address_not_found': 'Adresse nicht gefunden. Bitte präziser eingeben.',
    'location_permission_hint': 'Standortzugriff hilft, passende Restaurants schneller zu finden.',
    'address_hint': 'Zum Beispiel Stadtteil oder Straße angeben.',
    'manual_address_hint': 'Geben Sie Stadtteil oder Straße ein.',
    'apply': 'Anwenden',
    
    // Restaurant List
    'nearby_restaurants': 'Restaurants in der Nähe',
    'no_restaurants': 'Keine Restaurants gefunden',
    'places_found': 'Restaurants gefunden',
    'place_found': 'Restaurant gefunden',
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
    'hide': 'Ausblenden',
    
    // Errors
    'error_generic': 'Ein Fehler ist aufgetreten',
    'error_network': 'Netzwerkfehler',
    'error_not_found': 'Nicht gefunden',

    // Order Tracking
    'back_to_home': 'Zurück zur Startseite',
    'order_tracking': 'Bestellverfolgung',
    'tracking_unavailable': 'Nachverfolgung nicht verfügbar',
    'tracking_token_missing': 'Tracking-Token fehlt. Bitte verwenden Sie den Bestätigungslink aus der Bestellung.',
    'unable_to_load_order': 'Bestellstatus konnte nicht geladen werden. Bitte versuchen Sie es erneut oder kontaktieren Sie das Restaurant.',
    'order_id': 'Bestell-ID',
    'restaurant': 'Restaurant',
    'payment': 'Zahlung',
    'method': 'Methode',
    'status': 'Status',
    'fulfillment': 'Erfüllung',
    'estimated_ready_time': 'Geschätzte Fertigstellung',
    'back_to_restaurants': 'Zurück zu Restaurants',
    'view_order_history': 'Bestellverlauf ansehen',
    'order_items': 'Bestellte Artikel',
    'item': 'Artikel',
    'price': 'Preis',

    // Order Status Values
    'status_new': 'Neu',
    'status_confirmed': 'Bestätigt',
    'status_preparing': 'In Zubereitung',
    'status_ready': 'Bereit zur Abholung',
    'status_out_for_delivery': 'Wird ausgeliefert',
    'status_completed': 'Abgeschlossen',
    'status_cancelled': 'Storniert',

    // Payment Status
    'payment_status_unpaid': 'Unbezahlt',
    'payment_status_paid': 'Bezahlt',
    'payment_status_refunded': 'Erstattet',

    // Profile Page
    'guest_user': 'Gastbenutzer',
    'not_logged_in': 'Nicht angemeldet',
    'sign_in_register': 'Anmelden / Registrieren',
    'my_orders': 'Meine Bestellungen',
    'saved_addresses': 'Gespeicherte Adressen',
    'payment_methods': 'Zahlungsmethoden',
    'settings_privacy': 'Einstellungen & Datenschutz',
    'about': 'Über',
    'version': 'Version',
    'terms_of_service': 'Nutzungsbedingungen',
    'privacy_policy': 'Datenschutzerklärung',
    'contact_support': 'Support kontaktieren',
    'sign_out': 'Abmelden',

    // Legal / Checkout
    'order_info_title': 'Bestellhinweis',
    'no_cancellation_notice': 'Für zubereitete Speisen besteht gemäß BGB §312g Abs. 2 Nr. 9 kein Widerrufsrecht.',
    'no_cancel_after_confirm': 'Nach Bestätigung kann die Bestellung nicht mehr storniert werden.',
    'accept_terms': 'Ich akzeptiere die AGB und Datenschutzerklärung.',
    'place_order_binding': 'Zahlungspflichtig bestellen',
    'contact_info': 'Kontaktinformationen',
    'all': 'Alle',
    'search_results': 'Ergebnisse für',
    'no_results': 'Keine Ergebnisse gefunden',
    'clear': 'Löschen',
    'loading_cart': 'Warenkorb wird geladen...',
    'loading_checkout': 'Kasse wird geladen...',
    'from_restaurant': 'von',
    'note_label': 'Hinweis',
    'each_label': 'je',
    'order_failed': 'Bestellung fehlgeschlagen',
    'pay_with_cash': 'Barzahlung bei Lieferung',
    'pay_with_card': 'Kartenzahlung bei Lieferung',
    'online_payment': 'Online-Zahlung',
    'online_payment_coming_soon': 'Demnächst verfügbar - PayPal, Kreditkarte',
    'order_singular': 'Bestellung',
    'order_plural': 'Bestellungen',
    'in_last_7_days': 'in den letzten 7 Tagen',
    'no_orders': 'Noch keine Bestellungen',
    'start_ordering': 'Starte deine erste Bestellung',
    'browse_restaurants': 'Restaurants durchsuchen',
    'reorder': 'Nochmal bestellen',
    'minutes_ago': 'Min. vor',
    'hours_ago': 'Std. vor',
    'menu_not_available': 'Menü nicht verfügbar.',
    'menu_using_mock': 'Mock-Menü wird verwendet, bis die API verfügbar ist.',
    'menu_load_error': 'Menü konnte nicht geladen werden. Bitte später erneut versuchen.',
    'no_description': 'Keine Beschreibung verfügbar',
    'customize_order': 'Bestellung anpassen',
    'clear_cart_title': 'Warenkorb leeren?',
    'clear_cart_message': 'Dein Warenkorb enthält Artikel von {restaurant}. Möchtest du den Warenkorb leeren und Artikel von {newRestaurant} hinzufügen?',
    'clear_cart_confirm': 'Leeren & Hinzufügen',
    'clear_cart_keep': 'Warenkorb behalten',
    'error_name_required': 'Name ist erforderlich',
    'error_name_min': 'Name muss mindestens 2 Zeichen haben',
    'error_name_max': 'Name darf höchstens 100 Zeichen lang sein',
    'error_phone_required': 'Telefonnummer ist erforderlich',
    'error_phone_invalid': 'Bitte geben Sie eine gültige deutsche Telefonnummer ein (z.B. +49 171 1234567)',
    'error_email_invalid': 'Ungültige E-Mail-Adresse',
    'error_delivery_address_required': 'Lieferadresse ist erforderlich',
    'error_notes_max': 'Notizen dürfen höchstens 500 Zeichen lang sein',
    'restaurant_singular': 'Restaurant',
    'restaurant_plural': 'Restaurants',
    'saved': 'gespeichert',
    'no_favorites': 'Noch keine Favoriten',
    'save_favorites_hint': 'Speichern Sie Ihre Lieblingsrestaurants, um schneller zu bestellen',
    'restaurant_not_found_title': 'Restaurant nicht gefunden',
    'restaurant_not_found_body': 'Wir konnten dieses Restaurant nicht finden. Es wurde möglicherweise entfernt oder die URL ist falsch.',
    'page_not_found_title': 'Seite nicht gefunden',
    'page_not_found_body': 'Leider konnten wir die Seite nicht finden. Sie wurde möglicherweise verschoben oder existiert nicht.',
    'order_not_found_title': 'Bestellung nicht gefunden',
    'order_not_found_body': 'Wir konnten diese Bestellung nicht finden. Möglicherweise ist sie abgelaufen oder der Tracking-Link ist ungültig.',
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
    'locating': 'Finding location...',
    'location_selected': 'Location',
    'search_radius': 'Search Radius',
    'search_cta': 'Search',
    'search_placeholder_hero': 'Search restaurants or dishes...',
    'location_error': 'Unable to get your location. Please check your location permission.',
    'geolocation_unsupported': 'Geolocation is not supported by your browser.',
    'address_not_found': 'Address not found. Please be more specific.',
    'location_permission_hint': 'Location access helps us find nearby restaurants faster.',
    'address_hint': 'Try adding a neighborhood or street.',
    'manual_address_hint': 'Enter a neighborhood or street.',
    'apply': 'Apply',
    
    // Restaurant List
    'nearby_restaurants': 'Nearby Restaurants',
    'no_restaurants': 'No restaurants found',
    'places_found': 'places found',
    'place_found': 'place found',
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
    'hide': 'Hide',
    
    // Errors
    'error_generic': 'An error occurred',
    'error_network': 'Network error',
    'error_not_found': 'Not found',

    // Order Tracking
    'back_to_home': 'Back to home',
    'order_tracking': 'Order Tracking',
    'tracking_unavailable': 'Tracking unavailable',
    'tracking_token_missing': 'Tracking token is missing. Please use the confirmation link from checkout.',
    'unable_to_load_order': 'Unable to load order status. Please try again or contact the restaurant.',
    'order_id': 'Order ID',
    'restaurant': 'Restaurant',
    'payment': 'Payment',
    'method': 'Method',
    'status': 'Status',
    'fulfillment': 'Fulfillment',
    'estimated_ready_time': 'Estimated Ready Time',
    'back_to_restaurants': 'Back to restaurants',
    'view_order_history': 'View order history',
    'order_items': 'Order Items',
    'item': 'Item',
    'price': 'Price',

    // Order Status Values
    'status_new': 'New',
    'status_confirmed': 'Confirmed',
    'status_preparing': 'Preparing',
    'status_ready': 'Ready for Pickup',
    'status_out_for_delivery': 'Out for Delivery',
    'status_completed': 'Completed',
    'status_cancelled': 'Cancelled',

    // Payment Status
    'payment_status_unpaid': 'Unpaid',
    'payment_status_paid': 'Paid',
    'payment_status_refunded': 'Refunded',

    // Profile Page
    'guest_user': 'Guest User',
    'not_logged_in': 'Not logged in',
    'sign_in_register': 'Sign In / Register',
    'my_orders': 'My Orders',
    'saved_addresses': 'Saved Addresses',
    'payment_methods': 'Payment Methods',
    'settings_privacy': 'Settings & Privacy',
    'about': 'About',
    'version': 'Version',
    'terms_of_service': 'Terms of Service',
    'privacy_policy': 'Privacy Policy',
    'contact_support': 'Contact Support',
    'sign_out': 'Sign Out',

    // Legal / Checkout
    'order_info_title': 'Order Information',
    'no_cancellation_notice': 'For prepared food orders, there is no right of withdrawal according to BGB §312g Para. 2 No. 9.',
    'no_cancel_after_confirm': 'Your order cannot be cancelled after confirmation.',
    'accept_terms': 'I accept the Terms of Service and Privacy Policy.',
    'place_order_binding': 'Place Binding Order',
    'contact_info': 'Contact Information',
    'all': 'All',
    'search_results': 'results for',
    'no_results': 'No results found',
    'clear': 'Clear',
    'loading_cart': 'Loading cart...',
    'loading_checkout': 'Loading checkout...',
    'from_restaurant': 'from',
    'note_label': 'Note',
    'each_label': 'each',
    'order_failed': 'Order Failed',
    'pay_with_cash': 'Pay with cash when you receive your order',
    'pay_with_card': 'Pay with card when you receive your order',
    'online_payment': 'Online Payment',
    'online_payment_coming_soon': 'Coming soon - PayPal, Credit Card',
    'order_singular': 'order',
    'order_plural': 'orders',
    'in_last_7_days': 'in last 7 days',
    'no_orders': 'No orders yet',
    'start_ordering': 'Start ordering from your favorite restaurants',
    'browse_restaurants': 'Browse Restaurants',
    'reorder': 'Reorder',
    'minutes_ago': 'min ago',
    'hours_ago': 'hours ago',
    'menu_not_available': 'Menu not available.',
    'menu_using_mock': 'Using mock menu until the API is available.',
    'menu_load_error': 'Unable to load menu. Please try again later.',
    'no_description': 'No description available',
    'customize_order': 'Customize your order',
    'clear_cart_title': 'Clear your cart?',
    'clear_cart_message': 'Your cart contains items from {restaurant}. Would you like to clear your cart and add items from {newRestaurant}?',
    'clear_cart_confirm': 'Clear & Add',
    'clear_cart_keep': 'Keep Cart',
    'error_name_required': 'Name is required',
    'error_name_min': 'Name must be at least 2 characters',
    'error_name_max': 'Name must be less than 100 characters',
    'error_phone_required': 'Phone number is required',
    'error_phone_invalid': 'Please enter a valid German phone number (e.g., +49 171 1234567)',
    'error_email_invalid': 'Invalid email address',
    'error_delivery_address_required': 'Delivery address is required',
    'error_notes_max': 'Notes must be less than 500 characters',
    'restaurant_singular': 'restaurant',
    'restaurant_plural': 'restaurants',
    'saved': 'saved',
    'no_favorites': 'No favorites yet',
    'save_favorites_hint': 'Save your favorite restaurants to order faster',
    'restaurant_not_found_title': 'Restaurant Not Found',
    'restaurant_not_found_body': 'We couldn\'t find this restaurant. It may have been removed or the URL is incorrect.',
    'page_not_found_title': 'Page Not Found',
    'page_not_found_body': 'Sorry, we couldn\'t find the page you\'re looking for. It might have been moved or doesn\'t exist.',
    'order_not_found_title': 'Order Not Found',
    'order_not_found_body': 'We couldn\'t find this order. It may have expired or the tracking link is invalid.',
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
    'use_my_location': 'Konumumu kullan',
    'locating': 'Konum alınıyor...',
    'location_selected': 'Konum',
    'search_radius': 'Arama Yarıçapı',
    'search_cta': 'Ara',
    'search_placeholder_hero': 'Restoran veya yemek ara...',
    'location_error': 'Konumunuz alınamadı. Lütfen konum iznini kontrol edin.',
    'geolocation_unsupported': 'Tarayıcınız konum belirlemeyi desteklemiyor.',
    'address_not_found': 'Adres bulunamadı. Lütfen daha spesifik yazın.',
    'location_permission_hint': 'Konum izni, yakındaki restoranları daha hızlı bulmamıza yardımcı olur.',
    'address_hint': 'Mahalle veya cadde eklemeyi deneyin.',
    'manual_address_hint': 'Mahalle veya cadde yazın.',
    'apply': 'Uygula',
    
    // Restaurant List
    'nearby_restaurants': 'Yakındaki Restoranlar',
    'no_restaurants': 'Restoran bulunamadı',
    'places_found': 'restoran bulundu',
    'place_found': 'restoran bulundu',
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
    'hide': 'Gizle',
    
    // Errors
    'error_generic': 'Bir hata oluştu',
    'error_network': 'Ağ hatası',
    'error_not_found': 'Bulunamadı',

    // Order Tracking
    'back_to_home': 'Ana sayfaya dön',
    'order_tracking': 'Sipariş Takibi',
    'tracking_unavailable': 'Takip kullanılamıyor',
    'tracking_token_missing': 'Takip kodu eksik. Lütfen ödeme sonrası gönderilen onay linkini kullanın.',
    'unable_to_load_order': 'Sipariş durumu yüklenemedi. Lütfen tekrar deneyin veya restoranla iletişime geçin.',
    'order_id': 'Sipariş No',
    'restaurant': 'Restoran',
    'payment': 'Ödeme',
    'method': 'Yöntem',
    'status': 'Durum',
    'fulfillment': 'Teslim',
    'estimated_ready_time': 'Tahmini Hazır Olma',
    'back_to_restaurants': 'Restoranlara dön',
    'view_order_history': 'Sipariş geçmişini görüntüle',
    'order_items': 'Sipariş Ürünleri',
    'item': 'Ürün',
    'price': 'Fiyat',

    // Order Status Values
    'status_new': 'Yeni',
    'status_confirmed': 'Onaylandı',
    'status_preparing': 'Hazırlanıyor',
    'status_ready': 'Hazır',
    'status_out_for_delivery': 'Yolda',
    'status_completed': 'Tamamlandı',
    'status_cancelled': 'İptal Edildi',

    // Payment Status
    'payment_status_unpaid': 'Ödenmedi',
    'payment_status_paid': 'Ödendi',
    'payment_status_refunded': 'İade Edildi',

    // Profile Page
    'guest_user': 'Misafir Kullanıcı',
    'not_logged_in': 'Giriş yapılmadı',
    'sign_in_register': 'Giriş Yap / Kayıt Ol',
    'my_orders': 'Siparişlerim',
    'saved_addresses': 'Kayıtlı Adresler',
    'payment_methods': 'Ödeme Yöntemleri',
    'settings_privacy': 'Ayarlar & Gizlilik',
    'about': 'Hakkında',
    'version': 'Sürüm',
    'terms_of_service': 'Kullanım Koşulları',
    'privacy_policy': 'Gizlilik Politikası',
    'contact_support': 'Destek İletişim',
    'sign_out': 'Çıkış Yap',

    // Legal / Checkout
    'order_info_title': 'Sipariş Bilgilendirmesi',
    'no_cancellation_notice': 'Hazırlanmış yemek siparişleri için yasal düzenlemeler gereği cayma hakkı bulunmamaktadır.',
    'no_cancel_after_confirm': 'Siparişiniz onaylandıktan sonra iptal edilemez.',
    'accept_terms': 'Kullanım Koşulları ve Gizlilik Politikası\'nı kabul ediyorum.',
    'place_order_binding': 'Ödeme yükümlü sipariş ver',
    'contact_info': 'İletişim Bilgileri',
    'all': 'Tümü',
    'search_results': 'için sonuçlar',
    'no_results': 'Sonuç bulunamadı',
    'clear': 'Temizle',
    'loading_cart': 'Sepet yükleniyor...',
    'loading_checkout': 'Ödeme sayfası yükleniyor...',
    'from_restaurant': 'şuradan',
    'note_label': 'Not',
    'each_label': 'adet',
    'order_failed': 'Sipariş başarısız',
    'pay_with_cash': 'Teslimat sırasında nakit ödeme',
    'pay_with_card': 'Teslimat sırasında kartla ödeme',
    'online_payment': 'Online Ödeme',
    'online_payment_coming_soon': 'Yakında - PayPal, Kredi Kartı',
    'order_singular': 'sipariş',
    'order_plural': 'sipariş',
    'in_last_7_days': 'son 7 günde',
    'no_orders': 'Henüz sipariş yok',
    'start_ordering': 'Favori restoranlarından sipariş vermeye başla',
    'browse_restaurants': 'Restoranlara göz at',
    'reorder': 'Tekrar sipariş ver',
    'minutes_ago': 'dk önce',
    'hours_ago': 'saat önce',
    'menu_not_available': 'Menü mevcut değil.',
    'menu_using_mock': 'API hazır olana kadar örnek menü kullanılıyor.',
    'menu_load_error': 'Menü yüklenemedi. Lütfen daha sonra tekrar deneyin.',
    'no_description': 'Açıklama bulunmuyor',
    'customize_order': 'Siparişi özelleştir',
    'clear_cart_title': 'Sepet boşaltılsın mı?',
    'clear_cart_message': 'Sepetinizde {restaurant} ürünleri var. Sepeti boşaltıp {newRestaurant} ürünlerini eklemek ister misiniz?',
    'clear_cart_confirm': 'Boşalt ve Ekle',
    'clear_cart_keep': 'Sepeti Koru',
    'error_name_required': 'Ad gerekli',
    'error_name_min': 'Ad en az 2 karakter olmalı',
    'error_name_max': 'Ad en fazla 100 karakter olabilir',
    'error_phone_required': 'Telefon numarası gerekli',
    'error_phone_invalid': 'Lütfen geçerli bir Alman telefon numarası girin (örn. +49 171 1234567)',
    'error_email_invalid': 'Geçersiz e-posta adresi',
    'error_delivery_address_required': 'Teslimat adresi gerekli',
    'error_notes_max': 'Notlar en fazla 500 karakter olabilir',
    'restaurant_singular': 'restoran',
    'restaurant_plural': 'restoran',
    'saved': 'kaydedildi',
    'no_favorites': 'Henüz favori yok',
    'save_favorites_hint': 'Daha hızlı sipariş vermek için favori restoranlarını kaydet',
    'restaurant_not_found_title': 'Restoran bulunamadı',
    'restaurant_not_found_body': 'Bu restoran bulunamadı. Kaldırılmış olabilir veya URL hatalı.',
    'page_not_found_title': 'Sayfa bulunamadı',
    'page_not_found_body': 'Üzgünüz, aradığınız sayfayı bulamadık. Taşınmış olabilir veya mevcut değil.',
    'order_not_found_title': 'Sipariş bulunamadı',
    'order_not_found_body': 'Bu siparişi bulamadık. Süresi dolmuş olabilir veya takip bağlantısı geçersizdir.',
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
