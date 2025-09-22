import React, { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Switch } from "./ui/switch";
import { 
  Camera, 
  Play, 
  Square, 
  Download, 
  Maximize, 
  Settings, 
  Volume2, 
  VolumeX,
  RotateCw,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Grid3X3,
  Grid2X2,
  Monitor,
  Radio,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  Activity,
  Wifi,
  WifiOff,
  Shield,
  Recording,
  Users,
  Building,
  TrendingUp
} from 'lucide-react';
import { cctvService, Camera as CameraType, GeofenceZone, CCTVEvent, RecordingSession } from '../services/cctv-service';
import { toast } from 'sonner@2.0.3';

interface CCTVOperatorDashboardProps {
  onNavigate?: (view: string) => void;
}

export function CCTVOperatorDashboard({ onNavigate }: CCTVOperatorDashboardProps) {
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [events, setEvents] = useState<CCTVEvent[]>([]);
  const [recordings, setRecordings] = useState<RecordingSession[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [activeRecordings, setActiveRecordings] = useState<Set<string>>(new Set());
  const [systemHealth, setSystemHealth] = useState({
    total_cameras: 0,
    online_cameras: 0,
    recording_cameras: 0,
    active_zones: 0,
    storage_usage: 0,
    bandwidth_usage: 0
  });

  useEffect(() => {
    loadDashboardData();
    
    // Start real-time event monitoring
    const stopEventStream = cctvService.startEventStream((event) => {
      setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
      
      // Show toast for critical events
      if (event.severity === 'critical') {
        toast.error(`🚨 ${event.event_type.replace('_', ' ').toUpperCase()}`, {
          description: `${event.camera_name}: ${event.zone_name || 'No zone'}`,
          duration: 10000
        });
      }
    });

    // Refresh data every 30 seconds
    const refreshInterval = setInterval(loadDashboardData, 30000);

    return () => {
      stopEventStream();
      clearInterval(refreshInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [camerasData, zonesData, eventsData, recordingsData, healthData] = await Promise.all([
        cctvService.getCameras(),
        cctvService.getGeofenceZones(),
        cctvService.getCCTVEvents(),
        cctvService.getRecordings(),
        cctvService.getSystemHealth()
      ]);

      setCameras(camerasData);
      setGeofenceZones(zonesData);
      setEvents(eventsData);
      setRecordings(recordingsData);
      setSystemHealth(healthData);
      
      if (!selectedCamera && camerasData.length > 0) {
        setSelectedCamera(camerasData[0]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async (cameraId: string) => {
    const recording = await cctvService.startRecording(cameraId);
    if (recording) {
      setActiveRecordings(prev => new Set([...prev, cameraId]));
    }
  };

  const handleStopRecording = async (cameraId: string) => {
    const activeRecording = recordings.find(r => r.camera_id === cameraId && r.status === 'recording');
    if (activeRecording) {
      const stopped = await cctvService.stopRecording(activeRecording.id);
      if (stopped) {
        setActiveRecordings(prev => {
          const newSet = new Set(prev);
          newSet.delete(cameraId);
          return newSet;
        });
      }
    }
  };

  const handlePTZControl = async (command: string, value?: number) => {
    if (!selectedCamera || selectedCamera.type !== 'ptz') return;
    
    await cctvService.controlPTZ(selectedCamera.id, command as any, value);
  };

  const handleAcknowledgeEvent = async (eventId: string) => {
    const success = await cctvService.acknowledgeEvent(eventId);
    if (success) {
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, acknowledged: true } : event
      ));
    }
  };

  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camera.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || camera.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const unacknowledgedEvents = events.filter(e => !e.acknowledged).length;
  const criticalEvents = events.filter(e => e.severity === 'critical' && !e.acknowledged).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading CCTV Operator Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              CCTV Operations Center
            </h1>
            <p className="text-muted-foreground">Security Surveillance Control & Monitoring</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={loadDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {onNavigate && (
              <Button variant="outline" onClick={() => onNavigate('dashboard')}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cameras Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {systemHealth.online_cameras}/{systemHealth.total_cameras}
                </p>
              </div>
              <Camera className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recording</p>
                <p className="text-2xl font-bold text-red-600">{systemHealth.recording_cameras}</p>
              </div>
              <Recording className="h-8 w-8 text-red-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Zones</p>
                <p className="text-2xl font-bold">{systemHealth.active_zones}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage</p>
                <p className="text-2xl font-bold">{systemHealth.storage_usage}%</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bandwidth</p>
                <p className="text-2xl font-bold">{systemHealth.bandwidth_usage}%</p>
              </div>
              <Activity className="h-8 w-8 text-cyan-500" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cameras">Cameras</TabsTrigger>
            <TabsTrigger value="events">
              Events
              {unacknowledgedEvents > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs">{unacknowledgedEvents}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recordings">Records</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Live Camera Preview Grid */}
              <div className="col-span-2">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Live Camera Grid</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {cameras.slice(0, 9).map((camera) => (
                      <div
                        key={camera.id}
                        className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          selectedCamera?.id === camera.id ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedCamera(camera)}
                      >
                        <div className="aspect-video bg-gray-900 flex items-center justify-center">
                          {camera.status === 'online' ? (
                            <img
                              src={camera.thumbnail_url}
                              alt={camera.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-white">
                              <Camera className="h-6 w-6 mx-auto mb-1 opacity-50" />
                              <p className="text-xs opacity-75">Offline</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute top-1 left-1">
                          <Badge variant={camera.status === 'online' ? 'default' : 'destructive'} className="text-xs">
                            {camera.status === 'online' ? <Wifi className="h-2 w-2 mr-1" /> : <WifiOff className="h-2 w-2 mr-1" />}
                          </Badge>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2">
                          <p className="font-medium text-xs truncate">{camera.name}</p>
                        </div>
                        
                        {activeRecordings.has(camera.id) && (
                          <div className="absolute top-1 right-1">
                            <Badge variant="destructive" className="text-xs">
                              <Radio className="h-2 w-2 mr-1" />
                              REC
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-4">
                {/* Recent Events */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Recent Events</h3>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {events.slice(0, 8).map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border ${
                          event.severity === 'critical' ? 'border-red-200 bg-red-50' :
                          event.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {event.event_type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm">{event.camera_name}</p>
                        
                        {!event.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => handleAcknowledgeEvent(event.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* System Health */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">System Health</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Camera Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{systemHealth.online_cameras} Online</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{width: `${systemHealth.storage_usage}%`}}
                          ></div>
                        </div>
                        <span className="text-sm">{systemHealth.storage_usage}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bandwidth</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-cyan-500 h-2 rounded-full" 
                            style={{width: `${systemHealth.bandwidth_usage}%`}}
                          ></div>
                        </div>
                        <span className="text-sm">{systemHealth.bandwidth_usage}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cameras Tab */}
          <TabsContent value="cameras" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Input
                placeholder="Search cameras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {filteredCameras.map((camera) => (
                <Card key={camera.id} className="p-4">
                  <div className="aspect-video bg-gray-900 rounded mb-3 overflow-hidden">
                    {camera.status === 'online' ? (
                      <img
                        src={camera.thumbnail_url}
                        alt={camera.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Camera className="h-8 w-8 opacity-50" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{camera.name}</h4>
                      <Badge variant={camera.status === 'online' ? 'default' : 'destructive'}>
                        {camera.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">{camera.location}</p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={activeRecordings.has(camera.id) ? "destructive" : "secondary"}
                        onClick={() => {
                          if (activeRecordings.has(camera.id)) {
                            handleStopRecording(camera.id);
                          } else {
                            handleStartRecording(camera.id);
                          }
                        }}
                        className="flex-1"
                      >
                        {activeRecordings.has(camera.id) ? (
                          <Square className="h-3 w-3 mr-1" />
                        ) : (
                          <Play className="h-3 w-3 mr-1" />
                        )}
                        {activeRecordings.has(camera.id) ? 'Stop' : 'Record'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cctvService.takeScreenshot(camera.id)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {events.map((event) => (
                <Card key={event.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          event.severity === 'critical' ? 'destructive' :
                          event.severity === 'warning' ? 'secondary' : 'outline'
                        }>
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        
                        <Badge variant={
                          event.severity === 'critical' ? 'destructive' :
                          event.severity === 'warning' ? 'secondary' : 'outline'
                        }>
                          {event.severity}
                        </Badge>
                        
                        {!event.acknowledged && (
                          <Badge variant="outline" className="text-orange-600">
                            Unacknowledged
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium">{event.camera_name}</h4>
                      {event.zone_name && (
                        <p className="text-sm text-muted-foreground">{event.zone_name}</p>
                      )}
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    {!event.acknowledged && (
                      <Button
                        variant="outline"
                        onClick={() => handleAcknowledgeEvent(event.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {recordings.map((recording) => (
                <Card key={recording.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{recording.camera_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(recording.start_time).toLocaleString()}
                        {recording.duration && ` • ${Math.floor(recording.duration / 60)}m ${recording.duration % 60}s`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={recording.status === 'recording' ? 'destructive' : 'default'}>
                          {recording.status}
                        </Badge>
                        <Badge variant="outline">
                          {recording.trigger_type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {recording.status === 'recording' && (
                        <Button
                          variant="destructive"
                          onClick={() => cctvService.stopRecording(recording.id)}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      )}
                      
                      {recording.video_url && (
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}