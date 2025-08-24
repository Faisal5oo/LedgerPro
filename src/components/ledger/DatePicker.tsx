import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-4"
    >
      <label className="text-lg font-medium text-gray-700">Select Date:</label>
      <input
        type="date"
        value={format(selectedDate, 'yyyy-MM-dd')}
        onChange={(e) => onChange(new Date(e.target.value))}
        className="p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </motion.div>
  );
};

export default DatePicker;
