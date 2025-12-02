import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, Scale, TrendingUp, Truck, Package } from 'lucide-react';
import { CustomerSelector } from '@/components';

const LeadSellingForm = ({ entry, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    commuteRent: '',
    weight: '',
    rate: '',
    debit: '0',
    notes: ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isPaymentOnly, setIsPaymentOnly] = useState(false);

  // Handle entry prop for editing
  useEffect(() => {
    if (entry) {
      const isPayment = entry.isPaymentOnly === true;
      setIsPaymentOnly(isPayment);
      
      setFormData({
        date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        commuteRent: entry.commuteRent || '',
        weight: entry.weight || '',
        rate: entry.rate || '',
        debit: entry.debit || '0',
        notes: entry.notes || ''
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
      setIsPaymentOnly(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        commuteRent: '',
        weight: '',
        rate: '',
        debit: '0',
        notes: ''
      });
      setSelectedCustomer(null);
    }
  }, [entry]);

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

    // For payment-only entries
    if (isPaymentOnly) {
      if (!formData.debit || parseFloat(formData.debit) <= 0) {
        alert('Please enter a valid payment amount');
        return;
      }

      const submitData = {
        customerId: selectedCustomer._id,
        date: new Date(formData.date).toISOString(),
        commuteRent: 0,
        weight: 0,
        rate: 0,
        debit: parseFloat(formData.debit),
        credit: 0,
        balance: -parseFloat(formData.debit),
        notes: formData.notes,
        isPaymentOnly: true
      };

      console.log('Form submitting payment entry:', submitData);
      onSubmit(submitData);
      return;
    }

    // For regular lead selling entries
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      alert('Please enter a valid rate');
      return;
    }

    if (formData.debit === '' || isNaN(parseFloat(formData.debit))) {
      alert('Please enter a valid debit amount');
      return;
    }

    if (formData.commuteRent === '' || isNaN(parseFloat(formData.commuteRent))) {
      alert('Please enter a valid commute rent');
      return;
    }

    // Calculate credit and balance
    const weight = parseFloat(formData.weight);
    const rate = parseFloat(formData.rate);
    const debit = parseFloat(formData.debit) || 0;
    const commuteRent = parseFloat(formData.commuteRent) || 0;
    
    // Credit = (weight * rate) + commute rent
    const credit = Math.round((weight * rate + commuteRent) * 100) / 100;
    const balance = Math.round((credit - debit) * 100) / 100;

    const submitData = {
      customerId: selectedCustomer._id,
      date: new Date(formData.date).toISOString(),
      commuteRent: commuteRent,
      weight: weight,
      rate: rate,
      debit: debit,
      credit: credit,
      balance: balance,
      notes: formData.notes,
      isPaymentOnly: false
    };

    console.log('Form submitting complete data:', submitData);
    console.log('Selected customer:', selectedCustomer);
    console.log('Customer ID being sent:', submitData.customerId);
    console.log('Calculated values:', {
      credit: `Rs ${credit} (${weight} kg × Rs ${rate} + Rs ${commuteRent} commute rent)`,
      balance: `Rs ${balance} (Rs ${credit} - Rs ${debit})`
    });

    onSubmit(submitData);
  };

  // Calculate derived values for display
  const weight = parseFloat(formData.weight) || 0;
  const rate = parseFloat(formData.rate) || 0;
  const commuteRent = parseFloat(formData.commuteRent) || 0;
  const debit = parseFloat(formData.debit) || 0;
  const credit = weight * rate + commuteRent;
  const balance = credit - debit;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {entry ? 'Edit Lead Selling Entry' : 'Add New Lead Selling Entry'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
                placeholder="Select customer for lead selling"
                className="w-full"
              />
            </div>

            {/* Payment Only Checkbox */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPaymentOnly}
                  onChange={(e) => setIsPaymentOnly(e.target.checked)}
                  className="w-4 h-4 text-[#0A1172] border-gray-300 rounded focus:ring-[#0A1172]/20"
                />
                <span className="text-sm font-medium text-gray-700">
                  Payment Only Entry (Payment received without lead selling)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Check this to record a payment received without adding lead selling data
              </p>
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
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
                required
              />
            </div>

            {/* Payment Amount - shown only for payment entries */}
            {isPaymentOnly && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-2" />
                  Payment Amount (Rs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="debit"
                  value={formData.debit}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Enter payment amount received"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
                  required={isPaymentOnly}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Enter the payment amount received from the customer
                </p>
              </div>
            )}

            {/* Regular entry fields - hidden for payment entries */}
            {!isPaymentOnly && (
              <>
                {/* Commute Rent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="w-4 h-4 inline mr-2" />
                    Commute Rent (Rs)
                  </label>
                  <input
                    type="number"
                    name="commuteRent"
                    value={formData.commuteRent}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="Enter commute rent"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
                    required={!isPaymentOnly}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Transportation cost for delivering lead.
                  </p>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Scale className="w-4 h-4 inline mr-2" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="Enter lead weight"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
                    required={!isPaymentOnly}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Weight of lead being sold.
                  </p>
                </div>

                {/* Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Rate per kg (Rs)
                  </label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="Enter rate per kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
                    required={!isPaymentOnly}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Price per kg of lead.
                  </p>
                </div>

                {/* Debit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-2" />
                    Debit (Rs)
                  </label>
                  <input
                    type="number"
                    name="debit"
                    value={formData.debit}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="Enter debit amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
                    required={!isPaymentOnly}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount paid by customer (can be 0).
                  </p>
                </div>
              </>
            )}

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Add any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors"
              />
            </div>
          </div>

          {/* Calculated Values Display - hidden for payment entries */}
          {!isPaymentOnly && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    Rs {credit.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Credit</div>
                  <div className="text-xs text-gray-400">
                    ({weight.toFixed(2)} kg × Rs {rate.toFixed(2)} + Rs {commuteRent.toFixed(2)})
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Rs {balance.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Balance</div>
                  <div className="text-xs text-gray-400">
                    (Rs {credit.toFixed(2)} - Rs {debit.toFixed(2)})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
    </motion.div>
  );
};

export default LeadSellingForm;
