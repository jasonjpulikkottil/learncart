/**
 * Non-interactive admin initialization for Vercel build
 * Reads from environment variables and creates/updates admin account
 * Safe to run multiple times - idempotent
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables (in local dev, Vercel provides them automatically)
dotenv.config({ path: '.env.local' });

// User Schema (must match your actual User model)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    image: { type: String, default: null },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    college: { type: String, default: '' },
    listingsCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    phoneNumber: { type: String },
    whatsappEnabled: { type: Boolean, default: false },
    showPhoneNumber: { type: Boolean, default: false },
    location: {
        city: { type: String },
        area: { type: String },
        state: { type: String },
        pincode: { type: String },
    },
    swappedCount: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    otpExpires: { type: Date },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function initAdmin() {
    try {
        // Get environment variables
        const MONGODB_URI = process.env.MONGODB_URI;
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
        const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

        // Validate required environment variables
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI environment variable is required');
            process.exit(1);
        }

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.log('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set - skipping admin creation');
            process.exit(0);
        }

        console.log('🛡️  Initializing admin account...');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
        });
        console.log('✅ Connected to MongoDB');

        // Check if admin exists
        const existingAdmin = await User.findOne({
            email: ADMIN_EMAIL.toLowerCase()
        }).select('+password');

        if (existingAdmin) {
            // Update existing user to admin
            let updated = false;

            if (!existingAdmin.isAdmin) {
                existingAdmin.isAdmin = true;
                updated = true;
            }

            if (!existingAdmin.emailVerified) {
                existingAdmin.emailVerified = true;
                updated = true;
            }

            if (updated) {
                await existingAdmin.save();
                console.log(`✅ Updated existing user to admin: ${ADMIN_EMAIL}`);
            } else {
                console.log(`✅ Admin already exists: ${ADMIN_EMAIL}`);
            }
        } else {
            // Create new admin account
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, salt);

            const admin = await User.create({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL.toLowerCase(),
                password: hashedPassword,
                isAdmin: true,
                emailVerified: true,
            });

            console.log(`🎉 Admin account created: ${admin.email}`);
        }

        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error initializing admin:', error.message);

        // Don't fail the build if admin creation fails
        // Just log the error and continue
        console.log('⚠️  Continuing without admin initialization');
        process.exit(0);
    }
}

// Run the initialization
initAdmin();
