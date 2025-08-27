import React from 'react';
import { motion } from 'framer-motion';
import { Users, Package, TrendingUp, Scale, Download, Percent } from 'lucide-react';

const LeadExtractionSearchSummary = ({ searchResults, searchTerm }) => {
  if (!searchResults || !searchTerm) return null;

  const { summary } = searchResults;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#0A1172] to-[#1e40af] rounded-lg p-6 text-white shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Search Results for "{searchTerm}"</h3>
        <div className="text-sm opacity-90">
          {summary.totalEntries || 0} {(summary.totalEntries || 0) === 1 ? 'entry' : 'entries'} found across all dates
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Customers</span>
          </div>
          <div className="text-2xl font-bold">{summary.uniqueCustomers || 0}</div>
          <div className="text-xs opacity-75">
            {(summary.customerNames || []).slice(0, 2).join(', ')}
            {(summary.customerNames || []).length > 2 && ` +${(summary.customerNames || []).length - 2} more`}
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Scale className="w-5 h-5" />
            <span className="text-sm font-medium">Battery Weight</span>
          </div>
          <div className="text-2xl font-bold">{(summary.totalBatteryWeight || 0).toFixed(2)} kg</div>
          <div className="text-xs opacity-75">Total batteries processed</div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-5 h-5 text-green-300" />
            <span className="text-sm font-medium">Lead Received</span>
          </div>
          <div className="text-2xl font-bold">{(summary.totalLeadReceived || 0).toFixed(2)} kg</div>
          <div className="text-xs opacity-75">Lead extracted</div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-300" />
            <span className="text-sm font-medium">Lead Pending</span>
          </div>
          <div className="text-2xl font-bold">{(summary.totalLeadPending || 0).toFixed(2)} kg</div>
          <div className="text-xs opacity-75">Still to extract</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Average Completion:</span>
          <span className="text-lg font-bold text-green-300">
            {(summary.averageCompletion || 0).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium">Expected Lead Weight:</span>
          <span className="text-sm font-bold">
            {(summary.totalLeadWeight || 0).toFixed(2)} kg
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default LeadExtractionSearchSummary;
