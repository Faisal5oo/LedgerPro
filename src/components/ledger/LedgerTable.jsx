import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';

const LedgerTable = ({ entries, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#0A1172]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Weight (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Rate/kg</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Credit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Debit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Balance</th>
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
                  {entry.batteryType}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {entry.totalWeight.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {entry.ratePerKg.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                  {entry.credit.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600">
                  {entry.debit.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                  {entry.balance.toFixed(2)}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No entries found</h3>
          <p className="text-sm text-gray-500">Get started by adding your first transaction entry.</p>
        </div>
      )}
    </div>
  );
};

export default LedgerTable;
