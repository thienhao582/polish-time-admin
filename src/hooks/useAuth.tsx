
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'employee' | 'cashier';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS = {
  owner: ['create_user', 'edit_user', 'delete_user', 'view_reports', 'manage_settings', 'manage_employees', 'manage_services', 'manage_appointments', 'manage_customers'],
  employee: ['manage_appointments', 'manage_customers', 'view_basic_reports'],
  cashier: ['manage_appointments', 'manage_customers', 'handle_payments', 'view_basic_reports']
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      
      const sessionData = localStorage.getItem('nail_salon_session');
      if (!sessionData) {
        console.log('No session found');
        setLoading(false);
        return;
      }

      const { sessionToken, user: userData, expiresAt } = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date() > new Date(expiresAt)) {
        console.log('Session expired');
        localStorage.removeItem('nail_salon_session');
        setLoading(false);
        return;
      }

      console.log('Session found, verifying with database...');

      // Verify session in database
      const { data: sessionRecord, error } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error('Session verification error:', error);
        localStorage.removeItem('nail_salon_session');
        setLoading(false);
        return;
      }

      if (!sessionRecord) {
        console.log('Session not found in database');
        localStorage.removeItem('nail_salon_session');
        setLoading(false);
        return;
      }

      // Get fresh user data
      const { data: freshUserData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionRecord.user_id)
        .eq('is_active', true)
        .maybeSingle();

      if (userError || !freshUserData) {
        console.error('User verification error:', userError);
        localStorage.removeItem('nail_salon_session');
        setLoading(false);
        return;
      }

      console.log('Session valid, user authenticated:', freshUserData.email);
      setUser(freshUserData);
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('nail_salon_session');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    console.log('Login called with user:', userData.email);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const sessionData = localStorage.getItem('nail_salon_session');
      if (sessionData) {
        const { sessionToken } = JSON.parse(sessionData);
        
        // Delete session from database
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', sessionToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('nail_salon_session');
      setUser(null);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
