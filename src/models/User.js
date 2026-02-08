import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxLength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minLength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        image: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            maxLength: [500, 'Bio cannot exceed 500 characters'],
            default: '',
        },
        phone: {
            type: String,
            default: '',
        },
        college: {
            type: String,
            default: '',
        },
        listingsCount: {
            type: Number,
            default: 0,
        },
        soldCount: {
            type: Number,
            default: 0,
        },
        // Communication preferences
        phoneNumber: {
            type: String,
            trim: true,
            match: /^[6-9]\d{9}$/, // Indian mobile number format (10 digits starting with 6-9)
        },
        whatsappEnabled: {
            type: Boolean,
            default: false,
        },
        showPhoneNumber: {
            type: Boolean,
            default: false, // Hide by default for privacy
        },
        // Location information
        location: {
            city: {
                type: String,
                trim: true,
            },
            area: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                trim: true,
            },
            pincode: {
                type: String,
                trim: true,
                match: /^[1-9][0-9]{5}$/, // Indian pincode format (6 digits, doesn't start with 0)
            },
            coordinates: {
                type: {
                    type: String,
                    enum: ['Point'],
                },
                coordinates: {
                    type: [Number], // [longitude, latitude] - GeoJSON format
                },
            },
        },
        swappedCount: {
            type: Number,
            default: 0,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        verificationOTP: {
            type: String,
            select: false, // Don't return in queries by default
        },
        otpExpires: {
            type: Date,
            select: false, // Don't return in queries by default
        },
        // Pro Subscription fields
        subscription: {
            plan: {
                type: String,
                enum: ['free', 'pro'],
                default: 'free',
            },
            status: {
                type: String,
                enum: ['active', 'cancelled', 'expired', 'pending'],
                default: 'active',
            },
            paypalSubscriptionId: {
                type: String,
                default: null,
            },
            paypalPlanId: {
                type: String,
                default: null,
            },
            currentPeriodStart: {
                type: Date,
                default: null,
            },
            currentPeriodEnd: {
                type: Date,
                default: null,
            },
            billingCycle: {
                type: String,
                enum: ['monthly', 'annual', null],
                default: null,
            },
            // Usage tracking (reset monthly)
            featuredListingsUsed: {
                type: Number,
                default: 0,
            },
            bumpsUsed: {
                type: Number,
                default: 0,
            },
            usageResetDate: {
                type: Date,
                default: null,
            },
        },
    },
    {
        timestamps: true,
    }
);


// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
};

// Create geospatial index for location-based queries
UserSchema.index({ 'location.coordinates': '2dsphere' });

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model('User', UserSchema);

