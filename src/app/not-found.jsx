import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <Search className="w-24 h-24 text-gray-400" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Sorry, we couldn&apos;t find what you&apos;re looking for.
                    The page might have been moved or deleted.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                    <Link
                        href="/listings"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:border-indigo-300 hover:text-indigo-600 transition"
                    >
                        <Search className="w-5 h-5" />
                        Browse Listings
                    </Link>
                </div>
            </div>
        </div>
    );
}
