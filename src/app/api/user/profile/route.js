import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getPincodeCoordinates, isValidPincodeFormat } from '@/lib/pincode';

// GET /api/user/profile - Get current user profile
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await connectDB();

        const user = await User.findById(session.user.id).select('-password -verificationOTP -otpExpires');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const { name, phoneNumber, whatsappEnabled, showPhoneNumber, location } = body;

        // Validate phone number format if provided
        if (phoneNumber) {
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(phoneNumber)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid phone number. Must be 10 digits starting with 6-9' },
                    { status: 400 }
                );
            }
        }

        // WhatsApp can only be enabled if phone number is provided
        if (whatsappEnabled && !phoneNumber) {
            return NextResponse.json(
                { success: false, error: 'Phone number required to enable WhatsApp contact' },
                { status: 400 }
            );
        }

        // Validate and geocode location if provided
        let locationData = null;
        if (location) {
            // Validate pincode if provided
            if (location.pincode) {
                if (!isValidPincodeFormat(location.pincode)) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid pincode format. Must be 6 digits' },
                        { status: 400 }
                    );
                }

                // Get coordinates from pincode
                const geocoded = getPincodeCoordinates(location.pincode);
                if (geocoded) {
                    locationData = {
                        city: location.city || geocoded.city,
                        area: location.area || '',
                        state: geocoded.state,
                        pincode: location.pincode,
                        coordinates: {
                            type: 'Point',
                            coordinates: geocoded.coordinates, // [lng, lat]
                        }
                    };
                } else {
                    // Pincode not in database, still save location without coordinates
                    locationData = {
                        city: location.city || '',
                        area: location.area || '',
                        state: location.state || '',
                        pincode: location.pincode,
                    };
                }
            } else if (location.city) {
                // Only city provided, no pincode
                locationData = {
                    city: location.city,
                    area: location.area || '',
                    state: location.state || '',
                };
            }
        }

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (whatsappEnabled !== undefined) updateData.whatsappEnabled = whatsappEnabled;
        if (showPhoneNumber !== undefined) updateData.showPhoneNumber = showPhoneNumber;
        if (locationData) updateData.location = locationData;

        // If phone number is removed, also disable WhatsApp
        if (phoneNumber === '' || phoneNumber === null) {
            updateData.phoneNumber = null;
            updateData.whatsappEnabled = false;
            updateData.showPhoneNumber = false;
        }

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -verificationOTP -otpExpires');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
