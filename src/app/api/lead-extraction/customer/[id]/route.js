import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LeadExtraction from '@/models/LeadExtraction';
import { adminProtectedRoute } from '@/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET - Fetch all lead extraction entries for a specific customer
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
    
    // Find all lead extraction entries for this customer, sorted by date and creation time
    const entries = await LeadExtraction.find({ customerId: id })
      .populate('customerId', 'name')
      .sort({ date: 1, createdAt: 1 })
      .lean();
    
    if (entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No lead extraction entries found for this customer' },
        { status: 404 }
      );
    }

    // Calculate summary statistics
    const totalBatteryWeight = entries.reduce((sum, entry) => sum + (entry.batteryWeight || 0), 0);
    const totalLeadWeight = entries.reduce((sum, entry) => sum + (entry.leadWeight || 0), 0);
    const totalLeadReceived = entries.reduce((sum, entry) => sum + (entry.leadReceived || 0), 0);
    const totalLeadPending = entries.reduce((sum, entry) => sum + (entry.leadPending || 0), 0);
    const averageCompletion = totalLeadWeight > 0 ? (totalLeadReceived / totalLeadWeight * 100) : 0;

    const customerData = {
      customer: entries[0].customerId,
      entries: entries,
      summary: {
        totalEntries: entries.length,
        totalBatteryWeight: totalBatteryWeight,
        totalLeadWeight: totalLeadWeight,
        totalLeadReceived: totalLeadReceived,
        totalLeadPending: totalLeadPending,
        averageCompletion: averageCompletion
      }
    };
    
    return NextResponse.json({ 
      success: true, 
      data: customerData 
    });
  } catch (error) {
    console.error('Error fetching customer lead extraction entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer lead extraction entries' },
      { status: 500 }
    );
  }
}
