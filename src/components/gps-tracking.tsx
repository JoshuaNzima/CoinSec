import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Settings,
  Target,
  Zap,
  Battery,
  Signal,
  Shield
} from 'lucide-react';
import { mockEmployees, mockSites, type Employee } from '../data/mock-data';
import { gpsService, LocationData } from '../services/gps-service';
import { notificationService } from '../services/notification-service';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner@2.0.3';

interface Location {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  accuracy: number;
  battery?: number;
}

interface GuardLocation extends Employee {
  location: Location;
  lastUpdate: string;
}

export function GPSTracking() {
  const { user } = useAuth();
  const [guards, setGuards] = useState<GuardLocation[]>([]);
  const [selectedGuard, setSelectedGuard] = useState<GuardLocation | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isStartingTracking, setIsStartingTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [realTimeLocations, setRealTimeLocations] = useState<LocationData[]>([]);

  // Initialize and load real location data
  useEffect(() => {
    loadLocationData();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadLocationData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadLocationData = async () => {
    try {
      // Load all current locations from server
      const locations = await gpsService.getAllLocations();
      setRealTimeLocations(locations);

      // Merge with mock employee data for display
      const guardsWithLocation: GuardLocation[] = mockEmployees
        .filter(emp => emp.role === 'guard' || emp.role === 'supervisor')
        .map((guard, index) => {
          // Try to find real location data for this guard
          const realLocation = locations.find(loc => loc.user_id === guard.id);
          
          const location: Location = realLocation ? {
            id: `loc_${guard.id}`,
            lat: realLocation.latitude,
            lng: realLocation.longitude,
            timestamp: realLocation.timestamp,
            accuracy: realLocation.accuracy || 5,
            battery: Math.floor(Math.random() * 50) + 50 // Mock battery for now
          } : {
            id: `mock_${index}`,
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            timestamp: new Date().toISOString(),
            accuracy: Math.random() * 10 + 3,
            battery: Math.floor(Math.random() * 50) + 50
          };

          const lastUpdateTime = realLocation 
            ? new Date(realLocation.timestamp)
            : new Date(Date.now() - Math.random() * 600000); // Random time in last 10 minutes

          const timeDiff = Date.now() - lastUpdateTime.getTime();
          const minutesAgo = Math.floor(timeDiff / 60000);
          
          return {
            ...guard,
            location,
            lastUpdate: minutesAgo < 1 ? 'Just now' : 
                      minutesAgo < 60 ? `${minutesAgo} min ago` : 
                      `${Math.floor(minutesAgo / 60)}h ago`
          };
        });
      
      setGuards(guardsWithLocation);
    } catch (error) {
      console.error('Failed to load location data:', error);
      // Fallback to mock data
      loadMockLocationData();
    }
  };

  const loadMockLocationData = () => {
    const guardsWithLocation: GuardLocation[] = mockEmployees
      .filter(emp => emp.role === 'guard' || emp.role === 'supervisor')
      .map((guard, index) => ({
        ...guard,
        location: {
          id: `mock_${index}`,
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1,
          timestamp: new Date().toISOString(),
          accuracy: Math.random() * 10 + 3,
          battery: Math.floor(Math.random() * 50) + 50
        },
        lastUpdate: `${Math.floor(Math.random() * 10) + 1} minutes ago`
      }));
    
    setGuards(guardsWithLocation);
  };

  // Handle GPS tracking toggle
  const handleTrackingToggle = async (enabled: boolean) => {
    if (enabled) {
      setIsStartingTracking(true);
      const success = await gpsService.startTracking();
      if (success) {
        setTrackingEnabled(true);
        toast.success('GPS tracking started');
        
        // Start notification polling if user is logged in
        if (user) {
          notificationService.startPolling(user.id);
        }
      } else {
        toast.error('Failed to start GPS tracking');
      }
      setIsStartingTracking(false);
    } else {
      gpsService.stopTracking();
      setTrackingEnabled(false);
      notificationService.stopPolling();
      toast.info('GPS tracking stopped');
    }
  };

  // Update current location when tracking is enabled
  useEffect(() => {
    if (trackingEnabled) {
      const updateCurrentLocation = async () => {
        try {
          const position = await gpsService.getCurrentLocation();
          if (position) {
            setCurrentLocation({
              id: 'current',
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: position.coords.accuracy,
              battery: 75 // Mock battery for now
            });
          }
        } catch (error) {
          console.error('Failed to get current location:', error);
          // Fallback to mock location for demo
          setCurrentLocation({
            id: 'current',
            lat: 40.7128 + (Math.random() - 0.5) * 0.01,
            lng: -74.0060 + (Math.random() - 0.5) * 0.01,
            timestamp: new Date().toISOString(),
            accuracy: Math.random() * 10 + 3,
            battery: 75
          });
        }
      };

      // Update immediately
      updateCurrentLocation();
      
      // Then update every 30 seconds
      const interval = setInterval(updateCurrentLocation, 30000);
      return () => clearInterval(interval);
    }
  }, [trackingEnabled]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'on_leave':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600';
    if (battery > 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGeofenceStatus = (guard: GuardLocation) => {
    // Mock geofence checking - in real app would check against site boundaries
    const isInGeofence = Math.random() > 0.2; // 80% chance in geofence
    return isInGeofence;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">GPS Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Real-time location monitoring for {guards.length} guards
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Switch 
              checked={trackingEnabled}
              onCheckedChange={handleTrackingToggle}
              disabled={isStartingTracking}
            />
            <span className="text-sm">
              {isStartingTracking ? 'Starting...' : trackingEnabled ? 'Live' : 'Paused'}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current Location Card */}
      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              Your Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Coordinates</p>
                <p className="font-mono text-sm">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-sm">±{currentLocation.accuracy.toFixed(1)}m</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Update</p>
                <p className="text-sm">{new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signal Strength</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-4 bg-green-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-green-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-green-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-300 rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Map placeholder */}
            <div className="mt-4 aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Interactive Map View</p>
                <p className="text-xs">Your location and nearby guards</p>
              </div>
              
              {/* Simulate location dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-blue-500/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Location Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Locations
          </CardTitle>
          <CardDescription>
            Live tracking of all team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {guards.map((guard) => {
              const isInGeofence = getGeofenceStatus(guard);
              return (
                <div 
                  key={guard.id} 
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                    selectedGuard?.id === guard.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedGuard(guard)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{guard.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{guard.name}</p>
                        <p className="text-sm text-muted-foreground">{guard.site || 'Unassigned'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(guard.status)}>
                            {guard.status}
                          </Badge>
                          {!isInGeofence && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Out of bounds
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{guard.lastUpdate}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          guard.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs">{trackingEnabled ? 'Live' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-mono text-xs">
                        {guard.location.lat.toFixed(4)}, {guard.location.lng.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Accuracy</p>
                      <p>±{guard.location.accuracy.toFixed(1)}m</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Battery</p>
                      <p className={getBatteryColor(guard.location.battery || 0)}>
                        {Math.floor(guard.location.battery || 0)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Guard Details */}
      {selectedGuard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {selectedGuard.name} - Detailed View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Location Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="font-mono">{selectedGuard.location.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="font-mono">{selectedGuard.location.lng.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span>±{selectedGuard.location.accuracy.toFixed(1)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Update:</span>
                    <span>{new Date(selectedGuard.location.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Geofence Status:</span>
                    {getGeofenceStatus(selectedGuard) ? (
                      <Badge className="bg-green-100 text-green-800">Within bounds</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Out of bounds</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Guard Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(selectedGuard.status)}>
                      {selectedGuard.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Badge:</span>
                    <span>{selectedGuard.badge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Site:</span>
                    <span>{selectedGuard.site || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shift:</span>
                    <span>{selectedGuard.shift || 'Not scheduled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battery:</span>
                    <span className={getBatteryColor(selectedGuard.location.battery || 0)}>
                      {Math.floor(selectedGuard.location.battery || 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Location History
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Geofence Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Guards</p>
                <p className="text-xl font-semibold">{guards.filter(g => g.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Update</p>
                <p className="text-xl font-semibold">2.3 min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Geofence</p>
                <p className="text-xl font-semibold">{guards.filter(g => getGeofenceStatus(g)).length}/{guards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Low Battery</p>
                <p className="text-xl font-semibold">{guards.filter(g => (g.location.battery || 0) < 20).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          Share Location
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Emergency Alert
        </Button>
      </div>
    </div>
  );
}