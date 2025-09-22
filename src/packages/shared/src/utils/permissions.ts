import { UserRole } from '../types';

export const ROLE_PERMISSIONS = {
  guard: [
    'incidents:create',
    'incidents:view_own',
    'checkpoints:scan',
    'gps:share_location',
    'reports:view_own',
    'tours:participate',
    'communication:send',
    'communication:receive'
  ],
  supervisor: [
    'incidents:create',
    'incidents:view_all',
    'incidents:assign',
    'incidents:update_status',
    'checkpoints:scan',
    'checkpoints:view_all',
    'gps:share_location',
    'gps:view_team',
    'reports:view_all',
    'reports:generate',
    'tours:manage',
    'communication:send',
    'communication:receive',
    'analytics:view_basic'
  ],
  admin: [
    'incidents:*',
    'checkpoints:*',
    'gps:*',
    'reports:*',
    'tours:*',
    'communication:*',
    'analytics:*',
    'users:manage',
    'settings:manage',
    'audit:view'
  ],
  hr: [
    'users:view',
    'users:manage',
    'reports:hr',
    'analytics:hr',
    'payroll:manage',
    'recruitment:manage',
    'performance:manage',
    'compliance:manage'
  ]
};

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  
  // Check for exact permission match
  if (rolePermissions.includes(permission)) {
    return true;
  }
  
  // Check for wildcard permissions
  const [resource, action] = permission.split(':');
  const wildcardPermission = `${resource}:*`;
  
  return rolePermissions.includes(wildcardPermission);
}

export function canAccessFeature(userRole: UserRole, feature: string): boolean {
  switch (feature) {
    case 'incidents':
      return hasPermission(userRole, 'incidents:view_own') || hasPermission(userRole, 'incidents:view_all');
    case 'gps-tracking':
      return hasPermission(userRole, 'gps:share_location') || hasPermission(userRole, 'gps:view_team');
    case 'checkpoints':
      return hasPermission(userRole, 'checkpoints:scan');
    case 'reports':
      return hasPermission(userRole, 'reports:view_own') || hasPermission(userRole, 'reports:view_all');
    case 'analytics':
      return hasPermission(userRole, 'analytics:view_basic') || hasPermission(userRole, 'analytics:*');
    case 'admin-dashboard':
      return userRole === 'admin';
    case 'hr-dashboard':
      return userRole === 'hr' || userRole === 'admin';
    case 'audit-trail':
      return hasPermission(userRole, 'audit:view');
    default:
      return false;
  }
}

export function getAccessibleFeatures(userRole: UserRole): string[] {
  const features = [
    'incidents',
    'gps-tracking', 
    'checkpoints',
    'reports',
    'communication',
    'tours',
    'analytics',
    'admin-dashboard',
    'hr-dashboard',
    'audit-trail'
  ];
  
  return features.filter(feature => canAccessFeature(userRole, feature));
}