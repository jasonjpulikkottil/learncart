import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';
import { requireAdmin } from '@/lib/admin-auth';

// PUT /api/admin/users/[id] - Update user
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

        // Prevent admin from modifying their own admin status
        if (id === adminCheck.session.user.id && body.isAdmin === false) {
            return NextResponse.json(
                { success: false, error: 'Cannot remove your own admin privileges' },
                { status: 403 }
            );
        }

        // Fields that can be updated
        const allowedUpdates = {
            name: body.name,
            emailVerified: body.emailVerified,
            isAdmin: body.isAdmin,
        };

        // Remove undefined fields
        Object.keys(allowedUpdates).forEach(key =>
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        const user = await User.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[id] - Delete user
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

        // Prevent admin from deleting themselves
        if (id === adminCheck.session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete your own account' },
                { status: 403 }
            );
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Delete user's listings
        await Listing.deleteMany({ seller: id });

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
