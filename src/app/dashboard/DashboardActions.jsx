'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardActions({ listingId }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setShowConfirm(false);
        setDeleting(true);
        try {
            const res = await fetch(`/api/listings/${listingId}`, {
                method: 'DELETE',
            });

            const data = await res.json(); // Added this line to parse the response

            if (data.success) {
                toast.success('Listing deleted successfully!');
                router.refresh();
            } else {
                toast.error('Failed to delete listing');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete listing');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={deleting}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Delete"
            >
                {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>

            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Listing?</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this listing? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
