import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// CSRF token management
let csrfToken: string | null = null;

/**
 * Fetch CSRF token from backend
 * Backend should expose GET /csrf-token endpoint that returns { token: string }
 */
async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
      withCredentials: true,
      timeout: 5000, // Short timeout for CSRF token fetch
    });
    return response.data?.token || null;
  } catch (error) {
    // Log in all environments for security monitoring
    // In production, this should be sent to a logging service
    console.warn('[Security] CSRF token fetch failed:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      // Note: Backend may not support CSRF yet - this is expected during development
    });
    return null;
  }
}

/**
 * Get cached CSRF token or fetch new one
 */
async function getCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  csrfToken = await fetchCsrfToken();
  return csrfToken;
}

/**
 * Clear cached CSRF token (call on 403/token expiry)
 */
export function clearCsrfToken(): void {
  csrfToken = null;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for CSRF
  timeout: 30000, // 30 second timeout to prevent hung connections
});

// Helper to get current locale from localStorage (for SSR-safe access)
const getCurrentLocale = (): string => {
  if (typeof window === 'undefined') return 'de';
  try {
    const stored = localStorage.getItem('donbot_user_locale');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.locale || 'de';
    }
  } catch {
    // Ignore parse errors
  }
  return 'de';
};

// Request interceptor for logging, locale header, and CSRF token
apiClient.interceptors.request.use(
  async (config) => {
    // Add Accept-Language header based on user's locale preference
    const locale = getCurrentLocale();
    config.headers['Accept-Language'] = locale;

    // Add CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
    const method = config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const token = await getCsrfToken();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', method, config.url, `[${locale}]`);
      if (config.data) {
        console.log('Request Data:', JSON.stringify(config.data, null, 2));
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and CSRF token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If CSRF token is invalid (403 Forbidden with CSRF error), refresh and retry once
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes('csrf') &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      clearCsrfToken();
      const newToken = await getCsrfToken();
      if (newToken) {
        originalRequest.headers['X-CSRF-Token'] = newToken;
        return apiClient(originalRequest);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.status || error.message || 'Network Error');
      console.error('Error Details:', error.response?.data || error.code);
      console.error('Request URL:', error.config?.url);
      console.error('Request Data:', error.config?.data);
    }
    return Promise.reject(error);
  }
);
