import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, X, Download } from 'lucide-react';

const PDFExportModal = ({ isOpen, onClose, entries, selectedDate }) => {
  if (!isOpen) return null;

  const handleExportToday = () => {
    if (entries.length === 0) {
      alert('No entries to export for today');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lead Selling Report - ${selectedDate.toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #0A1172; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; font-weight: bold; }
            .total-row { font-weight: bold; border-top: 2px solid #333; margin-top: 20px; padding-top: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } .no-print { display: none; } }
            .print-button, .close-button {
              padding: 10px 20px; margin: 10px 5px; border: none; border-radius: 5px; cursor: pointer;
            }
            .print-button { background: #0A1172; color: white; }
            .close-button { background: #666; color: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">LEAD SELLING REPORT</div>
            <div>Date: ${selectedDate.toLocaleDateString()}</div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Commute Rent</th>
                <th>Weight (kg)</th>
                <th>Rate (Rs/kg)</th>
                <th>Debit (Rs)</th>
                <th>Credit (Rs)</th>
                <th>Balance (Rs)</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString()}</td>
                  <td>${entry.customerId?.name || 'Unknown'}</td>
                  <td>Rs ${entry.commuteRent?.toFixed(2) || '0.00'}</td>
                  <td>${entry.weight?.toFixed(2) || '0.00'}</td>
                  <td>Rs ${entry.rate?.toFixed(2) || '0.00'}</td>
                  <td>Rs ${entry.debit?.toFixed(2) || '0.00'}</td>
                  <td>Rs ${entry.credit?.toFixed(2) || '0.00'}</td>
                  <td>Rs ${entry.balance?.toFixed(2) || '0.00'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-row">
            <div>Total Weight: ${entries.reduce((sum, entry) => sum + (entry.weight || 0), 0).toFixed(2)} kg</div>
            <div>Total Credit: Rs ${entries.reduce((sum, entry) => sum + (entry.credit || 0), 0).toFixed(2)}</div>
            <div>Total Debit: Rs ${entries.reduce((sum, entry) => sum + (entry.debit || 0), 0).toFixed(2)}</div>
            <div>Net Balance: Rs ${entries.reduce((sum, entry) => sum + (entry.balance || 0), 0).toFixed(2)}</div>
          </div>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" class="print-button">Print Report</button>
            <button onclick="window.close()" class="close-button">Close</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
    }, 100);
    
    onClose();
  };

  const handleExportAll = async () => {
    try {
      const response = await fetch('/api/lead-selling');
      const data = await response.json();
      
      if (!data.success || !data.data || data.data.length === 0) {
        alert('No entries to export');
        return;
      }

      const allEntries = data.data;
      const printWindow = window.open('', '_blank', 'width=1000,height=800');
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>All Lead Selling Entries Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .company-name { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #0A1172; }
              .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .table th { background-color: #f2f2f2; font-weight: bold; }
              .total-row { font-weight: bold; border-top: 2px solid #333; margin-top: 20px; padding-top: 10px; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
              @media print { body { margin: 0; } .no-print { display: none; } }
              .print-button, .close-button {
                padding: 10px 20px; margin: 10px 5px; border: none; border-radius: 5px; cursor: pointer;
              }
              .print-button { background: #0A1172; color: white; }
              .close-button { background: #666; color: white; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">ALL LEAD SELLING ENTRIES</div>
              <div>Complete Report - ${new Date().toLocaleDateString()}</div>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Commute Rent</th>
                  <th>Weight (kg)</th>
                  <th>Rate (Rs/kg)</th>
                  <th>Debit (Rs)</th>
                  <th>Credit (Rs)</th>
                  <th>Balance (Rs)</th>
                </tr>
              </thead>
              <tbody>
                ${allEntries.map(entry => `
                  <tr>
                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                    <td>${entry.customerId?.name || 'Unknown'}</td>
                    <td>Rs ${entry.commuteRent?.toFixed(2) || '0.00'}</td>
                    <td>${entry.weight?.toFixed(2) || '0.00'}</td>
                    <td>Rs ${entry.rate?.toFixed(2) || '0.00'}</td>
                    <td>Rs ${entry.debit?.toFixed(2) || '0.00'}</td>
                    <td>Rs ${entry.credit?.toFixed(2) || '0.00'}</td>
                    <td>Rs ${entry.balance?.toFixed(2) || '0.00'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-row">
              <div>Total Entries: ${allEntries.length}</div>
              <div>Total Weight: ${allEntries.reduce((sum, entry) => sum + (entry.weight || 0), 0).toFixed(2)} kg</div>
              <div>Total Credit: Rs ${allEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0).toFixed(2)}</div>
              <div>Total Debit: Rs ${allEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0).toFixed(2)}</div>
              <div>Net Balance: Rs ${allEntries.reduce((sum, entry) => sum + (entry.balance || 0), 0).toFixed(2)}</div>
            </div>
            
            <div class="footer">
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="no-print" style="margin-top: 20px; text-align: center;">
              <button onclick="window.print()" class="print-button">Print Report</button>
              <button onclick="window.close()" class="close-button">Close</button>
            </div>
          </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
      }, 100);
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export all entries');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#0A1172]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0A1172]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export PDF</h3>
                <p className="text-sm text-gray-500">Choose your export option</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Today's PDF Option */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A1172]/30 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Today's Lead Selling</h4>
                  <p className="text-sm text-gray-500">
                    Export entries for {selectedDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportToday}
                className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-[#0A1172] border border-transparent rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Today</span>
              </button>
            </div>

            {/* All Bills PDF Option */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A1172]/30 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">All Lead Selling Entries</h4>
                  <p className="text-sm text-gray-500">
                    Export all lead selling entries from database
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportAll}
                className="mt-3 w-full px-4 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export All</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              PDF will be generated with professional formatting and summary
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PDFExportModal;
