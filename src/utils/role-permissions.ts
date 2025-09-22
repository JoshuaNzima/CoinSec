export type Role = 'guard' | 'supervisor' | 'admin' | 'hr' | 'cctv_operator';

// Simple role-based permissions
export function hasPermission(role: Role, feature: string): boolean {
  // Basic permissions for each role
  switch (role) {
    case 'guard':
      return !['audit', 'cctv'].includes(feature);
    case 'supervisor':
      return true;
    case 'admin':
      return true;
    case 'hr':
      return !['tracking', 'checkpoints', 'equipment', 'cctv'].includes(feature);
    case 'cctv_operator':
      return ['cctv', 'incidents', 'reports', 'communication'].includes(feature);
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

export function canAccessCCTVFeatures(role: Role): boolean {
  return role === 'cctv_operator' || role === 'supervisor' || role === 'admin';
}

export function canManageCCTVSystem(role: Role): boolean {
  return role === 'cctv_operator' || role === 'admin';
}

export function canControlCameras(role: Role): boolean {
  return role === 'cctv_operator' || role === 'supervisor' || role === 'admin';
}