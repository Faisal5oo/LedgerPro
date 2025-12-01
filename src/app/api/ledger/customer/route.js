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
    const allEntries = await LedgerEntry.find({ customerId: customerId })
      .populate('customerId', 'name')
      .sort({ date: 1, createdAt: 1 })
      .lean();
    
    // Separate ledger entries from payment-only entries
    // An entry is considered a payment if:
    // 1. Explicitly marked as isPaymentOnly === true, OR
    // 2. Has debit > 0, credit = 0 (or very small), and totalWeight = 0 (or very small) (payment pattern)
    const isPaymentEntry = (entry) => {
      // Check explicit flag first
      if (entry.isPaymentOnly === true) {
        return true;
      }
      
      // Check payment pattern: debit > 0, credit = 0, weight = 0
      const debit = parseFloat(entry.debit) || 0;
      const credit = parseFloat(entry.credit) || 0;
      const weight = parseFloat(entry.totalWeight) || 0;
      
      // Payment pattern: has debit but no credit and no weight
      if (debit > 0 && credit === 0 && weight === 0) {
        return true;
      }
      
      return false;
    };
    
    const entries = allEntries.filter(entry => !isPaymentEntry(entry));
    const payments = allEntries.filter(entry => isPaymentEntry(entry));
    
    console.log(`Customer ${customerId}: Found ${entries.length} ledger entries and ${payments.length} payment entries`);
    if (payments.length > 0) {
      console.log('Payment entries:', payments.map(p => ({
        id: p._id,
        date: p.date,
        debit: p.debit,
        credit: p.credit,
        weight: p.totalWeight,
        isPaymentOnly: p.isPaymentOnly
      })));
    }
    
    // Get customer information
    let customer;
    if (allEntries.length > 0) {
      customer = allEntries[0].customerId;
    } else {
      // If no entries, fetch customer directly
      const Customer = (await import('@/models/Customer')).default;
      customer = await Customer.findById(customerId);
      if (!customer) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }
    }

    // Calculate summary statistics for ledger entries
    const totalWeight = entries.reduce((sum, entry) => sum + (entry.totalWeight || 0), 0);
    const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    
    // Calculate total received from payment entries
    const totalReceived = payments.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    
    // Net balance = total credit - (debit from entries + payments)
    const netBalance = totalCredit - totalDebit - totalReceived;

    const customerData = {
      customer: customer,
      entries: entries,
      payments: payments,
      totalWeight: totalWeight,
      totalCredit: totalCredit,
      totalDebit: totalDebit,
      totalReceived: totalReceived,
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
