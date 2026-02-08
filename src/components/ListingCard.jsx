import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ArrowRightLeft, Tag, BookOpen, Monitor, Sofa, Shirt, Package, User } from 'lucide-react';
import ProBadge from './ProBadge';

export default function ListingCard({ listing }) {
    const conditionColors = {
        'new': 'bg-green-100 text-green-800',
        'like-new': 'bg-blue-100 text-blue-800',
        'good': 'bg-yellow-100 text-yellow-800',
        'fair': 'bg-orange-100 text-orange-800',
    };

    const categoryIcons = {
        textbooks: <BookOpen className="w-12 h-12 text-gray-400" />,
        electronics: <Monitor className="w-12 h-12 text-gray-400" />,
        furniture: <Sofa className="w-12 h-12 text-gray-400" />,
        clothing: <Shirt className="w-12 h-12 text-gray-400" />,
        other: <Package className="w-12 h-12 text-gray-400" />,
    };

    return (
        <Link href={`/listings/${listing._id}`}>
            <article className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {listing.imageUrl ? (
                        <Image
                            src={listing.imageUrl}
                            alt={listing.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            {categoryIcons[listing.category] || categoryIcons['other']}
                        </div>
                    )}

                    {/* Swap Badge */}
                    {listing.isSwappable && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                            <ArrowRightLeft className="w-3 h-3" />
                            Swap
                        </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full text-gray-700 capitalize">
                        {listing.category}
                    </div>

                    {/* Pro Seller Badge */}
                    {listing.seller?.subscription?.plan === 'pro' && listing.seller?.subscription?.status === 'active' && (
                        <div className="absolute bottom-3 left-3">
                            <ProBadge size="sm" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {listing.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {listing.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-3 flex items-center justify-between">
                        {/* Price */}
                        <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4 text-indigo-600" />
                            <span className="font-bold text-lg text-indigo-600">
                                {formatPrice(listing.price)}
                            </span>
                        </div>

                        {/* Condition */}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${conditionColors[listing.condition]}`}>
                            {listing.condition}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
