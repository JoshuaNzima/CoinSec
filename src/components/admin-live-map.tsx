import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  MapPin, 
  Navigation, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Eye,
  Maximize2
} from 'lucide-react';

interface GuardLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'patrol' | 'break' | 'incident';
  lastUpdate: string;
  currentSite: string;
}

const mockGuardLocations: GuardLocation[] = [
  {
    id: '1',
    name: 'John Doe',
    lat: 40.7128,
    lng: -74.0060,
    status: 'patrol',
    lastUpdate: '2 min ago',
    currentSite: 'Downtown Plaza'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    lat: 40.7589,
    lng: -73.9851,
    status: 'active',
    lastUpdate: '1 min ago',
    currentSite: 'Corporate Center'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    lat: 40.7505,
    lng: -73.9934,
    status: 'break',
    lastUpdate: '5 min ago',
    currentSite: 'Financial District'
  }
];

export function AdminLiveMap() {
  const [selectedGuard, setSelectedGuard] = useState<GuardLocation | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'patrol':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'break':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'incident':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'patrol':
        return <Navigation className="h-3 w-3" />;
      case 'break':
        return <Clock className="h-3 w-3" />;
      case 'incident':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Live Guard Tracking
            </CardTitle>
            <CardDescription>
              Real-time location and status of all guards
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              </div>
              
              {/* Guard Markers */}
              {mockGuardLocations.map((guard, index) => (
                <div
                  key={guard.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                    selectedGuard?.id === guard.id ? 'z-10 scale-110' : 'z-0'
                  }`}
                  style={{
                    left: `${30 + index * 25}%`,
                    top: `${40 + index * 15}%`
                  }}
                  onClick={() => setSelectedGuard(guard)}
                >
                  <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                    guard.status === 'active' ? 'bg-green-500' :
                    guard.status === 'patrol' ? 'bg-blue-500' :
                    guard.status === 'break' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}>
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap">
                    {guard.name}
                  </div>
                </div>
              ))}
              
              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button variant="outline" size="sm" className="bg-white/90">
                  <Navigation className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-white/90">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Guard List */}
          <div className="space-y-3">
            <h3 className="font-medium">Active Guards</h3>
            {mockGuardLocations.map((guard) => (
              <div
                key={guard.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedGuard?.id === guard.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedGuard(guard)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{guard.name}</span>
                  <Badge className={getStatusColor(guard.status)}>
                    {getStatusIcon(guard.status)}
                    <span className="ml-1">{guard.status}</span>
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {guard.currentSite}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {guard.lastUpdate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Guard Details */}
        {selectedGuard && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">{selectedGuard.name} - Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedGuard.status)}>
                    {getStatusIcon(selectedGuard.status)}
                    <span className="ml-1">{selectedGuard.status}</span>
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>
                <p className="mt-1">{selectedGuard.currentSite}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Coordinates:</span>
                <p className="mt-1">{selectedGuard.lat.toFixed(4)}, {selectedGuard.lng.toFixed(4)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Update:</span>
                <p className="mt-1">{selectedGuard.lastUpdate}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}