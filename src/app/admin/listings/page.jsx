'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Edit2, Trash2, X, History, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminListingsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

    // Modal states
    const [editingListing, setEditingListing] = useState(null);
    const [deletingListing, setDeletingListing] = useState(null);
    const [viewingHistory, setViewingHistory] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchListings();
    }, [search, categoryFilter, statusFilter, pagination.page]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: '20',
            });

            if (search) params.append('search', search);
            if (categoryFilter) params.append('category', categoryFilter);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/admin/listings?${params}`);
            const data = await res.json();

            if (data.success) {
                setListings(data.data.listings);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            toast.error('Failed to fetch listings');
        } finally {
            setLoading(false);
        }
    };

    const handleEditListing = async (listingData) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/listings/${editingListing.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(listingData),
            });

            const data = await res.json();

            if (data.success) {
                await fetchListings();
                setEditingListing(null);
                toast.success('Listing updated successfully!');
            } else {
                toast.error(data.error || 'Failed to update listing');
            }
        } catch (error) {
            console.error('Failed to update listing:', error);
            toast.error('Failed to update listing');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteListing = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/listings/${deletingListing.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data.success) {
                await fetchListings();
                setDeletingListing(null);
                toast.success('Listing deleted successfully!');
            } else {
                toast.error(data.error || 'Failed to delete listing');
            }
        } catch (error) {
            console.error('Failed to delete listing:', error);
            toast.error('Failed to delete listing');
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewHistory = async (listing) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/listings/${listing.id}`);
            const data = await res.json();

            if (data.success) {
                setViewingHistory(data.data);
            } else {
                toast.error('Failed to load swap history');
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            toast.error('Failed to load swap history');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Listing Management</h2>
                <p className="text-gray-600 mt-1">Manage all product listings and swap history</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                        >
                            <option value="">All Categories</option>
                            <option value="textbooks">Textbooks</option>
                            <option value="electronics">Electronics</option>
                            <option value="furniture">Furniture</option>
                            <option value="clothing">Clothing</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="swapped">Swapped</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Listings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No listings found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Listing</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Seller</th>
                                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">Price</th>
                                        <th className="text-center py-3 px-4 text-gray-600 font-semibold">Status</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Posted</th>
                                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.map((listing) => (
                                        <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-start gap-3">
                                                    {listing.imageUrl && (
                                                        <img
                                                            src={listing.imageUrl}
                                                            alt={listing.title}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{listing.title}</div>
                                                        <div className="text-sm text-gray-500 capitalize">{listing.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-gray-900">{listing.seller?.name || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{listing.seller?.email}</div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-green-600">
                                                ${listing.price}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${listing.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    listing.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {listing.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 text-sm">
                                                {new Date(listing.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewHistory(listing)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                        title="View swap history"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingListing(listing)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Edit listing"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingListing(listing)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete listing"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total listings)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                        disabled={pagination.page === 1}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                        disabled={pagination.page === pagination.pages}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Modal */}
            {editingListing && (
                <EditListingModal
                    listing={editingListing}
                    onClose={() => setEditingListing(null)}
                    onSave={handleEditListing}
                    loading={actionLoading}
                />
            )}

            {/* Delete Modal */}
            {deletingListing && (
                <DeleteListingModal
                    listing={deletingListing}
                    onClose={() => setDeletingListing(null)}
                    onConfirm={handleDeleteListing}
                    loading={actionLoading}
                />
            )}

            {/* Swap History Modal */}
            {viewingHistory && (
                <SwapHistoryModal
                    listing={viewingHistory}
                    onClose={() => setViewingHistory(null)}
                />
            )}
        </div>
    );
}

// Edit Listing Modal
function EditListingModal({ listing, onClose, onSave, loading }) {
    const [formData, setFormData] = useState({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        status: listing.status,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Edit Listing</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
                            rows="3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
                        >
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="swapped">Swapped</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Delete Listing Modal
function DeleteListingModal({ listing, onClose, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Delete Listing</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{listing.title}</strong>?
                    </p>
                    <p className="text-red-600 text-sm mt-2">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : 'Delete Listing'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Swap History Modal
function SwapHistoryModal({ listing, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Swap History: {listing.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {listing.swapHistory && listing.swapHistory.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {listing.swapHistory.map((swap, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700">
                                        Swap #{listing.swapHistory.length - index}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(swap.swapDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">From:</span>
                                        <div className="font-medium">{swap.fromUser?.name || 'Unknown'}</div>
                                        <div className="text-gray-500 text-xs">{swap.fromUser?.email}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">To:</span>
                                        <div className="font-medium">{swap.toUser?.name || 'Unknown'}</div>
                                        <div className="text-gray-500 text-xs">{swap.toUser?.email}</div>
                                    </div>
                                </div>
                                {swap.notes && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <span className="font-medium">Notes:</span> {swap.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No swap history for this listing</p>
                        <p className="text-sm text-gray-500 mt-1">Swaps will appear here when they occur</p>
                    </div>
                )}

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
