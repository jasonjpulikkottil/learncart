'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ListingCard from '@/components/ListingCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import { CATEGORIES, CONDITIONS } from '@/lib/utils';
import { Filter, X, ChevronDown, ArrowRightLeft, Search } from 'lucide-react';

export default function ListingsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        q: searchParams.get('q') || '',
        category: searchParams.get('category') || '',
        condition: searchParams.get('condition') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        swappable: searchParams.get('swappable') === 'true',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    useEffect(() => {
        fetchListings();
    }, [searchParams]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (filters.q) params.set('q', filters.q);
            if (filters.category) params.set('category', filters.category);
            if (filters.condition) params.set('condition', filters.condition);
            if (filters.minPrice) params.set('minPrice', filters.minPrice);
            if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
            if (filters.swappable) params.set('swappable', 'true');
            params.set('sortBy', filters.sortBy);
            params.set('sortOrder', filters.sortOrder);
            params.set('page', searchParams.get('page') || '1');

            const res = await fetch(`/api/listings?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setListings(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();

        if (filters.q) params.set('q', filters.q);
        if (filters.category) params.set('category', filters.category);
        if (filters.condition) params.set('condition', filters.condition);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.swappable) params.set('swappable', 'true');
        if (filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
        if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);

        router.push(`/listings?${params.toString()}`);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            q: '',
            category: '',
            condition: '',
            minPrice: '',
            maxPrice: '',
            swappable: false,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
        router.push('/listings');
        setShowFilters(false);
    };

    const hasActiveFilters = filters.category || filters.condition || filters.minPrice || filters.maxPrice || filters.swappable;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {filters.q ? `Results for "${filters.q}"` : 'Browse Listings'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {pagination.total} {pagination.total === 1 ? 'item' : 'items'} found
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            value={`${filters.sortBy}-${filters.sortOrder}`}
                            onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('-');
                                setFilters({ ...filters, sortBy, sortOrder });
                                setTimeout(applyFilters, 0);
                            }}
                            className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                        >
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${hasActiveFilters
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && (
                            <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                                {[filters.category, filters.condition, filters.minPrice || filters.maxPrice, filters.swappable].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                            <select
                                value={filters.condition}
                                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                            >
                                <option value="">Any Condition</option>
                                {CONDITIONS.map((cond) => (
                                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Swappable Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Swap Option</label>
                            <button
                                onClick={() => setFilters({ ...filters, swappable: !filters.swappable })}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition ${filters.swappable
                                    ? 'bg-purple-50 border-purple-300 text-purple-600'
                                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                <ArrowRightLeft className="w-4 h-4" />
                                Swappable Only
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Listings Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <ListingCardSkeleton key={i} />
                    ))}
                </div>
            ) : listings.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set('page', String(i + 1));
                                        router.push(`/listings?${params.toString()}`);
                                    }}
                                    className={`w-10 h-10 rounded-lg font-medium transition ${pagination.page === i + 1
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-300'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <div className="flex justify-center mb-4">
                        <Search className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                    <button
                        onClick={clearFilters}
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}
