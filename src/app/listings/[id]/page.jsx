import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPrice, formatDate, CATEGORIES, CONDITIONS } from '@/lib/utils';
import { ArrowLeft, Mail, ArrowRightLeft, Tag, Clock, User, Package, MessageCircle, BookOpen, Monitor, Sofa, Shirt } from 'lucide-react';
import ProBadge from '@/components/ProBadge';

async function getListing(id) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/listings/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching listing:', error);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) {
        return { title: 'Listing Not Found | LearnCart' };
    }

    return {
        title: `${listing.title} | LearnCart`,
        description: listing.description.substring(0, 160),
    };
}

export default async function ListingDetailPage({ params }) {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) {
        notFound();
    }

    const category = CATEGORIES.find((c) => c.value === listing.category);
    const condition = CONDITIONS.find((c) => c.value === listing.condition);

    const conditionColors = {
        'new': 'bg-green-100 text-green-800 border-green-200',
        'like-new': 'bg-blue-100 text-blue-800 border-blue-200',
        'good': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'fair': 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const categoryIcons = {
        textbooks: <BookOpen className="w-5 h-5" />,
        electronics: <Monitor className="w-5 h-5" />,
        furniture: <Sofa className="w-5 h-5" />,
        clothing: <Shirt className="w-5 h-5" />,
        other: <Package className="w-5 h-5" />,
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Back Link */}
            <Link
                href="/listings"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Listings
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Section */}
                <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                    {listing.imageUrl ? (
                        <Image
                            src={listing.imageUrl}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-9xl bg-gradient-to-br from-gray-50 to-gray-100">
                            {categoryIcons[listing.category] || categoryIcons['other']}
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {listing.isSwappable && (
                            <span className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-full shadow-lg">
                                <ArrowRightLeft className="w-4 h-4" />
                                Open to Swap
                            </span>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col">
                    {/* Category */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>{categoryIcons[listing.category]}</span>
                        <span className="capitalize">{listing.category}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        {listing.title}
                    </h1>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                            <Tag className="w-6 h-6 text-indigo-600" />
                            <span className="text-4xl font-bold text-indigo-600">
                                {formatPrice(listing.price)}
                            </span>
                        </div>
                        <span className={`px - 3 py - 1 text - sm font - medium rounded - full border ${conditionColors[listing.condition]} `}>
                            {condition?.label || listing.condition}
                        </span>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Listed {formatDate(listing.createdAt)}
                        </div>
                        {listing.sellerName && (
                            <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {listing.sellerName}
                                {listing.seller?.subscription?.plan === 'pro' && listing.seller?.subscription?.status === 'active' && (
                                    <ProBadge size="sm" />
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {listing.status === 'active' ? 'Available' : listing.status}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {listing.description}
                        </p>
                    </div>

                    {/* Swap Preferences */}
                    {listing.isSwappable && listing.swapPreferences && (
                        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-900 mb-2">
                                <ArrowRightLeft className="w-5 h-5" />
                                Swap Preferences
                            </h3>
                            <p className="text-purple-700">{listing.swapPreferences}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-auto pt-6 space-y-3">
                        {/* Contact Seller Heading */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Seller</h3>

                        {/* WhatsApp Button (if enabled) */}
                        {listing.sellerWhatsappEnabled && listing.sellerPhoneNumber && (
                            <a
                                href={`https://wa.me/91${listing.sellerPhoneNumber}?text=${encodeURIComponent(`Hi! I'm interested in your listing: ${listing.title}\nPrice: ₹${listing.price}\n\nFrom: LearnCart`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-200"
                            >
                                <MessageCircle className="w-5 h-5" />
                                WhatsApp Seller
                            </a >
                        )}

                        {/* Email Button */}
                        <a
                            href={`mailto:${listing.sellerEmail}?subject=Interested in: ${encodeURIComponent(listing.title)}&body=Hi,%0D%0A%0D%0AI'm interested in your listing "${encodeURIComponent(listing.title)}" on LearnCart.%0D%0A%0D%0APlease let me know if it's still available.%0D%0A%0D%0AThanks!`}
                            className={`flex items-center justify-center gap-2 w-full py-4 ${listing.sellerWhatsappEnabled && listing.sellerPhoneNumber
                                ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                } font-semibold rounded-xl transition-all transform hover:scale-[1.02]`}
                        >
                            <Mail className="w-5 h-5" />
                            Email Seller
                        </a>

                        <p className="text-center text-sm text-gray-500 mt-3">
                            {listing.sellerWhatsappEnabled && listing.sellerPhoneNumber
                                ? 'Choose your preferred contact method'
                                : 'Opens your email client to send a message'
                            }
                        </p>
                    </div >
                </div >
            </div >

            {/* Similar Listings Section - can be added later */}
        </div >
    );
}
