import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If not authenticated, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',                 // Dashboard
    '/ledger',           // Ledger page
    '/lead-extraction',  // Lead Extraction page
    '/api/dashboard/:path*', // Dashboard API
    '/api/ledger',       // Ledger API
    '/api/lead-extraction', // Lead Extraction API
  ],
};
