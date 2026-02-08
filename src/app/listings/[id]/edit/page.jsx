'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORIES, CONDITIONS } from '@/lib/utils';
import { Upload, X, Loader2, ArrowRightLeft, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditListingPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: '',
        imageUrl: '',
        sellerEmail: '',
        sellerName: '',
        isSwappable: false,
        swapPreferences: '',
        status: 'active',
    });

    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchListing();
    }, [params.id]);

    const fetchListing = async () => {
        try {
            const res = await fetch(`/api/listings/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setFormData({
                    ...data.data,
                    price: data.data.price.toString(),
                });
                if (data.data.imageUrl) {
                    setPreviewImage(data.data.imageUrl);
                }
            } else {
                setError('Listing not found');
                toast.error('Listing not found');
            }
        } catch (err) {
            console.error('Error fetching listing:', err);
            setError('Failed to load listing');
            toast.error('Failed to load listing');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File too large. Maximum size is 5MB.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);

            const uploadData = new FormData();
            uploadData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            const data = await res.json();

            if (data.success) {
                setFormData({ ...formData, imageUrl: data.url });
                toast.success('Image uploaded!');
            } else {
                setError(data.error || 'Failed to upload image');
                setPreviewImage(formData.imageUrl);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image');
            setPreviewImage(formData.imageUrl);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, imageUrl: '' });
        setPreviewImage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/listings/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Listing updated successfully!');
                setTimeout(() => router.push(`/listings/${params.id}`), 1000);
            } else {
                setError(data.error || 'Failed to update listing');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        toast(
            (t) => (
                <div className="flex flex-col gap-3">
                    <p className="font-semibold">Delete this listing?</p>
                    <p className="text-sm text-gray-600">This action cannot be undone.</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                performDelete();
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                position: 'top-center',
            }
        );
    };

    const performDelete = async () => {

        toast.loading('Deleting listing...');

        setLoading(true);
        try {
            const res = await fetch(`/api/listings/${params.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data.success) {
                toast.dismiss();
                toast.success('Listing deleted successfully!');
                setTimeout(() => router.push('/dashboard'), 1000);
            } else {
                toast.dismiss();
                toast.error(data.error || 'Failed to delete listing');
                setError(data.error || 'Failed to delete listing');
            }
        } catch (err) {
            console.error('Delete error:', err);
            toast.dismiss();
            toast.error('Failed to delete listing');
            setError('Failed to delete listing');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error && !formData.title) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link href="/listings" className="text-indigo-600 hover:underline">
                        Back to Listings
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <Link
                href={`/listings/${params.id}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Listing
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
                <p className="mt-2 text-gray-600">Update the details below to modify your listing</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        {error}
                    </div>
                )}

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Photo
                    </label>

                    {previewImage || formData.imageUrl ? (
                        <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden bg-gray-100">
                            <Image
                                src={previewImage || formData.imageUrl}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click to upload an image</span>
                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        maxLength={2000}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.description.length}/2000 characters</p>
                </div>

                {/* Price, Category, Condition Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                            Price (₹) *
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        >
                            <option value="">Select...</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                            Condition *
                        </label>
                        <select
                            id="condition"
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        >
                            <option value="">Select...</option>
                            {CONDITIONS.map((cond) => (
                                <option key={cond.value} value={cond.value}>{cond.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                    >
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                        <option value="swapped">Swapped</option>
                    </select>
                </div>

                {/* Seller Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-2">
                            Your Name
                        </label>
                        <input
                            type="text"
                            id="sellerName"
                            name="sellerName"
                            value={formData.sellerName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="sellerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                            Your Email *
                        </label>
                        <input
                            type="email"
                            id="sellerEmail"
                            name="sellerEmail"
                            value={formData.sellerEmail}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        />
                    </div>
                </div>

                {/* Swap Section */}
                <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isSwappable"
                            checked={formData.isSwappable}
                            onChange={handleChange}
                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-gray-900">I&apos;m open to swapping this item</span>
                        </div>
                    </label>

                    {formData.isSwappable && (
                        <div className="mt-4">
                            <label htmlFor="swapPreferences" className="block text-sm font-medium text-gray-700 mb-2">
                                What would you swap for?
                            </label>
                            <textarea
                                id="swapPreferences"
                                name="swapPreferences"
                                value={formData.swapPreferences}
                                onChange={handleChange}
                                rows={2}
                                maxLength={500}
                                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition resize-none bg-white"
                            />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex-1 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Listing'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading || uploading}
                        className="sm:w-auto px-6 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Delete Listing
                    </button>
                </div>
            </form>
        </div>
    );
}
