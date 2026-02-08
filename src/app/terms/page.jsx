import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service | LearnCart',
    description: 'Terms of service for LearnCart student marketplace',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm p-8 lg:p-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                    <p className="text-gray-600 mb-8">Last updated: February 2026</p>

                    <div className="prose prose-indigo max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            By accessing and using LearnCart, you accept and agree to be bound by the terms and
                            provisions of this agreement.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">User Responsibilities</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                            <li>You must provide accurate and truthful information in your listings</li>
                            <li>You are responsible for the content you post</li>
                            <li>You must not engage in fraudulent or illegal activities</li>
                            <li>You must respect other users and communicate professionally</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Prohibited Activities</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                            <li>Selling prohibited, stolen, or counterfeit items</li>
                            <li>Harassment, discrimination, or abusive behavior</li>
                            <li>Spamming or posting misleading information</li>
                            <li>Attempting to circumvent platform fees or policies</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Listing Guidelines</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            All listings must include accurate descriptions, fair pricing, and clear images.
                            Misleading listings may be removed, and repeat offenders may face account suspension.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Liability</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            LearnCart acts as a platform to connect buyers and sellers. We are not responsible for
                            disputes, quality of items, or completion of transactions. Users engage at their own risk.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Account Termination</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            We reserve the right to suspend or terminate accounts that violate these terms or
                            engage in prohibited activities.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact</h2>
                        <p className="text-gray-700 leading-relaxed">
                            For questions about these terms, contact us at{' '}
                            <a href="mailto:support@learncart.com" className="text-indigo-600 hover:underline">
                                support@learncart.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
