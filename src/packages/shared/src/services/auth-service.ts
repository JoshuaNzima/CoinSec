import { supabase, apiCall } from './api-client';
import { User } from '../types';

export class AuthService {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.session) {
        const profile = await this.getUserProfile();
        return { user: profile, error: null };
      }

      return { user: null, error: 'Authentication failed' };
    } catch (error) {
      return { user: null, error: 'Network error' };
    }
  }

  // Sign up new user
  async signUp(email: string, password: string, name: string, role: string = 'guard'): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role })
      });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  // Get current session
  async getSession() {
    return supabase.auth.getSession();
  }

  // Get user profile
  async getUserProfile(): Promise<User | null> {
    try {
      const { profile } = await apiCall('/users/profile');
      return profile;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User | null> {
    try {
      const { profile } = await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return profile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return null;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  // Get current user ID
  async getCurrentUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  }
}

export const authService = new AuthService();