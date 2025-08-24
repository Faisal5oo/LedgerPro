import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

const DashboardHeader = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-600 hover:text-[#0A1172] mr-4"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1 flex items-center">
        <div className="relative max-w-md w-full hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A1172]/20 focus:border-[#0A1172]"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-600 hover:text-[#0A1172] hover:bg-[#0A1172]/5 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#0A1172] text-white flex items-center justify-center font-medium">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
