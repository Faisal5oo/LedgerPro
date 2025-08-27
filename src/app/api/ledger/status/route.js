import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LedgerEntry from '@/models/LedgerEntry';
import Customer from '@/models/Customer';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// GET - Check database status and identify issues
export async function GET(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    
    // Check total entries
    const totalEntries = await LedgerEntry.countDocuments();
    
    // Check entries without customerId
    const entriesWithoutCustomerId = await LedgerEntry.countDocuments({ 
      $or: [
        { customerId: { $exists: false } },
        { customerId: null },
        { customerId: '' }
      ]
    });
    
    // Check entries with customerId
    const entriesWithCustomerId = await LedgerEntry.countDocuments({ 
      customerId: { $exists: true, $ne: null, $ne: '' }
    });
    
    // Check total customers
    const totalCustomers = await Customer.countDocuments();
    
    // Check for any validation errors
    let validationErrors = [];
    try {
      await LedgerEntry.find().limit(1).lean();
    } catch (error) {
      validationErrors.push(`LedgerEntry model error: ${error.message}`);
    }
    
    try {
      await Customer.find().limit(1).lean();
    } catch (error) {
      validationErrors.push(`Customer model error: ${error.message}`);
    }
    
    return NextResponse.json({
      success: true,
      database: {
        totalEntries,
        entriesWithoutCustomerId,
        entriesWithCustomerId,
        totalCustomers
      },
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      needsMigration: entriesWithoutCustomerId > 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Status check failed: ' + error.message },
      { status: 500 }
    );
  }
}
