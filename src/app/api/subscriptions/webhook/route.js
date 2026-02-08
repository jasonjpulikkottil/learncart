import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyWebhookSignature, getSubscription } from '@/lib/paypal';
import { upgradeToProUser, downgradeToFree } from '@/lib/subscription';
import Subscription from '@/models/Subscription';

/**
 * POST /api/subscriptions/webhook - Handle PayPal webhook events
 */
export async function POST(request) {
    try {
        const rawBody = await request.text();
        const headers = Object.fromEntries(request.headers.entries());

        // Verify webhook signature (skip in development if not configured)
        if (process.env.PAYPAL_WEBHOOK_ID) {
            const isValid = await verifyWebhookSignature(headers, rawBody);
            if (!isValid) {
                console.error('Invalid webhook signature');
                return NextResponse.json(
                    { success: false, error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        }

        await dbConnect();

        const event = JSON.parse(rawBody);
        const eventType = event.event_type;
        const resource = event.resource;

        console.log(`PayPal webhook received: ${eventType}`, resource?.id);

        switch (eventType) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED': {
                // Subscription is now active - upgrade user to Pro
                const subscriptionId = resource.id;

                // Find subscription in our database
                const subscription = await Subscription.findOne({
                    paypalSubscriptionId: subscriptionId
                });

                if (!subscription) {
                    console.error('Subscription not found:', subscriptionId);
                    return NextResponse.json({ success: true }); // Return 200 to prevent retries
                }

                // Get subscription details from PayPal
                const paypalSubscription = await getSubscription(subscriptionId);

                // Calculate billing period dates
                const startDate = new Date(paypalSubscription.start_time);
                const currentPeriodEnd = new Date(paypalSubscription.billing_info?.next_billing_time);

                // Update subscription record
                await Subscription.findByIdAndUpdate(subscription._id, {
                    status: 'ACTIVE',
                    startDate,
                    nextBillingDate: currentPeriodEnd,
                });

                // Upgrade user to Pro
                await upgradeToProUser(subscription.userId, {
                    paypalSubscriptionId: subscriptionId,
                    paypalPlanId: subscription.paypalPlanId,
                    billingCycle: subscription.billingCycle,
                    currentPeriodStart: startDate,
                    currentPeriodEnd,
                });

                console.log(`User ${subscription.userId} upgraded to Pro`);
                break;
            }

            case 'BILLING.SUBSCRIPTION.CANCELLED':
            case 'BILLING.SUBSCRIPTION.SUSPENDED':
            case 'BILLING.SUBSCRIPTION.EXPIRED': {
                const subscriptionId = resource.id;

                const subscription = await Subscription.findOne({
                    paypalSubscriptionId: subscriptionId
                });

                if (subscription) {
                    await Subscription.findByIdAndUpdate(subscription._id, {
                        status: eventType.split('.').pop(), // CANCELLED, SUSPENDED, or EXPIRED
                        cancelledAt: new Date(),
                    });

                    await downgradeToFree(subscription.userId);
                    console.log(`User ${subscription.userId} downgraded to Free`);
                }
                break;
            }

            case 'PAYMENT.SALE.COMPLETED': {
                // Payment received - record it
                const billingAgreementId = resource.billing_agreement_id;

                const subscription = await Subscription.findOne({
                    paypalSubscriptionId: billingAgreementId
                });

                if (subscription) {
                    await Subscription.findByIdAndUpdate(subscription._id, {
                        lastPaymentDate: new Date(),
                        lastPaymentAmount: parseFloat(resource.amount.total),
                        $push: {
                            payments: {
                                paypalPaymentId: resource.id,
                                amount: parseFloat(resource.amount.total),
                                currency: resource.amount.currency,
                                status: 'completed',
                                paidAt: new Date(),
                            },
                        },
                    });

                    console.log(`Payment recorded for subscription ${billingAgreementId}`);
                }
                break;
            }

            default:
                console.log(`Unhandled webhook event: ${eventType}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        // Return 200 to prevent PayPal from retrying
        return NextResponse.json({ success: true });
    }
}
