import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LeadExtraction from '@/models/LeadExtraction';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// GET - Search lead extraction entries by customer name
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
    const entries = await LeadExtraction.find({})
      .populate({
        path: 'customerId',
        select: 'name',
        options: { strictPopulate: false } // Allow missing customerId
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
            totalBatteryWeight: 0,
            totalLeadWeight: 0,
            totalLeadReceived: 0,
            totalLeadPending: 0,
            averageCompletion: 0,
            uniqueCustomers: 0,
            customerNames: []
          },
          searchTerm: searchTerm.trim(),
          dateFilter: null // No date filter - showing all dates
        }
      });
    }

    // Calculate summary statistics for search results
    const totalBatteryWeight = filteredEntries.reduce((sum, entry) => sum + (entry.batteryWeight || 0), 0);
    const totalLeadWeight = filteredEntries.reduce((sum, entry) => sum + (entry.leadWeight || 0), 0);
    const totalLeadReceived = filteredEntries.reduce((sum, entry) => sum + (entry.leadReceived || 0), 0);
    const totalLeadPending = filteredEntries.reduce((sum, entry) => sum + (entry.leadPending || 0), 0);
    const averageCompletion = totalLeadWeight > 0 ? (totalLeadReceived / totalLeadWeight * 100) : 0;

    // Get unique customers
    const uniqueCustomers = [...new Set(filteredEntries.map(entry => entry.customerId?.name).filter(Boolean))];
    const customerNames = uniqueCustomers;

    return NextResponse.json({
      success: true,
      data: {
        entries: filteredEntries,
        summary: {
          totalEntries: filteredEntries.length,
          totalBatteryWeight: totalBatteryWeight,
          totalLeadWeight: totalLeadWeight,
          totalLeadReceived: totalLeadReceived,
          totalLeadPending: totalLeadPending,
          averageCompletion: averageCompletion,
          uniqueCustomers: uniqueCustomers.length,
          customerNames: customerNames
        },
        searchTerm: searchTerm.trim(),
        dateFilter: null // No date filter - showing all dates
      }
    });
  } catch (error) {
    console.error('Error searching lead extraction entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search lead extraction entries' },
      { status: 500 }
    );
  }
}