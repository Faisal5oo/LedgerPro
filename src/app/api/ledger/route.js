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
  }).populate('customerId', 'name')
    .sort({ date: 1, createdAt: 1 });
  
  let balance = 0;
  for (const entry of entries) {
    balance += entry.credit - entry.debit;
  }
  
  return balance;
}

// Helper function to check if customer has existing entry on the same day
async function findExistingCustomerEntry(customerId, date) {
  const startDate = startOfDay(date);
  const endDate = endOfDay(date);
  
  return await LedgerEntry.findOne({
    customerId: customerId,
    date: { $gte: startDate, $lte: endDate }
  });
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
      const endDate = endOfDay(date);
      query = { date: { $gte: startDate, $lte: endDate } };
    }
    
    const entries = await LedgerEntry.find(query)
      .populate('customerId', 'name')
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

// POST - Create new entry or update existing customer entry for the same day
export async function POST(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const body = await req.json();
    
    console.log('POST request body:', body);
    
    // Validate required fields
    if (!body.customerId) {
      console.error('Missing customerId in request body');
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.date) {
      console.error('Missing date in request body');
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }
    
    if (!body.totalWeight || body.totalWeight <= 0) {
      console.error('Invalid totalWeight in request body:', body.totalWeight);
      return NextResponse.json(
        { success: false, error: 'Valid total weight is required' },
        { status: 400 }
      );
    }
    
    if (!body.ratePerKg || body.ratePerKg <= 0) {
      console.error('Invalid ratePerKg in request body:', body.ratePerKg);
      return NextResponse.json(
        { success: false, error: 'Valid rate per kg is required' },
        { status: 400 }
      );
    }
    
    // Validate that the customer exists
    try {
      const Customer = (await import('@/models/Customer')).default;
      const customer = await Customer.findById(body.customerId);
      if (!customer) {
        console.error('Customer not found with ID:', body.customerId);
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }
    } catch (customerError) {
      console.error('Error validating customer:', customerError);
      return NextResponse.json(
        { success: false, error: 'Error validating customer' },
        { status: 500 }
      );
    }
    
    // Check if customer already has an entry on the same day
    const existingEntry = await findExistingCustomerEntry(body.customerId, new Date(body.date));
    
    if (existingEntry) {
      console.log('Found existing entry for same customer on same day:', existingEntry._id);
      // Update existing entry by adding new weight to weightLogs
      const newWeightLog = {
        weight: body.totalWeight,
        time: new Date()
      };
      
      const newTotalWeight = existingEntry.totalWeight + body.totalWeight;
      const newCredit = newTotalWeight * body.ratePerKg;
      
      const updatedEntry = await LedgerEntry.findByIdAndUpdate(
        existingEntry._id,
        {
          $push: { weightLogs: newWeightLog },
          $set: {
            totalWeight: newTotalWeight,
            credit: newCredit,
            notes: body.notes || existingEntry.notes
          }
        },
        { new: true, runValidators: true }
      ).populate('customerId', 'name');
      
      // Recalculate balance
      const balance = await calculateDailyBalance(updatedEntry.date);
      updatedEntry.balance = balance;
      
      return NextResponse.json(
        { 
          success: true, 
          data: updatedEntry,
          message: `Weight added to existing customer entry. Total weight: ${newTotalWeight.toFixed(2)} kg`
        },
        { status: 200 }
      );
    } else {
      console.log('Creating new entry for customer:', body.customerId);
      // Create new entry
      const credit = body.totalWeight * body.ratePerKg;
      const weightLog = {
        weight: body.totalWeight,
        time: new Date()
      };
      
      const entry = await LedgerEntry.create({
        ...body,
        credit,
        balance: 0, // Will be calculated on retrieval
        weightLogs: [weightLog]
      });
      
      // Populate customer information
      await entry.populate('customerId', 'name');
      
      // Calculate and update balance
      const balance = await calculateDailyBalance(entry.date);
      entry.balance = balance;
      
      return NextResponse.json(
        { success: true, data: entry },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error creating/updating ledger entry:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create/update ledger entry: ' + error.message },
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

      // Handle weight addition
      if (body.addWeight !== undefined) {
        const entry = await LedgerEntry.findById(id);
        if (!entry) {
          return NextResponse.json(
            { success: false, error: 'Entry not found' },
            { status: 404 }
          );
        }

        // Add new weight to weightLogs
        const newWeightLog = {
          weight: body.addWeight,
          time: new Date()
        };

        const newTotalWeight = entry.totalWeight + body.addWeight;
        const newCredit = newTotalWeight * entry.ratePerKg;

        const updatedEntry = await LedgerEntry.findByIdAndUpdate(
          id,
          {
            $push: { weightLogs: newWeightLog },
            $set: { 
              totalWeight: newTotalWeight, 
              credit: newCredit 
            }
          },
          { new: true, runValidators: true }
        ).populate('customerId', 'name');

        if (!updatedEntry) {
          return NextResponse.json(
            { success: false, error: 'Failed to update entry' },
            { status: 500 }
          );
        }

        // Recalculate balance
        const balance = await calculateDailyBalance(updatedEntry.date);
        updatedEntry.balance = balance;

        return NextResponse.json({ 
          success: true, 
          data: updatedEntry,
          message: `Weight added successfully. New total: ${newTotalWeight.toFixed(2)} kg`
        });
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
      ).populate('customerId', 'name');
      
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
