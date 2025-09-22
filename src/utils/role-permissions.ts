export type Role = 'guard' | 'supervisor' | 'admin' | 'hr';

// Simple role-based permissions
export function hasPermission(role: Role, feature: string): boolean {
  // Basic permissions for each role
  switch (role) {
    case 'guard':
      return !['audit'].includes(feature);
    case 'supervisor':
      return true;
    case 'admin':
      return true;
    case 'hr':
      return !['tracking', 'checkpoints', 'equipment'].includes(feature);
    default:
      return false;
  }
}

export function canAccessAdminFeatures(role: Role): boolean {
  return role === 'admin';
}

export function canAccessHRFeatures(role: Role): boolean {
  return role === 'hr' || role === 'admin';
}