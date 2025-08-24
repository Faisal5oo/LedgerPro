import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret";

export async function isAdmin(req) {
  try {
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return false;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    return !!decoded.id;
  } catch (error) {
    return false;
  }
}

export async function adminProtectedRoute(req) {
  const isAdminUser = await isAdmin(req);
  
  if (!isAdminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  
  return null; // Continue with the request
}
