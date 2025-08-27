import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LedgerEntry from '@/models/LedgerEntry';
import Customer from '@/models/Customer';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// POST - Migrate existing ledger entries to new structure
export async function POST(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    
    // Find all entries without customerId (old structure)
    const entriesWithoutCustomerId = await LedgerEntry.find({ 
      $or: [
        { customerId: { $exists: false } },
        { customerId: null },
        { customerId: '' }
      ]
    });

    console.log(`Found ${entriesWithoutCustomerId.length} entries without customerId`);

    if (entriesWithoutCustomerId.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No migration needed - all entries already have customerId' 
      });
    }

    let migratedCount = 0;
    let errors = [];

    for (const entry of entriesWithoutCustomerId) {
      try {
        // Create a default customer for this entry
        const defaultCustomerName = `Customer_${entry._id.toString().slice(-6)}`;
        
        // Check if customer already exists
        let customer = await Customer.findOne({ name: defaultCustomerName });
        
        if (!customer) {
          customer = await Customer.create({ name: defaultCustomerName });
        }

        // Update the entry with customerId and weightLogs
        await LedgerEntry.findByIdAndUpdate(entry._id, {
          $set: {
            customerId: customer._id,
            weightLogs: [{
              weight: entry.totalWeight || 0,
              time: entry.createdAt || new Date()
            }]
          }
        });

        migratedCount++;
        console.log(`Migrated entry ${entry._id} with customer ${customer.name}`);
      } catch (error) {
        console.error(`Error migrating entry ${entry._id}:`, error);
        errors.push(`Entry ${entry._id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${migratedCount} entries migrated successfully.`,
      migratedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed: ' + error.message },
      { status: 500 }
    );
  }
}
