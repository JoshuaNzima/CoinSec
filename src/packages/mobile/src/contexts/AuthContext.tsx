import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@guard-services/shared';
import * as SecureStore from 'expo-secure-store';

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
        await SecureStore.deleteItemAsync('user-profile');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        // Try to load profile from secure storage first
        const storedProfile = await SecureStore.getItemAsync('user-profile');
        if (storedProfile) {
          setUser(JSON.parse(storedProfile));
        }
        
        // Then load fresh profile from server
        await loadUserProfile();
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
        await SecureStore.setItemAsync('user-profile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { user: authUser, error } = await authService.signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        return false;
      }

      if (authUser) {
        setUser(authUser);
        await SecureStore.setItemAsync('user-profile', JSON.stringify(authUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string = 'guard'): Promise<boolean> => {
    try {
      setLoading(true);
      const { success, error } = await authService.signUp(email, password, name, role);
      
      if (error) {
        console.error('Sign up error:', error);
        return false;
      }

      return success;
    } catch (error) {
      console.error('Sign up failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      setUser(null);
      await SecureStore.deleteItemAsync('user-profile');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      const updatedProfile = await authService.updateProfile(updates);
      if (updatedProfile) {
        setUser(updatedProfile);
        await SecureStore.setItemAsync('user-profile', JSON.stringify(updatedProfile));
      }
    } catch (error) {
      console.error('Profile update failed:', error);
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