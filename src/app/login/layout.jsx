import { Suspense } from 'react';

export const metadata = {
    title: 'Sign In | LearnCart',
    description: 'Sign in to your LearnCart account to buy, sell, and swap items.',
};

export default function LoginLayout({ children }) {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        }>
            {children}
        </Suspense>
    );
}
