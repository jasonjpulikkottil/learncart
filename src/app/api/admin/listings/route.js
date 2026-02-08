import { NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin-auth';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';

export async function GET(request) {
    // Check admin authorization
    const authError = await protectAdminRoute();
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category');
        const status = searchParams.get('status');

        await connectDB();

        // Build query
        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        // Get total count and listings with seller info
        const [total, listings] = await Promise.all([
            Listing.countDocuments(query),
            Listing.find(query)
                .populate('seller', 'name email')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                listings: listings.map(listing => ({
                    id: listing._id,
                    title: listing.title,
                    description: listing.description,
                    price: listing.price,
                    category: listing.category,
                    condition: listing.condition,
                    status: listing.status,
                    views: listing.views || 0,
                    images: listing.images || [],
                    seller: {
                        id: listing.seller._id,
                        name: listing.seller.name,
                        email: listing.seller.email,
                    },
                    createdAt: listing.createdAt,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Admin listings error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch listings' },
            { status: 500 }
        );
    }
}
