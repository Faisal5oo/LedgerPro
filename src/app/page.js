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
  Activity,
  Users,
  Truck,
  RefreshCw,
  Zap,
  Target,
  Award,
  BarChart3,
  PieChart,
  TrendingUp as TrendingUpIcon,
  ArrowUpRight,
  ArrowDownRight
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

  const RecentEntryCard = ({ title, entries, type, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Latest 5
        </div>
      </div>
      
      {entries && entries.length > 0 ? (
        <div className="space-y-3">
          {entries.slice(0, 5).map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#0A1172] rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {type === 'ledger' ? 
                      `${entry.customerId?.name || 'Unknown Customer'} - ${entry.totalWeight || 0} kg` :
                      type === 'leadExtraction' ?
                      `${entry.customerId?.name || 'Unknown Customer'} - ${entry.batteryWeight || 0} kg` :
                      `${entry.customerId?.name || 'Unknown Customer'} - ${entry.weight || 0} kg`
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
                    `Rs ${(entry.credit || 0).toFixed(2)}` :
                    type === 'leadExtraction' ?
                    `${(entry.leadReceived || 0).toFixed(2)} kg` :
                    `Rs ${(entry.credit || 0).toFixed(2)}`
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
      <div className="space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A1172] via-[#1e40af] to-[#3b82f6] rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Business Command Center</h1>
                <p className="text-lg opacity-90">Complete business overview for {new Date().toLocaleDateString()}</p>
              </div>
              <button
                onClick={fetchDashboardStats}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-[#0A1172] bg-white rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh Data
              </button>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-300" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-green-300" />
                </div>
                <h3 className="text-sm font-medium text-white/80 mb-1">Total Revenue</h3>
                <p className="text-2xl font-bold text-white">
                  Rs {((stats?.today?.ledger?.totalCredit || 0) + (stats?.today?.leadSelling?.totalCredit || 0)).toFixed(2)}
                </p>
                <p className="text-xs text-white/60 mt-1">From all business activities</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Scale className="w-6 h-6 text-blue-300" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-sm font-medium text-white/80 mb-1">Lead Processed</h3>
                <p className="text-2xl font-bold text-white">
                  {((stats?.today?.leadExtraction?.totalLeadReceived || 0) + (stats?.today?.leadSelling?.totalLeadSold || 0)).toFixed(2)} kg
                </p>
                <p className="text-xs text-white/60 mt-1">Total lead handled</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-purple-300" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="text-sm font-medium text-white/80 mb-1">Active Customers</h3>
                <p className="text-2xl font-bold text-white">
                  {(stats?.today?.ledger?.entryCount || 0) + (stats?.today?.leadExtraction?.entryCount || 0) + (stats?.today?.leadSelling?.entryCount || 0)}
                </p>
                <p className="text-xs text-white/60 mt-1">Transactions today</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Target className="w-6 h-6 text-orange-300" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-orange-300" />
                </div>
                <h3 className="text-sm font-medium text-white/80 mb-1">Net Profit</h3>
                <p className="text-2xl font-bold text-white">
                  Rs {((stats?.today?.ledger?.finalBalance || 0) + (stats?.today?.leadSelling?.netBalance || 0)).toFixed(2)}
                </p>
                <p className="text-xs text-white/60 mt-1">After all expenses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Modules Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Ledger Module */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Ledger</h3>
                  <p className="text-sm text-gray-500">Customer transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  Rs {(stats?.today?.ledger?.totalCredit || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Money Paid Out</span>
                <span className="text-sm font-medium">Rs {(stats?.today?.ledger?.totalDebit || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Balance</span>
                <span className="text-sm font-medium text-green-600">Rs {(stats?.today?.ledger?.finalBalance || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transactions</span>
                <span className="text-sm font-medium">{stats?.today?.ledger?.entryCount || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Lead Extraction Module */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lead Extraction</h3>
                  <p className="text-sm text-gray-500">Battery processing</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {(stats?.today?.leadExtraction?.totalBatteryWeight || 0).toFixed(2)} kg
                </p>
                <p className="text-xs text-gray-500">Batteries</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lead Received</span>
                <span className="text-sm font-medium">{(stats?.today?.leadExtraction?.totalLeadReceived || 0).toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lead Pending</span>
                <span className="text-sm font-medium text-yellow-600">{(stats?.today?.leadExtraction?.totalLeadPending || 0).toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Processing</span>
                <span className="text-sm font-medium">{stats?.today?.leadExtraction?.entryCount || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Lead Selling Module */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lead Selling</h3>
                  <p className="text-sm text-gray-500">Client sales</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">
                  Rs {(stats?.today?.leadSelling?.totalCredit || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lead Sold</span>
                <span className="text-sm font-medium">{(stats?.today?.leadSelling?.totalLeadSold || 0).toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transport Cost</span>
                <span className="text-sm font-medium">Rs {(stats?.today?.leadSelling?.totalCommuteRent || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sales</span>
                <span className="text-sm font-medium">{stats?.today?.leadSelling?.entryCount || 0}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentEntryCard
            title="Recent Daily Ledger"
            entries={stats?.recent?.ledger}
            type="ledger"
            icon={BookOpen}
            color="bg-green-500"
          />
          
          <RecentEntryCard
            title="Recent Lead Extraction"
            entries={stats?.recent?.leadExtraction}
            type="leadExtraction"
            icon={Package}
            color="bg-blue-500"
          />

          <RecentEntryCard
            title="Recent Lead Selling"
            entries={stats?.recent?.leadSelling}
            type="leadSelling"
            icon={Truck}
            color="bg-purple-500"
          />
        </div>
      </div>
    </Layout>
  );
}
