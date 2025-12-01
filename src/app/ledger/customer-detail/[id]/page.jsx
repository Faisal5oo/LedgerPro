'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  DollarSign, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Printer
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/LayoutWrapper";

export default function CustomerDetailPage({ params }) {
  const router = useRouter();
  const { id: customerId } = params;
  
  const [customer, setCustomer] = useState(null);
  const [entries, setEntries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalWeight: 0,
    totalCredit: 0,
    totalDebit: 0,
    totalReceived: 0,
    netBalance: 0,
    entryCount: 0,
    paymentCount: 0
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCustomerEntries();
    }
  }, [customerId]);

  const fetchCustomerEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ledger/customer?customerId=${customerId}`);
      const data = await response.json();

      if (data.success) {
        setEntries(data.data.entries || []);
        setPayments(data.data.payments || []);
        setCustomer(data.data.customer);
        setSummary({
          totalWeight: data.data.totalWeight || 0,
          totalCredit: data.data.totalCredit || 0,
          totalDebit: data.data.totalDebit || 0,
          totalReceived: data.data.totalReceived || 0,
          netBalance: data.data.netBalance || 0,
          entryCount: (data.data.entries || []).length,
          paymentCount: (data.data.payments || []).length
        });
      } else {
        setEntries([]);
        setPayments([]);
        setCustomer(null);
        setSummary({
          totalWeight: 0,
          totalCredit: 0,
          totalDebit: 0,
          totalReceived: 0,
          netBalance: 0,
          entryCount: 0,
          paymentCount: 0
        });
      }
    } catch (error) {
      console.error('Error fetching customer entries:', error);
      setEntries([]);
      setPayments([]);
      setCustomer(null);
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
        // Refresh the data
        await fetchCustomerEntries();
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
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${customer?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .bill-details { margin-bottom: 20px; }
            .bill-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .bill-label { font-weight: bold; }
            .bill-value { text-align: right; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; border-top: 2px solid #333; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } .no-print { display: none; } }
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
              <span class="bill-value">${customer?.name || 'N/A'}</span>
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
              <span class="bill-value">Rs ${(entry.credit - entry.debit)?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #0A1172; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Bill
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePrintAllBills = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    const customerName = customer?.name || 'Unknown Customer';
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Ledger Report - ${customerName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .customer-info { margin-bottom: 20px; text-align: center; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
            .summary-item { text-align: center; }
            .summary-label { font-size: 12px; color: #666; }
            .summary-value { font-size: 18px; font-weight: bold; }
            .bill-section { margin: 30px 0; page-break-inside: avoid; }
            .bill-date { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px; }
            .table th { background-color: #f2f2f2; }
            .bill-total { font-weight: bold; margin-top: 10px; text-align: right; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">DAILY LEDGER REPORT</div>
            <div>Customer: ${customerName}</div>
            <div>Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Total Days</div>
              <div class="summary-value">${summary.entryCount}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Weight</div>
              <div class="summary-value">${summary.totalWeight.toFixed(2)} kg</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Credit</div>
              <div class="summary-value">Rs ${summary.totalCredit.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Net Balance</div>
              <div class="summary-value">Rs ${summary.netBalance.toFixed(2)}</div>
            </div>
          </div>
          
          ${entries.map(entry => `
            <div class="bill-section">
              <div class="bill-date">Date: ${format(new Date(entry.date), 'dd/MM/yyyy')}</div>
              
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
              
              <div class="bill-total">
                <div>Product Type: ${entry.batteryType?.toUpperCase() || 'N/A'}</div>
                <div>Rate per kg: Rs ${entry.ratePerKg?.toFixed(2) || '0.00'}</div>
                <div>Total Weight: ${entry.totalWeight?.toFixed(2) || '0.00'} kg</div>
                <div>Total Amount: Rs ${entry.credit?.toFixed(2) || '0.00'}</div>
                <div>Debit: Rs ${entry.debit?.toFixed(2) || '0.00'}</div>
                <div>Balance: Rs ${(entry.credit - entry.debit)?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
          `).join('')}
          
          <div class="footer">
            <p>Thank you!</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #0A1172; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print All Bills
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A1172]"></div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <User className="mx-auto h-16 w-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customer not found</h3>
          <p className="text-white">The requested customer could not be found.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 text-sm font-medium text-[#0A1172] bg-[#0A1172]/10 rounded-md hover:bg-[#0A1172]/20 transition-colors"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/ledger')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Daily Ledger History</h1>
              <p className="text-gray-600 mt-1">All daily ledger entries for {customer.name}</p>
            </div>
          </div>
          <button
            onClick={handlePrintAllBills}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print All
          </button>
        </div>

        {/* Customer Summary */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0A1172] to-[#1e40af] rounded-lg p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-semibold">{customer.name}</h2>
                <p className="text-sm opacity-90">Daily Ledger Customer</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Total Entries</div>
              <div className="text-2xl font-bold">{summary.entryCount}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Scale className="w-5 h-5" />
                <span className="text-sm font-medium">Total Weight</span>
              </div>
              <div className="text-xl font-bold">{summary.totalWeight.toFixed(2)} kg</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Total Amount</span>
              </div>
              <div className="text-xl font-bold">Rs {summary.totalCredit.toFixed(2)}</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5" />
                <span className="text-sm font-medium">Total Debit</span>
              </div>
              <div className="text-xl font-bold">Rs {summary.totalDebit.toFixed(2)}</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Total Received</span>
              </div>
              <div className="text-xl font-bold">Rs {summary.totalReceived.toFixed(2)}</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Remaining Balance</span>
              </div>
              <div className={`text-xl font-bold ${summary.netBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                Rs {summary.netBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Entries Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Daily Ledger Entries</h3>
          </div>
          
          {entries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0A1172]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-8"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total Weight</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Rate/kg</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Credit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Debit</th>
                                         <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Balance</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Notes</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
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
                            <button
                              onClick={() => handleWeightClick(entry)}
                              className="flex items-center space-x-2 text-[#0A1172] hover:text-[#0A1172]/80 hover:underline transition-colors group"
                              title="Click to add more weight"
                            >
                              <span className="font-medium">{entry.totalWeight.toFixed(2)} kg</span>
                              <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-green-600" />
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Rs {entry.ratePerKg.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                            Rs {entry.credit.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                            Rs {entry.debit.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Rs {entry.balance.toFixed(2)}
                          </td>
                                                     <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                             <div className="truncate" title={entry.notes}>
                               {entry.notes || '-'}
                             </div>
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                             <button
                               onClick={() => handlePrintBill(entry)}
                               className="text-[#0A1172] hover:text-[#0A1172]/80 transition-colors p-2 rounded hover:bg-[#0A1172]/10"
                               title="Print daily bill"
                             >
                               <Printer className="w-4 h-4" />
                             </button>
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
                                                         <td colSpan="10" className="px-4 py-3">
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Weight Addition History</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Time</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Weight Added</th>
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
                                          <td colSpan="2" className="px-4 py-2 text-center text-sm text-white">
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
              <p className="text-white">No transactions recorded for this customer.</p>
            </div>
          )}
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment Received</h3>
            <p className="text-sm text-gray-500 mt-1">All payment entries (debit without weight/product)</p>
          </div>
          
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0A1172]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Payment Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Notes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment, index) => {
                    const customerName = payment.customerId?.name || customer?.name || 'Unknown Customer';
                    return (
                      <motion.tr
                        key={payment._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(payment.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{customerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                          Rs {payment.debit.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={payment.notes}>
                            {payment.notes || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handlePrintBill(payment)}
                            className="text-[#0A1172] hover:text-[#0A1172]/80 transition-colors p-2 rounded hover:bg-[#0A1172]/10"
                            title="Print payment receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-sm font-medium text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      Rs {summary.totalReceived.toFixed(2)}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <DollarSign className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments recorded</h3>
              <p className="text-gray-500">No payment entries found for this customer.</p>
            </div>
          )}
        </div>
      </div>

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
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                  <p className="text-sm text-gray-600 mb-2">Customer: <span className="font-medium text-gray-900">
                  {customer?.name || 
                   selectedEntry.customerName || 
                   selectedEntry.customerId?.name || 
                   'Unknown'}
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
    </Layout>
  );
}
