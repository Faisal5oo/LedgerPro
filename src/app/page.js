'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Scale, 
  Download,
  Calendar,
  BookOpen,
  Activity
} from 'lucide-react';
import Layout from "@/components/LayoutWrapper";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const RecentEntryCard = ({ title, entries, type }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Activity className="w-5 h-5 text-gray-400" />
      </div>
      
      {entries && entries.length > 0 ? (
        <div className="space-y-3">
          {entries.slice(0, 5).map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#0A1172] rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {type === 'ledger' ? 
                      `${entry.batteryType || 'N/A'} - ${entry.totalWeight || 0} kg` :
                      `${entry.description || 'N/A'} - ${entry.batteryWeight || 0} kg`
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {type === 'ledger' ? 
                    `Rs ${entry.credit || 0}` :
                    `${entry.leadReceived || 0} kg`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent entries</p>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A1172]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
            <p className="text-gray-600 mt-1">Today's business overview - {new Date().toLocaleDateString()}</p>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Credit"
            value={`Rs ${stats?.today?.ledger?.totalCredit || 0}`}
            subtitle={`${stats?.today?.ledger?.entryCount || 0} entries`}
            icon={TrendingUp}
            color="bg-green-500"
          />
          
          <StatCard
            title="Today's Debit"
            value={`Rs ${stats?.today?.ledger?.totalDebit || 0}`}
            subtitle="Total payments"
            icon={TrendingDown}
            color="bg-red-500"
          />
          
          <StatCard
            title="Final Balance"
            value={`Rs ${stats?.today?.ledger?.finalBalance || 0}`}
            subtitle="Net today"
            icon={DollarSign}
            color="bg-blue-500"
          />
          
          <StatCard
            title="Battery Weight"
            value={`${stats?.today?.leadExtraction?.totalBatteryWeight || 0} kg`}
            subtitle={`${stats?.today?.leadExtraction?.entryCount || 0} entries`}
            icon={Scale}
            color="bg-orange-500"
          />
        </div>

        {/* Lead Extraction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Expected Lead"
            value={`${stats?.today?.leadExtraction?.totalLeadWeight || 0} kg`}
            subtitle="60% of battery weight"
            icon={Package}
            color="bg-purple-500"
          />
          
          <StatCard
            title="Lead Received"
            value={`${stats?.today?.leadExtraction?.totalLeadReceived || 0} kg`}
            subtitle="Actually obtained"
            icon={Download}
            color="bg-green-600"
          />
          
          <StatCard
            title="Lead Pending"
            value={`${stats?.today?.leadExtraction?.totalLeadPending || 0} kg`}
            subtitle="Still to receive"
            icon={Calendar}
            color="bg-yellow-500"
          />
        </div>

        {/* Recent Entries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentEntryCard
            title="Recent Ledger Entries"
            entries={stats?.recent?.ledger}
            type="ledger"
          />
          
          <RecentEntryCard
            title="Recent Lead Extraction"
            entries={stats?.recent?.leadExtraction}
            type="leadExtraction"
          />
        </div>
      </div>
    </Layout>
  );
}
