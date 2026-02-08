/**
 * Database Seed Script for LearnCart
 * 
 * This script populates the database with sample users and listings for testing.
 * 
 * Usage:
 *   node scripts/seed.js
 * 
 * Environment:
 *   Requires MONGODB_URI in .env.local
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// User Schema (inline for seeding)
const UserSchema = new mongoose.Schema(
    {
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
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Listing Schema (inline for seeding)
const ListingSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true, enum: ['textbooks', 'electronics', 'furniture', 'clothing', 'other'] },
        condition: { type: String, required: true, enum: ['new', 'like-new', 'good', 'fair'] },
        imageUrl: { type: String, default: '' },
        sellerEmail: { type: String, required: true },
        sellerName: { type: String, default: '' },
        isSwappable: { type: Boolean, default: false },
        swapPreferences: { type: String, default: '' },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        location: {
            city: { type: String, required: true },
            area: { type: String },
            pincode: { type: String },
        },
        meetupPreference: { type: String, enum: ['pickup', 'delivery', 'both'], default: 'pickup' },
        status: { type: String, enum: ['active', 'sold', 'swapped'], default: 'active' },
        swapHistory: [{ type: Object }],
    },
    { timestamps: true }
);

const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);

// Sample data
const sampleUsers = [
    {
        name: 'Alice Johnson',
        email: 'alice@university.edu',
        password: 'password123',
        bio: 'Computer Science major, selling my old textbooks and electronics.',
        phone: '+1234567890',
        college: 'Tech University',
    },
    {
        name: 'Bob Smith',
        email: 'bob@university.edu',
        password: 'password123',
        bio: 'Business student looking to swap and sell items.',
        phone: '+1234567891',
        college: 'Tech University',
    },
    {
        name: 'Carol Davis',
        email: 'carol@university.edu',
        password: 'password123',
        bio: 'Art major, selling creative supplies and furniture.',
        phone: '+1234567892',
        college: 'Arts College',
    },
];

const sampleListings = [
    {
        title: 'Introduction to Algorithms Textbook',
        description: 'Classic CLRS textbook in excellent condition. Used for one semester.',
        price: 45,
        category: 'textbooks',
        condition: 'like-new',
        sellerEmail: 'alice@university.edu',
        sellerName: 'Alice Johnson',
        location: { city: 'Mumbai', area: 'Andheri', pincode: '400053' },
    },
    {
        title: 'MacBook Pro 2019 13-inch',
        description: 'Reliable laptop, 8GB RAM, 256GB SSD. Minor scratches on the case.',
        price: 650,
        category: 'electronics',
        condition: 'good',
        sellerEmail: 'bob@university.edu',
        sellerName: 'Bob Smith',
        location: { city: 'Delhi', area: 'South Delhi', pincode: '110001' },
    },
    {
        title: 'IKEA Desk Lamp',
        description: 'White desk lamp, perfect for studying. Works great!',
        price: 15,
        category: 'furniture',
        condition: 'good',
        sellerEmail: 'carol@university.edu',
        sellerName: 'Carol Davis',
        location: { city: 'Bangalore', area: 'Koramangala', pincode: '560034' },
    },
    {
        title: 'Scientific Calculator TI-84',
        description: 'Graphing calculator for math and engineering courses.',
        price: 80,
        category: 'electronics',
        condition: 'like-new',
        sellerEmail: 'alice@university.edu',
        sellerName: 'Alice Johnson',
        location: { city: 'Mumbai', area: 'Andheri', pincode: '400053' },
    },
    {
        title: 'Mini Fridge - Dorm Size',
        description: 'Compact fridge perfect for dorm rooms. Clean and working.',
        price: 120,
        category: 'other',
        condition: 'good',
        sellerEmail: 'bob@university.edu',
        sellerName: 'Bob Smith',
        location: { city: 'Delhi', area: 'South Delhi', pincode: '110001' },
    },
];

async function seed() {
    try {
        console.log('🌱 Starting database seed...\n');

        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env.local');
        }

        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Listing.deleteMany({});
        console.log('✅ Cleared existing data\n');

        // Create users
        console.log('👥 Creating users...');
        const createdUsers = [];

        for (const userData of sampleUsers) {
            // Hash password
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(userData.password, salt);

            const user = await User.create({
                ...userData,
                password: hashedPassword,
                emailVerified: true, // Auto-verify seeded users for testing
            });

            createdUsers.push(user);
            console.log(`   ✓ Created user: ${user.name} (${user.email})`);
        }
        console.log(`✅ Created ${createdUsers.length} users\n`);

        // Create listings
        console.log('📦 Creating listings...');
        const createdListings = [];

        for (let i = 0; i < sampleListings.length; i++) {
            const listingData = sampleListings[i];
            // Assign listings to users in round-robin fashion
            const seller = createdUsers[i % createdUsers.length];

            const listing = await Listing.create({
                ...listingData,
                seller: seller._id,
            });

            // Update user's listing count
            await User.findByIdAndUpdate(seller._id, {
                $inc: { listingsCount: 1 },
            });

            createdListings.push(listing);
            console.log(`   ✓ Created listing: ${listing.title} (by ${seller.name})`);
        }
        console.log(`✅ Created ${createdListings.length} listings\n`);

        // Summary
        console.log('📊 Seed Summary:');
        console.log('─────────────────────────────────────');
        console.log(`Users created:    ${createdUsers.length}`);
        console.log(`Listings created: ${createdListings.length}`);
        console.log('─────────────────────────────────────\n');

        console.log('🎉 Database seeded successfully!\n');
        console.log('📝 Test Credentials:');
        console.log('   Email:    alice@university.edu');
        console.log('   Password: password123');
        console.log('');

        // Close connection
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

// Run seed
seed();
