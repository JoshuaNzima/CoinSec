import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  BarChart3,
  Users,
  UserCheck,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, canAccessFeature } from '@guard-services/shared';

const menuItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    feature: 'dashboard',
  },
  {
    id: 'incidents',
    title: 'Incidents',
    icon: AlertTriangle,
    path: '/incidents',
    feature: 'incidents',
  },
  {
    id: 'gps-tracking',
    title: 'GPS Tracking',
    icon: MapPin,
    path: '/gps-tracking',
    feature: 'gps-tracking',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    feature: 'analytics',
  },
  {
    id: 'users',
    title: 'User Management',
    icon: Users,
    path: '/users',
    feature: 'admin-dashboard',
  },
  {
    id: 'hr',
    title: 'HR Management',
    icon: UserCheck,
    path: '/hr',
    feature: 'hr-dashboard',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    path: '/settings',
    feature: 'settings',
  },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAccessibleMenuItems = () => {
    if (!user) return [];
    
    return menuItems.filter(item => {
      if (item.feature === 'dashboard' || item.feature === 'settings') {
        return true; // Always accessible
      }
      
      return canAccessFeature(user.role, item.feature);
    });
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">GuardForce</h2>
            <p className="text-xs text-sidebar-foreground/60">Security Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getAccessibleMenuItems().map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {user ? getUserInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.role?.toUpperCase()} • {user?.badge}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}