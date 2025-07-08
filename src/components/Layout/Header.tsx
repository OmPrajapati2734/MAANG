import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Home, BookOpen, MessageCircle, FileText, Key, Trophy, Mic, Database, Upload, Menu, X, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ChangePasswordForm from '../Auth/ChangePasswordForm';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Practice', href: '/practice', icon: BookOpen },
    { name: 'System Design', href: '/system-design', icon: Database },
    { name: 'Mock Interview', href: '/mock-interview', icon: Mic },
    { name: 'Resources', href: '/resources', icon: FileText },
    { name: 'Success Stories', href: '/success-stories', icon: Trophy },
    { name: 'Resume Review', href: '/resume-review', icon: Upload },
    { name: 'AI Mentor', href: '/mentor', icon: MessageCircle },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log('Sign out completed');
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200 relative z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MAANG Prep
                </div>
              </Link>
            </div>

            {user && (
              <>
                {/* Desktop Navigation - Full Screen */}
                <nav className="hidden xl:flex items-center space-x-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 shadow-sm'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Tablet Navigation - Condensed */}
                <nav className="hidden lg:flex xl:hidden items-center space-x-1">
                  {navigation.slice(0, 6).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        title={item.name}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 shadow-sm'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </Link>
                    );
                  })}
                  
                  {/* More menu for remaining items */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                      className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    
                    {showMobileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                      >
                        <div className="py-2">
                          {navigation.slice(6).map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            
                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setShowMobileMenu(false)}
                                className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                <span>{item.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </nav>

                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>

                {/* Desktop User Menu */}
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="hidden xl:inline max-w-32 truncate">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                      >
                        <div className="py-2">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.user_metadata?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <User className="w-4 h-4" />
                            <span>View Profile</span>
                          </Link>
                          <button
                            onClick={() => {
                              setShowChangePassword(true);
                              setShowUserMenu(false);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Key className="w-4 h-4" />
                            <span>Change Password</span>
                          </button>
                          <button
                            onClick={() => {
                              handleSignOut();
                              setShowUserMenu(false);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Navigation Menu */}
          {user && showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100  text-blue-700'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Mobile User Actions */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-5 h-5" />
                    <span>View Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowChangePassword(true);
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    
                    <Key className="w-5 h-5" />
                    <span>Change Password</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Click outside to close menus */}
      {(showUserMenu ||  showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
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