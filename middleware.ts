import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { apiLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes first
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip rate limiting for routes that have their own specific rate limiters
    const skipRateLimitPaths = ['/api/contact', '/api/links/bulk-import'];

    if (!skipRateLimitPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
      const ip = getClientIp(request);
      const { success, limit, remaining, reset } = await checkRateLimit(apiLimiter, ip);

      if (!success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit?.toString() || '0',
              'X-RateLimit-Remaining': remaining?.toString() || '0',
              'X-RateLimit-Reset': reset?.toString() || '0',
            },
          }
        );
      }
    }
  }

  // Then handle Supabase session update
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
