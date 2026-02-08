'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Shield, BarChart } from 'lucide-react';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        // Redirect non-admin users
        if (!session?.user?.isAdmin) {
            router.push('/');
        }
    }, [session, status, router]);

    // Show loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not admin
    if (!session?.user?.isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold"><Shield className="w-6 h-6 inline mr-2" />Admin Dashboard</h1>
                            <p className="text-indigo-100 text-sm mt-1">LearnCart Management</p>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition backdrop-blur-sm"
                        >
                            ← Back to Site
                        </Link>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-6">
                    <div className="flex gap-8">
                        <Link
                            href="/admin/users"
                            className="py-4 px-2 border-b-2 border-transparent hover:border-indigo-300 text-gray-600 hover:text-gray-900 transition font-medium"
                        >
                            Users
                        </Link>
                        <Link
                            href="/admin/listings"
                            className="py-4 px-2 border-b-2 border-transparent hover:border-indigo-300 text-gray-600 hover:text-gray-900 transition font-medium"
                        >
                            Listings
                        </Link>
                        <Link
                            href="/admin/reports"
                            className="py-4 px-2 border-b-2 border-transparent hover:border-indigo-300 text-gray-600 hover:text-gray-900 transition font-medium"
                        >
                            <BarChart className="w-4 h-4 inline mr-1" /> Reports
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}
