'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only log errors in development to avoid exposing sensitive information
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <div className="bg-gray-100 p-4 rounded-lg mb-6 max-w-lg overflow-auto text-left">
        <p className="font-mono text-sm text-red-800">
          {process.env.NODE_ENV === 'development'
            ? error.message
            : 'An unexpected error occurred. Please try again.'}
        </p>
        {/* Only show stack trace in development mode to prevent sensitive info leakage */}
        {process.env.NODE_ENV === 'development' && error.stack && (
          <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
            {error.stack}
          </pre>
        )}
      </div>
      <button
        onClick={() => reset()}
        className="bg-[#D32F2F] text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
