import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2, Printer, User } from 'lucide-react';

const LeadSellingTable = ({ entries, onEdit, onDelete, onCustomerClick }) => {
  const handlePrintBill = (entry) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const customerName = entry.customerName || entry.customerId?.name || 'Unknown Customer';
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lead Selling Bill - ${customerName}</title>
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
            <div class="company-name">LEAD SELLING BILL</div>
            <div>Date: ${format(new Date(entry.date), 'dd/MM/yyyy')}</div>
          </div>
          
          <div class="bill-details">
            <div class="bill-row">
              <span class="bill-label">Customer Name:</span>
              <span class="bill-value">${customerName}</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Weight:</span>
              <span class="bill-value">${entry.weight?.toFixed(2) || '0.00'} kg</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Rate per kg:</span>
              <span class="bill-value">Rs ${entry.rate?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Commute Rent:</span>
              <span class="bill-value">Rs ${entry.commuteRent?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount (Rs)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lead Cost</td>
                <td>${((entry.weight || 0) * (entry.rate || 0)).toFixed(2)}</td>
                <td>${entry.weight?.toFixed(2) || '0.00'} kg × Rs ${entry.rate?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td>Commute Rent</td>
                <td>${entry.commuteRent?.toFixed(2) || '0.00'}</td>
                <td>Transportation cost</td>
              </tr>
              <tr>
                <td>Total Credit</td>
                <td>${entry.credit?.toFixed(2) || '0.00'}</td>
                <td>Total amount</td>
              </tr>
              <tr>
                <td>Debit</td>
                <td>${entry.debit?.toFixed(2) || '0.00'}</td>
                <td>Amount paid</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total-row">
            <div class="bill-row">
              <span class="bill-label">Balance:</span>
              <span class="bill-value">Rs ${(entry.balance !== undefined && entry.balance !== null ? entry.balance.toFixed(2) : ((entry.credit || 0) - (entry.debit || 0)).toFixed(2))}</span>
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#0A1172]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Commute Rent (Rs)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Weight (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Rate (Rs/kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Debit (Rs)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Credit (Rs)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Balance (Rs)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => {
              // Detect payment entries
              const isPayment = entry.isPaymentOnly === true || 
                (entry.debit > 0 && entry.credit === 0 && entry.weight === 0);
              
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
                    onClick={() => onCustomerClick && onCustomerClick(entry.customerId?._id || entry.customerId)}
                    className="flex items-center space-x-2 text-[#0A1172] hover:text-[#0A1172]/80 hover:underline transition-colors"
                    title="View customer lead selling history"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {entry.customerName || (entry.customerId?.name) || 'Unknown Customer'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {isPayment ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    `Rs ${entry.commuteRent?.toFixed(2) || '0.00'}`
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {isPayment ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    entry.weight?.toFixed(2) || '0.00'
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {isPayment ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    `Rs ${entry.rate?.toFixed(2) || '0.00'}`
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                  Rs {entry.debit?.toFixed(2) || '0.00'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                  {isPayment ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    `Rs ${entry.credit?.toFixed(2) || '0.00'}`
                  )}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${entry.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isPayment ? (
                    <span className="text-gray-400" title="Remaining balance after this payment">-</span>
                  ) : (
                    `Rs ${entry.balance?.toFixed(2) || '0.00'}`
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePrintBill(entry)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Print lead selling bill"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No entries found</h3>
          <p className="text-sm text-gray-500">Get started by adding your first lead selling entry.</p>
        </div>
      )}
    </div>
  );
};

export default LeadSellingTable;
