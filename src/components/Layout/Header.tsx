import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { LogOut, User, Home, BookOpen, MessageCircle, Settings, FileText, Key } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ChangePasswordForm from '../Auth/ChangePasswordForm';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Practice', href: '/practice', icon: BookOpen },
    { name: 'Resources', href: '/resources', icon: FileText },
    { name: 'AI Mentor', href: '/mentor', icon: MessageCircle },
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
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MAANG Prep
                </div>
              </Link>
            </div>

            {user && (
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
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {user && (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span>{user.user_metadata?.full_name || user.email}</span>
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
            )}
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

export default Header;