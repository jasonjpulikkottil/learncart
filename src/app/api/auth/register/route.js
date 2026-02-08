import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
    try {
        console.log('📝 Registration request received');
        const body = await request.json();
        const { name, email, password } = body;
        console.log('📧 Email:', email);

        // Validate input
        if (!name || !email || !password) {
            console.log('❌ Validation failed: Missing fields');
            return NextResponse.json(
                { success: false, error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            console.log('❌ Validation failed: Password too short');
            return NextResponse.json(
                { success: false, error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        console.log('🔌 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Check if user already exists
        console.log('🔍 Checking if user exists...');
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('❌ User already exists');
            return NextResponse.json(
                { success: false, error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        console.log('🔐 Hashing password...');
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        console.log('✅ Password hashed');

        // Create new user
        console.log('👤 Creating new user...');
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        });
        console.log('✅ User created successfully:', user._id);

        // Generate and send OTP for email verification
        try {
            const { generateOTP, hashOTP, getOTPExpiration } = await import('@/lib/otp');
            const { sendVerificationEmail } = await import('@/lib/send-email');

            const otp = generateOTP();
            const hashedOtp = await hashOTP(otp);
            const otpExpires = getOTPExpiration();

            // Update user with OTP
            user.verificationOTP = hashedOtp;
            user.otpExpires = otpExpires;
            await user.save();

            // Send verification email
            await sendVerificationEmail(user.email, otp, user.name);
            console.log('📧 Verification email sent');
        } catch (emailError) {
            console.error('⚠️  Email sending failed:', emailError);
            // Continue registration even if email fails
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully! Please check your email for a verification code.',
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    emailVerified: false,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Registration error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json(
                { success: false, error: messages.join(', ') },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
