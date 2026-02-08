import User from '@/models/User';
import Listing from '@/models/Listing';

// Subscription limits configuration
export const SUBSCRIPTION_LIMITS = {
    free: {
        maxActiveListings: 5,
        featuredListingsPerMonth: 0,
        bumpsPerMonth: 0,
    },
    pro: {
        maxActiveListings: Infinity,
        featuredListingsPerMonth: 3,
        bumpsPerMonth: 5,
    },
};

// Subscription pricing
export const SUBSCRIPTION_PRICING = {
    monthly: {
        price: 4.99,
        currency: 'USD',
        planId: process.env.PAYPAL_MONTHLY_PLAN_ID,
    },
    annual: {
        price: 39.99,
        currency: 'USD',
        planId: process.env.PAYPAL_ANNUAL_PLAN_ID,
    },
};

/**
 * Check if a user can create a new listing based on their subscription plan
 * @param {string} userId - The user's MongoDB ID
 * @returns {Promise<Object>} - { allowed: boolean, current: number, limit: number, upgradeRequired: boolean }
 */
export async function canCreateListing(userId) {
    const user = await User.findById(userId).lean();

    if (!user) {
        return { allowed: false, error: 'User not found' };
    }

    const plan = user.subscription?.plan || 'free';
    const limits = SUBSCRIPTION_LIMITS[plan];

    // Pro users have unlimited listings
    if (plan === 'pro' && user.subscription?.status === 'active') {
        return {
            allowed: true,
            current: 0,
            limit: Infinity,
            plan: 'pro',
        };
    }

    // Count active listings for free users
    const activeListings = await Listing.countDocuments({
        seller: userId,
        status: 'active',
    });

    const allowed = activeListings < limits.maxActiveListings;

    return {
        allowed,
        current: activeListings,
        limit: limits.maxActiveListings,
        plan: 'free',
        upgradeRequired: !allowed,
    };
}

/**
 * Check if a user has Pro subscription active
 * @param {string} userId - The user's MongoDB ID
 * @returns {Promise<boolean>}
 */
export async function isPro(userId) {
    const user = await User.findById(userId).select('subscription').lean();

    if (!user) return false;

    return (
        user.subscription?.plan === 'pro' &&
        user.subscription?.status === 'active' &&
        (!user.subscription?.currentPeriodEnd || new Date(user.subscription.currentPeriodEnd) > new Date())
    );
}

/**
 * Get subscription status for a user
 * @param {string} userId - The user's MongoDB ID
 * @returns {Promise<Object>}
 */
export async function getSubscriptionStatus(userId) {
    const user = await User.findById(userId).select('subscription').lean();

    if (!user) {
        return { error: 'User not found' };
    }

    const plan = user.subscription?.plan || 'free';
    const limits = SUBSCRIPTION_LIMITS[plan];

    // Count current active listings
    const activeListings = await Listing.countDocuments({
        seller: userId,
        status: 'active',
    });

    return {
        plan,
        status: user.subscription?.status || 'active',
        billingCycle: user.subscription?.billingCycle || null,
        currentPeriodEnd: user.subscription?.currentPeriodEnd || null,
        limits: {
            maxActiveListings: limits.maxActiveListings,
            featuredListingsPerMonth: limits.featuredListingsPerMonth,
            bumpsPerMonth: limits.bumpsPerMonth,
        },
        usage: {
            activeListings,
            featuredListingsUsed: user.subscription?.featuredListingsUsed || 0,
            bumpsUsed: user.subscription?.bumpsUsed || 0,
        },
        features: {
            unlimitedListings: plan === 'pro',
            featuredListings: plan === 'pro',
            bumps: plan === 'pro',
            verifiedBadge: plan === 'pro',
            prioritySupport: plan === 'pro',
            noAds: plan === 'pro',
        },
    };
}

/**
 * Upgrade a user to Pro
 * @param {string} userId - The user's MongoDB ID
 * @param {Object} subscriptionDetails - PayPal subscription details
 */
export async function upgradeToProUser(userId, subscriptionDetails) {
    const { paypalSubscriptionId, paypalPlanId, billingCycle, currentPeriodStart, currentPeriodEnd } = subscriptionDetails;

    await User.findByIdAndUpdate(userId, {
        'subscription.plan': 'pro',
        'subscription.status': 'active',
        'subscription.paypalSubscriptionId': paypalSubscriptionId,
        'subscription.paypalPlanId': paypalPlanId,
        'subscription.billingCycle': billingCycle,
        'subscription.currentPeriodStart': currentPeriodStart,
        'subscription.currentPeriodEnd': currentPeriodEnd,
        'subscription.featuredListingsUsed': 0,
        'subscription.bumpsUsed': 0,
        'subscription.usageResetDate': new Date(),
    });
}

/**
 * Downgrade a user to Free
 * @param {string} userId - The user's MongoDB ID
 */
export async function downgradeToFree(userId) {
    await User.findByIdAndUpdate(userId, {
        'subscription.plan': 'free',
        'subscription.status': 'cancelled',
        'subscription.paypalSubscriptionId': null,
        'subscription.paypalPlanId': null,
        'subscription.billingCycle': null,
    });
}
