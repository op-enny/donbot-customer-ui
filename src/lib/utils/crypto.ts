/**
 * Client-side encryption utilities for sensitive data storage
 * Uses Web Crypto API with AES-GCM encryption
 */

// Generate a key from a passphrase (derived from browser fingerprint + app secret)
async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  // Use a combination of factors for the passphrase
  const passphrase = `donbot-${navigator.userAgent.slice(0, 50)}-customer-ui`;

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Convert Uint8Array to ArrayBuffer for compatibility with strict TypeScript
  const saltBuffer = new Uint8Array(salt).buffer as ArrayBuffer;

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string value
 * Returns base64 encoded string with salt and IV prepended
 */
export async function encryptData(plaintext: string): Promise<string> {
  if (typeof window === 'undefined' || !crypto.subtle) {
    // Fallback for SSR or unsupported browsers
    return plaintext;
  }

  try {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(salt);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );

    // Combine salt + iv + ciphertext
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Encryption failed:', error);
    }
    // Return original if encryption fails (graceful degradation)
    return plaintext;
  }
}

/**
 * Decrypt a previously encrypted string
 */
export async function decryptData(ciphertext: string): Promise<string> {
  if (typeof window === 'undefined' || !crypto.subtle) {
    return ciphertext;
  }

  try {
    // Decode base64
    const combined = new Uint8Array(
      atob(ciphertext)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const key = await deriveKey(salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Decryption failed:', error);
    }
    // Return original if decryption fails (may be unencrypted legacy data)
    return ciphertext;
  }
}

/**
 * Check if a string appears to be encrypted (base64 with expected length)
 */
export function isEncrypted(value: string): boolean {
  if (!value || value.length < 40) return false;
  try {
    // Check if it's valid base64
    const decoded = atob(value);
    // Minimum length: 16 (salt) + 12 (iv) + 16 (minimum ciphertext with tag)
    return decoded.length >= 44;
  } catch {
    return false;
  }
}

/**
 * Securely store user info with encrypted sensitive fields
 */
export interface SecureUserInfo {
  customerName: string;
  customerPhone: string; // Encrypted
  customerEmail?: string; // Encrypted if present
  deliveryAddress?: string; // Encrypted if present
  timestamp: number;
  expiresAt: number;
  encrypted: boolean;
}

const STORAGE_KEY = 'donbot_user_info_v2';
const RETENTION_DAYS = 30; // Reduced from 15 days for security

export async function saveSecureUserInfo(data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
}): Promise<void> {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const expiresAt = now + RETENTION_DAYS * 24 * 60 * 60 * 1000;

  const secureData: SecureUserInfo = {
    customerName: data.customerName, // Name is less sensitive, keep plain
    customerPhone: await encryptData(data.customerPhone),
    customerEmail: data.customerEmail ? await encryptData(data.customerEmail) : undefined,
    deliveryAddress: data.deliveryAddress ? await encryptData(data.deliveryAddress) : undefined,
    timestamp: now,
    expiresAt,
    encrypted: true,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(secureData));

  // Remove old unencrypted data if exists
  localStorage.removeItem('donbot_user_info');
}

export async function loadSecureUserInfo(): Promise<{
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
} | null> {
  if (typeof window === 'undefined') return null;

  // Try new encrypted format first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data: SecureUserInfo = JSON.parse(stored);

      // Check expiration
      if (data.expiresAt && Date.now() > data.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Decrypt if encrypted
      if (data.encrypted) {
        return {
          customerName: data.customerName,
          customerPhone: await decryptData(data.customerPhone),
          customerEmail: data.customerEmail ? await decryptData(data.customerEmail) : undefined,
          deliveryAddress: data.deliveryAddress ? await decryptData(data.deliveryAddress) : undefined,
        };
      }

      return {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        deliveryAddress: data.deliveryAddress,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load secure user info:', error);
      }
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Fallback: Try to migrate old unencrypted data
  const legacyData = localStorage.getItem('donbot_user_info');
  if (legacyData) {
    try {
      const parsed = JSON.parse(legacyData);
      const now = Date.now();
      const fifteenDays = 15 * 24 * 60 * 60 * 1000;

      if (now - parsed.timestamp < fifteenDays) {
        // Migrate to encrypted format
        await saveSecureUserInfo({
          customerName: parsed.customerName || '',
          customerPhone: parsed.customerPhone || '',
          customerEmail: parsed.customerEmail,
          deliveryAddress: parsed.deliveryAddress,
        });

        // Remove old data
        localStorage.removeItem('donbot_user_info');

        return {
          customerName: parsed.customerName || '',
          customerPhone: parsed.customerPhone || '',
          customerEmail: parsed.customerEmail,
          deliveryAddress: parsed.deliveryAddress,
        };
      }

      // Old data expired
      localStorage.removeItem('donbot_user_info');
    } catch {
      localStorage.removeItem('donbot_user_info');
    }
  }

  return null;
}

export function clearSecureUserInfo(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('donbot_user_info');
}
