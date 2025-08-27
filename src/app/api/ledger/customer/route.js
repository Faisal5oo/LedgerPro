import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LedgerEntry from '@/models/LedgerEntry';
import { adminProtectedRoute } from '@/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET - Fetch all entries for a specific customer
export async function GET(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    
    // Get customerId from query parameters
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }
    
    // Find all entries for this customer, sorted by date and creation time
    const entries = await LedgerEntry.find({ customerId: customerId })
      .populate('customerId', 'name')
      .sort({ date: 1, createdAt: 1 })
      .lean();
    
    if (entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No entries found for this customer' },
        { status: 404 }
      );
    }

    // Calculate summary statistics
    const totalWeight = entries.reduce((sum, entry) => sum + entry.totalWeight, 0);
    const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
    const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const netBalance = totalCredit - totalDebit;

    const customerData = {
      customer: entries[0].customerId,
      entries: entries,
      totalWeight: totalWeight,
      totalCredit: totalCredit,
      totalDebit: totalDebit,
      netBalance: netBalance
    };
    
    return NextResponse.json({ 
      success: true, 
      data: customerData 
    });
  } catch (error) {
    console.error('Error fetching customer entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer entries' },
      { status: 500 }
    );
  }
}
