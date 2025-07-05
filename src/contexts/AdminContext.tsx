import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  auth_id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'content_admin';
  created_at: string;
  updated_at: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
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
  const { user } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    if (!user) {
      setAdminUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log('Checking admin status for user:', user.id);
      
      // Check admin status using the new admins table
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        setAdminUser(null);
      } else {
        console.log('Admin check result:', adminData);
        setAdminUser(adminData || null);
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const value = {
    adminUser,
    isAdmin: !!adminUser,
    isSuperAdmin: adminUser?.role === 'super_admin',
    loading,
    checkAdminStatus
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};