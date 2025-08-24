import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Package, 
  BarChart3, 
  Settings, 
  User,
  LogOut,
  Home
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home
    },
    {
      name: 'Ledger',
      href: '/ledger',
      icon: BookOpen
    },
    {
      name: 'Lead Extraction',
      href: '/lead-extraction',
      icon: Package
    }
  ];

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('adminData');
    sessionStorage.removeItem('adminData');
    
    // Clear cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login
    window.location.href = '/login';
  };

  return (
    <div className="bg-white border-r border-gray-200 w-64 min-h-screen p-4">
      {/* Logo/Brand */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A1172]">Business Panel</h1>
        <p className="text-sm text-gray-500">Admin Dashboard</p>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#0A1172] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#0A1172]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
