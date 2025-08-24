import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { adminProtectedRoute } from '@/middleware/authMiddleware';
import LedgerEntry from '@/models/LedgerEntry';
import LeadExtraction from '@/models/LeadExtraction';

export async function GET(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();

    // Get today's date
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get today's ledger entries
    const todayLedgerEntries = await LedgerEntry.find({
      date: { $gte: startOfDay, $lt: endOfDay }
    }).lean();

    // Get today's lead extraction entries
    const todayLeadEntries = await LeadExtraction.find({
      date: { $gte: startOfDay, $lt: endOfDay }
    }).lean();

    // Calculate ledger stats
    const totalCredit = todayLedgerEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const totalDebit = todayLedgerEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const finalBalance = totalCredit - totalDebit;

    // Calculate lead extraction stats
    const totalBatteryWeight = todayLeadEntries.reduce((sum, entry) => sum + (entry.batteryWeight || 0), 0);
    const totalLeadWeight = todayLeadEntries.reduce((sum, entry) => sum + (entry.leadWeight || 0), 0);
    const totalLeadReceived = todayLeadEntries.reduce((sum, entry) => sum + (entry.leadReceived || 0), 0);
    const totalLeadPending = todayLeadEntries.reduce((sum, entry) => sum + (entry.leadPending || 0), 0);

    // Get recent entries for quick overview
    const recentLedgerEntries = await LedgerEntry.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const recentLeadEntries = await LeadExtraction.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const stats = {
      today: {
        ledger: {
          totalCredit: Math.round(totalCredit * 100) / 100,
          totalDebit: Math.round(totalDebit * 100) / 100,
          finalBalance: Math.round(finalBalance * 100) / 100,
          entryCount: todayLedgerEntries.length
        },
        leadExtraction: {
          totalBatteryWeight: Math.round(totalBatteryWeight * 100) / 100,
          totalLeadWeight: Math.round(totalLeadWeight * 100) / 100,
          totalLeadReceived: Math.round(totalLeadReceived * 100) / 100,
          totalLeadPending: Math.round(totalLeadPending * 100) / 100,
          entryCount: todayLeadEntries.length
        }
      },
      recent: {
        ledger: recentLedgerEntries,
        leadExtraction: recentLeadEntries
      }
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
