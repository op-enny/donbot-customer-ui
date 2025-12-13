import Link from 'next/link';

export default function OrderNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
      <div className="text-8xl mb-6">📦</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        We couldn&apos;t find this order. It may have expired or the tracking link is invalid.
      </p>
      <div className="flex gap-4">
        <Link
          href="/orders"
          className="bg-[#D32F2F] hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg"
        >
          View Order History
        </Link>
        <Link
          href="/"
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
