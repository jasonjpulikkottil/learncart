'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CONDITIONS } from '@/lib/utils';
import { Upload, X, Loader2, ArrowRightLeft, Check } from 'lucide-react';
import Image from 'next/image';

export default function NewListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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
        location: {
            city: '',
            area: '',
            pincode: '',
        },
    });

    const [previewImage, setPreviewImage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            location: {
                ...formData.location,
                [name]: value,
            },
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
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
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to server
            const uploadData = new FormData();
            uploadData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            const data = await res.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, imageUrl: data.url }));
            } else {
                setError(data.error || 'Failed to upload image');
                setPreviewImage('');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image');
            setPreviewImage('');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        setPreviewImage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/listings/${data.data._id}`);
                }, 1500);
            } else {
                setError(data.error || 'Failed to create listing');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Created!</h2>
                    <p className="text-gray-600">Redirecting to your listing...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sell an Item</h1>
                <p className="mt-2 text-gray-600">Fill out the details below to list your item on LearnCart</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
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
                        placeholder="e.g., Introduction to Psychology Textbook"
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
                        placeholder="Describe your item in detail. Include condition, features, and any defects."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.description.length}/2000 characters</p>
                </div>

                {/* Price, Category, Condition Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Price */}
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
                            placeholder="500"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Category */}
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

                    {/* Condition */}
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

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.location.city}
                            onChange={handleLocationChange}
                            required
                            placeholder="e.g., Mumbai"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                            Area/Locality
                        </label>
                        <input
                            type="text"
                            id="area"
                            name="area"
                            value={formData.location.area}
                            onChange={handleLocationChange}
                            placeholder="e.g., Andheri West"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode
                        </label>
                        <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            value={formData.location.pincode}
                            onChange={handleLocationChange}
                            placeholder="e.g., 400053"
                            pattern="[1-9][0-9]{5}"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        />
                        <p className="text-xs text-gray-400 mt-1">6-digit Indian pincode</p>
                    </div>
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
                            placeholder="John Doe"
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
                            placeholder="john@university.edu"
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
                                placeholder="e.g., Looking for data structures textbook or similar electronics"
                                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition resize-none bg-white"
                            />
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Listing...
                            </>
                        ) : (
                            'Create Listing'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
