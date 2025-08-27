import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LeadSelling from '@/models/LeadSelling';
import { adminProtectedRoute } from '@/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET - Fetch all lead selling entries for a specific customer
export async function GET(req, { params }) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }
    
    // Find all lead selling entries for this customer, sorted by date and creation time
    const entries = await LeadSelling.find({ customerId: id })
      .populate('customerId', 'name')
      .sort({ date: 1, createdAt: 1 })
      .lean();
    
    if (entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No lead selling entries found for this customer' },
        { status: 404 }
      );
    }

    // Calculate summary statistics
    const totalWeight = entries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
    const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCommuteRent = entries.reduce((sum, entry) => sum + (entry.commuteRent || 0), 0);
    const netBalance = totalCredit - totalDebit;

    const customerData = {
      customer: entries[0].customerId,
      entries: entries,
      summary: {
        totalEntries: entries.length,
        totalWeight: totalWeight,
        totalCredit: totalCredit,
        totalDebit: totalDebit,
        totalCommuteRent: totalCommuteRent,
        netBalance: netBalance
      }
    };
    
    return NextResponse.json({ 
      success: true, 
      data: customerData 
    });
  } catch (error) {
    console.error('Error fetching customer lead selling entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer lead selling entries' },
      { status: 500 }
    );
  }
}
