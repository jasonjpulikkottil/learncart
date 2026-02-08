/**
 * PayPal API utility functions for subscription management
 */

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * Get PayPal access token
 */
async function getAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials not configured');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get PayPal access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Create a PayPal subscription
 * @param {string} planId - PayPal Plan ID (monthly or annual)
 * @param {Object} user - User object with email and name
 * @param {string} returnUrl - URL to redirect after approval
 * @param {string} cancelUrl - URL to redirect if cancelled
 */
export async function createSubscription(planId, user, returnUrl, cancelUrl) {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'PayPal-Request-Id': `sub-${user.id}-${Date.now()}`,
        },
        body: JSON.stringify({
            plan_id: planId,
            subscriber: {
                name: {
                    given_name: user.name?.split(' ')[0] || 'User',
                    surname: user.name?.split(' ').slice(1).join(' ') || '',
                },
                email_address: user.email,
            },
            application_context: {
                brand_name: 'LearnCart',
                locale: 'en-US',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'SUBSCRIBE_NOW',
                payment_method: {
                    payer_selected: 'PAYPAL',
                    payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
                },
                return_url: returnUrl,
                cancel_url: cancelUrl,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('PayPal subscription creation error:', error);
        throw new Error(error.message || 'Failed to create PayPal subscription');
    }

    const subscription = await response.json();

    // Find the approval URL
    const approvalUrl = subscription.links?.find(link => link.rel === 'approve')?.href;

    return {
        subscriptionId: subscription.id,
        status: subscription.status,
        approvalUrl,
        subscription,
    };
}

/**
 * Get subscription details
 * @param {string} subscriptionId - PayPal Subscription ID
 */
export async function getSubscription(subscriptionId) {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get subscription');
    }

    return response.json();
}

/**
 * Cancel a subscription
 * @param {string} subscriptionId - PayPal Subscription ID
 * @param {string} reason - Cancellation reason
 */
export async function cancelSubscription(subscriptionId, reason = 'Cancelled by user') {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
    }

    return true;
}

/**
 * Verify webhook signature
 * @param {Object} headers - Request headers
 * @param {string} body - Raw request body
 */
export async function verifyWebhookSignature(headers, body) {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: process.env.PAYPAL_WEBHOOK_ID,
            webhook_event: JSON.parse(body),
        }),
    });

    if (!response.ok) {
        return false;
    }

    const result = await response.json();
    return result.verification_status === 'SUCCESS';
}
