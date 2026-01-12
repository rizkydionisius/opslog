
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check if we are checking the dashboard path
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const sessionToken = request.cookies.get('session_token')

        if (!sessionToken) {
            // Redirect to login if no token
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*'],
}
