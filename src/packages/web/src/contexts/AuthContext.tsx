import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@guard-services/shared';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('guard-app-user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        // Try to load profile from localStorage first for faster UI
        const storedProfile = localStorage.getItem('guard-app-user');
        if (storedProfile) {
          setUser(JSON.parse(storedProfile));
        }
        
        // Then load fresh profile from server
        await loadUserProfile();
      } else {
        // Check for demo user in localStorage
        const savedUser = localStorage.getItem('guard-app-user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await authService.getUserProfile();
      if (profile) {
        setUser(profile);
        localStorage.setItem('guard-app-user', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Keep existing user data if API call fails
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { user: authUser, error } = await authService.signIn(email, password);
      
      if (error) {
        // Fallback to demo mode for development
        return signInDemo(email, password);
      }

      if (authUser) {
        setUser(authUser);
        localStorage.setItem('guard-app-user', JSON.stringify(authUser));
        toast.success('Sign in successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign in failed:', error);
      // Fallback to demo mode
      return signInDemo(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signInDemo = async (email: string, password: string): Promise<boolean> => {
    // Demo login for testing without real backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Determine role based on email for demo purposes
    let role: 'guard' | 'supervisor' | 'admin' | 'hr' = 'admin'; // Default to admin for web
    if (email.includes('guard')) {
      role = 'guard';
    } else if (email.includes('supervisor')) {
      role = 'supervisor';
    } else if (email.includes('hr') || email.includes('human')) {
      role = 'hr';
    }
    
    const mockUser: User = {
      id: role === 'admin' ? 'admin-1' : role === 'hr' ? 'hr-1' : '1',
      name: role === 'admin' ? 'Admin User' : role === 'hr' ? 'HR Manager' : 'John Doe',
      email: email,
      role: role,
      badge: role === 'admin' ? 'ADM-001' : role === 'hr' ? 'HR-001' : 'GRD-001',
      biometricEnabled: false,
      twoFactorEnabled: false,
      status: 'active',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };
    
    setUser(mockUser);
    localStorage.setItem('guard-app-user', JSON.stringify(mockUser));
    toast.success('Demo sign in successful');
    return true;
  };

  const signUp = async (email: string, password: string, name: string, role: string = 'guard'): Promise<boolean> => {
    try {
      setLoading(true);
      const { success, error } = await authService.signUp(email, password, name, role);
      
      if (error) {
        toast.error(error);
        return false;
      }

      if (success) {
        toast.success('Account created successfully! Please sign in.');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign up failed:', error);
      toast.error('Sign up failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      setUser(null);
      localStorage.removeItem('guard-app-user');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      const updatedProfile = await authService.updateProfile(updates);
      if (updatedProfile) {
        setUser(updatedProfile);
        localStorage.setItem('guard-app-user', JSON.stringify(updatedProfile));
        toast.success('Profile updated successfully');
      } else {
        // Fallback to local update for demo mode
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('guard-app-user', JSON.stringify(updatedUser));
        toast.success('Profile updated (demo mode)');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}