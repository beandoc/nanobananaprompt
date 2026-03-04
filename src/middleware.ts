import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis for Ratelimiting (only if env vars are present)
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests every 10 seconds per IP
        analytics: true,
    });
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /api routes
    if (pathname.startsWith("/api")) {
        // 1. Authentication Check
        const authHeader = request.headers.get("authorization");
        const adminSecret = process.env.APP_ADMIN_SECRET;

        if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid or missing Admin Secret" },
                { status: 401 }
            );
        }

        // 2. Rate Limiting Check
        if (ratelimit) {
            const forwarded = request.headers.get("x-forwarded-for");
            const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
            const { success, limit, reset, remaining } = await ratelimit.limit(ip);

            if (!success) {
                return NextResponse.json(
                    { error: "Rate limit exceeded. Slow down, Banana." },
                    {
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                        },
                    }
                );
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
