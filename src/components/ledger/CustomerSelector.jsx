import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';

const CustomerSelector = ({ 
  selectedCustomer, 
  onCustomerSelect, 
  placeholder = "Select or create customer",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
    if (!newCustomerName.trim()) return;
    
    try {
      setCreatingCustomer(true);
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCustomerName.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add new customer to the list
        setCustomers(prev => [...prev, data.data]);
        // Select the new customer
        onCustomerSelect(data.data);
        setNewCustomerName('');
        setShowCreateForm(false);
        setIsOpen(false);
      } else {
        alert(data.error || 'Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setSearchTerm('');
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewCustomerName('');
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={selectedCustomer ? selectedCustomer.name : searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172] transition-colors pr-8"
          readOnly={selectedCustomer ? true : false}
        />
        
        {selectedCustomer && (
          <button
            onClick={() => {
              onCustomerSelect(null);
              setSearchTerm('');
            }}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {!showCreateForm ? (
            <>
              {/* Search and Create Button */}
              <div className="p-2 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search customers..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#0A1172]/20 focus:border-[#0A1172]"
                  />
                  <button
                    onClick={handleCreateClick}
                    className="p-1 text-[#0A1172] hover:bg-[#0A1172]/10 rounded transition-colors"
                    title="Create new customer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer List */}
              {loading ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  Loading customers...
                </div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer._id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#0A1172]/5 hover:text-[#0A1172] transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {customer.name}
                  </button>
                ))
              ) : searchTerm ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  No customers found. 
                  <button
                    onClick={handleCreateClick}
                    className="text-[#0A1172] hover:underline ml-1"
                  >
                    Create new customer
                  </button>
                </div>
              ) : (
                <div className="p-3 text-center text-sm text-gray-500">
                  No customers found
                </div>
              )}
            </>
          ) : (
            /* Create Customer Form */
            <div className="p-3 border-b border-gray-200">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#0A1172]/20 focus:border-[#0A1172]"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={createCustomer}
                    disabled={creatingCustomer || !newCustomerName.trim()}
                    className="flex-1 px-2 py-1 text-xs text-white bg-[#0A1172] rounded hover:bg-[#0A1172]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {creatingCustomer ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={handleCancelCreate}
                    className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
