import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { requireAdmin } from '@/lib/admin-auth';

// PUT /api/admin/listings/[id] - Update listing
export async function PUT(request, { params }) {
    try {
        // Check admin authentication
        const adminCheck = await requireAdmin();
        if (adminCheck.error) {
            return NextResponse.json(
                { success: false, error: adminCheck.error },
                { status: adminCheck.status }
            );
        }

        await connectDB();

        const { id } = await params;
        const body = await request.json();

        // Fields that can be updated
        const allowedUpdates = {
            title: body.title,
            description: body.description,
            price: body.price,
            status: body.status,
        };

        // Remove undefined fields
        Object.keys(allowedUpdates).forEach(key =>
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        const listing = await Listing.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).populate('seller', 'name email');

        if (!listing) {
            return NextResponse.json(
                { success: false, error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: listing });
    } catch (error) {
        console.error('Error updating listing:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update listing' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/listings/[id] - Delete listing
export async function DELETE(request, { params }) {
    try {
        // Check admin authentication
        const adminCheck = await requireAdmin();
        if (adminCheck.error) {
            return NextResponse.json(
                { success: false, error: adminCheck.error },
                { status: adminCheck.status }
            );
        }

        await connectDB();

        const { id } = await params;

        const listing = await Listing.findByIdAndDelete(id);

        if (!listing) {
            return NextResponse.json(
                { success: false, error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting listing:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete listing' },
            { status: 500 }
        );
    }
}

// GET /api/admin/listings/[id] - Get listing with swap history
export async function GET(request, { params }) {
    try {
        // Check admin authentication
        const adminCheck = await requireAdmin();
        if (adminCheck.error) {
            return NextResponse.json(
                { success: false, error: adminCheck.error },
                { status: adminCheck.status }
            );
        }

        await connectDB();

        const { id } = await params;

        const listing = await Listing.findById(id)
            .populate('seller', 'name email')
            .populate('swapHistory.fromUser', 'name email')
            .populate('swapHistory.toUser', 'name email');

        if (!listing) {
            return NextResponse.json(
                { success: false, error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: listing });
    } catch (error) {
        console.error('Error fetching listing:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch listing' },
            { status: 500 }
        );
    }
}
