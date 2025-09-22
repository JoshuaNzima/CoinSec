import { createClient } from '@supabase/supabase-js';

// Environment configuration
export const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    projectId: process.env.REACT_APP_SUPABASE_PROJECT_ID || process.env.EXPO_PUBLIC_SUPABASE_PROJECT_ID || ''
  }
};

// Create Supabase client
export const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// API base URL for custom server functions
export const API_BASE_URL = `${config.supabase.url}/functions/v1/make-server-def022bc`;

// Helper function to make authenticated API calls
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || config.supabase.anonKey}`,
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
}

// Helper function for file uploads
export async function uploadFile(file: File | any, bucket: string = 'incidents') {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Authorization': `Bearer ${session?.access_token || config.supabase.anonKey}`,
    'Content-Type': file.type || 'application/octet-stream',
  };

  // Handle both web File objects and React Native file objects
  const body = file instanceof File ? file : file.uri ? 
    await fetch(file.uri).then(res => res.blob()) : file;

  const response = await fetch(`${API_BASE_URL}/upload/${bucket}`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || 'File upload failed');
  }

  return response.json();
}

export default supabase;