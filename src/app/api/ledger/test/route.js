import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// GET - Test endpoint to check if API is working
export async function GET(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ledger API is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed: ' + error.message },
      { status: 500 }
    );
  }
}
