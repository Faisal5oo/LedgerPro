'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  BatteryCharging, 
  Scale, 
  Download, 
  Percent, 
  Printer,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from "@/components/LayoutWrapper";

export default function LeadExtractionCustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;

  const [customer, setCustomer] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch customer data
  const fetchCustomerEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/lead-extraction/customer/${customerId}`);
      const data = await response.json();

      if (data.success) {
        setCustomer(data.data.customer);
        setEntries(data.data.entries);
        setSummary(data.data.summary);
      } else {
        toast.error(data.error || 'Failed to fetch customer data');
        router.push('/lead-extraction');
      }
    } catch (error) {
      console.error('Error fetching customer entries:', error);
      toast.error('Failed to fetch customer data');
      router.push('/lead-extraction');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerEntries();
    }
  }, [customerId]);

  // Handle entry deletion
  const handleDelete = async (entryId) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/lead-extraction?id=${entryId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Entry deleted successfully');
        fetchCustomerEntries(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    
    const customerName = customer?.name || 'Unknown Customer';
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lead Extraction Report - ${customerName}</title>
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
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              color: #0A1172;
            }
            .customer-info { 
              margin-bottom: 20px; 
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 15px; 
              margin: 20px 0; 
            }
            .summary-item { 
              text-align: center; 
              padding: 15px; 
              background-color: #e9ecef; 
              border-radius: 5px; 
            }
            .summary-value { 
              font-size: 18px; 
              font-weight: bold; 
              color: #0A1172; 
            }
            .summary-label { 
              font-size: 12px; 
              color: #666; 
              margin-top: 5px; 
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
              background-color: #0A1172; 
              color: white; 
              font-weight: bold;
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
            <div class="company-name">LEAD EXTRACTION REPORT</div>
            <div>Customer: ${customerName}</div>
            <div>Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="customer-info">
            <h3>Customer Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-value">${summary.totalEntries}</div>
                <div class="summary-label">Total Entries</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${summary.totalBatteryWeight.toFixed(2)} kg</div>
                <div class="summary-label">Total Battery Weight</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${summary.totalLeadWeight.toFixed(2)} kg</div>
                <div class="summary-label">Total Lead Weight</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${summary.averageCompletion.toFixed(1)}%</div>
                <div class="summary-label">Avg Completion</div>
              </div>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Battery Weight (kg)</th>
                <th>Lead %</th>
                <th>Lead Weight (kg)</th>
                <th>Lead Received (kg)</th>
                <th>Lead Pending (kg)</th>
                <th>Completion (%)</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${format(new Date(entry.date), 'dd/MM/yyyy')}</td>
                  <td>${entry.description || 'N/A'}</td>
                  <td>${entry.batteryWeight?.toFixed(2) || '0.00'}</td>
                  <td>${entry.leadPercentage?.toFixed(1) || '60.0'}%</td>
                  <td>${entry.leadWeight?.toFixed(2) || '0.00'}</td>
                  <td>${entry.leadReceived?.toFixed(2) || '0.00'}</td>
                  <td>${entry.leadPending?.toFixed(2) || '0.00'}</td>
                  <td>${entry.percentage?.toFixed(1) || '0.0'}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Report generated on: ${new Date().toLocaleString()}</p>
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

  // Handle print individual bill
  const handlePrintBill = (entry) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const customerName = customer?.name || 'Unknown Customer';
    
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
          <p className="text-gray-500 mb-6">No lead extraction entries found for this customer.</p>
          <button
            onClick={() => router.push('/lead-extraction')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lead Extraction
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
              onClick={() => router.push('/lead-extraction')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Lead Extraction History</h1>
              <p className="text-gray-600 mt-1">All lead extraction entries for {customer.name}</p>
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
                <p className="text-sm opacity-90">Lead Extraction Customer</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Total Entries</div>
              <div className="text-2xl font-bold">{summary.totalEntries}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BatteryCharging className="w-5 h-5" />
                <span className="text-sm font-medium">Total Battery Weight</span>
              </div>
              <div className="text-xl font-bold">{summary.totalBatteryWeight.toFixed(2)} kg</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Scale className="w-5 h-5" />
                <span className="text-sm font-medium">Total Lead Weight</span>
              </div>
              <div className="text-xl font-bold">{summary.totalLeadWeight.toFixed(2)} kg</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Download className="w-5 h-5" />
                <span className="text-sm font-medium">Lead Received</span>
              </div>
              <div className="text-xl font-bold">{summary.totalLeadReceived.toFixed(2)} kg</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Percent className="w-5 h-5" />
                <span className="text-sm font-medium">Avg Completion</span>
              </div>
              <div className="text-xl font-bold">{summary.averageCompletion.toFixed(1)}%</div>
            </div>
          </div>
        </motion.div>

        {/* Entries Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lead Extraction Entries</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#0A1172]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-600">
                      {entry.leadPercentage?.toFixed(1) || '60.0'}%
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
                          onClick={() => handlePrintBill(entry)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Print lead extraction bill"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/lead-extraction?edit=${entry._id}`)}
                          className="text-[#0A1172] hover:text-[#0A1172]/80 p-1 rounded hover:bg-[#0A1172]/10 transition-colors"
                          title="Edit entry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
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
        </div>
      </div>
    </Layout>
  );
}
