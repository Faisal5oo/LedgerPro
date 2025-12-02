'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  DollarSign, 
  Truck,
  Package,
  Printer,
  Edit,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/LayoutWrapper";

export default function CustomerDetailPage({ params }) {
  const router = useRouter();
  const { id: customerId } = params;
  
  const [customer, setCustomer] = useState(null);
  const [entries, setEntries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalWeight: 0,
    totalCredit: 0,
    totalDebit: 0,
    totalCommuteRent: 0,
    totalReceived: 0,
    netBalance: 0,
    entryCount: 0
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomerEntries();
    }
  }, [customerId]);

  const fetchCustomerEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/lead-selling/customer/${customerId}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomer(data.data.customer);
        setEntries(data.data.entries || []);
        setPayments(data.data.payments || []);
        setSummary(data.data.summary);
      } else {
        console.error('Failed to fetch customer entries:', data.error);
      }
    } catch (error) {
      console.error('Error fetching customer entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    const customerName = customer?.name || 'Unknown Customer';
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lead Selling Report - ${customerName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #0A1172; }
            .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .summary-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; }
            .summary-label { font-size: 14px; color: #666; margin-bottom: 5px; }
            .summary-value { font-size: 24px; font-weight: bold; color: #0A1172; }
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
            <div>Customer: ${customerName}</div>
            <div>Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Total Entries</div>
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
              <div class="summary-label">Total Debit</div>
              <div class="summary-value">Rs ${summary.totalDebit.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Commute Rent</div>
              <div class="summary-value">Rs ${summary.totalCommuteRent.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Net Balance</div>
              <div class="summary-value">Rs ${summary.netBalance.toFixed(2)}</div>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
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
                  <td>${format(new Date(entry.date), 'dd/MM/yyyy')}</td>
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
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" class="print-button">
              Print Report
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

  const handlePrintBill = (entry) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const customerName = customer?.name || 'Unknown Customer';
    
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A1172]"></div>
          <p className="mt-4 text-gray-600">Loading customer data...</p>
        </div>
      </Layout>
    );
  }

  if (!customer || !entries.length) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
          <p className="text-gray-500 mb-6">No lead selling entries found for this customer.</p>
          <button
            onClick={() => router.push('/lead-selling')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lead Selling
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
              onClick={() => router.push('/lead-selling')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Lead Selling History</h1>
              <p className="text-gray-600 mt-1">All lead selling entries for {customer.name}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
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
                <p className="text-sm opacity-90">Lead Selling Customer</p>
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
                <span className="text-sm font-medium">Total Credit</span>
              </div>
              <div className="text-xl font-bold">Rs {summary.totalCredit.toFixed(2)}</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Total Debit</span>
              </div>
              <div className="text-xl font-bold">Rs {summary.totalDebit.toFixed(2)}</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Total Received</span>
              </div>
              <div className="text-xl font-bold text-green-300">Rs {summary.totalReceived?.toFixed(2) || '0.00'}</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Net Balance</span>
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
            <h3 className="text-lg font-medium text-gray-900">Lead Selling Entries</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#0A1172]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      Rs {entry.commuteRent?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.weight?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      Rs {entry.rate?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      Rs {entry.debit?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                      Rs {entry.credit?.toFixed(2) || '0.00'}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${entry.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Rs {entry.balance?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handlePrintBill(entry)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Print lead selling bill"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Received Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment Received</h3>
            <p className="text-sm text-gray-500 mt-1">All payment entries (payments without lead selling)</p>
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
                          Rs {(payment.debit || 0).toFixed(2)}
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
                      Rs {summary.totalReceived?.toFixed(2) || '0.00'}
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
    </Layout>
  );
}
