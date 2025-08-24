"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Warehouse,
  TrendingUp,
  LogOut,
  Settings,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  {
    path: '/',
    name: 'Dashboard',
    icon: BookOpen,
    description: 'Business Overview'
  },
  {
    path: '/ledger',
    name: 'Daily Ledger',
    icon: BookOpen,
    description: 'Manage Transactions'
  },
  {
    path: '/lead-extraction',
    name: 'Lead Extraction',
    icon: Warehouse,
    description: 'Battery to Lead'
  },
  {
    path: '/settings',
    name: 'Settings',
    icon: Settings,
    description: 'System Settings'
  }
];

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Get admin details from localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Clear any stored tokens or user data
      localStorage.removeItem('admin');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#0A1172]">Battery Master</h1>
          <p className="text-sm text-gray-600 mt-1">Business Management System</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#0A1172] text-white'
                    : 'hover:bg-[#0A1172]/5 text-gray-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-[#0A1172]"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                <span className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#0A1172]'
                    }`}
                  />
                </span>
                <div className="relative flex flex-col">
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-700 group-hover:text-[#0A1172]'
                  }`}>
                    {item.name}
                  </span>
                  <span className={`text-xs ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden bg-white border-r border-gray-200"
            >
              <div className="p-6">
                <h1 className="text-2xl font-bold text-[#0A1172]">Battery Master</h1>
                <p className="text-sm text-gray-600 mt-1">Business Management System</p>
              </div>

              <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`relative flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-[#0A1172] text-white'
                          : 'hover:bg-[#0A1172]/5 text-gray-700'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-lg bg-[#0A1172]"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      )}
                      <span className="relative">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#0A1172]'
                          }`}
                        />
                      </span>
                      <div className="relative flex flex-col">
                        <span className={`text-sm font-medium ${
                          isActive ? 'text-white' : 'text-gray-700 group-hover:text-[#0A1172]'
                        }`}>
                          {item.name}
                        </span>
                        <span className={`text-xs ${
                          isActive ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-gray-600 hover:text-[#0A1172] mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex items-center justify-end">
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-[#0A1172] hover:bg-[#0A1172]/5 rounded-lg transition-colors">
                <div className="w-5 h-5 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#0A1172] text-white flex items-center justify-center font-medium">
                  {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{admin?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{admin?.email || 'admin@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
