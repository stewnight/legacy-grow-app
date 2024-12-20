import { auth } from '~/server/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/']

export default async function middleware(request: NextRequest) {
  const session = await auth()
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // If not logged in and trying to access a protected route, redirect to home
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If logged in and trying to access home, redirect to dashboard
  if (session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.svg|public).*)'],
}
