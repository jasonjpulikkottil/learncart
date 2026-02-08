import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | LearnCart',
    description: 'Privacy policy for LearnCart student marketplace',
};

export default function PrivacyPage() {
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-600 mb-8">Last updated: February 2026</p>

                    <div className="prose prose-indigo max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Introduction</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Welcome to LearnCart. We respect your privacy and are committed to protecting your personal information.
                            This Privacy Policy explains how we collect, use, and safeguard your data.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                            <li>Account information (name, email, password)</li>
                            <li>Profile information (phone number, location - optional)</li>
                            <li>Listing details (titles, descriptions, images, prices)</li>
                            <li>Usage data (pages visited, interactions)</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                            <li>To provide and maintain our marketplace services</li>
                            <li>To enable communication between buyers and sellers</li>
                            <li>To improve our platform and user experience</li>
                            <li>To send important updates about your account</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            We implement industry-standard security measures to protect your personal information.
                            Passwords are encrypted, and we use secure connections (HTTPS) for all data transmission.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            You have the right to access, update, or delete your personal information at any time
                            through your account settings.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at{' '}
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
