import React from 'react';
import { X, AlertTriangle, Info, Clock, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface NotificationsProps {
  onClose: () => void;
}

export function Notifications({ onClose }: NotificationsProps) {
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Security Breach',
      message: 'Motion detected at East Entrance',
      time: '2 mins ago',
      icon: AlertTriangle,
      color: 'text-red-500',
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      title: 'Tour Reminder',
      message: 'Next patrol checkpoint in 15 minutes',
      time: '5 mins ago',
      icon: Clock,
      color: 'text-blue-500',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'location',
      title: 'Geofence Alert',
      message: 'You have exited the patrol zone',
      time: '10 mins ago',
      icon: MapPin,
      color: 'text-orange-500',
      priority: 'medium'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16">
      <div className="w-full max-w-md mx-4 bg-card rounded-lg shadow-xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2>Notifications</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-96">
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <Card key={notification.id} className="m-3 border-l-4 border-l-primary">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <IconComponent className={`h-5 w-5 mt-0.5 ${notification.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm">{notification.title}</h3>
                        <Badge 
                          variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full text-xs">
            Mark all as read
          </Button>
        </div>
      </div>
    </div>
  );
}