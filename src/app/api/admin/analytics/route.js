import { NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';

export async function GET(request) {
    // Check admin authorization
    const authError = await protectAdminRoute();
    if (authError) return authError;

    try {
        await connectDB();

        // Get date 7 days ago for recent stats
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Parallel queries for better performance
        const [
            totalUsers,
            totalListings,
            verifiedUsers,
            unverifiedUsers,
            activeListings,
            soldListings,
            recentUsers,
            recentListings,
        ] = await Promise.all([
            User.countDocuments(),
            Listing.countDocuments(),
            User.countDocuments({ emailVerified: true }),
            User.countDocuments({ emailVerified: false }),
            Listing.countDocuments({ status: 'available' }),
            Listing.countDocuments({ status: 'sold' }),
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            Listing.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        ]);

        // Get category breakdown
        const categoryStats = await Listing.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        // Get top sellers
        const topSellers = await Listing.aggregate([
            {
                $group: {
                    _id: '$seller',
                    listingsCount: { $sum: 1 },
                },
            },
            { $sort: { listingsCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'sellerInfo',
                },
            },
            { $unwind: '$sellerInfo' },
            {
                $project: {
                    name: '$sellerInfo.name',
                    email: '$sellerInfo.email',
                    listingsCount: 1,
                },
            },
        ]);

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalListings,
                    verifiedUsers,
                    unverifiedUsers,
                    activeListings,
                    soldListings,
                },
                recent: {
                    newUsers: recentUsers,
                    newListings: recentListings,
                },
                categories: categoryStats.map(cat => ({
                    name: cat._id || 'Uncategorized',
                    count: cat.count,
                })),
                topSellers: topSellers.map(seller => ({
                    id: seller._id,
                    name: seller.name,
                    email: seller.email,
                    listingsCount: seller.listingsCount,
                })),
            },
        });
    } catch (error) {
        console.error('Admin analytics error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
