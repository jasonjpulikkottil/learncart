import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // PayPal subscription details
        paypalSubscriptionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        paypalPlanId: {
            type: String,
            required: true,
        },
        // Subscription status
        status: {
            type: String,
            enum: ['APPROVAL_PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'],
            default: 'APPROVAL_PENDING',
        },
        // Billing details
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'annual'],
            required: true,
        },
        // Dates
        startDate: {
            type: Date,
            default: null,
        },
        nextBillingDate: {
            type: Date,
            default: null,
        },
        lastPaymentDate: {
            type: Date,
            default: null,
        },
        lastPaymentAmount: {
            type: Number,
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
        cancelReason: {
            type: String,
            default: null,
        },
        // PayPal links for management
        approvalUrl: {
            type: String,
            default: null,
        },
        // Payment history
        payments: [
            {
                paypalPaymentId: String,
                amount: Number,
                currency: String,
                status: String,
                paidAt: Date,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for finding user's active subscription
SubscriptionSchema.index({ userId: 1, status: 1 });

// Static method to find active subscription for user
SubscriptionSchema.statics.findActiveForUser = async function (userId) {
    return this.findOne({
        userId,
        status: { $in: ['ACTIVE', 'APPROVED'] },
    });
};

// Instance method to check if subscription is active
SubscriptionSchema.methods.isActive = function () {
    return ['ACTIVE', 'APPROVED'].includes(this.status);
};

// Prevent model recompilation in development
export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
