import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyOTP } from '@/lib/otp';

export async function POST(request) {
    try {
        // Check if user is authenticated
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { otp } = body;

        if (!otp || otp.length !== 6) {
            return NextResponse.json(
                { success: false, error: 'Please provide a valid 6-digit code' },
                { status: 400 }
            );
        }

        await connectDB();

        // Get user with OTP fields
        const user = await User.findOne({ email: session.user.email })
            .select('+verificationOTP +otpExpires');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { success: false, error: 'Email already verified' },
                { status: 400 }
            );
        }

        // Check if OTP exists
        if (!user.verificationOTP) {
            return NextResponse.json(
                { success: false, error: 'No verification code found. Please request a new one.' },
                { status: 400 }
            );
        }

        // Check if OTP expired
        if (!user.otpExpires || user.otpExpires < new Date()) {
            return NextResponse.json(
                { success: false, error: 'Verification code has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Verify OTP
        const isValid = await verifyOTP(otp, user.verificationOTP);
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Mark email as verified and clear OTP fields
        user.emailVerified = true;
        user.verificationOTP = undefined;
        user.otpExpires = undefined;
        await user.save();

        console.log('✅ Email verified for user:', user.email);

        return NextResponse.json(
            {
                success: true,
                message: 'Email verified successfully!',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to verify code' },
            { status: 500 }
        );
    }
}
