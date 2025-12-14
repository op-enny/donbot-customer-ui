/**
 * Centralized input sanitization utilities
 * Uses DOMPurify for HTML/XSS sanitization
 */

import DOMPurify from 'dompurify';

/**
 * Configuration for DOMPurify
 * ALLOW_DATA_ATTR: false - prevents data-* attributes which can be used for XSS
 * ALLOW_UNKNOWN_PROTOCOLS: false - prevents javascript: and other dangerous protocols
 */
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [] as string[], // Strip all HTML tags for text inputs
  ALLOWED_ATTR: [] as string[],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

/**
 * Sanitize text input - removes all HTML and dangerous content
 * Use for: names, addresses, notes, comments
 */
export function sanitizeText(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';

  // First, decode HTML entities to catch encoded attacks
  const decoded = decodeHTMLEntities(input);

  // Use DOMPurify to strip all HTML
  const sanitized = DOMPurify.sanitize(decoded, DOMPURIFY_CONFIG);

  // Additional cleanup
  return sanitized
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Sanitize email - validates format and removes dangerous chars
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const cleaned = input
    .trim()
    .toLowerCase()
    .slice(0, 255);

  // Basic email validation
  const emailRegex = /^[^\s@<>()[\]\\,;:]+@[^\s@<>()[\]\\,;:]+\.[^\s@<>()[\]\\,;:]+$/;
  if (!emailRegex.test(cleaned)) {
    return '';
  }

  return cleaned;
}

/**
 * Sanitize phone number - keeps only valid phone characters
 */
export function sanitizePhone(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Keep only digits, +, spaces, and dashes
  return input
    .trim()
    .slice(0, 20)
    .replace(/[^\d+\s-]/g, '');
}

/**
 * Sanitize URL - validates and ensures safe protocol
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';

  try {
    const url = new URL(input.trim());
    // Only allow http and https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize special instructions / notes - allows newlines but strips HTML
 */
export function sanitizeNotes(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';

  // Preserve newlines by temporarily replacing them
  const preserved = input.replace(/\n/g, '{{NEWLINE}}');

  // Sanitize
  const sanitized = DOMPurify.sanitize(preserved, DOMPURIFY_CONFIG);

  // Restore newlines
  return sanitized
    .replace(/\{\{NEWLINE\}\}/g, '\n')
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control chars except newline/tab
}

/**
 * Sanitize for display - allows limited safe HTML for rich text
 * Use only for content that needs to display formatted text
 */
export function sanitizeForDisplay(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const displayConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'span'],
    ALLOWED_ATTR: [] as string[],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  };

  return DOMPurify.sanitize(input, displayConfig);
}

/**
 * Decode HTML entities to prevent double-encoding attacks
 */
function decodeHTMLEntities(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic entity decoding
    return input
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
      .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  // Client-side: use browser's built-in decoder
  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
}

/**
 * Escape HTML for safe display in text context
 * Use when you need to display user input as text (not HTML)
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => escapeMap[char]);
}

/**
 * Validate and sanitize order item options
 */
export function sanitizeOrderOptions(
  options: Record<string, string | string[]>
): Record<string, string | string[]> {
  const sanitized: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(options)) {
    const sanitizedKey = sanitizeText(key, 50);
    if (!sanitizedKey) continue;

    if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value
        .map((v) => sanitizeText(v, 100))
        .filter(Boolean);
    } else {
      sanitized[sanitizedKey] = sanitizeText(value, 100);
    }
  }

  return sanitized;
}
