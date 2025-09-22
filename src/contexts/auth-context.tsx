import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'guard' | 'supervisor' | 'admin' | 'hr' | 'cctv_operator';
  badge: string;
  avatar?: string;
  shiftStart?: string;
  shiftEnd?: string;
  lastLogin?: string;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  status?: string;
  created_at?: string;
  last_active?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role?: string) => Promise<boolean>;
  logout: () => void;
  biometricLogin: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  enableTwoFactor: () => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
  isFirstTime: boolean;
  completeOnboarding: () => void;
  sessionTimeout: number;
  resetSessionTimeout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30 * 60 * 1000); // 30 minutes

  useEffect(() => {
    // Check for existing session on startup
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('guard-app-user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadUserProfile();
      } else {
        // Check for demo user in localStorage
        const savedUser = localStorage.getItem('guard-app-user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
      
      // Check first time status
      const firstTime = localStorage.getItem('guard-app-first-time');
      if (!firstTime) {
        setIsFirstTime(true);
      }
    }
  };

  const loadUserProfile = async () => {
    try {
      const { profile } = await apiCall('/users/profile');
      setUser({
        ...profile,
        biometricEnabled: false,
        twoFactorEnabled: false
      });
      localStorage.setItem('guard-app-user', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to load user profile:', error);
      toast.error('Failed to load user profile');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback to demo mode for development
        if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
          return loginDemo(email, password);
        }
        throw error;
      }

      if (data.session) {
        await loadUserProfile();
        toast.success('Login successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (email: string, password: string): Promise<boolean> => {
    // Demo login for testing without real backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Determine role based on email for demo purposes
    let role: 'guard' | 'supervisor' | 'admin' | 'hr' | 'cctv_operator' = 'guard';
    if (email.includes('admin') || email.includes('manager')) {
      role = 'admin';
    } else if (email.includes('supervisor')) {
      role = 'supervisor';
    } else if (email.includes('hr') || email.includes('human')) {
      role = 'hr';
    } else if (email.includes('cctv') || email.includes('operator') || email.includes('security')) {
      role = 'cctv_operator';
    }
    
    const mockUser: User = {
      id: role === 'admin' ? 'admin-1' : role === 'hr' ? 'hr-1' : role === 'cctv_operator' ? 'cctv-1' : '1',
      name: role === 'admin' ? 'Admin User' : 
            role === 'hr' ? 'HR Manager' : 
            role === 'cctv_operator' ? 'CCTV Operator' : 
            role === 'supervisor' ? 'Security Supervisor' : 'John Doe',
      email: email,
      role: role,
      badge: role === 'admin' ? 'ADM-001' : 
             role === 'hr' ? 'HR-001' : 
             role === 'cctv_operator' ? 'CCTV-001' : 
             role === 'supervisor' ? 'SUP-001' : 'GRD-001',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      shiftStart: '08:00',
      shiftEnd: '20:00',
      lastLogin: new Date().toISOString(),
      biometricEnabled: false,
      twoFactorEnabled: false,
      status: 'active',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };
    
    setUser(mockUser);
    localStorage.setItem('guard-app-user', JSON.stringify(mockUser));
    toast.success('Demo login successful');
    return true;
  };

  const signup = async (email: string, password: string, name: string, role: string = 'guard'): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { user: newUser, error } = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role })
      });

      if (error) {
        throw new Error(error);
      }

      toast.success('Account created successfully! Please sign in.');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('guard-app-user');
    toast.success('Logged out successfully');
  };

  const biometricLogin = async (): Promise<boolean> => {
    // Simulate biometric authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.1; // 90% success rate
  };

  const enableBiometric = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (user) {
      const updatedUser = { ...user, biometricEnabled: true };
      setUser(updatedUser);
      localStorage.setItem('guard-app-user', JSON.stringify(updatedUser));
    }
    return true;
  };

  const enableTwoFactor = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (user) {
      const updatedUser = { ...user, twoFactorEnabled: true };
      setUser(updatedUser);
      localStorage.setItem('guard-app-user', JSON.stringify(updatedUser));
    }
    return true;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      // Try to update on server first
      const { profile } = await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      setUser(profile);
      localStorage.setItem('guard-app-user', JSON.stringify(profile));
      toast.success('Profile updated successfully');
    } catch (error) {
      // Fallback to local update for demo mode
      console.error('Profile update error:', error);
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('guard-app-user', JSON.stringify(updatedUser));
      toast.success('Profile updated (demo mode)');
    }
  };

  const completeOnboarding = () => {
    setIsFirstTime(false);
    localStorage.setItem('guard-app-first-time', 'completed');
  };

  const resetSessionTimeout = () => {
    setSessionTimeout(30 * 60 * 1000);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      biometricLogin,
      enableBiometric,
      enableTwoFactor,
      updateProfile,
      isFirstTime,
      completeOnboarding,
      sessionTimeout,
      resetSessionTimeout,
      loading
    }}>
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