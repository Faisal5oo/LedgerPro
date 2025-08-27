'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  LeadSellingTable, 
  LeadSellingForm, 
  LeadSellingActions, 
  DeleteConfirmModal, 
  PDFExportModal, 
  LeadSellingSearchSummary
} from '@/components/lead-selling';
import Layout from "@/components/LayoutWrapper";

export default function LeadSellingPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, entry: null });
  const [pdfModal, setPdfModal] = useState({ isOpen: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch entries for the selected date
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/lead-selling?date=${dateStr}`);
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch lead selling entries');
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to fetch lead selling entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all entries for search
  const fetchAllEntries = async () => {
    try {
      const response = await fetch('/api/lead-selling');
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Failed to fetch all entries:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching all entries:', error);
      return [];
    }
  };

  // Handle search
  const handleSearch = async (term) => {
    if (!term.trim()) return;
    
    try {
      setIsSearching(true);
      setSearchTerm(term);
      
      const response = await fetch(`/api/lead-selling/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        setEntries(data.data.entries);
      } else {
        toast.error(data.error || 'Search failed');
        setSearchResults(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    fetchEntries(); // Fetch entries for current date
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      const url = selectedEntry ? `/api/lead-selling?id=${selectedEntry._id}` : '/api/lead-selling';
      const method = selectedEntry ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(selectedEntry ? 'Entry updated successfully!' : 'Entry added successfully!');
        setIsFormOpen(false);
        setSelectedEntry(null);
        
        // Refresh entries
        if (searchTerm) {
          handleSearch(searchTerm);
        } else {
          fetchEntries();
        }
      } else {
        toast.error(data.error || 'Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    }
  };

  // Handle delete
  const handleDelete = async (entry) => {
    try {
      const response = await fetch(`/api/lead-selling?id=${entry._id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Entry deleted successfully!');
        setDeleteModal({ isOpen: false, entry: null });
        
        // Refresh entries
        if (searchTerm) {
          handleSearch(searchTerm);
        } else {
          fetchEntries();
        }
      } else {
        toast.error(data.error || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  // Handle print
  const handlePrint = async () => {
    try {
      const allEntries = await fetchAllEntries();
      if (allEntries.length === 0) {
        toast.error('No entries to print');
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
                ${allEntries.map(entry => `
                  <tr>
                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                    <td>${entry.customerName || entry.customerId?.name || 'Unknown'}</td>
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
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print report');
    }
  };

  // Handle customer click - navigate to customer detail page
  const handleCustomerClick = (customerId) => {
    router.push(`/lead-selling/customer-detail/${customerId}`);
  };

  // Show delete modal
  const showDeleteModal = (entry) => {
    setDeleteModal({ isOpen: true, entry });
  };

  // Show PDF modal
  const showPDFModal = () => {
    setPdfModal({ isOpen: true });
  };

  // Load entries on component mount and date change
  useEffect(() => {
    if (!searchTerm) {
      fetchEntries();
    }
  }, [selectedDate, searchTerm]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Selling</h1>
            <p className="text-gray-600 mt-1">Manage lead sales to clients</p>
          </div>
        </div>

        <LeadSellingActions
          onAdd={() => {
            setSelectedEntry(null);
            setIsFormOpen(true);
          }}
          onPrint={handlePrint}
          onExportPDF={showPDFModal}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onSearch={handleSearch}
          searchTerm={searchTerm}
          onClearSearch={handleClearSearch}
        />

        {/* Search Results Summary */}
        {searchResults && searchTerm && (
          <LeadSellingSearchSummary searchResults={searchResults} searchTerm={searchTerm} />
        )}

        {isLoading || isSearching ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A1172]"></div>
            <p className="mt-4 text-gray-600">
              {isSearching ? 'Searching...' : 'Loading lead selling entries...'}
            </p>
          </div>
        ) : entries.length > 0 ? (
          <LeadSellingTable
            entries={entries}
            onEdit={(entry) => {
              setSelectedEntry(entry);
              setIsFormOpen(true);
            }}
            onDelete={showDeleteModal}
            onCustomerClick={handleCustomerClick}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No entries found' : 'No lead selling entries for this date'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? `No entries found matching "${searchTerm}"`
                : 'Get started by adding your first lead selling entry for this date.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
              >
                Add First Entry
              </button>
            )}
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <LeadSellingForm
              entry={selectedEntry}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedEntry(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModal.isOpen && (
            <DeleteConfirmModal
              entry={deleteModal.entry}
              onConfirm={handleDelete}
              onCancel={() => setDeleteModal({ isOpen: false, entry: null })}
            />
          )}
        </AnimatePresence>

        {/* PDF Export Modal */}
        <AnimatePresence>
          {pdfModal.isOpen && (
            <PDFExportModal
              entries={entries}
              selectedDate={selectedDate}
              onClose={() => setPdfModal({ isOpen: false })}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
