import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Calendar } from 'lucide-react';

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
          className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#0A1172]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0A1172]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export PDF Report</h3>
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
            {/* Today's Report Option */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A1172]/30 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Today's Lead Extraction Report</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Export lead extraction data for {selectedDate.toLocaleDateString()}
                  </p>
                  <button
                    onClick={onExportToday}
                    disabled={isExportingPDF}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExportingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-2" />
                        Export Today's Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* All Records Option */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A1172]/30 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Complete Lead Extraction Report</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Export all lead extraction records from the beginning
                  </p>
                  <button
                    onClick={onExportAll}
                    disabled={isExportingPDF}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExportingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-2" />
                        Export All Records
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PDFExportModal;
