import { Suspense } from 'react';

export const metadata = {
    title: 'Browse Listings | LearnCart',
    description: 'Browse and search for textbooks, electronics, furniture, and more from fellow students.',
};

export default function ListingsLayout({ children }) {
    return (
        <Suspense fallback={
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
            </div>
        }>
            {children}
        </Suspense>
    );
}
