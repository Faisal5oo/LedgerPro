import React from 'react';
import { Plus, Printer, FileDown, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const LeadExtractionActions = ({ onAdd, onPrint, onExportPDF, selectedDate, onDateChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200"
    >
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input 
            type="date" 
            value={selectedDate.toISOString().split('T')[0]} 
            onChange={(e) => onDateChange(new Date(e.target.value))} 
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors" 
          />
        </div>
        <button 
          onClick={onAdd} 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Entry
        </button>
      </div>
      
      <div className="flex space-x-3">
        <button 
          onClick={onPrint} 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </button>
        <button 
          onClick={onExportPDF}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Export PDF
        </button>
      </div>
    </motion.div>
  );
};

export default LeadExtractionActions;
