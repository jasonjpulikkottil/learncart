import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { createSubscription } from '@/lib/paypal';
import { SUBSCRIPTION_PRICING } from '@/lib/subscription';
import Subscription from '@/models/Subscription';

/**
 * POST /api/subscriptions/create - Create a new PayPal subscription
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
        const { billingCycle = 'monthly' } = body;

        // Validate billing cycle
        if (!['monthly', 'annual'].includes(billingCycle)) {
            return NextResponse.json(
                { success: false, error: 'Invalid billing cycle' },
                { status: 400 }
            );
        }

        // Get pricing and plan ID
        const pricing = SUBSCRIPTION_PRICING[billingCycle];

        if (!pricing.planId) {
            return NextResponse.json(
                { success: false, error: 'PayPal plan not configured. Please set PAYPAL_MONTHLY_PLAN_ID and PAYPAL_ANNUAL_PLAN_ID environment variables.' },
                { status: 500 }
            );
        }

        // Build return URLs
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const returnUrl = `${baseUrl}/upgrade/success`;
        const cancelUrl = `${baseUrl}/upgrade?cancelled=true`;

        // Create PayPal subscription
        const result = await createSubscription(
            pricing.planId,
            {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
            },
            returnUrl,
            cancelUrl
        );

        // Store pending subscription in database
        await Subscription.create({
            userId: session.user.id,
            paypalSubscriptionId: result.subscriptionId,
            paypalPlanId: pricing.planId,
            status: 'APPROVAL_PENDING',
            amount: pricing.price,
            currency: pricing.currency,
            billingCycle,
            approvalUrl: result.approvalUrl,
        });

        return NextResponse.json({
            success: true,
            data: {
                subscriptionId: result.subscriptionId,
                approvalUrl: result.approvalUrl,
                billingCycle,
                amount: pricing.price,
                currency: pricing.currency,
            },
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
