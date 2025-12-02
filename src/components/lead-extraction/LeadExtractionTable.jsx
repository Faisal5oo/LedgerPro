import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2, Printer, User } from 'lucide-react';

const LeadExtractionTable = ({ entries, onEdit, onDelete, onCustomerClick }) => {
  const handlePrintBill = (entry) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const customerName = entry.customerName || entry.customerId?.name || 'Unknown Customer';
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lead Extraction Bill - ${customerName}</title>
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
            <div class="company-name">LEAD EXTRACTION BILL</div>
            <div>Date: ${format(new Date(entry.date), 'dd/MM/yyyy')}</div>
          </div>
          
          <div class="bill-details">
            <div class="bill-row">
              <span class="bill-label">Customer Name:</span>
              <span class="bill-value">${customerName}</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Description:</span>
              <span class="bill-value">${entry.description || 'N/A'}</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Battery Weight:</span>
              <span class="bill-value">${entry.batteryWeight?.toFixed(2) || '0.00'} kg</span>
            </div>
            <div class="bill-row">
              <span class="bill-label">Lead Percentage:</span>
              <span class="bill-value">${entry.leadPercentage?.toFixed(1) || '60.0'}%</span>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Weight (kg)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Expected Lead Weight</td>
                <td>${entry.leadWeight?.toFixed(2) || '0.00'}</td>
                <td>Expected</td>
              </tr>
              <tr>
                <td>Lead Received</td>
                <td>${entry.leadReceived?.toFixed(2) || '0.00'}</td>
                <td>Completed</td>
              </tr>
              <tr>
                <td>Lead Pending</td>
                <td>${entry.leadPending?.toFixed(2) || '0.00'}</td>
                <td>Pending</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total-row">
            <div class="bill-row">
              <span class="bill-label">Completion Percentage:</span>
              <span class="bill-value">${entry.percentage?.toFixed(1) || '0.0'}%</span>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Battery Weight (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Lead %</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Lead Weight (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Lead Received (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Lead Pending (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Completion (%)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => {
              // Detect lead received only entries
              const isLeadReceivedOnly = entry.isLeadReceivedOnly === true || 
                (entry.batteryWeight === 0 && entry.leadReceived > 0);
              
              return (
              <motion.tr
                key={entry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-gray-50 transition-colors ${isLeadReceivedOnly ? 'bg-blue-50/30' : ''}`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(entry.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => onCustomerClick && onCustomerClick(entry.customerId?._id || entry.customerId)}
                    className="flex items-center space-x-2 text-[#0A1172] hover:text-[#0A1172]/80 hover:underline transition-colors"
                    title="View customer lead extraction history"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {entry.customerName || (entry.customerId?.name) || 'Unknown Customer'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {isLeadReceivedOnly ? (
                    <span className="text-blue-600 font-medium">Lead Received</span>
                  ) : (
                    entry.description
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {isLeadReceivedOnly ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    entry.batteryWeight.toFixed(2)
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-600">
                  {isLeadReceivedOnly ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    `${entry.leadPercentage?.toFixed(1) || '60.0'}%`
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                  {isLeadReceivedOnly ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    entry.leadWeight.toFixed(2)
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                  {entry.leadReceived.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-orange-600">
                  {isLeadReceivedOnly ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    entry.leadPending.toFixed(2)
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                  {isLeadReceivedOnly ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    `${entry.percentage}%`
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {isLeadReceivedOnly && entry.notes && (
                    <div className="text-xs text-gray-500 mb-1" title={entry.notes}>
                      {entry.notes.length > 30 ? entry.notes.substring(0, 30) + '...' : entry.notes}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePrintBill(entry)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Print lead extraction bill"
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
