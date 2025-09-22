import React from 'react';
import { Bell, ArrowLeft, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface TopBarProps {
  onNotificationsClick: () => void;
  currentView: string;
  onBack: () => void;
}

export function TopBar({ onNotificationsClick, currentView, onBack }: TopBarProps) {
  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'GuardSecure';
      case 'tracking': return 'GPS Tracking';
      case 'checkpoints': return 'Checkpoints';
      case 'incidents': return 'Incident Report';
      case 'tours': return 'Guard Tours';
      case 'reports': return 'Reports';
      case 'communication': return 'Communication';
      default: return 'GuardSecure';
    }
  };

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between z-50">
      <div className="flex items-center gap-3">
        {currentView !== 'dashboard' ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary/20 p-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Shield className="h-6 w-6" />
        )}
        <h1 className="font-medium">{getTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onNotificationsClick}
          className="text-primary-foreground hover:bg-primary/20 relative p-2"
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-destructive text-destructive-foreground p-0">
            3
          </Badge>
        </Button>
      </div>
    </div>
  );
}