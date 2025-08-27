import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Package, Users, DollarSign, Calendar } from 'lucide-react';

const DailyStats = ({ entries, selectedDate }) => {
  if (!entries || entries.length === 0) return null;

  const stats = {
    totalEntries: entries.length,
    totalWeight: entries.reduce((sum, entry) => sum + (entry.totalWeight || 0), 0),
    totalCredit: entries.reduce((sum, entry) => sum + (entry.credit || 0), 0),
    totalDebit: entries.reduce((sum, entry) => sum + (entry.debit || 0), 0),
    uniqueCustomers: new Set(entries.map(entry => entry.customerName || entry.customerId?.name)).size,
    batteryEntries: entries.filter(entry => entry.batteryType === 'battery').length,
    gutkaEntries: entries.filter(entry => entry.batteryType === 'gutka').length
  };

  const netBalance = stats.totalCredit - stats.totalDebit;

  const statCards = [
    {
      title: 'Total Entries',
      value: stats.totalEntries,
      icon: Calendar,
      color: 'blue',
      change: null
    },
    {
      title: 'Total Weight',
      value: `${stats.totalWeight.toFixed(2)} kg`,
      icon: Package,
      color: 'purple',
      change: null
    },
    {
      title: 'Total Credit',
      value: `Rs ${stats.totalCredit.toFixed(2)}`,
      icon: TrendingUp,
      color: 'green',
      change: null
    },
    {
      title: 'Total Debit',
      value: `Rs ${stats.totalDebit.toFixed(2)}`,
      icon: TrendingDown,
      color: 'red',
      change: null
    },
    {
      title: 'Net Balance',
      value: `Rs ${netBalance.toFixed(2)}`,
      icon: DollarSign,
      color: netBalance >= 0 ? 'green' : 'red',
      change: null
    },
    {
      title: 'Customers',
      value: stats.uniqueCustomers,
      icon: Users,
      color: 'indigo',
      change: null
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Daily Summary - {selectedDate.toLocaleDateString()}
        </h3>
        <div className="text-sm text-gray-500">
          {stats.batteryEntries} Battery • {stats.gutkaEntries} Gutka
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${getColorClasses(stat.color)}`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium opacity-75">{stat.title}</span>
              </div>
              <div className="text-lg font-bold">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            • Average weight per entry: <span className="font-medium">{(stats.totalWeight / stats.totalEntries).toFixed(2)} kg</span>
          </div>
          <div>
            • Average credit per entry: <span className="font-medium">Rs {(stats.totalCredit / stats.totalEntries).toFixed(2)}</span>
          </div>
          <div>
            • Most common product: <span className="font-medium">{stats.batteryEntries > stats.gutkaEntries ? 'Battery' : 'Gutka'}</span>
          </div>
          <div>
            • Entries per customer: <span className="font-medium">{(stats.totalEntries / stats.uniqueCustomers).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyStats;
