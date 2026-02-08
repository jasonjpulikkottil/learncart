import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, hashOTP, getOTPExpiration } from '@/lib/otp';
import { sendVerificationEmail } from '@/lib/send-email';

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

        await connectDB();

        // Get user from database
        const user = await User.findOne({ email: session.user.email });
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

        // Rate limiting: Check if OTP was recently sent
        if (user.otpExpires && user.otpExpires > new Date()) {
            const remainingTime = Math.ceil((user.otpExpires - new Date()) / 1000 / 60);
            if (remainingTime > 8) { // Only allow resend if less than 2 minutes have passed
                return NextResponse.json(
                    {
                        success: false,
                        error: `Please wait ${remainingTime - 8} more minute(s) before requesting a new code`
                    },
                    { status: 429 }
                );
            }
        }

        // Generate new OTP
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        const otpExpires = getOTPExpiration();

        // Update user with new OTP
        user.verificationOTP = hashedOtp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(user.email, otp, user.name);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // In development, continue anyway (OTP is logged to console)
            if (process.env.NODE_ENV !== 'development') {
                return NextResponse.json(
                    { success: false, error: 'Failed to send verification email' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Verification code sent to your email',
                expiresIn: 10, // minutes
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send verification code' },
            { status: 500 }
        );
    }
}
