import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, X, Download } from 'lucide-react';

const PDFExportModal = ({ isOpen, onClose, onExportToday, onExportAll, selectedDate, isExportingPDF }) => {
  if (!isOpen) return null;

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
                  <h4 className="font-medium text-gray-900">Today's Ledger</h4>
                  <p className="text-sm text-gray-500">
                    Export entries for {selectedDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={onExportToday}
                disabled={isExportingPDF}
                className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-[#0A1172] border border-transparent rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Today</span>
                  </>
                )}
              </button>
            </div>

            {/* All Bills PDF Option */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A1172]/30 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">All Bills</h4>
                  <p className="text-sm text-gray-500">
                    Export all ledger entries from database
                  </p>
                </div>
              </div>
              <button
                onClick={onExportAll}
                disabled={isExportingPDF}
                className="mt-3 w-full px-4 py-2 text-sm font-medium text-[#0A1172] bg-white border border-[#0A1172] rounded-md hover:bg-[#0A1172]/5 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#0A1172]"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export All</span>
                  </>
                )}
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
