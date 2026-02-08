import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
            maxlength: [2000, 'Description cannot be more than 2000 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
            enum: ['textbooks', 'electronics', 'furniture', 'clothing', 'other'],
        },
        condition: {
            type: String,
            required: [true, 'Please select condition'],
            enum: ['new', 'like-new', 'good', 'fair'],
        },
        imageUrl: {
            type: String,
            default: '',
        },
        // User reference for ownership
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        sellerEmail: {
            type: String,
            required: [true, 'Please provide your email'],
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        sellerName: {
            type: String,
            default: '',
        },
        isSwappable: {
            type: Boolean,
            default: false,
        },
        swapPreferences: {
            type: String,
            default: '',
            maxlength: [500, 'Swap preferences cannot be more than 500 characters'],
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        // Listing location (can override seller's default location)
        location: {
            city: {
                type: String,
                required: [true, 'City is required'],
                trim: true,
            },
            area: {
                type: String,
                trim: true,
            },
            pincode: {
                type: String,
                trim: true,
                match: /^[1-9][0-9]{5}$/,
            },
            coordinates: {
                type: {
                    type: String,
                    enum: ['Point'],
                },
                coordinates: {
                    type: [Number], // [longitude, latitude]
                },
            },
        },
        meetupPreference: {
            type: String,
            enum: ['pickup', 'delivery', 'both'],
            default: 'pickup',
        },
        swapHistory: [{
            fromUser: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            toUser: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            swapDate: {
                type: Date,
                default: Date.now
            },
            previousStatus: String,
            newStatus: String,
            notes: String
        }],
        status: {
            type: String,
            enum: ['active', 'sold', 'swapped'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Add text index for search
ListingSchema.index({ title: 'text', description: 'text' });

// Add geospatial index for location-based queries
ListingSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);

