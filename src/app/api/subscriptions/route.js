import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { getSubscriptionStatus } from '@/lib/subscription';

/**
 * GET /api/subscriptions - Get current user's subscription status
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const subscriptionStatus = await getSubscriptionStatus(session.user.id);

        if (subscriptionStatus.error) {
            return NextResponse.json(
                { success: false, error: subscriptionStatus.error },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: subscriptionStatus,
        });
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch subscription status' },
            { status: 500 }
        );
    }
}
