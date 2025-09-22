import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MapPin, Users, Clock, AlertTriangle, Wifi, WifiOff, Navigation } from 'lucide-react';
import { gpsService, LocationData } from '@guard-services/shared';

export default function GPSTrackingPage() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [selectedGuard, setSelectedGuard] = useState<string | null>(null);

  useEffect(() => {
    loadGuardLocations();
    
    if (realTimeEnabled) {
      const interval = setInterval(loadGuardLocations, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled]);

  const loadGuardLocations = async () => {
    try {
      setLoading(true);
      const data = await gpsService.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to load guard locations:', error);
      // Fallback to mock data
      setLocations(mockLocations);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (lastUpdate: string) => {
    const minutesAgo = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60);
    if (minutesAgo < 5) return 'text-green-600 bg-green-100';
    if (minutesAgo < 15) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = (lastUpdate: string) => {
    const minutesAgo = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60));
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 5) return 'Active';
    if (minutesAgo < 15) return `${minutesAgo}m ago`;
    return 'Offline';
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const onlineGuards = locations.filter(loc => {
    const minutesAgo = (Date.now() - new Date(loc.timestamp).getTime()) / (1000 * 60);
    return minutesAgo < 15;
  });

  const stats = [
    {
      title: 'Guards Online',
      value: onlineGuards.length,
      total: locations.length,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Active Tracking',
      value: locations.filter(loc => {
        const minutesAgo = (Date.now() - new Date(loc.timestamp).getTime()) / (1000 * 60);
        return minutesAgo < 5;
      }).length,
      total: locations.length,
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'Average Accuracy',
      value: locations.length > 0 ? Math.round(locations.reduce((sum, loc) => sum + (loc.accuracy || 0), 0) / locations.length) : 0,
      unit: 'm',
      icon: Navigation,
      color: 'text-purple-600'
    },
    {
      title: 'Last Update',
      value: locations.length > 0 ? getStatusText(Math.max(...locations.map(loc => new Date(loc.timestamp).getTime())).toString()) : 'No data',
      icon: Clock,
      color: 'text-orange-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GPS Tracking</h1>
          <p className="text-muted-foreground">
            Real-time location monitoring for all security personnel.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Real-time updates</span>
            <Switch
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
          </div>
          <Button onClick={loadGuardLocations} disabled={loading}>
            {loading ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                {stat.unit && <span className="text-sm font-normal"> {stat.unit}</span>}
                {stat.total && <span className="text-sm font-normal text-muted-foreground">/{stat.total}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Guard List</TabsTrigger>
          <TabsTrigger value="map">Live Map</TabsTrigger>
          <TabsTrigger value="zones">Geofences</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Guard Locations</CardTitle>
              <CardDescription>
                Current location status for all guards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guard</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {loading ? 'Loading guard locations...' : 'No location data available'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    locations.map((location) => (
                      <TableRow key={location.user_id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Guard {location.user_id}</div>
                              <div className="text-sm text-muted-foreground">ID: {location.user_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(location.timestamp)}>
                            {getStatusText(location.timestamp)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {formatCoordinates(location.latitude, location.longitude)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {location.accuracy ? `±${Math.round(location.accuracy)}m` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(location.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGuard(location.user_id)}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Live Map View</CardTitle>
              <CardDescription>
                Interactive map showing real-time guard positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive map would be integrated here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Using services like Google Maps, Mapbox, or OpenStreetMap
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Geofence Management</CardTitle>
              <CardDescription>
                Configure and monitor geographical boundaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Main Building Perimeter</h4>
                    <p className="text-sm text-muted-foreground">Radius: 50m • Active</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Parking Area</h4>
                    <p className="text-sm text-muted-foreground">Radius: 30m • Active</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Emergency Exit Zone</h4>
                    <p className="text-sm text-muted-foreground">Radius: 15m • Monitoring</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Monitor</Badge>
                </div>
                
                <Button className="w-full">
                  Add New Geofence
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mock data for fallback
const mockLocations: LocationData[] = [
  {
    user_id: 'guard-001',
    latitude: 37.7849,
    longitude: -122.4094,
    accuracy: 5,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
  },
  {
    user_id: 'guard-002',
    latitude: 37.7849,
    longitude: -122.4104,
    accuracy: 8,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  },
  {
    user_id: 'guard-003',
    latitude: 37.7859,
    longitude: -122.4084,
    accuracy: 12,
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
  },
];