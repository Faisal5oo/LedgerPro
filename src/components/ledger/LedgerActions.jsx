import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Printer, FileDown, Calendar, Search, X } from 'lucide-react';

const LedgerActions = ({ 
  onAdd, 
  onPrint, 
  onExportPDF, 
  selectedDate, 
  onDateChange, 
  onSearch = () => {}, 
  searchTerm = '', 
  onClearSearch = () => {} 
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

  // Update local search term when prop changes
  React.useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchTerm.trim().length >= 2) {
      onSearch(localSearchTerm.trim());
    }
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onClearSearch();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex-1 min-w-64">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder="Search customer across all dates..."
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
              />
              {localSearchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={localSearchTerm.trim().length < 2}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
        {searchTerm && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Searching for: <strong>"{searchTerm}"</strong> across all dates</span>
            <button
              onClick={handleClearSearch}
              className="text-[#0A1172] hover:text-[#0A1172]/80 underline"
            >
              Clear
            </button>
          </div>
        )}
      </motion.div>

      {/* Date and Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input 
              type="date" 
              value={selectedDate && !isNaN(selectedDate.getTime()) 
                ? selectedDate.toISOString().split('T')[0] 
                : new Date().toISOString().split('T')[0]} 
              onChange={(e) => {
                const dateValue = e.target.value;
                if (dateValue) {
                  const newDate = new Date(dateValue);
                  // Only update if the date is valid
                  if (!isNaN(newDate.getTime())) {
                    onDateChange(newDate);
                  }
                }
              }} 
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors" 
            />
          </div>
          <button 
            onClick={onAdd} 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </button>
        </div>
      
        <div className="flex space-x-3">
          {/* <button 
            onClick={onPrint} 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button> */}
          <button 
            onClick={onExportPDF}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LedgerActions;