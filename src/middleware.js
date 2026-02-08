import { NextResponse } from 'next/server';

// Initialize admin account on first request
let adminInitialized = false;

export async function middleware(request) {
    // Initialize admin account once
    if (!adminInitialized) {
        try {
            const { initializeAdmin } = await import('./lib/init-admin');
            await initializeAdmin();
            adminInitialized = true;
        } catch (error) {
            console.error('Admin initialization error:', error);
        }
    }

    return NextResponse.next();
}

// Run middleware on all routes
export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
