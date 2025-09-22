// App Configuration
export const APP_CONFIG = {
  name: 'GuardForce',
  version: '1.0.0',
  description: 'Professional Security Management System'
};

// API Configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};

// GPS Configuration
export const GPS_CONFIG = {
  highAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
  updateInterval: 30000, // 30 seconds
  geofenceRadius: 100 // meters
};

// Incident Configuration
export const INCIDENT_CONFIG = {
  maxPhotos: 5,
  maxAttachments: 3,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  supportedDocumentTypes: ['application/pdf', 'text/plain']
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  pollInterval: 30000, // 30 seconds
  maxNotifications: 50,
  emergencyDuration: 0, // Never auto-dismiss
  defaultDuration: 5000 // 5 seconds
};

// UI Constants
export const SCREEN_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};

export const COLORS = {
  primary: '#030213',
  secondary: '#f1f5f9',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// Role Display Names
export const ROLE_NAMES = {
  guard: 'Security Guard',
  supervisor: 'Supervisor',
  admin: 'Administrator',
  hr: 'HR Manager'
};

// Status Display Names
export const STATUS_NAMES = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave'
};

// Incident Types
export const INCIDENT_TYPES = {
  security: 'Security Breach',
  medical: 'Medical Emergency',
  fire: 'Fire Incident',
  theft: 'Theft/Robbery',
  vandalism: 'Vandalism',
  other: 'Other'
};

// Incident Priorities
export const INCIDENT_PRIORITIES = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

// Incident Status
export const INCIDENT_STATUS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

// Time Formats
export const TIME_FORMATS = {
  date: 'MMM dd, yyyy',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm',
  full: 'EEEE, MMMM dd, yyyy \'at\' HH:mm'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  user: 'guard-app-user',
  theme: 'guard-app-theme',
  settings: 'guard-app-settings',
  firstTime: 'guard-app-first-time',
  cache: 'guard-app-cache'
};