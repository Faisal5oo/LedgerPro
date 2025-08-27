import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LedgerEntry from '@/models/LedgerEntry';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// GET - Search ledger entries by customer name
export async function GET(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('q');
    const date = searchParams.get('date');
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search term must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Build query - search by customer name through population
    // Don't filter by date - show ALL entries for the customer across all dates
    let query = {};

    // Search entries with customer population - get ALL entries
    const entries = await LedgerEntry.find(query)
      .populate('customerId', 'name')
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
            netBalance: 0,
            uniqueCustomers: 0,
            customerNames: []
          },
          searchTerm: searchTerm.trim(),
          dateFilter: null // No date filter - showing all dates
        }
      });
    }

    // Calculate summary statistics for search results
    const totalEntries = filteredEntries.length;
    const totalWeight = filteredEntries.reduce((sum, entry) => sum + (entry.totalWeight || 0), 0);
    const totalCredit = filteredEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const totalDebit = filteredEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const netBalance = totalCredit - totalDebit;

    // Get unique customers from search results
    const uniqueCustomers = [...new Set(filteredEntries.map(entry => 
      entry.customerId?.name || 'Unknown'
    ))];

    // Calculate running balance for each entry
    let runningBalance = 0;
    const entriesWithBalance = filteredEntries.map(entry => {
      runningBalance += (entry.credit || 0) - (entry.debit || 0);
      return { ...entry, balance: runningBalance };
    });

    const searchResults = {
      entries: entriesWithBalance,
      summary: {
        totalEntries,
        totalWeight,
        totalCredit,
        totalDebit,
        netBalance,
        uniqueCustomers: uniqueCustomers.length,
        customerNames: uniqueCustomers
      },
      searchTerm: searchTerm.trim(),
      dateFilter: null // No date filter - showing all dates
    };
    
    return NextResponse.json({ 
      success: true, 
      data: searchResults 
    });
  } catch (error) {
    console.error('Error searching ledger entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search ledger entries' },
      { status: 500 }
    );
  }
}
