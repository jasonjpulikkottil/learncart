import { NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/admin-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
    // Check admin authorization
    const authError = await protectAdminRoute();
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const verified = searchParams.get('verified'); // 'true', 'false', or null

        await connectDB();

        // Build query
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (verified !== null && verified !== '') {
            query.emailVerified = verified === 'true';
        }

        // Get total count and users
        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .select('-password -verificationOTP -otpExpires')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    isAdmin: user.isAdmin,
                    listingsCount: user.listingsCount || 0,
                    soldCount: user.soldCount || 0,
                    createdAt: user.createdAt,
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
        console.error('Admin users error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
