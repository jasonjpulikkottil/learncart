'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Check, Star, Crown, ArrowRight } from 'lucide-react';

const FEATURES = {
    free: [
        { text: 'Up to 5 active listings', included: true },
        { text: 'Basic search visibility', included: true },
        { text: 'Email contact', included: true },
    ],
    pro: [
        { text: 'Unlimited active listings', included: true, highlight: true },
        { text: 'Priority search visibility', included: true },
        { text: 'Verified seller badge', included: true },
    ],
};

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [scriptLoaded, setScriptLoaded] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-16 px-4">
            <Script
                src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
                data-sdk-integration-source="button-factory"
                onLoad={() => setScriptLoaded(true)}
            />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                        <Crown className="w-4 h-4" />
                        Upgrade to Pro
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Sell More with <span className="text-indigo-600">LearnCart Pro</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Unlock unlimited listings, featured placements, and verified seller status to boost your sales.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                            <p className="text-gray-600 text-sm">Perfect for occasional sellers</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">$0</span>
                            <span className="text-gray-600">/forever</span>
                        </div>
                        <Link
                            href="/dashboard"
                            className="block w-full py-3 px-6 text-center bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition mb-8"
                        >
                            Current Plan
                        </Link>
                        <ul className="space-y-4 flex-grow">
                            {FEATURES.free.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className={`mt-0.5 ${feature.included ? 'text-green-600' : 'text-gray-300'}`}>
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                        <div className="relative flex-grow flex flex-col">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold">Pro</h3>
                                    <Star className="w-5 h-5 text-yellow-300 fill-current" />
                                </div>
                                <p className="text-indigo-200 text-sm">For active sellers who want more</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$2.00</span>
                                <span className="text-indigo-200">/month</span>
                            </div>

                            {/* PayPal Button Container */}
                            <div className="mb-8 min-h-[50px]">
                                {scriptLoaded ? (
                                    <PayPalButton />
                                ) : (
                                    <div className="h-12 bg-white/20 animate-pulse rounded-xl" />
                                )}
                            </div>

                            <ul className="space-y-4">
                                {FEATURES.pro.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="mt-0.5 text-green-300">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        <span className={feature.highlight ? 'text-white font-medium' : 'text-indigo-100'}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-20 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                            <p className="text-gray-600">Yes! You can cancel your Pro subscription at any time. You'll retain Pro features until the end of your billing period.</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-2">What happens to my listings if I downgrade?</h3>
                            <p className="text-gray-600">Your existing listings will remain active. However, if you have more than 5 active listings, you won't be able to create new ones until you're under the limit.</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-2">How does payment work?</h3>
                            <p className="text-gray-600">We use PayPal for secure subscription billing. You can pay with PayPal balance, credit card, or debit card linked to your PayPal account.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PayPalButton() {
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        const containerId = 'paypal-button-container';
        const container = document.getElementById(containerId);

        if (window.paypal && container) {
            // Check if buttons are already rendered
            if (container.children.length > 0) return;

            window.paypal.Buttons({
                style: {
                    shape: 'pill',
                    color: 'white',
                    layout: 'vertical',
                    label: 'subscribe'
                },
                createSubscription: function (data, actions) {
                    // Check if user is logged in
                    if (!session) {
                        router.push('/login?callbackUrl=/pricing');
                        return Promise.reject('User not logged in');
                    }

                    return actions.subscription.create({
                        plan_id: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID,
                        quantity: 1
                    });
                },
                onApprove: function (data, actions) {
                    // Redirect to success page with subscription ID
                    router.push(`/upgrade/success?subscription_id=${data.subscriptionID}`);
                },
                onError: function (err) {
                    console.error('PayPal Error:', err);
                    alert('There was an error processing your payment. Please try again.');
                }
            }).render(`#${containerId}`);
        }

        // Cleanup function
        return () => {
            if (container) container.innerHTML = '';
        };
    }, [session, router]);

    if (!session) {
        return (
            <Link
                href="/login?callbackUrl=/pricing"
                className="block w-full py-3 px-6 text-center bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition"
            >
                Log in to Upgrade
            </Link>
        );
    }

    return <div id="paypal-button-container" className="w-full relative z-10"></div>;
}
