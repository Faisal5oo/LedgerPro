import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LeadSelling from '@/models/LeadSelling';
import Customer from '@/models/Customer';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// GET - Fetch lead selling entries
export async function GET(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const id = searchParams.get('id');
    
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
    
    if (id) {
      query._id = id;
    }
    
    console.log('Final query:', query);
    
    const entries = await LeadSelling.find(query)
      .populate({
        path: 'customerId',
        select: 'name',
        options: { strictPopulate: false }
      })
      .sort({ date: 1, createdAt: 1 })
      .lean();
    
    console.log('Fetched entries:', entries.length);
    console.log('Sample entry:', entries[0]);
    
    console.log('Found entries:', entries.length);
    
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching lead selling entries:', error);
    console.error('Error details:', { name: error.name, message: error.message, stack: error.stack });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lead selling entries', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new lead selling entry
export async function POST(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const body = await req.json();
    
    console.log('Creating lead selling entry with data:', body);
    console.log('Date received:', body.date, 'Type:', typeof body.date);
    console.log('Customer ID received:', body.customerId);
    
    // Parse date if it's a string
    if (typeof body.date === 'string') {
      body.date = new Date(body.date);
      console.log('Parsed date:', body.date);
    }
    
    // Validate required fields
    if (!body.customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a payment-only entry
    const isPaymentOnly = body.isPaymentOnly === true;

    if (isPaymentOnly) {
      // For payment-only entries, validate payment amount
      if (!body.debit || parseFloat(body.debit) <= 0) {
        return NextResponse.json(
          { success: false, error: 'Valid payment amount is required for payment entries' },
          { status: 400 }
        );
      }
      
      // Create payment entry with default values
      const paymentEntry = {
        customerId: body.customerId,
        date: body.date,
        commuteRent: 0,
        weight: 0,
        rate: 0,
        debit: parseFloat(body.debit),
        credit: 0,
        balance: -parseFloat(body.debit),
        notes: body.notes || '',
        isPaymentOnly: true
      };
      
      const entry = await LeadSelling.create(paymentEntry);
      await entry.populate('customerId', 'name');
      
      console.log('Successfully created payment entry:', entry);
      return NextResponse.json(
        { success: true, data: entry, message: 'Payment entry created successfully' },
        { status: 201 }
      );
    }

    // For regular lead selling entries
    if (!body.weight || isNaN(body.weight)) {
      return NextResponse.json(
        { success: false, error: 'Valid weight is required' },
        { status: 400 }
      );
    }

    if (!body.rate || isNaN(body.rate)) {
      return NextResponse.json(
        { success: false, error: 'Valid rate is required' },
        { status: 400 }
      );
    }

    if (body.debit === '' || isNaN(parseFloat(body.debit))) {
      return NextResponse.json(
        { success: false, error: 'Valid debit amount is required' },
        { status: 400 }
      );
    }

    if (body.commuteRent === '' || isNaN(parseFloat(body.commuteRent))) {
      return NextResponse.json(
        { success: false, error: 'Valid commute rent is required' },
        { status: 400 }
      );
    }
    
    // Calculate credit and balance
    const weight = parseFloat(body.weight);
    const rate = parseFloat(body.rate);
    const debit = parseFloat(body.debit) || 0;
    const commuteRent = parseFloat(body.commuteRent) || 0;
    
    // Credit = (weight * rate) + commute rent
    const credit = Math.round((weight * rate + commuteRent) * 100) / 100;
    const balance = Math.round((credit - debit) * 100) / 100;
    
    // Set default values for regular entries
    body.isPaymentOnly = false;
    
    // Create new entry with complete data
    const entry = await LeadSelling.create({
      ...body,
      credit,
      balance
    });
    
    // Populate customer information
    await entry.populate('customerId', 'name');
    
    console.log('Successfully created entry:', entry);
    
    return NextResponse.json(
      { success: true, data: entry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead selling entry:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create lead selling entry: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update lead selling entry
export async function PUT(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Recalculate values if weight, rate, debit, or commuteRent changed
    if (body.weight !== undefined || body.rate !== undefined || body.debit !== undefined || body.commuteRent !== undefined) {
      const currentEntry = await LeadSelling.findById(id);
      if (!currentEntry) {
        return NextResponse.json(
          { success: false, error: 'Entry not found' },
          { status: 404 }
        );
      }

      const weight = body.weight !== undefined ? body.weight : currentEntry.weight;
      const rate = body.rate !== undefined ? body.rate : currentEntry.rate;
      const debit = body.debit !== undefined ? body.debit : currentEntry.debit;
      const commuteRent = body.commuteRent !== undefined ? body.commuteRent : currentEntry.commuteRent;

      // Recalculate
      body.credit = Math.round((weight * rate + commuteRent) * 100) / 100;
      body.balance = Math.round((body.credit - debit) * 100) / 100;
    }
    
    const updatedEntry = await LeadSelling.findByIdAndUpdate(
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
    
    // Populate customer information
    await updatedEntry.populate('customerId', 'name');
    
    return NextResponse.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('Error updating lead selling entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead selling entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead selling entry
export async function DELETE(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const deletedEntry = await LeadSelling.findByIdAndDelete(id);
    
    if (!deletedEntry) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: deletedEntry });
  } catch (error) {
    console.error('Error deleting lead selling entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead selling entry' },
      { status: 500 }
    );
  }
}
