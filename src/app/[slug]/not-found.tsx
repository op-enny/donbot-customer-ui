import Link from 'next/link';

export default function RestaurantNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
      <div className="text-8xl mb-6">🏪</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        We couldn&apos;t find this restaurant. It may have been removed or the URL is incorrect.
      </p>
      <Link
        href="/"
        className="bg-[#D32F2F] hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
      >
        Browse Restaurants
      </Link>
    </div>
  );
}
