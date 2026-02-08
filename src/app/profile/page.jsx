'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, User, Mail, Phone, Building, Save, Check, MessageCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        whatsappEnabled: false,
        showPhoneNumber: false,
        location: {
            city: '',
            area: '',
            pincode: '',
        },
    });

    // Fetch current profile data
    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();

            if (data.success) {
                setFormData({
                    name: data.data.name || '',
                    phoneNumber: data.data.phoneNumber || '',
                    whatsappEnabled: data.data.whatsappEnabled || false,
                    showPhoneNumber: data.data.showPhoneNumber || false,
                    location: {
                        city: data.data.location?.city || '',
                        area: data.data.location?.area || '',
                        pincode: data.data.location?.pincode || '',
                    },
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setFetching(false);
        }
    };

    // Redirect if not logged in
    if (status === 'unauthenticated') {
        router.push('/login?callbackUrl=/profile');
        return null;
    }

    if (status === 'loading' || fetching) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle nested location fields
        if (name.startsWith('location.')) {
            const locationField = name.split('.')[1];
            setFormData({
                ...formData,
                location: {
                    ...formData.location,
                    [locationField]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Profile updated successfully!');
                // Update session to reflect changes
                await update();
            } else {
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Update error:', err);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account and contact preferences</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                        ) : (
                            <User className="w-10 h-10 text-indigo-600" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{session?.user?.name}</h2>
                        <p className="text-gray-500">{session?.user?.email}</p>
                        {session?.user?.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600 mt-1">
                                <Check className="w-4 h-4" />
                                Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-amber-600 mt-1">
                                <Lock className="w-4 h-4" />
                                Unverified
                            </span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>

                    {/* Email (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={session?.user?.email || ''}
                                disabled
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Location</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Help buyers find you - show listings near you
                        </p>
                    </div>

                    {/* City */}
                    <div>
                        <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-2">
                            City
                        </label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="location.city"
                                name="location.city"
                                value={formData.location.city}
                                onChange={handleChange}
                                placeholder="e.g., Mumbai, Delhi, Bangalore"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>

                    {/* Area */}
                    <div>
                        <label htmlFor="location.area" className="block text-sm font-medium text-gray-700 mb-2">
                            Area/Neighborhood (Optional)
                        </label>
                        <input
                            type="text"
                            id="location.area"
                            name="location.area"
                            value={formData.location.area}
                            onChange={handleChange}
                            placeholder="e.g., Andheri, Connaught Place"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Pincode */}
                    <div>
                        <label htmlFor="location.pincode" className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode
                        </label>
                        <input
                            type="text"
                            id="location.pincode"
                            name="location.pincode"
                            value={formData.location.pincode}
                            onChange={handleChange}
                            placeholder="400001"
                            maxLength={6}
                            pattern="[1-9][0-9]{5}"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            6-digit Indian pincode (for location-based features)
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Contact Preferences</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Allow buyers to contact you via WhatsApp when viewing your listings
                        </p>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number (WhatsApp)
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="9876543210"
                                maxLength={10}
                                pattern="[6-9][0-9]{9}"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Enter 10-digit Indian mobile number (starts with 6-9)
                        </p>
                    </div>

                    {/* WhatsApp Toggle */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="whatsappEnabled"
                                checked={formData.whatsappEnabled}
                                onChange={handleChange}
                                disabled={!formData.phoneNumber}
                                className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-green-600" />
                                    <span className="font-medium text-gray-900">
                                        Enable WhatsApp Contact
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Buyers will see a WhatsApp button on your listings to message you directly
                                </p>
                                {!formData.phoneNumber && (
                                    <p className="text-sm text-amber-600 mt-1">
                                        Add your phone number first to enable this feature
                                    </p>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Show Phone Number Toggle */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="showPhoneNumber"
                                checked={formData.showPhoneNumber}
                                onChange={handleChange}
                                disabled={!formData.phoneNumber}
                                className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="flex-1">
                                <span className="font-medium text-gray-900">
                                    Show Phone Number on Listings
                                </span>
                                <p className="text-sm text-gray-600 mt-1">
                                    Display your phone number publicly on your listings (not recommended for privacy)
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <strong>Privacy Protected:</strong> Your phone number and WhatsApp contact will only be visible to interested buyers viewing your listings. Your information is never shared elsewhere on the platform.
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
