import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import CustomerSelector from './CustomerSelector';

const LedgerForm = ({ entry, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    customerId: '',
    batteryType: 'battery', // Set default value
    totalWeight: '',
    ratePerKg: '',
    debit: '0', // Start at 0 instead of empty string
    notes: ''
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customType, setCustomType] = useState('');

  const batteryTypes = ['battery', 'gutka'];

  useEffect(() => {
    if (entry) {
      console.log('Editing entry:', entry);
      setFormData({
        ...entry,
        date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        customerId: entry.customerId || '',
        totalWeight: entry.totalWeight || '',
        ratePerKg: entry.ratePerKg || '',
        debit: entry.debit || '',
        notes: entry.notes || ''
      });
      
      // Set selected customer for display
      if (entry.customerId && entry.customerName) {
        setSelectedCustomer({
          _id: entry.customerId,
          name: entry.customerName
        });
      }
      
      if (!batteryTypes.includes(entry.batteryType)) {
        setCustomType(entry.batteryType);
      }
    } else {
      console.log('Creating new entry - setting default values');
      // Reset form for new entry
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerId: '',
        batteryType: 'battery', // Set default value
        totalWeight: '',
        ratePerKg: '',
        debit: '0', // Start at 0 instead of empty string
        notes: ''
      });
      setSelectedCustomer(null);
      setCustomType('');
    }
    console.log('Form data after useEffect:', formData);
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'date' ? new Date(value) : value
    }));
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer ? customer._id : ''
    }));
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, batteryType: type }));
    setCustomType('');
    setIsDropdownOpen(false);
  };

  const handleCustomTypeChange = (value) => {
    setCustomType(value);
    setFormData(prev => ({ ...prev, batteryType: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form data before validation:', formData);
    
    // Validate required fields - be more lenient
    if (!formData.customerId || formData.customerId.trim() === '') {
      alert('Please select a customer');
      return;
    }
    
    if (!formData.batteryType || formData.batteryType.trim() === '') {
      alert('Please select a battery type');
      return;
    }
    
    if (!formData.totalWeight || parseFloat(formData.totalWeight) <= 0) {
      alert('Please enter a valid total weight');
      return;
    }
    
    if (!formData.ratePerKg || parseFloat(formData.ratePerKg) <= 0) {
      alert('Please enter a valid rate per kg');
      return;
    }
    
    // Debit can be 0, so just check if it's a valid number
    if (formData.debit === '' || isNaN(parseFloat(formData.debit))) {
      alert('Please enter a valid debit amount');
      return;
    }
    
    // Ensure date is a Date object and convert to ISO string
    const dateValue = formData.date instanceof Date ? formData.date : new Date(formData.date);
    
    // Convert empty strings to 0 for numeric fields
    const submitData = {
      ...formData,
      date: dateValue.toISOString(), // Convert Date to ISO string
      customerId: formData.customerId,
      totalWeight: parseFloat(formData.totalWeight) || 0,
      ratePerKg: parseFloat(formData.ratePerKg) || 0,
      debit: parseFloat(formData.debit) || 0,
      notes: formData.notes.trim()
    };
    
    console.log('Form submitting data:', submitData);
    onSubmit(submitData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg space-y-5"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {entry ? 'Edit Entry' : 'Add New Entry'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer
          </label>
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onCustomerSelect={handleCustomerSelect}
            placeholder="Select or create customer"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Type
          </label>
          <div className="relative">
            <input
              type="text"
              value={customType || formData.batteryType}
              onChange={(e) => handleCustomTypeChange(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors pr-8"
              placeholder="Type or select product type"
              required
            />
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {batteryTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#0A1172]/5 hover:text-[#0A1172] transition-colors capitalize"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Weight (kg)
          </label>
          <input
            type="number"
            name="totalWeight"
            value={formData.totalWeight}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
            placeholder="Enter weight in kg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate per kg
          </label>
          <input
            type="number"
            name="ratePerKg"
            value={formData.ratePerKg}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
            placeholder="Enter rate per kg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Debit Amount
          </label>
          <input
            type="number"
            name="debit"
            value={formData.debit}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
            placeholder="Enter debit amount"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
            placeholder="Add any additional notes (optional)"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
        >
          {entry ? 'Update' : 'Add'} Entry
        </button>
      </div>
    </motion.form>
  );
};

export default LedgerForm;
