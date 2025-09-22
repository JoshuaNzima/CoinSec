import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useScreenSize } from '../hooks/use-screen-size';
import { useAuth } from '../contexts/auth-context';
import { Monitor, Smartphone, RotateCcw } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { isLargeScreen, isTablet, isMobile } = useScreenSize();
  const { user } = useAuth();

  // Show device type indicator for debugging/demo purposes
  const DeviceIndicator = () => (
    <div className="fixed top-2 right-2 z-50">
      <Card className="px-2 py-1">
        <CardContent className="p-0 flex items-center gap-1 text-xs">
          {isMobile && <Smartphone className="h-3 w-3" />}
          {isTablet && <RotateCcw className="h-3 w-3" />}
          {isLargeScreen && <Monitor className="h-3 w-3" />}
          <span>
            {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
          </span>
          {user && <span>| {user.role}</span>}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <DeviceIndicator />
      {children}
    </>
  );
}