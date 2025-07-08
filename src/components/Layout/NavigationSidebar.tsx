import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Mic, 
  FileText, 
  Trophy, 
  MessageCircle, 
  Target,
  BarChart3,
  Database,
  Github,
  Upload,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';

const NavigationSidebar: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and progress' },
    { name: 'Practice', href: '/practice', icon: BookOpen, description: 'Coding questions' },
    { name: 'System Design', href: '/system-design', icon: Database, description: 'Design challenges' },
    { name: 'Mock Interview', href: '/mock-interview', icon: Mic, description: 'AI interviews' },
    { name: 'Resources', href: '/resources', icon: FileText, description: 'Learning materials' },
    { name: 'Success Stories', href: '/success-stories', icon: Trophy, description: 'User experiences' },
    { name: 'AI Mentor', href: '/mentor', icon: MessageCircle, description: 'Get help' },
  ];

  const toolsNavigation = [
    { name: 'Goals', href: '/goals', icon: Target, description: 'Track progress' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Performance insights' },
    { name: 'GitHub Sync', href: '/github', icon: Github, description: 'Code portfolio' },
    { name: 'Resume Review', href: '/resume-review', icon: Upload, description: 'AI feedback' },
  ];

  const filteredMainNav = mainNavigation.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredToolsNav = toolsNavigation.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MAANG Prep
                </div>
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search navigation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Main
                </h3>
              )}
              <ul className="space-y-1">
                {filteredMainNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                        title={isCollapsed ? item.name : ''}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <div className="flex-1">
                            <div>{item.name}</div>
                            <div className="text-xs text-gray-500 group-hover:text-blue-500">
                              {item.description}
                            </div>
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Tools Navigation */}
            <div>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Tools
                </h3>
              )}
              <ul className="space-y-1">
                {filteredToolsNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                          isActive
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                        }`}
                        title={isCollapsed ? item.name : ''}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <div className="flex-1">
                            <div>{item.name}</div>
                            <div className="text-xs text-gray-500 group-hover:text-purple-500">
                              {item.description}
                            </div>
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Admin Navigation */}
            {isAdmin && (
              <div>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Admin
                  </h3>
                )}
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                        location.pathname.startsWith('/admin')
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                      }`}
                      title={isCollapsed ? 'Admin Panel' : ''}
                    >
                      <Settings className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1">
                          <div>Admin Panel</div>
                          <div className="text-xs text-gray-500 group-hover:text-red-500">
                            Manage platform
                          </div>
                        </div>
                      )}
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </nav>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.user_metadata?.full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NavigationSidebar;