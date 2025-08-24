import { NextResponse } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';
import dbConnect from '@/lib/dbConnect';
import LeadExtraction from '@/models/LeadExtraction';
import { adminProtectedRoute } from '@/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET - Fetch all entries or filter by date
export async function GET(req) {
  try {
    console.log('=== GET /api/lead-extraction ===');
    
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) {
      console.log('Auth error:', authError);
      return authError;
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    
    console.log('Date parameter received:', date);
    
    let query = {};
    if (date) {
      // Parse the date and create a range for the entire day
      const targetDate = new Date(date);
      const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
      
      query = { date: { $gte: startDate, $lt: endDate } };
      console.log('Date query:', { 
        originalDate: date,
        targetDate: targetDate,
        startDate, 
        endDate, 
        query 
      });
    }
    
    console.log('Final query:', query);
    
    const entries = await LeadExtraction.find(query)
      .sort({ date: 1, createdAt: 1 })
      .lean();
    
    console.log('Found entries:', entries.length);
    
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('=== ERROR in GET /api/lead-extraction ===');
    console.error('Error fetching lead extraction entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lead extraction entries' },
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
    
    console.log('Creating lead extraction entry with data:', body);
    console.log('Date received:', body.date, 'Type:', typeof body.date);
    
    // Parse date if it's a string
    if (typeof body.date === 'string') {
      body.date = new Date(body.date);
      console.log('Parsed date:', body.date);
    }
    
    // Validate required fields
    if (!body.batteryWeight || isNaN(body.batteryWeight)) {
      return NextResponse.json(
        { success: false, error: 'Valid battery weight is required' },
        { status: 400 }
      );
    }
    
    // Allow leadReceived to be 0, but ensure it's a valid number
    if (body.leadReceived === undefined || body.leadReceived === null || isNaN(body.leadReceived)) {
      return NextResponse.json(
        { success: false, error: 'Valid lead received amount is required (can be 0)' },
        { status: 400 }
      );
    }
    
    // Validate calculated fields are present
    if (!body.leadWeight || !body.leadPending || body.percentage === undefined) {
      return NextResponse.json(
        { success: false, error: 'Calculated fields are missing. Please recalculate on frontend.' },
        { status: 400 }
      );
    }
    
    // Create new entry with complete data
    const entry = await LeadExtraction.create(body);
    
    console.log('Successfully created entry:', entry);
    
    return NextResponse.json(
      { success: true, data: entry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead extraction entry:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Return more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: `Validation failed: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create lead extraction entry' },
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
    
    // Recalculate values if batteryWeight or leadReceived changed
    if (body.batteryWeight !== undefined || body.leadReceived !== undefined) {
      const currentEntry = await LeadExtraction.findById(id);
      if (!currentEntry) {
        return NextResponse.json(
          { success: false, error: 'Entry not found' },
          { status: 404 }
        );
      }
      
      const batteryWeight = body.batteryWeight !== undefined ? body.batteryWeight : currentEntry.batteryWeight;
      const leadReceived = body.leadReceived !== undefined ? body.leadReceived : currentEntry.leadReceived;
      
      // Recalculate
      body.leadWeight = Math.round((batteryWeight * 0.6) * 100) / 100;
      body.leadPending = Math.round((body.leadWeight - leadReceived) * 100) / 100;
      body.percentage = body.leadWeight > 0 ? Math.round((leadReceived / body.leadWeight) * 100) : 0;
    }
    
    const updatedEntry = await LeadExtraction.findByIdAndUpdate(
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
    
    return NextResponse.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('Error updating lead extraction entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead extraction entry' },
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
    
    const deletedEntry = await LeadExtraction.findByIdAndDelete(id);
    
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
    console.error('Error deleting lead extraction entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead extraction entry' },
      { status: 500 }
    );
  }
}
