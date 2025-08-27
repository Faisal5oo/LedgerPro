import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Package, Scale, Download, Percent, User } from 'lucide-react';
import { CustomerSelector } from '@/components';

const LeadExtractionForm = ({ entry, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: 'Battery for Lead',
    batteryWeight: '',
    leadReceived: '',
    leadPercentage: 60
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: entry.description || 'Battery for Lead',
        batteryWeight: entry.batteryWeight || '',
        leadReceived: entry.leadReceived || '', // Allow empty for editing
        leadPercentage: entry.leadPercentage || 60
      });
      // Set selectedCustomer properly - handle both populated and non-populated cases
      if (entry.customerId) {
        if (typeof entry.customerId === 'object' && entry.customerId.name) {
          // Customer is populated
          setSelectedCustomer(entry.customerId);
        } else {
          // Customer is just an ID
          setSelectedCustomer(entry.customerId);
        }
      } else {
        setSelectedCustomer(null);
      }
    } else {
      // Reset form for new entry
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: 'Battery for Lead',
        batteryWeight: '',
        leadReceived: '', // Start empty, not '0'
        leadPercentage: 60
      });
      setSelectedCustomer(null);
    }
  }, [entry]);

  // Calculate lead weight and pending on battery weight or percentage change
  useEffect(() => {
    if (formData.batteryWeight && !isNaN(formData.batteryWeight)) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        setIsCalculating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.batteryWeight, formData.leadPercentage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    if (!formData.batteryWeight || parseFloat(formData.batteryWeight) <= 0) {
      alert('Please enter a valid battery weight');
      return;
    }

    if (formData.leadReceived === '' || isNaN(parseFloat(formData.leadReceived))) {
      alert('Please enter a valid lead received amount (can be 0)');
      return;
    }

    const leadPercentage = parseFloat(formData.leadPercentage) || 60; // Default to 60% if not provided
    if (leadPercentage <= 0 || leadPercentage > 100) {
      alert('Please enter a valid lead percentage (1-100)');
      return;
    }

    // Calculate all values on the frontend
    const batteryWeight = parseFloat(formData.batteryWeight);
    const leadReceived = parseFloat(formData.leadReceived) || 0; // Allow 0
    const leadWeight = Math.round((batteryWeight * leadPercentage / 100) * 100) / 100;
    const leadPending = Math.round((leadWeight - leadReceived) * 100) / 100;
    const percentage = leadWeight > 0 ? Math.round((leadReceived / leadWeight) * 100) : 0;

    const submitData = {
      customerId: selectedCustomer._id,
      date: new Date(formData.date).toISOString(), // Convert Date to ISO string
      description: formData.description,
      batteryWeight: batteryWeight,
      leadPercentage: leadPercentage,
      leadWeight: leadWeight,
      leadReceived: leadReceived,
      leadPending: leadPending,
      percentage: percentage
    };

    console.log('Form submitting complete data:', submitData);
    console.log('Selected customer:', selectedCustomer);
    console.log('Customer ID being sent:', submitData.customerId);
    console.log('Calculated values:', {
      leadWeight: `${leadWeight} kg (${leadPercentage}% of ${batteryWeight} kg)`,
      leadPending: `${leadPending} kg (${leadWeight} - ${leadReceived})`,
      percentage: `${percentage}% (${leadReceived}/${leadWeight} * 100)`
    });

    onSubmit(submitData);
  };

  // Calculate derived values
  const leadWeight = formData.batteryWeight && formData.leadPercentage ? 
    (parseFloat(formData.batteryWeight) * parseFloat(formData.leadPercentage) / 100) : 0;
  const leadPending = leadWeight - (parseFloat(formData.leadReceived) || 0);
  const percentage = leadWeight > 0 ? ((parseFloat(formData.leadReceived) || 0) / leadWeight * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-lg shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {entry ? 'Edit Lead Extraction Entry' : 'Add New Lead Extraction Entry'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track battery purchases and lead extraction progress
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Customer
            </label>
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onCustomerSelect={setSelectedCustomer}
              placeholder="Select customer for lead extraction"
              className="w-full"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <div className="relative">
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                list="description-options"
                placeholder="Type or select description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
                required
              />
              <datalist id="description-options">
                <option value="Battery for Lead" />
                <option value="Battery Scrap" />
                <option value="Used Battery" />
                <option value="Battery Waste" />
                <option value="Lead Acid Battery" />
                <option value="Old Battery" />
                <option value="Damaged Battery" />
              </datalist>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Type your own description or select from the dropdown
            </p>
          </div>

          {/* Battery Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Scale className="w-4 h-4 inline mr-2" />
              Battery Weight (kg)
            </label>
            <input
              type="number"
              name="batteryWeight"
              value={formData.batteryWeight}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="Enter battery weight"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Enter the total weight of batteries purchased.
            </p>
          </div>

          {/* Lead Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Percent className="w-4 h-4 inline mr-2" />
              Lead Percentage (%)
            </label>
            <input
              type="number"
              name="leadPercentage"
              value={formData.leadPercentage}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="100"
              placeholder="Enter lead percentage"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Percentage of battery weight expected as lead (default: 60%).
            </p>
          </div>

          {/* Lead Received */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Download className="w-4 h-4 inline mr-2" />
              Lead Received (kg)
            </label>
            <input
              type="number"
              name="leadReceived"
              value={formData.leadReceived}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="Enter lead received"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Enter the actual amount of lead obtained from the batteries.
            </p>
          </div>
        </div>

        {/* Calculated Values Display */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {isCalculating ? '...' : leadWeight.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Lead Weight (kg)</div>
              <div className="text-xs text-gray-400">{formData.leadPercentage}% of battery weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {isCalculating ? '...' : leadPending.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Lead Pending (kg)</div>
              <div className="text-xs text-gray-400">Remaining to receive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {isCalculating ? '...' : percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Completion</div>
              <div className="text-xs text-gray-400">Lead received vs total</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[#0A1172] rounded-md hover:bg-[#0A1172]/90 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 transition-colors"
          >
            {entry ? 'Update Entry' : 'Add Entry'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default LeadExtractionForm;
