'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
    const router = useRouter();
    const { data: session, update: updateSession } = useSession();

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [cooldown, setCooldown] = useState(0);

    // Redirect if already verified
    useEffect(() => {
        if (session?.user?.emailVerified) {
            router.push('/');
        }
    }, [session, router]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleResendOTP = async () => {
        if (cooldown > 0) return;

        setSending(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Failed to send code');
                return;
            }

            setSuccess('Verification code sent! Check your email.');
            setCooldown(120); // 2 minute cooldown
        } catch (err) {
            console.error('Resend error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Verification failed');
                setLoading(false);
                return;
            }

            setSuccess('Email verified successfully!');

            // Update session to reflect email verification
            await updateSession({ trigger: 'update' });

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/');
                router.refresh();
            }, 1500);
        } catch (err) {
            console.error('Verify error:', err);
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to verify your email</p>
                    <Link href="/login" className="text-indigo-600 hover:underline mt-2 inline-block">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
                    <p className="text-gray-600 mt-2">
                        We sent a 6-digit code to <span className="font-semibold">{session.user?.email}</span>
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleVerify} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" />
                                {success}
                            </div>
                        )}

                        {/* OTP Input */}
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                placeholder="000000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition text-center text-2xl tracking-widest font-mono"
                                disabled={loading}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Enter the 6-digit code from your email
                            </p>
                        </div>

                        {/* Verify Button */}
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify Email
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Resend */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                        <button
                            onClick={handleResendOTP}
                            disabled={sending || cooldown > 0}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                'Sending...'
                            ) : cooldown > 0 ? (
                                `Resend in ${cooldown}s`
                            ) : (
                                'Resend Code'
                            )}
                        </button>
                    </div>
                </div>

                {/* Skip for now */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    You can skip this for now, but you'll need to verify your email before creating listings.{' '}
                    <Link href="/" className="text-indigo-600 hover:underline">
                        Go to Home
                    </Link>
                </p>
            </div>
        </div>
    );
}
