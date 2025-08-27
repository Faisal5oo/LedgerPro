import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LedgerEntry from '@/models/LedgerEntry';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// GET - Fetch all entries for a specific customer
export async function GET(req, { params }) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { name } = params;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Decode the customer name from URL
    const customerName = decodeURIComponent(name);
    
    // Find all entries for this customer, sorted by date and creation time
    const entries = await LedgerEntry.find({ 
      customerName: { $regex: new RegExp(customerName, 'i') } // Case-insensitive search
    })
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
      customerName: customerName,
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
