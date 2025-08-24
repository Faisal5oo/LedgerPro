import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';

const LeadExtractionTable = ({ entries, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#0A1172]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Battery Weight (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Lead Weight (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Lead Received (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Lead Pending (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Percentage (%)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <motion.tr
                key={entry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(entry.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {entry.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {entry.batteryWeight.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                  {entry.leadWeight.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                  {entry.leadReceived.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-orange-600">
                  {entry.leadPending.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                  {entry.percentage}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(entry)}
                      className="text-[#0A1172] hover:text-[#0A1172]/80 p-1 rounded hover:bg-[#0A1172]/10 transition-colors"
                      title="Edit entry"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(entry)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {entries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No lead extraction entries found</h3>
          <p className="text-sm text-gray-500">Get started by adding your first battery purchase entry.</p>
        </div>
      )}
    </div>
  );
};

export default LeadExtractionTable;
