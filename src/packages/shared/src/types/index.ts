// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guard' | 'supervisor' | 'admin' | 'hr';
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
  site?: string;
  shift?: string;
}

// Location and GPS Types
export interface LocationData {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

// Incident Types
export interface Incident {
  id: string;
  reporter_id: string;
  reporter_name: string;
  title: string;
  description: string;
  type: 'security' | 'medical' | 'fire' | 'theft' | 'vandalism' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photos?: string[];
  attachments?: string[];
  notes?: string;
  assigned_to?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface IncidentCreate {
  title: string;
  description: string;
  type: Incident['type'];
  priority: Incident['priority'];
  location?: Incident['location'];
  photos?: File[];
  attachments?: File[];
  notes?: string;
}

// Checkpoint Types
export interface CheckpointScan {
  id: string;
  user_id: string;
  user_name: string;
  checkpoint_id: string;
  latitude: number;
  longitude: number;
  notes: string;
  timestamp: string;
  verified?: boolean;
  verification_method?: 'qr' | 'nfc' | 'manual';
}

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  qr_code?: string;
  nfc_tag?: string;
  required_interval_minutes?: number;
  is_active: boolean;
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'emergency';
  sender_id: string;
  sender_name: string;
  target_user_id: string | 'all';
  read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: any;
}

export interface NotificationCreate {
  title: string;
  message: string;
  type?: Notification['type'];
  target_user_id?: string;
  action_url?: string;
  metadata?: any;
}

// Employee and Organization Types
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'guard' | 'supervisor' | 'admin' | 'hr';
  badge: string;
  status: 'active' | 'inactive' | 'on_leave';
  site?: string;
  shift?: string;
  phone?: string;
  hire_date?: string;
  salary?: number;
  certifications?: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Site {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  client: string;
  guards_required: number;
  active_guards: number;
  contract_value: number;
  status: 'active' | 'inactive';
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Analytics Types
export interface AnalyticsData {
  users: {
    total: number;
    active: number;
    by_role: {
      guard: number;
      supervisor: number;
      admin: number;
      hr: number;
    };
  };
  incidents: {
    total: number;
    open: number;
    closed: number;
    today: number;
  };
  checkpoints: {
    total_scans: number;
    today: number;
    unique_guards: number;
  };
}

// Utility Types
export type UserRole = User['role'];
export type IncidentStatus = Incident['status'];
export type IncidentType = Incident['type'];
export type IncidentPriority = Incident['priority'];
export type NotificationType = Notification['type'];