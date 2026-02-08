'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Search, Menu, X, ShoppingBag, Plus, Home, User, LogOut, LayoutDashboard, AlertTriangle, Shield } from 'lucide-react';

export default function Header() {
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition">
                        <ShoppingBag className="w-7 h-7" />
                        <span className="hidden sm:inline">LearnCart</span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search textbooks, electronics..."
                                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                            />
                        </div>
                    </form>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-indigo-600 transition"
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </Link>
                        <Link
                            href="/listings"
                            className="px-3 py-2 text-gray-600 hover:text-indigo-600 transition"
                        >
                            Browse
                        </Link>

                        {status === 'loading' ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                        ) : session ? (
                            <>
                                <Link
                                    href="/listings/new"
                                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Sell Item
                                </Link>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition"
                                    >
                                        {session.user?.image ? (
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-indigo-600" />
                                            </div>
                                        )}
                                    </button>

                                    {isUserMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="font-medium text-gray-900 truncate">{session.user?.name}</p>
                                                    <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
                                                    {!session.user?.emailVerified && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                                            Unverified
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Verify Email - Show only if not verified */}
                                                {!session.user?.emailVerified && (
                                                    <>
                                                        <Link
                                                            href="/verify-email"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                            className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 transition font-medium"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Verify Email
                                                        </Link>
                                                        <hr className="my-2" />
                                                    </>
                                                )}

                                                {/* Admin Dashboard - Show only for admins */}
                                                {session.user?.isAdmin && (
                                                    <>
                                                        <Link
                                                            href="/admin/users"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 transition font-medium"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Admin Dashboard
                                                        </Link>
                                                        <hr className="my-2" />
                                                    </>
                                                )}

                                                {/* Upgrade to Pro - Show only if not Pro and not Admin */}
                                                {(session.user?.subscription?.plan !== 'pro' || session.user?.subscription?.status !== 'active') && !session.user?.isAdmin && (
                                                    <>
                                                        <Link
                                                            href="/pricing"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 transition font-medium"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            Upgrade to Pro
                                                        </Link>
                                                        <hr className="my-2" />
                                                    </>
                                                )}

                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    My Listings
                                                </Link>
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Profile
                                                </Link>
                                                <hr className="my-2" />
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-gray-600 hover:text-indigo-600 transition font-medium"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition font-medium"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-indigo-600"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search items..."
                                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </form>
                        <nav className="flex flex-col gap-2">
                            <Link
                                href="/"
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/listings"
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Browse All
                            </Link>

                            {session ? (
                                <>
                                    {/* Verify Email - Mobile */}
                                    {!session.user?.emailVerified && (
                                        <Link
                                            href="/verify-email"
                                            className="px-4 py-2 text-amber-600 bg-amber-50 rounded-lg font-medium"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <AlertTriangle className="w-4 h-4 inline mr-1" /> Verify Email
                                        </Link>
                                    )}

                                    {/* Admin Dashboard - Mobile */}
                                    {session.user?.isAdmin && (
                                        <Link
                                            href="/admin/users"
                                            className="px-4 py-2 text-purple-600 bg-purple-50 rounded-lg font-medium"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Shield className="w-4 h-4 inline mr-1" /> Admin Dashboard
                                        </Link>
                                    )}

                                    {/* Upgrade to Pro - Mobile */}
                                    {(session.user?.subscription?.plan !== 'pro' || session.user?.subscription?.status !== 'active') && !session.user?.isAdmin && (
                                        <Link
                                            href="/pricing"
                                            className="px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <AlertTriangle className="w-4 h-4 inline mr-1" /> Upgrade to Pro
                                        </Link>
                                    )}

                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Listings
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/listings/new"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sell Item
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setIsMenuOpen(false);
                                        }}
                                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-left"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
