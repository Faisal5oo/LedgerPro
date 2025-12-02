import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2, User, Plus, X, Printer } from 'lucide-react';

const LedgerTable = ({ 
  entries, 
  onEdit, 
  onDelete, 
  onCustomerClick,
  onWeightAdd 
}) => {
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWeightClick = (entry) => {
    setSelectedEntry(entry);
    setNewWeight('');
    setIsWeightModalOpen(true);
  };

  const handleWeightSubmit = async () => {
    if (!newWeight || parseFloat(newWeight) <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/ledger?id=${selectedEntry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addWeight: parseFloat(newWeight)
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Call the parent callback to refresh the data
        if (onWeightAdd) {
          onWeightAdd(result.data);
        }
        setIsWeightModalOpen(false);
        setSelectedEntry(null);
        setNewWeight('');
      } else {
        alert(result.error || 'Failed to add weight');
      }
    } catch (error) {
      console.error('Error adding weight:', error);
      alert('Failed to add weight');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeightCancel = () => {
    setIsWeightModalOpen(false);
    setSelectedEntry(null);
    setNewWeight('');
  };

  const handlePrintBill = (entry) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const customerName = entry.customerName || entry.customerId?.name || 'No Customer';
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Bill - ${customerName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 20px; 
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              color: #0A1172;
            }
            .bill-details { 
              margin-bottom: 20px; 
            }
            .bill-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px; 
              padding: 5px 0;
            }
            .bill-label { 
              font-weight: bold; 
            }
            .bill-value { 
              text-align: right; 
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .table th, .table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            .table th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            .total-row { 
              font-weight: bold; 
              border-top: 2px solid #333; 
              margin-top: 20px;
              padding-top: 10px;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
            @media print { 
              body { margin: 0; } 
              .no-print { display: none; } 
            }
            .print-button {
              padding: 10px 20px; 
              background: #0A1172; 
              color: white; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer;
              margin: 10px 5px;
            }
            .close-button {
              padding: 10px 20px; 
              background: #666; 
              color: white; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer;
              margin: 10px 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">DAILY LEDGER BILL</div>
            <div>Date: ${format(new Date(entry.date), 'dd/MM/yyyy')}</div>
          </div>
          
          <div class="bill-details">
            <div class="bill-row">
              <span class="bill-label">Customer Name:</span>
              <span class="bill-value">${customerName}</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Product Type:</span>
              <span class="bill-value">${entry.batteryType?.toUpperCase() || 'N/A'}</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Rate per kg:</span>
              <span class="bill-value">Rs ${entry.ratePerKg?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Weight Added</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${entry.weightLogs?.map(log => `
                <tr>
                  <td>${format(new Date(log.time), 'HH:mm:ss')}</td>
                  <td>${log.weight.toFixed(2)} kg</td>
                  <td>Rs ${(log.weight * entry.ratePerKg).toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="total-row">
            <div class="bill-row">
              <span class="bill-label">Total Weight:</span>
              <span class="bill-value">${entry.totalWeight?.toFixed(2) || '0.00'} kg</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Total Amount:</span>
              <span class="bill-value">Rs ${entry.credit?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Debit:</span>
              <span class="bill-value">Rs ${entry.debit?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Balance:</span>
              <span class="bill-value">Rs ${(entry.balance !== undefined && entry.balance !== null ? entry.balance : (entry.credit || 0) - (entry.debit || 0)).toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" class="print-button">
              Print Bill
            </button>
            <button onclick="window.close()" class="close-button">
              Close
            </button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then focus
    setTimeout(() => {
      printWindow.focus();
    }, 100);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/kg</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => {
              // Detect payment entries: has debit but no credit and no weight
              const debit = parseFloat(entry.debit) || 0;
              const credit = parseFloat(entry.credit) || 0;
              const weight = parseFloat(entry.totalWeight) || 0;
              const isPayment = entry.isPaymentOnly === true || 
                (debit > 0 && credit === 0 && weight === 0);
              
              return (
              <motion.tr
                key={entry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-gray-50 transition-colors ${isPayment ? 'bg-blue-50/30' : ''}`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(entry.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => onCustomerClick(entry.customerId?._id || entry.customerId)}
                    className="flex items-center space-x-2 text-[#0A1172] hover:text-[#0A1172]/80 hover:underline transition-colors"
                    title="View customer account"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {entry.customerName || (entry.customerId?.name) || 'Unknown Customer'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {isPayment ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    entry.batteryType || '-'
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {isPayment ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <button
                      onClick={() => handleWeightClick(entry)}
                      className="flex items-center space-x-2 text-[#0A1172] hover:text-[#0A1172]/80 hover:underline transition-colors group"
                      title="Click to add more weight"
                    >
                      <span className="font-medium">{entry.totalWeight.toFixed(2)} kg</span>
                      <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-green-600" />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {isPayment ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    `Rs ${entry.ratePerKg.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                  {isPayment ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    `Rs ${entry.credit.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                  {isPayment ? (
                    <span className="text-green-600 font-semibold" title="Payment received from customer">
                      Rs {entry.debit.toFixed(2)}
                    </span>
                  ) : (
                    `Rs ${entry.debit.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span title={isPayment ? "Remaining balance after this payment" : "Running balance"}>
                    Rs {entry.balance.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                  <div className="truncate" title={entry.notes}>
                    {entry.notes || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePrintBill(entry)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Print daily bill"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(entry)}
                      className="text-[#0A1172] hover:text-[#0A1172]/80 transition-colors"
                      title="Edit entry"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(entry)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
              );
            })}
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

      {/* Weight Addition Modal */}
      {isWeightModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Weight</h3>
              <button
                onClick={handleWeightCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Customer: <span className="font-medium text-gray-900">
                  {selectedEntry.customerName || selectedEntry.customerId?.name || 'Unknown'}
                </span></p>
                <p className="text-sm text-gray-600 mb-2">Date: <span className="font-medium text-gray-900">{format(new Date(selectedEntry.date), 'dd/MM/yyyy')}</span></p>
                <p className="text-sm text-gray-600 mb-2">Current Total: <span className="font-medium text-gray-900">{selectedEntry.totalWeight.toFixed(2)} kg</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
                  placeholder="Enter weight to add"
                  autoFocus
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleWeightSubmit}
                  disabled={isSubmitting || !newWeight || parseFloat(newWeight) <= 0}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Adding...' : 'Add Weight'}
                </button>
                <button
                  onClick={handleWeightCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default LedgerTable;
