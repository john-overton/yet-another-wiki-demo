import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT = {
    windowMs: 60 * 1000, // 1 minute
    max: 100 // limit each IP to 100 requests per minute
};

// IP blocking configuration
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_FAILED_ATTEMPTS = 3;

// Use KV store for persistence (Edge compatible)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const failedAttemptsStore = new Map<string, { count: number; lastAttempt: number }>();
const blockedIPs = new Map<string, number>();

async function blockIP(ip: string) {
    try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/block-ip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip })
        });

        if (!response.ok) {
            console.error('Failed to persist IP block:', await response.text());
        }
    } catch (error) {
        console.error('Error persisting IP block:', error);
    }
}

export async function middleware(request: NextRequest) {
    // Skip middleware for NextAuth session endpoints
    if (request.nextUrl.pathname.startsWith('/api/auth/session')) {
        return NextResponse.next();
    }

    // Skip middleware for CSRF token endpoint
    if (request.nextUrl.pathname.startsWith('/api/auth/csrf')) {
        return NextResponse.next();
    }

    // Get client IP
    const ip = request.headers.get('x-real-ip') || 
               request.headers.get('x-forwarded-for') || 
               '127.0.0.1';

    // Check if IP is blocked
    const blockExpiry = blockedIPs.get(ip);
    if (blockExpiry) {
        if (Date.now() < blockExpiry) {
            return new NextResponse(null, {
                status: 403,
                statusText: 'Forbidden: Your IP has been blocked'
            });
        } else {
            blockedIPs.delete(ip);
            failedAttemptsStore.delete(ip);
        }
    }

    // Track failed login attempts
    if (request.nextUrl.pathname === '/api/auth/callback/credentials' && request.method === 'POST') {
        const failedAttempts = failedAttemptsStore.get(ip) || { count: 0, lastAttempt: Date.now() };
        
        // Reset count if last attempt was more than 24 hours ago
        if (Date.now() - failedAttempts.lastAttempt > BLOCK_DURATION) {
            failedAttempts.count = 0;
        }

        failedAttempts.count++;
        failedAttempts.lastAttempt = Date.now();
        failedAttemptsStore.set(ip, failedAttempts);

        if (failedAttempts.count >= MAX_FAILED_ATTEMPTS) {
            blockedIPs.set(ip, Date.now() + BLOCK_DURATION);
            // Persist IP block
            await blockIP(ip);
            return new NextResponse(null, {
                status: 403,
                statusText: 'Forbidden: Too many failed login attempts'
            });
        }
    }

    // Rate limiting
    const now = Date.now();
    const rateLimit = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT.windowMs };

    // Reset count if window has passed
    if (now > rateLimit.resetTime) {
        rateLimit.count = 0;
        rateLimit.resetTime = now + RATE_LIMIT.windowMs;
    }

    rateLimit.count++;
    rateLimitStore.set(ip, rateLimit);

    if (rateLimit.count > RATE_LIMIT.max) {
        // Block IP if rate limit is exceeded
        blockedIPs.set(ip, now + BLOCK_DURATION);
        // Persist IP block
        await blockIP(ip);
        
        return new NextResponse(null, {
            status: 429,
            statusText: 'Too Many Requests'
        });
    }

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.max.toString());
    response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT.max - rateLimit.count).toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

    return response;
}

export const config = {
    matcher: [
        '/api/auth/:path*',
        '/auth/:path*'
    ]
};
