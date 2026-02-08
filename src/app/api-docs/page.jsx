'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI with no SSR to avoid window/document issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">LearnCart API Documentation</h1>
                    <p className="text-gray-600 mt-2">
                        Interactive API documentation for the LearnCart student marketplace
                    </p>
                </div>
            </div>

            {/* Swagger UI */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SwaggerUI url="/api/docs" />
            </div>
        </div>
    );
}
