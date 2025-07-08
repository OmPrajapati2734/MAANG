import React, { createContext, useContext } from 'react';

interface AdminContextType {
  adminUser: null;
  isAdmin: false;
  isSuperAdmin: false;
  loading: false;
  checkAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Admin functionality removed - always return non-admin state
  const value = {
    adminUser: null,
    isAdmin: false,
    isSuperAdmin: false,
    loading: false,
    checkAdminStatus: async () => {}
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};</b oltAction>