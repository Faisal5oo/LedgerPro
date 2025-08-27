import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LeadExtraction from '@/models/LeadExtraction';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// POST - Migrate existing lead extraction entries to include missing fields
export async function POST(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    
    // Find all entries that don't have leadPercentage
    const entriesToUpdate = await LeadExtraction.find({
      $or: [
        { leadPercentage: { $exists: false } },
        { leadPercentage: null },
        { leadPercentage: undefined }
      ]
    });

    console.log(`Found ${entriesToUpdate.length} entries to migrate`);

    let updatedCount = 0;
    
    for (const entry of entriesToUpdate) {
      const updateData = {};
      
      // Set default leadPercentage if missing
      if (!entry.leadPercentage) {
        updateData.leadPercentage = 60; // Default to 60%
      }
      
      // Recalculate leadWeight if leadPercentage was missing
      if (!entry.leadPercentage && entry.batteryWeight) {
        updateData.leadWeight = Math.round((entry.batteryWeight * 60 / 100) * 100) / 100;
        updateData.leadPending = Math.round((updateData.leadWeight - (entry.leadReceived || 0)) * 100) / 100;
        updateData.percentage = updateData.leadWeight > 0 ? Math.round(((entry.leadReceived || 0) / updateData.leadWeight) * 100) : 0;
      }
      
      if (Object.keys(updateData).length > 0) {
        await LeadExtraction.findByIdAndUpdate(entry._id, { $set: updateData });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${updatedCount} lead extraction entries`,
      data: {
        totalEntries: entriesToUpdate.length,
        updatedEntries: updatedCount
      }
    });
  } catch (error) {
    console.error('Error migrating lead extraction entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to migrate lead extraction entries' },
      { status: 500 }
    );
  }
}
