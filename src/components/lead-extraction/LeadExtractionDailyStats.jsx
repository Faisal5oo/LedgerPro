import React from 'react';
import { motion } from 'framer-motion';
import { Package, Scale, TrendingUp, Download, Percent, Users, BarChart3 } from 'lucide-react';

const LeadExtractionDailyStats = ({ entries, selectedDate }) => {
  if (!entries || entries.length === 0) return null;

  // Calculate statistics
  const totalEntries = entries.length;
  const totalBatteryWeight = entries.reduce((sum, entry) => sum + (entry.batteryWeight || 0), 0);
  const totalLeadWeight = entries.reduce((sum, entry) => sum + (entry.leadWeight || 0), 0);
  const totalLeadReceived = entries.reduce((sum, entry) => sum + (entry.leadReceived || 0), 0);
  const totalLeadPending = entries.reduce((sum, entry) => sum + (entry.leadPending || 0), 0);
  const averagePercentage = totalLeadWeight > 0 ? (totalLeadReceived / totalLeadWeight * 100) : 0;
  const averageLeadPercentage = entries.reduce((sum, entry) => sum + (entry.leadPercentage || 60), 0) / totalEntries;

  // Get unique customers
  const uniqueCustomers = [...new Set(entries.map(entry => 
    entry.customerName || entry.customerId?.name || 'No Customer'
  ))].filter(customer => customer !== 'No Customer');

  // Calculate average weight per entry
  const averageBatteryWeight = totalBatteryWeight / totalEntries;
  const averageLeadReceived = totalLeadReceived / totalEntries;

  // Product breakdown (by description)
  const productBreakdown = entries.reduce((acc, entry) => {
    const description = entry.description || 'Unknown';
    acc[description] = (acc[description] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    {
      title: 'Total Entries',
      value: totalEntries,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Battery purchases today'
    },
    {
      title: 'Battery Weight',
      value: `${totalBatteryWeight.toFixed(2)} kg`,
      icon: Scale,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `Avg: ${averageBatteryWeight.toFixed(2)} kg/entry`
    },
    {
      title: 'Lead Received',
      value: `${totalLeadReceived.toFixed(2)} kg`,
      icon: Download,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `Avg: ${averageLeadReceived.toFixed(2)} kg/entry`
    },
    {
      title: 'Lead Pending',
      value: `${totalLeadPending.toFixed(2)} kg`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Still to extract'
    },
    {
      title: 'Completion Rate',
      value: `${averagePercentage.toFixed(1)}%`,
      icon: Percent,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Overall progress'
    },
    {
      title: 'Customers',
      value: uniqueCustomers.length,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      description: 'Active today'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daily Lead Extraction Summary</h3>
          <p className="text-sm text-gray-500">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <BarChart3 className="w-4 h-4" />
          <span>Lead Extraction Analytics</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-lg p-4 border border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-2 rounded-lg bg-white/50`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lead Percentage Analysis */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Percent className="w-4 h-4 mr-2 text-purple-600" />
            Lead Percentage Analysis
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average Lead %:</span>
              <span className="font-medium text-purple-600">{averageLeadPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expected Lead Weight:</span>
              <span className="font-medium text-blue-600">{totalLeadWeight.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Extraction Efficiency:</span>
              <span className={`font-medium ${averagePercentage >= 80 ? 'text-green-600' : averagePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {averagePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Customer Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2 text-pink-600" />
            Customer Activity
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Customers:</span>
              <span className="font-medium text-pink-600">{uniqueCustomers.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg per Customer:</span>
              <span className="font-medium text-gray-900">
                {uniqueCustomers.length > 0 ? (totalEntries / uniqueCustomers.length).toFixed(1) : '0'} entries
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {uniqueCustomers.slice(0, 3).join(', ')}
              {uniqueCustomers.length > 3 && ` +${uniqueCustomers.length - 3} more`}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Breakdown */}
      {Object.keys(productBreakdown).length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Package className="w-4 h-4 mr-2 text-blue-600" />
            Product Breakdown
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(productBreakdown).map(([product, count]) => (
              <div key={product} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-600 capitalize">{product}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LeadExtractionDailyStats;
