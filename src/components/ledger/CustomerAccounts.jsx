import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { X, User, TrendingUp, TrendingDown, Scale, DollarSign, Clock, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

const CustomerAccounts = ({ customerId, isOpen, onClose }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalWeight: 0,
    totalCredit: 0,
    totalDebit: 0,
    netBalance: 0,
    entryCount: 0
  });
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerEntries();
    }
  }, [isOpen, customerId]);

  const fetchCustomerEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ledger/customer?customerId=${customerId}`);
      const data = await response.json();

      if (data.success) {
        setEntries(data.data.entries);
        setSummary({
          totalWeight: data.data.totalWeight,
          totalCredit: data.data.totalCredit,
          totalDebit: data.data.totalDebit,
          netBalance: data.data.netBalance,
          entryCount: data.data.entries.length
        });
      } else {
        setEntries([]);
        setSummary({
          totalWeight: 0,
          totalCredit: 0,
          totalDebit: 0,
          netBalance: 0,
          entryCount: 0
        });
      }
    } catch (error) {
      console.error('Error fetching customer entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (entryId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(entryId)) {
      newExpandedRows.delete(entryId);
    } else {
      newExpandedRows.add(entryId);
    }
    setExpandedRows(newExpandedRows);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 bg-[#0A1172] text-white">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Customer Account</h2>
                <p className="text-[#0A1172]/80">
                  {entries.length > 0 ? entries[0].customerName || 'Customer' : 'Customer'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Scale className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Weight</p>
                    <p className="text-lg font-bold text-gray-900">{summary.totalWeight.toFixed(2)} kg</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Credit</p>
                    <p className="text-lg font-bold text-green-600">Rs {summary.totalCredit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Debit</p>
                    <p className="text-lg font-bold text-red-600">Rs {summary.totalDebit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Balance</p>
                    <p className={`text-lg font-bold ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Rs {summary.netBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Days</p>
                    <p className="text-lg font-bold text-gray-900">{summary.entryCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A1172]"></div>
              </div>
            ) : entries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Weight</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/kg</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entries.map((entry, index) => {
                      const isExpanded = expandedRows.has(entry._id);
                      return (
                        <React.Fragment key={entry._id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <button
                                onClick={() => toggleRowExpansion(entry._id)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {format(new Date(entry.date), 'dd/MM/yyyy')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {entry.batteryType}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {entry.totalWeight.toFixed(2)} kg
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              Rs {entry.ratePerKg.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                              Rs {entry.credit.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600">
                              Rs {entry.debit.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                              <div className="truncate" title={entry.notes}>
                                {entry.notes || '-'}
                              </div>
                            </td>
                          </motion.tr>
                          
                          {/* Expanded Weight Logs Row */}
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gray-50"
                            >
                              <td colSpan="8" className="px-4 py-3">
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="text-sm font-medium text-gray-900 mb-3">Weight Addition History</h4>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight Added</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {entry.weightLogs && entry.weightLogs.length > 0 ? (
                                          entry.weightLogs.map((log, logIndex) => (
                                            <tr key={logIndex} className="hover:bg-gray-50">
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center space-x-2">
                                                  <Clock className="w-4 h-4 text-gray-400" />
                                                  <span>{format(new Date(log.time), 'HH:mm:ss')}</span>
                                                </div>
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {log.weight.toFixed(2)} kg
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan="2" className="px-4 py-2 text-center text-sm text-gray-500">
                                              No weight logs available
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <User className="mx-auto h-16 w-16" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
                <p className="text-gray-500">No transactions recorded for this customer.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerAccounts;
