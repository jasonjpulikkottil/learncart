import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';

// GET /api/listings/[id] - Get a single listing
export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const listing = await Listing.findById(id)
            .populate('seller', 'name email phoneNumber whatsappEnabled showPhoneNumber subscription')
            .lean();

        if (!listing) {
            return NextResponse.json(
                { success: false, error: 'Listing not found' },
                { status: 404 }
            );
        }

        // Add seller info to listing object for easier access
        if (listing.seller) {
            listing.sellerName = listing.seller.name;
            listing.sellerEmail = listing.seller.email;
            listing.sellerPhoneNumber = listing.seller.whatsappEnabled ? listing.seller.phoneNumber : null;
            listing.sellerWhatsappEnabled = listing.seller.whatsappEnabled || false;
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

// PUT /api/listings/[id] - Update a listing
export async function PUT(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        const listing = await Listing.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        ).lean();

        if (!listing) {
            return NextResponse.json(
                { success: false, error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: listing });
    } catch (error) {
        console.error('Error updating listing:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json(
                { success: false, error: errors.join(', ') },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to update listing' },
            { status: 500 }
        );
    }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const listing = await Listing.findByIdAndDelete(id);

        if (!listing) {
            return NextResponse.json(
                { success: false, error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Listing deleted' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete listing' },
            { status: 500 }
        );
    }
}
