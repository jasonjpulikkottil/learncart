'use client';

import Link from 'next/link';
import { Crown, Zap, AlertTriangle } from 'lucide-react';

/**
 * Upgrade prompt component for dashboard
 * Shows when user is approaching or at their listing limit
 */
export default function UpgradePrompt({ currentListings = 0, maxListings = 5, isPro = false }) {
    // Don't show if user is Pro
    if (isPro) return null;

    const percentage = (currentListings / maxListings) * 100;
    const isAtLimit = currentListings >= maxListings;
    const isNearLimit = currentListings >= maxListings - 1;

    // Don't show if user has plenty of room
    if (currentListings < 3) return null;

    return (
        <div className={`rounded-xl p-4 sm:p-6 mb-6 ${isAtLimit
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                : isNearLimit
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
            }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isAtLimit ? 'bg-white/20' : 'bg-white/20'}`}>
                        {isAtLimit ? (
                            <AlertTriangle className="w-6 h-6" />
                        ) : (
                            <Zap className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">
                            {isAtLimit
                                ? 'Listing Limit Reached!'
                                : isNearLimit
                                    ? 'Almost at Your Limit'
                                    : 'Upgrade to Pro'
                            }
                        </h3>
                        <p className="text-sm opacity-90 mt-1">
                            {isAtLimit
                                ? `You've used all ${maxListings} free listings. Upgrade to Pro for unlimited listings!`
                                : `You're using ${currentListings} of ${maxListings} free listings. Go Pro for unlimited!`
                            }
                        </p>
                        {/* Progress bar */}
                        <div className="mt-3 w-full max-w-xs bg-white/20 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${isAtLimit ? 'bg-white' : 'bg-white/80'
                                    }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs opacity-75 mt-1">{currentListings}/{maxListings} listings used</p>
                    </div>
                </div>
                <Link
                    href="/pricing"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition whitespace-nowrap ${isAtLimit
                            ? 'bg-white text-red-600 hover:bg-gray-100'
                            : 'bg-white text-indigo-600 hover:bg-gray-100'
                        }`}
                >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro
                </Link>
            </div>
        </div>
    );
}
