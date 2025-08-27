'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { 
  LedgerTable, 
  LedgerForm, 
  LedgerActions, 
  DeleteConfirmModal, 
  PDFExportModal,
  SearchSummary,

} from '@/components';
import Layout from "@/components/LayoutWrapper";

export default function LedgerPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch entries for selected date
  const fetchEntries = async () => {
    try {
      console.log('Fetching entries for date:', selectedDate);
      setIsLoading(true);
      const response = await fetch(
        `/api/ledger?date=${selectedDate.toISOString()}`
      );
      console.log('Fetch response status:', response.status);
      const data = await response.json();
      console.log('Fetch response data:', data);

      if (data.success && Array.isArray(data.data)) {
        setEntries(data.data);
      } else {
        setEntries([]);
        if (data.error) {
          console.error('API error:', data.error);
          toast.error(data.error);
        }
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
      toast.error('Failed to fetch entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all entries for all bills PDF
  const fetchAllEntries = async () => {
    try {
      const response = await fetch('/api/ledger');
      const data = await response.json();
      return data.success && Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching all entries:', error);
      return [];
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      fetchEntries();
    }
  }, [selectedDate, searchTerm]);

  // Search functionality
  const handleSearch = async (term) => {
    if (!term || term.trim().length < 2) return;
    
    try {
      setIsSearching(true);
      setSearchTerm(term);
      
      const response = await fetch(`/api/ledger/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        setEntries(data.data.entries);
      } else {
        toast.error(data.error || 'Search failed');
        setSearchResults(null);
        setEntries([]);
      }
    } catch (error) {
      console.error('Error searching entries:', error);
      toast.error('Failed to search entries');
      setSearchResults(null);
      setEntries([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search functionality
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    fetchEntries(); // Fetch entries for the selected date
  };

  // Handle form submission (create/update)
  const handleSubmit = async (data) => {
    try {
      console.log('Submitting ledger entry:', data);
      
      const url = selectedEntry
        ? `/api/ledger?id=${selectedEntry._id}`
        : '/api/ledger';
      const method = selectedEntry ? 'PUT' : 'POST';

      console.log('Making request to:', url, 'with method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        const message = result.message || (
          selectedEntry ? 'Entry updated successfully' : 'Entry added successfully'
        );
        toast.success(message);
        setIsFormOpen(false);
        setSelectedEntry(null);
        fetchEntries();
      } else {
        console.error('API returned error:', result.error);
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting entry:', error);
      toast.error('Failed to submit entry');
    }
  };

  // Handle entry deletion
  const handleDelete = async (id) => {
    try {
      console.log('Deleting entry with ID:', id);
      console.log('ID type:', typeof id);
      console.log('ID value:', id);
      
      if (!id) {
        toast.error('Invalid entry ID');
        return;
      }

      const response = await fetch(`/api/ledger?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Entry deleted successfully');
        fetchEntries();
      } else {
        toast.error(result.error || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  // Handle customer click - navigate to customer detail page
  const handleCustomerClick = (customerId) => {
    router.push(`/ledger/customer-detail/${customerId}`);
  };

  // Handle weight addition
  const handleWeightAdd = (updatedEntry) => {
    // Refresh the entries to show updated data
    fetchEntries();
  };

  // Show delete confirmation modal
  const showDeleteModal = (entry) => {
    setEntryToDelete(entry);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (entryToDelete) {
      await handleDelete(entryToDelete._id);
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Generate PDF with proper formatting
  const generatePDF = async (entries, title, filename) => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 105, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
      
      if (entries.length === 0) {
        doc.text('No entries found', 20, 50);
      } else {
        // Prepare table data with proper formatting
        const tableData = entries.map((entry, index) => [
          index + 1,
          entry.customerName || 'N/A',
          entry.batteryType || 'N/A',
          entry.totalWeight ? `${entry.totalWeight} kg` : 'N/A',
          entry.ratePerKg ? `Rs ${entry.ratePerKg.toFixed(2)}` : 'N/A',
          entry.credit ? `Rs ${entry.credit.toFixed(2)}` : 'N/A',
          entry.debit ? `Rs ${entry.debit.toFixed(2)}` : 'N/A',
          entry.balance ? `Rs ${entry.balance.toFixed(2)}` : 'N/A'
        ]);
        
        // Add table
        autoTable(doc, {
          head: [['#', 'Customer', 'Product Type', 'Total Weight', 'Rate/kg', 'Credit', 'Debit', 'Balance']],
          body: tableData,
          startY: 50,
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [10, 17, 114], // #0A1172
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          columnStyles: {
            0: { cellWidth: 15 }, // #
            1: { cellWidth: 35 }, // Customer
            2: { cellWidth: 30 }, // Product Type
            3: { cellWidth: 25 }, // Total Weight
            4: { cellWidth: 25 }, // Rate/kg
            5: { cellWidth: 30 }, // Credit
            6: { cellWidth: 30 }, // Debit
            7: { cellWidth: 30 }, // Balance
          },
        });
        
        // Add summary
        const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
        const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
        const finalBalance = totalCredit - totalDebit;
        
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Credit: Rs ${totalCredit.toFixed(2)}`, 20, finalY);
        doc.text(`Total Debit: Rs ${totalDebit.toFixed(2)}`, 20, finalY + 10);
        doc.text(`Final Balance: Rs ${finalBalance.toFixed(2)}`, 20, finalY + 20);
      }
      
      // Save the PDF
      doc.save(filename);
      
      toast.success('PDF exported successfully!', { id: 'pdf-export' });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.', { id: 'pdf-export' });
    }
  };

  // Handle PDF export for today
  const handleExportToday = async () => {
    if (isExportingPDF) return;
    
    try {
      setIsExportingPDF(true);
      toast.loading('Generating PDF...', { id: 'pdf-export' });
      
      const title = `Daily Ledger Report - ${selectedDate.toLocaleDateString()}`;
      const filename = `ledger-${selectedDate.toISOString().split('T')[0]}.pdf`;
      
      await generatePDF(entries, title, filename);
      setIsPDFModalOpen(false);
    } catch (error) {
      console.error('Error exporting today\'s PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Handle PDF export for all bills
  const handleExportAll = async () => {
    if (isExportingPDF) return;
    
    try {
      setIsExportingPDF(true);
      toast.loading('Generating PDF...', { id: 'pdf-export' });
      
      const allEntries = await fetchAllEntries();
      const title = 'Complete Ledger Report - All Entries';
      const filename = `ledger-all-entries-${new Date().toISOString().split('T')[0]}.pdf`;
      
      await generatePDF(allEntries, title, filename);
      setIsPDFModalOpen(false);
    } catch (error) {
      console.error('Error exporting all bills PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Show PDF export modal
  const showPDFModal = () => {
    setIsPDFModalOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Ledger</h1>
            <p className="text-gray-600 mt-1">Manage your daily business transactions</p>
          </div>
        </div>

        <LedgerActions
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
          <SearchSummary searchResults={searchResults} searchTerm={searchTerm} />
        )}



        {isLoading || isSearching ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A1172]"></div>
            <p className="mt-4 text-gray-600">
              {isSearching ? 'Searching...' : 'Loading entries...'}
            </p>
          </div>
        ) : entries.length > 0 ? (
          <LedgerTable
            entries={entries}
            onEdit={(entry) => {
              setSelectedEntry(entry);
              setIsFormOpen(true);
            }}
            onDelete={showDeleteModal}
            onCustomerClick={handleCustomerClick}
            onWeightAdd={handleWeightAdd}
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            {searchTerm ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No search results found</h3>
                <p className="text-gray-500 mb-6">No entries found for "{searchTerm}" across all dates. Try a different search term.</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleClearSearch}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEntry(null);
                      setIsFormOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
                  >
                    Add New Entry
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
                <p className="text-gray-500 mb-6">No transactions recorded for {selectedDate.toLocaleDateString()}. Start by adding your first entry.</p>
                <button
                  onClick={() => {
                    setSelectedEntry(null);
                    setIsFormOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
                >
                  Add First Entry
                </button>
              </>
            )}
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <LedgerForm
                  entry={selectedEntry}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setSelectedEntry(null);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setEntryToDelete(null);
          }}
          onConfirm={confirmDelete}
          entry={entryToDelete}
        />

        {/* PDF Export Options Modal */}
        <PDFExportModal
          isOpen={isPDFModalOpen}
          onClose={() => setIsPDFModalOpen(false)}
          onExportToday={handleExportToday}
          onExportAll={handleExportAll}
          selectedDate={selectedDate}
          isExportingPDF={isExportingPDF}
        />


      </div>
    </Layout>
  );
}
