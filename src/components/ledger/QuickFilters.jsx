import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, TrendingUp, TrendingDown, Package, Users } from 'lucide-react';

const QuickFilters = ({ onFilter, selectedFilter, onDateRangeChange }) => {
  const filters = [
    { id: 'all', label: 'All Entries', icon: Filter, color: 'gray' },
    { id: 'today', label: 'Today', icon: Calendar, color: 'blue' },
    { id: 'high-credit', label: 'High Credit', icon: TrendingUp, color: 'green' },
    { id: 'high-debit', label: 'High Debit', icon: TrendingDown, color: 'red' },
    { id: 'battery', label: 'Battery Only', icon: Package, color: 'purple' },
    { id: 'gutka', label: 'Gutka Only', icon: Package, color: 'orange' }
  ];

  const handleFilterClick = (filterId) => {
    onFilter(filterId);
  };

  const getFilterColor = (color) => {
    const colors = {
      gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300',
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300',
      green: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300',
      red: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300',
      purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300',
      orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300'
    };
    return colors[color] || colors.gray;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
    >
      <div className="flex items-center space-x-2 mb-3">
        <Filter className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700">Quick Filters</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isSelected = selectedFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                isSelected 
                  ? 'bg-[#0A1172] text-white border-[#0A1172]' 
                  : getFilterColor(filter.color)
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Range Picker */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-medium text-gray-600">Date Range</h4>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            onChange={(e) => onDateRangeChange('start', e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#0A1172]/20 focus:border-[#0A1172]"
            placeholder="Start date"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            onChange={(e) => onDateRangeChange('end', e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#0A1172]/20 focus:border-[#0A1172]"
            placeholder="End date"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default QuickFilters;
