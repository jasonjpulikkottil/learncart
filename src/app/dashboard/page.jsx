import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import User from '@/models/User';
import Link from 'next/link';
import { Plus, Package, DollarSign, ArrowRightLeft, Eye, Edit, BookOpen, Monitor, Sofa, Shirt } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import DashboardActions from './DashboardActions';
import UpgradePrompt from '@/components/UpgradePrompt';

export const metadata = {
    title: 'My Listings | LearnCart',
    description: 'Manage your listings on LearnCart',
};

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect('/login?callbackUrl=/dashboard');
    }

    // Get all listings (in production, you'd filter by userId)
    await connectDB();
    const listings = await Listing.find({})
        .sort({ createdAt: -1 })
        .lean();

    const parsedListings = JSON.parse(JSON.stringify(listings));

    // Get user's subscription status
    const user = await User.findById(session.user.id).select('subscription').lean();
    const isPro = user?.subscription?.plan === 'pro' && user?.subscription?.status === 'active';
    const maxListings = isPro ? Infinity : 5;

    // Calculate stats
    const stats = {
        active: parsedListings.filter(l => l.status === 'active').length,
        sold: parsedListings.filter(l => l.status === 'sold').length,
        swapped: parsedListings.filter(l => l.status === 'swapped').length,
        totalValue: parsedListings
            .filter(l => l.status === 'active')
            .reduce((sum, l) => sum + l.price, 0),
    };

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        sold: 'bg-blue-100 text-blue-800',
        swapped: 'bg-purple-100 text-purple-800',
    };

    const categoryIcons = {
        textbooks: <BookOpen className="w-5 h-5" />,
        electronics: <Monitor className="w-5 h-5" />,
        furniture: <Sofa className="w-5 h-5" />,
        clothing: <Shirt className="w-5 h-5" />,
        other: <Package className="w-5 h-5" />,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
                    <p className="text-gray-600 mt-1">Manage your items on LearnCart</p>
                </div>
                <Link
                    href="/listings/new"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    New Listing
                </Link>
            </div>

            {/* Upgrade Prompt */}
            <UpgradePrompt
                currentListings={stats.active}
                maxListings={maxListings}
                isPro={isPro}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                            <p className="text-sm text-gray-500">Active</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.sold}</p>
                            <p className="text-sm text-gray-500">Sold</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <ArrowRightLeft className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.swapped}</p>
                            <p className="text-sm text-gray-500">Swapped</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalValue)}</p>
                            <p className="text-sm text-gray-500">Active Value</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Table */}
            {parsedListings.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Listed</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {parsedListings.map((listing) => (
                                    <tr key={listing._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                                                    {listing.imageUrl ? (
                                                        <img
                                                            src={listing.imageUrl}
                                                            alt={listing.title}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        categoryIcons[listing.category] || categoryIcons['other']
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{listing.title}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{listing.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900">{formatPrice(listing.price)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${statusColors[listing.status]}`}>
                                                {listing.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(listing.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/listings/${listing._id}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/listings/${listing._id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <DashboardActions listingId={listing._id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <div className="flex justify-center mb-4">
                        <Package className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-600 mb-6">Start selling by creating your first listing</p>
                    <Link
                        href="/listings/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Create Listing
                    </Link>
                </div>
            )}
        </div>
    );
}
