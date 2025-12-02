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
    const allEntries = await LeadSelling.find({ customerId: id })
      .populate('customerId', 'name')
      .sort({ date: 1, createdAt: 1 })
      .lean();
    
    // Separate lead selling entries from payment-only entries
    const isPaymentEntry = (entry) => {
      if (entry.isPaymentOnly === true) {
        return true;
      }
      // Check payment pattern: has debit but no weight/credit
      const debit = parseFloat(entry.debit) || 0;
      const weight = parseFloat(entry.weight) || 0;
      const credit = parseFloat(entry.credit) || 0;
      if (debit > 0 && credit === 0 && weight === 0) {
        return true;
      }
      return false;
    };
    
    const entries = allEntries.filter(entry => !isPaymentEntry(entry));
    const payments = allEntries.filter(entry => isPaymentEntry(entry));
    
    // Get customer information
    let customer;
    if (allEntries.length > 0) {
      customer = allEntries[0].customerId;
    } else {
      // If no entries, fetch customer directly
      const Customer = (await import('@/models/Customer')).default;
      customer = await Customer.findById(id);
      if (!customer) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }
    }

    // Calculate summary statistics for lead selling entries only
    const totalWeight = entries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
    const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCommuteRent = entries.reduce((sum, entry) => sum + (entry.commuteRent || 0), 0);
    
    // Calculate total received from payment entries
    const totalReceived = payments.reduce((sum, entry) => sum + (parseFloat(entry.debit) || 0), 0);
    
    // Net balance = total credit - total debit (from entries) - total received (from payments)
    const netBalance = totalCredit - totalDebit - totalReceived;

    const customerData = {
      customer: customer,
      entries: entries,
      payments: payments,
      summary: {
        totalEntries: entries.length,
        totalWeight: totalWeight,
        totalCredit: totalCredit,
        totalDebit: totalDebit,
        totalCommuteRent: totalCommuteRent,
        totalReceived: totalReceived,
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
