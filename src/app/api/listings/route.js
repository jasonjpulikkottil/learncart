import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Get all active listings
 *     description: Retrieve a list of all active listings with optional filtering by category and search term
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [textbooks, electronics, furniture, clothing, other]
 *         description: Filter listings by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title/description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, sold, swapped]
 *         description: 'Filter by listing status (default: active)'
 *     responses:
 *       200:
 *         description: List of listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Listing'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/listings - Get all listings with optional filters
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const query = {};

        // Text search
        const search = searchParams.get('q');
        if (search) {
            query.$text = { $search: search };
        }

        // Category filter
        const category = searchParams.get('category');
        if (category) {
            query.category = category;
        }

        // Condition filter
        const condition = searchParams.get('condition');
        if (condition) {
            query.condition = condition;
        }

        // Price range
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Swappable filter
        const swappable = searchParams.get('swappable');
        if (swappable === 'true') {
            query.isSwappable = true;
        }

        // Status filter (default to active)
        const status = searchParams.get('status');
        query.status = status || 'active';

        // Pagination
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const skip = (page - 1) * limit;

        // Sort
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        const [listings, total] = await Promise.all([
            Listing.find(query)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .populate('seller', 'name email image subscription')
                .lean(),
            Listing.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: listings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch listings' },
            { status: 500 }
        );
    }
}

// POST /api/listings - Create a new listing
export async function POST(request) {
    try {
        // Import auth function
        const { auth } = await import('@/lib/auth');

        // Check authentication
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'You must be logged in to create a listing' },
                { status: 401 }
            );
        }

        // Check email verification
        if (!session.user.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Please verify your email before creating listings',
                    code: 'EMAIL_NOT_VERIFIED'
                },
                { status: 403 }
            );
        }

        await dbConnect();

        // Check listing limit for free users
        const { canCreateListing } = await import('@/lib/subscription');
        const limitCheck = await canCreateListing(session.user.id);

        if (!limitCheck.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: `You've reached the maximum of ${limitCheck.limit} active listings. Upgrade to Pro for unlimited listings!`,
                    code: 'LISTING_LIMIT_REACHED',
                    upgradeRequired: true,
                    current: limitCheck.current,
                    limit: limitCheck.limit,
                },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Add seller information from session
        const listingData = {
            ...body,
            seller: session.user.id,
        };

        const listing = await Listing.create(listingData);

        return NextResponse.json(
            { success: true, data: listing },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating listing:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json(
                { success: false, error: errors.join(', ') },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create listing' },
            { status: 500 }
        );
    }
}
