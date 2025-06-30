import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { LogOut, User, Home, BookOpen, FileText, BarChart3, Settings, Key, Building2, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ChangePasswordForm from '../Auth/ChangePasswordForm';

const AdminHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const { adminUser, isSuperAdmin } = useAdmin();
  const location = useLocation();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Questions', href: '/admin/questions', icon: BookOpen },
    { name: 'Quizzes', href: '/admin/quizzes', icon: HelpCircle },
    { name: 'Resources', href: '/admin/resources', icon: FileText },
    { name: 'Companies', href: '/admin/companies', icon: Building2 },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ...(isSuperAdmin ? [{ name: 'Settings', href: '/admin/settings', icon: Settings }] : [])
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/admin" className="flex items-center space-x-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                  MAANG Admin
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                User Portal
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span>{adminUser?.full_name || user?.email}</span>
                  {isSuperAdmin && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Super Admin
                    </span>
                  )}
                </button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowChangePassword(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Key className="w-4 h-4" />
                        <span>Change Password</span>
                      </button>
                      <button
                        onClick={signOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
};

export default AdminHeader;