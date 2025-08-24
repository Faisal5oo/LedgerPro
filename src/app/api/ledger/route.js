import { NextResponse } from 'next/server';
import { format, startOfDay, endOfDay } from 'date-fns';
import dbConnect from '@/lib/dbConnect';
import LedgerEntry from '@/models/LedgerEntry';
import { adminProtectedRoute } from '@/middleware/authMiddleware';
import mongoose from 'mongoose';

// Helper function to calculate running balance for a day
async function calculateDailyBalance(date) {
  const startDate = startOfDay(date);
  const endDate = endOfDay(date);
  
  const entries = await LedgerEntry.find({
    date: { $lte: endDate }
  }).sort({ date: 1, createdAt: 1 });
  
  let balance = 0;
  for (const entry of entries) {
    balance += entry.credit - entry.debit;
  }
  
  return balance;
}

// GET - Fetch all entries or filter by date
export async function GET(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    
    let query = {};
    if (date) {
      const startDate = startOfDay(new Date(date));
      const endDate = endOfDay(new Date(date));
      query = { date: { $gte: startDate, $lte: endDate } };
    }
    
    const entries = await LedgerEntry.find(query)
      .sort({ date: 1, createdAt: 1 })
      .lean();
    
    // Calculate running balance for each entry
    let runningBalance = 0;
    const entriesWithBalance = entries.map(entry => {
      runningBalance += entry.credit - entry.debit;
      return { ...entry, balance: runningBalance };
    });
    
    return NextResponse.json({ success: true, data: entriesWithBalance });
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ledger entries' },
      { status: 500 }
    );
  }
}

// POST - Create new entry
export async function POST(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const body = await req.json();
    
    // Calculate credit based on weight and rate
    const credit = body.totalWeight * body.ratePerKg;
    
    // Create new entry
    const entry = await LedgerEntry.create({
      ...body,
      credit,
      balance: 0 // Will be calculated on retrieval
    });
    
    // Calculate and update balance
    const balance = await calculateDailyBalance(entry.date);
    entry.balance = balance;
    
    return NextResponse.json(
      { success: true, data: entry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ledger entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ledger entry' },
      { status: 500 }
    );
  }
}

// PUT - Update entry
export async function PUT(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }
    
    // If weight or rate is updated, recalculate credit
    if (body.totalWeight !== undefined || body.ratePerKg !== undefined) {
      const entry = await LedgerEntry.findById(id);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Entry not found' },
          { status: 404 }
        );
      }
      
      const weight = body.totalWeight ?? entry.totalWeight;
      const rate = body.ratePerKg ?? entry.ratePerKg;
      body.credit = weight * rate;
    }
    
    const updatedEntry = await LedgerEntry.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedEntry) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    // Recalculate balance
    const balance = await calculateDailyBalance(updatedEntry.date);
    updatedEntry.balance = balance;
    
    return NextResponse.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('Error updating ledger entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ledger entry' },
      { status: 500 }
    );
  }
}

// DELETE - Remove entry
export async function DELETE(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    console.log('DELETE request received for ID:', id);
    console.log('ID type:', typeof id);
    console.log('ID value:', id);
    
    if (!id) {
      console.log('No ID provided');
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format:', id);
      return NextResponse.json(
        { success: false, error: 'Invalid entry ID format' },
        { status: 400 }
      );
    }
    
    const deletedEntry = await LedgerEntry.findByIdAndDelete(id);
    
    if (!deletedEntry) {
      console.log('Entry not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    console.log('Successfully deleted entry:', id);
    return NextResponse.json({ 
      success: true, 
      data: deletedEntry,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ledger entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete ledger entry' },
      { status: 500 }
    );
  }
}
