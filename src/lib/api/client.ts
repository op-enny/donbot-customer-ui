import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Request interceptor for logging and locale header
apiClient.interceptors.request.use(
  (config) => {
    // Add Accept-Language header based on user's locale preference
    const locale = getCurrentLocale();
    config.headers['Accept-Language'] = locale;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, `[${locale}]`);
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.status);
      console.error('Error Details:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request Data:', error.config?.data);
    }
    return Promise.reject(error);
  }
);
