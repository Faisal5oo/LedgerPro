import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LeadSelling from '@/models/LeadSelling';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// GET - Search lead selling entries by customer name
export async function GET(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('q');
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search term must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Search entries with customer population - get ALL entries
    const entries = await LeadSelling.find({})
      .populate({
        path: 'customerId',
        select: 'name',
        options: { strictPopulate: false }
      })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Filter entries by customer name after population
    const filteredEntries = entries.filter(entry => {
      const customerName = entry.customerId?.name || '';
      return customerName.toLowerCase().includes(searchTerm.trim().toLowerCase());
    });

    // If no entries found, return empty result
    if (filteredEntries.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          entries: [],
          summary: {
            totalEntries: 0,
            totalWeight: 0,
            totalCredit: 0,
            totalDebit: 0,
            totalCommuteRent: 0,
            netBalance: 0,
            uniqueCustomers: 0,
            customerNames: []
          },
          searchTerm: searchTerm.trim(),
          dateFilter: null
        }
      });
    }

    // Calculate summary statistics for search results
    const totalWeight = filteredEntries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
    const totalCredit = filteredEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const totalDebit = filteredEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCommuteRent = filteredEntries.reduce((sum, entry) => sum + (entry.commuteRent || 0), 0);
    const netBalance = totalCredit - totalDebit;

    // Get unique customers
    const uniqueCustomers = [...new Set(filteredEntries.map(entry => entry.customerId?.name).filter(Boolean))];
    const customerNames = uniqueCustomers;

    return NextResponse.json({
      success: true,
      data: {
        entries: filteredEntries,
        summary: {
          totalEntries: filteredEntries.length,
          totalWeight: totalWeight,
          totalCredit: totalCredit,
          totalDebit: totalDebit,
          totalCommuteRent: totalCommuteRent,
          netBalance: netBalance,
          uniqueCustomers: uniqueCustomers.length,
          customerNames: customerNames
        },
        searchTerm: searchTerm.trim(),
        dateFilter: null
      }
    });
  } catch (error) {
    console.error('Error searching lead selling entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search lead selling entries' },
      { status: 500 }
    );
  }
}
