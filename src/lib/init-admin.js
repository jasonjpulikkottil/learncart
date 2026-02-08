/**
 * Admin Initialization Script
 * 
 * Auto-creates admin account from environment variables if it doesn't exist
 */

import bcryptjs from 'bcryptjs';
import connectDB from './mongodb';
import User from '@/models/User';

export async function initializeAdmin() {
    try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
        const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

        // Skip if admin credentials not configured
        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.log('⚠️  Admin credentials not configured - skipping admin initialization');
            return;
        }

        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

        if (existingAdmin) {
            // Update admin flag if needed
            if (!existingAdmin.isAdmin) {
                existingAdmin.isAdmin = true;
                existingAdmin.emailVerified = true; // Auto-verify admin
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin:', ADMIN_EMAIL);
            }
            return;
        }

        // Create admin account
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, salt);

        await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL.toLowerCase(),
            password: hashedPassword,
            isAdmin: true,
            emailVerified: true, // Auto-verify admin
        });

        console.log('🎉 Admin account created:', ADMIN_EMAIL);
    } catch (error) {
        console.error('❌ Admin initialization failed:', error);
    }
}
