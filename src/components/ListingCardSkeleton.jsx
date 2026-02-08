export default function ListingCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
            {/* Image Skeleton */}
            <div className="aspect-[4/3] bg-gray-200" />

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-5 bg-gray-200 rounded w-16" />
                </div>
            </div>
        </div>
    );
}
