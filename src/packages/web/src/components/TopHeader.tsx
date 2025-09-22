import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/incidents': 'Incident Management',
  '/gps-tracking': 'GPS Tracking',
  '/analytics': 'Analytics & Reports',
  '/users': 'User Management',
  '/hr': 'HR Management',
  '/settings': 'Settings',
};

export function TopHeader() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const currentPageName = pageNames[location.pathname] || 'GuardForce';

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <SidebarTrigger />
        
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">{currentPageName}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Badge */}
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {user?.role?.toUpperCase()}
          </Badge>

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {getThemeIcon()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="h-4 w-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="text-sm p-2 bg-muted rounded-md">
                  <div className="font-medium">New incident reported</div>
                  <div className="text-xs text-muted-foreground">Site A - Security breach detected</div>
                  <div className="text-xs text-muted-foreground mt-1">5 minutes ago</div>
                </div>
                <div className="text-sm p-2 bg-muted rounded-md">
                  <div className="font-medium">Guard check-in missed</div>
                  <div className="text-xs text-muted-foreground">John Doe - Checkpoint #3</div>
                  <div className="text-xs text-muted-foreground mt-1">15 minutes ago</div>
                </div>
                <div className="text-sm p-2 bg-muted rounded-md">
                  <div className="font-medium">System maintenance scheduled</div>
                  <div className="text-xs text-muted-foreground">Tonight at 2:00 AM - Expected downtime: 30 minutes</div>
                  <div className="text-xs text-muted-foreground mt-1">1 hour ago</div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center w-full">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}