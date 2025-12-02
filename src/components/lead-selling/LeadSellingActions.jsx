import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar, 
  Printer, 
  FileText,
  X
} from 'lucide-react';

const LeadSellingActions = ({ 
  onAdd, 
  onPrint, 
  onExportPDF, 
  selectedDate, 
  onDateChange, 
  onSearch, 
  searchTerm, 
  onClearSearch 
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchValue = formData.get('search');
    if (searchValue && searchValue.trim()) {
      onSearch(searchValue.trim());
      setIsSearchOpen(false);
    }
  };

  const handleClearSearch = () => {
    onClearSearch();
    setIsSearchOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
      >
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search customer across all dates..."
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
        {searchTerm && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-3">
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
              value={selectedDate instanceof Date && !isNaN(selectedDate.getTime()) 
                ? selectedDate.toISOString().split('T')[0] 
                : ''} 
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue) {
                  const newDate = new Date(inputValue);
                  if (!isNaN(newDate.getTime())) {
                    onDateChange(newDate);
                  }
                }
              }} 
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
            />
          </div>
          
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Lead Selling Entry
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Print All */}
          <button
            onClick={onPrint}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print All
          </button>

          {/* Export PDF button hidden for now */}
          {/* <button 
            onClick={onExportPDF}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-600 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/20 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </button> */}
        </div>
      </motion.div>
    </div>
  );
};

export default LeadSellingActions;
