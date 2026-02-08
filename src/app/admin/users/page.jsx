'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Filter, CheckCircle, XCircle, Edit2, Trash2, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [verifiedFilter, setVerifiedFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

    // Modal states
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [search, verifiedFilter, pagination.page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: '20',
            });

            if (search) params.append('search', search);
            if (verifiedFilter) params.append('verified', verifiedFilter);

            const res = await fetch(`/api/admin/users?${params}`);
            const data = await res.json();

            if (data.success) {
                setUsers(data.data.users);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = async (userData) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await res.json();

            if (data.success) {
                await fetchUsers();
                setEditingUser(null);
                toast.success('User updated successfully!');
            } else {
                toast.error(data.error || 'Failed to update user');
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data.success) {
                await fetchUsers();
                setDeletingUser(null);
                toast.success('User deleted successfully!');
            } else {
                toast.error(data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600 mt-1">View and manage all registered users</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                        />
                    </div>

                    {/* Verified Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={verifiedFilter}
                            onChange={(e) => setVerifiedFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                        >
                            <option value="">All Users</option>
                            <option value="true">Verified Only</option>
                            <option value="false">Unverified Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No users found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">User</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Email</th>
                                        <th className="text-center py-3 px-4 text-gray-600 font-semibold">Status</th>
                                        <th className="text-center py-3 px-4 text-gray-600 font-semibold">Listings</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Joined</th>
                                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                {user.isAdmin && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                                        <Shield className="w-3 h-3 inline mr-1" />
                                                        Admin
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4 text-center">
                                                {user.emailVerified ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                                                        <XCircle className="w-4 h-4" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center font-semibold text-indigo-600">
                                                {user.listingsCount}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingUser(user)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Edit user"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingUser(user)}
                                                        disabled={session?.user?.id === user.id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={session?.user?.id === user.id ? "Can't delete yourself" : "Delete user"}
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
                                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total users)
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
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleEditUser}
                    loading={actionLoading}
                    currentUserId={session?.user?.id}
                />
            )}

            {/* Delete Modal */}
            {deletingUser && (
                <DeleteUserModal
                    user={deletingUser}
                    onClose={() => setDeletingUser(null)}
                    onConfirm={handleDeleteUser}
                    loading={actionLoading}
                />
            )}
        </div>
    );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSave, loading, currentUserId }) {
    const [formData, setFormData] = useState({
        name: user.name,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                            required
                        />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                    </div>

                    {/* Email Verified Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="emailVerified"
                            checked={formData.emailVerified}
                            onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="emailVerified" className="text-sm font-medium text-gray-700">
                            Email Verified
                        </label>
                    </div>

                    {/* Admin Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isAdmin"
                            checked={formData.isAdmin}
                            onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                            disabled={currentUserId === user.id}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">
                            Administrator
                            {currentUserId === user.id && (
                                <span className="text-xs text-gray-500 ml-2">(Can't change your own status)</span>
                            )}
                        </label>
                    </div>

                    {/* Actions */}
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

// Delete User Modal Component
function DeleteUserModal({ user, onClose, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{user.name}</strong> ({user.email})?
                    </p>
                    <p className="text-red-600 text-sm mt-2">
                        This action cannot be undone. All their listings will also be affected.
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
                        {loading ? 'Deleting...' : 'Delete User'}
                    </button>
                </div>
            </div>
        </div>
    );
}
