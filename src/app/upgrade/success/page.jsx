'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Crown, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifySubscription = async () => {
            try {
                // Give PayPal webhook time to process
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Check subscription status
                const response = await fetch('/api/subscriptions');
                const data = await response.json();

                if (data.success && data.data.plan === 'pro') {
                    setIsVerifying(false);
                } else {
                    // Webhook might not have processed yet, wait and retry
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    const retryResponse = await fetch('/api/subscriptions');
                    const retryData = await retryResponse.json();

                    if (retryData.success && retryData.data.plan === 'pro') {
                        setIsVerifying(false);
                    } else {
                        setError('Your subscription is being processed. Please check back in a few minutes.');
                        setIsVerifying(false);
                    }
                }
            } catch (err) {
                console.error('Verification error:', err);
                setError('Something went wrong. Please contact support if your subscription is not activated.');
                setIsVerifying(false);
            }
        };

        verifySubscription();
    }, []);

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900">Activating your Pro subscription...</h2>
                    <p className="text-gray-600 mt-2">This will only take a moment</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-white flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Subscription</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/dashboard"
                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
                        >
                            Go to Dashboard
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                        >
                            Check Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white flex items-center justify-center px-4">
            <div className="max-w-lg text-center">
                {/* Success Icon */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-200">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Crown className="w-5 h-5 text-yellow-800" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Welcome to <span className="text-indigo-600">LearnCart Pro!</span>
                </h1>

                <p className="text-lg text-gray-600 mb-8">
                    Your subscription is now active. You now have access to all Pro features!
                </p>

                {/* Features */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Your Pro Benefits
                    </h3>
                    <ul className="space-y-3 text-left">
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Unlimited active listings</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">3 featured listings per month</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">5 listing bumps per month</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Verified seller badge</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Priority support</span>
                        </li>
                    </ul>
                </div>

                {/* CTA */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                </Link>

                <p className="text-sm text-gray-500 mt-6">
                    Manage your subscription in{' '}
                    <Link href="/dashboard/subscription" className="text-indigo-600 hover:underline">
                        Account Settings
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function UpgradeSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
