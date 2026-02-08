/**
 * Admin Authentication Utilities
 * 
 * Helper functions for checking admin permissions
 */

import { auth } from './auth';
import { NextResponse } from 'next/server';

/**
 * Check if the current session user is an admin
 * @param {Object} session - NextAuth session object
 * @returns {boolean} True if user is admin
 */
export function isAdmin(session) {
    return session?.user?.isAdmin === true;
}

/**
 * Middleware to protect admin API routes
 * Returns error response if user is not admin
 * @returns {Promise<{session: Object} | {error: string, status: number}>}
 */
export async function requireAdmin() {
    const session = await auth();

    if (!session?.user) {
        return {
            error: 'Not authenticated',
            status: 401
        };
    }

    if (!session.user.isAdmin) {
        return {
            error: 'Admin access required',
            status: 403
        };
    }

    return { session }; // Return session if authorized
}

/**
 * Legacy function - kept for compatibility
 * Middleware to protect admin API routes
 * Returns error response if user is not admin
 * @returns {Promise<NextResponse|null>} Error response or null if authorized
 */
export async function protectAdminRoute() {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        );
    }

    if (!session.user.isAdmin) {
        return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
        );
    }

    return null; // No error, user is authorized
}
