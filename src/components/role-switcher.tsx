import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useAuth } from '../contexts/auth-context';
import { Shield, Users, Settings, RefreshCw, UserCheck } from 'lucide-react';

export function RoleSwitcher() {
  const { user, updateProfile } = useAuth();

  if (!user) return null;

  const switchRole = (newRole: 'guard' | 'supervisor' | 'admin' | 'hr') => {
    updateProfile({ 
      role: newRole,
      name: newRole === 'admin' ? 'Admin User' : 
            newRole === 'supervisor' ? 'Supervisor User' : 
            newRole === 'hr' ? 'HR Manager' : 'Guard User',
      badge: newRole === 'admin' ? 'ADM-001' : 
             newRole === 'supervisor' ? 'SUP-001' : 
             newRole === 'hr' ? 'HR-001' : 'GRD-001'
    });
    
    // Reload page to apply changes
    window.location.reload();
  };

  return (
    <Card className="fixed bottom-4 left-4 z-50 bg-card/90 backdrop-blur">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm font-medium">Demo: Switch Role</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <Button
            size="sm"
            variant={user.role === 'guard' ? 'default' : 'outline'}
            onClick={() => switchRole('guard')}
            className="text-xs"
          >
            <Shield className="h-3 w-3 mr-1" />
            Guard
          </Button>
          <Button
            size="sm"
            variant={user.role === 'supervisor' ? 'default' : 'outline'}
            onClick={() => switchRole('supervisor')}
            className="text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            Super
          </Button>
          <Button
            size="sm"
            variant={user.role === 'hr' ? 'default' : 'outline'}
            onClick={() => switchRole('hr')}
            className="text-xs"
          >
            <UserCheck className="h-3 w-3 mr-1" />
            HR
          </Button>
          <Button
            size="sm"
            variant={user.role === 'admin' ? 'default' : 'outline'}
            onClick={() => switchRole('admin')}
            className="text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            Admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}