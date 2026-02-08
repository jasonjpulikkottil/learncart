import { Crown, CheckCircle } from 'lucide-react';

/**
 * Pro Badge component - displays verified seller badge for Pro users
 * Can be displayed in different sizes: 'sm', 'md', 'lg'
 */
export default function ProBadge({ size = 'md', showLabel = true, className = '' }) {
    const sizes = {
        sm: {
            container: 'px-1.5 py-0.5 gap-1',
            icon: 'w-3 h-3',
            text: 'text-xs',
        },
        md: {
            container: 'px-2 py-1 gap-1.5',
            icon: 'w-4 h-4',
            text: 'text-sm',
        },
        lg: {
            container: 'px-3 py-1.5 gap-2',
            icon: 'w-5 h-5',
            text: 'text-base',
        },
    };

    const s = sizes[size] || sizes.md;

    return (
        <span
            className={`inline-flex items-center ${s.container} bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 font-semibold rounded-full shadow-sm ${className}`}
            title="Pro Verified Seller"
        >
            <Crown className={s.icon} />
            {showLabel && <span className={s.text}>Pro</span>}
        </span>
    );
}

/**
 * Verified Badge - a checkmark variant for verified sellers
 */
export function VerifiedBadge({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <span
            className={`inline-flex items-center justify-center text-blue-500 ${className}`}
            title="Verified Seller"
        >
            <CheckCircle className={sizes[size] || sizes.md} />
        </span>
    );
}
