import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { calculateDistance } from '@/lib/pincode';

/**
 * @swagger
 * /api/listings/nearby:
 *   get:
 *     summary: Get listings near a specific location
 *     description: Find active listings within a specified distance from given coordinates using geospatial queries
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of user's location
 *         example: 28.6139
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of user's location
 *         example: 77.2090
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *           default: 10
 *         description: Maximum distance in kilometers
 *         example: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [textbooks, electronics, furniture, clothing, other]
 *         description: Filter by category (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Nearby listings retrieved successfully
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Listing'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                             description: Distance from user location in kilometers
 *                             example: 2.5
 *                 count:
 *                   type: integer
 *                 params:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *                     maxDistance:
 *                       type: number
 *                     category:
 *                       type: string
 *       400:
 *         description: Invalid coordinates provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        // Get query parameters
        const lat = parseFloat(searchParams.get('lat'));
        const lng = parseFloat(searchParams.get('lng'));
        const maxDistance = parseFloat(searchParams.get('maxDistance')) || 10; // km
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit')) || 20;

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
            return NextResponse.json(
                { success: false, error: 'Valid latitude and longitude required' },
                { status: 400 }
            );
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return NextResponse.json(
                { success: false, error: 'Invalid coordinates' },
                { status: 400 }
            );
        }

        // Build query
        const query = {
            status: 'active',
            'location.coordinates.coordinates': { $exists: true, $ne: [] },
        };

        if (category) {
            query.category = category;
        }

        // Use MongoDB geospatial query to find nearby listings
        const listings = await Listing.find(query)
            .where('location.coordinates')
            .near({
                center: {
                    type: 'Point',
                    coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
                },
                maxDistance: maxDistance * 1000, // Convert km to meters
            })
            .limit(limit)
            .populate('sellerId', 'name email phoneNumber whatsappEnabled')
            .lean();

        // Calculate exact distance and add to each listing
        const listingsWithDistance = listings.map(listing => {
            const distance = listing.location?.coordinates?.coordinates
                ? calculateDistance(
                    lat,
                    lng,
                    listing.location.coordinates.coordinates[1], // latitude
                    listing.location.coordinates.coordinates[0]  // longitude
                )
                : null;

            return {
                ...listing,
                distance, // in kilometers
            };
        });

        // Sort by distance (closest first)
        listingsWithDistance.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });

        return NextResponse.json({
            success: true,
            data: listingsWithDistance,
            count: listingsWithDistance.length,
            params: {
                lat,
                lng,
                maxDistance,
                category: category || 'all',
            },
        });
    } catch (error) {
        console.error('Error fetching nearby listings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch nearby listings' },
            { status: 500 }
        );
    }
}
