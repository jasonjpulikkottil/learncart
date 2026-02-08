import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { cancelSubscription as cancelPayPalSubscription } from '@/lib/paypal';
import { downgradeToFree } from '@/lib/subscription';
import User from '@/models/User';
import Subscription from '@/models/Subscription';

/**
 * POST /api/subscriptions/cancel - Cancel current subscription
 */
export async function POST(request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await request.json();
        const { reason = 'Cancelled by user' } = body;

        // Get user's subscription
        const user = await User.findById(session.user.id).select('subscription').lean();

        if (!user?.subscription?.paypalSubscriptionId) {
            return NextResponse.json(
                { success: false, error: 'No active subscription found' },
                { status: 404 }
            );
        }

        // Cancel on PayPal
        await cancelPayPalSubscription(user.subscription.paypalSubscriptionId, reason);

        // Update local subscription record
        await Subscription.findOneAndUpdate(
            { paypalSubscriptionId: user.subscription.paypalSubscriptionId },
            {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancelReason: reason,
            }
        );

        // Downgrade user to free
        await downgradeToFree(session.user.id);

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled successfully. You will retain Pro features until the end of your billing period.',
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
