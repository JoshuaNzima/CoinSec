import React from 'react';
import { useAuth } from '../contexts/auth-context';
import { 
  MapPin, 
  CheckSquare, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare,
  FileText,
  Settings,
  Shield,
  Package,
  TrendingUp,
  GraduationCap,
  Cloud,
  Search,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  // Different status display based on role
  const getStatusDisplay = () => {
    if (user?.role === 'hr') {
      return {
        title: 'HR Dashboard',
        subtitle: 'Managing workforce since 8:00 AM',
        status: 'Active',
        icon: Users,
        stats: [
          { label: 'Employees', value: '53' },
          { label: 'Open Positions', value: '5' },
          { label: 'On Leave', value: '3' }
        ]
      };
    }
    if (user?.role === 'supervisor') {
      return {
        title: 'Supervisor',
        subtitle: 'Managing team since 8:00 AM',
        status: 'Active',
        icon: Shield,
        stats: [
          { label: 'Team Size', value: '12' },
          { label: 'Active Sites', value: '4' },
          { label: 'Incidents', value: '2' }
        ]
      };
    }
    return {
      title: 'On Duty',
      subtitle: 'Shift started at 8:00 AM',
      status: 'Active',
      icon: Shield,
      stats: [
        { label: 'Checkpoints', value: '8' },
        { label: 'Incidents', value: '2' },
        { label: 'On Duty', value: '5h 30m' }
      ]
    };
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  // Simplified permissions - just basic role-based filtering
  const getQuickActions = () => {
    const allActions = [
      { id: 'tracking', label: 'GPS Tracking', icon: MapPin, color: 'bg-blue-500' },
      { id: 'checkpoints', label: 'Scan Checkpoint', icon: CheckSquare, color: 'bg-green-500' },
      { id: 'incidents', label: 'Report Incident', icon: AlertTriangle, color: 'bg-red-500' },
      { id: 'shifts', label: 'My Shifts', icon: Clock, color: 'bg-purple-500' },
      { id: 'equipment', label: 'Equipment', icon: Package, color: 'bg-orange-500' },
      { id: 'analytics', label: 'Performance', icon: TrendingUp, color: 'bg-indigo-500' },
    ];

    // HR users see different actions
    if (user?.role === 'hr') {
      return [
        { id: 'shifts', label: 'Manage Shifts', icon: Clock, color: 'bg-purple-500' },
        { id: 'analytics', label: 'HR Analytics', icon: TrendingUp, color: 'bg-indigo-500' },
        { id: 'training', label: 'Training', icon: GraduationCap, color: 'bg-green-500' },
        { id: 'reports', label: 'HR Reports', icon: BarChart3, color: 'bg-blue-500' },
      ];
    }

    return allActions;
  };

  const getAdditionalFeatures = () => {
    const baseFeatures = [
      { id: 'tours', label: 'Guard Tours', icon: Calendar, description: 'Schedule and manage patrol routes' },
      { id: 'communication', label: 'Communication', icon: MessageSquare, description: 'Chat with dispatch and team' },
      { id: 'reports', label: 'Reports', icon: BarChart3, description: 'View detailed activity reports' },
      { id: 'training', label: 'Training', icon: GraduationCap, description: 'Complete required training modules' },
      { id: 'weather', label: 'Weather', icon: Cloud, description: 'Current conditions and forecasts' },
      { id: 'search', label: 'Search', icon: Search, description: 'Advanced search across all data' },
      { id: 'sync', label: 'Offline Sync', icon: Settings, description: 'Manage offline data synchronization' },
    ];

    // Add audit trail for supervisors and admins
    if (user?.role === 'supervisor' || user?.role === 'admin') {
      baseFeatures.push({ id: 'audit', label: 'Audit Trail', icon: FileText, description: 'View security audit logs' });
    }

    return baseFeatures;
  };

  const quickActions = getQuickActions();
  const additionalFeatures = getAdditionalFeatures();

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5 text-primary" />
                {statusDisplay.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {statusDisplay.subtitle}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg">{currentTime}</div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {statusDisplay.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {statusDisplay.stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-3 text-center">
              <div className="text-lg">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  onClick={() => onNavigate(action.id)}
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent"
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Additional Features */}
      {additionalFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {additionalFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Button
                  key={feature.id}
                  variant="ghost"
                  onClick={() => onNavigate(feature.id)}
                  className="w-full justify-start h-auto p-3"
                >
                  <IconComponent className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium">{feature.label}</div>
                    <div className="text-xs text-muted-foreground">{feature.description}</div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {user?.role === 'hr' ? (
            <>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1 bg-green-100 rounded">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div>New employee onboarded</div>
                  <div className="text-xs text-muted-foreground">2:15 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1 bg-blue-100 rounded">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div>Performance review completed</div>
                  <div className="text-xs text-muted-foreground">1:30 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1 bg-orange-100 rounded">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div>Leave request approved</div>
                  <div className="text-xs text-muted-foreground">12:45 PM</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1 bg-green-100 rounded">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div>Checkpoint A1 scanned</div>
                  <div className="text-xs text-muted-foreground">2:15 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1 bg-blue-100 rounded">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div>Location updated</div>
                  <div className="text-xs text-muted-foreground">2:10 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1 bg-red-100 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <div>Minor incident reported</div>
                  <div className="text-xs text-muted-foreground">1:45 PM</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}