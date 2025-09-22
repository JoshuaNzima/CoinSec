import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// API base URL for our custom server functions
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-def022bc`;

// Helper function to make authenticated API calls
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session and we're in demo mode (user stored locally), skip API call
    const localUser = localStorage.getItem('guard-app-user');
    if (!session && localUser) {
      // Return mock data or throw specific error for demo mode
      console.log('Demo mode: Skipping API call for', endpoint);
      throw new Error('Demo mode - API call skipped');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // Log the error but don't show it to user if in demo mode
    const localUser = localStorage.getItem('guard-app-user');
    if (localUser && error.message.includes('Demo mode')) {
      console.log('API call skipped in demo mode:', endpoint);
      throw error; // Re-throw for services to handle with mock data
    }
    
    // For real auth errors, still throw
    throw error;
  }
}

// Helper function for file uploads
export async function uploadFile(file: File, bucket: string = 'incidents') {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
    'Content-Type': file.type,
  };

  const response = await fetch(`${API_BASE_URL}/upload/${bucket}`, {
    method: 'POST',
    headers,
    body: file,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || 'File upload failed');
  }

  return response.json();
}

export default supabase;