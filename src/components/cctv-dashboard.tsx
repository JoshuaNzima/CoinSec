import React, { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
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
  Move,
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
  Filter,
  RefreshCw,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cctvService, Camera as CameraType, GeofenceZone, CCTVEvent, RecordingSession } from '../services/cctv-service';
import { toast } from 'sonner@2.0.3';

interface CCTVDashboardProps {
  onNavigate?: (view: string) => void;
}

export function CCTVDashboard({ onNavigate }: CCTVDashboardProps) {
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [events, setEvents] = useState<CCTVEvent[]>([]);
  const [recordings, setRecordings] = useState<RecordingSession[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'single' | 'quad'>('grid');
  const [gridSize, setGridSize] = useState<'2x2' | '3x3' | '4x4'>('3x3');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [showGeofences, setShowGeofences] = useState(true);
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

  const handleTakeScreenshot = async (cameraId: string) => {
    const screenshotUrl = await cctvService.takeScreenshot(cameraId);
    if (screenshotUrl) {
      // In a real implementation, this would trigger a download
      toast.success('Screenshot captured and saved');
    }
  };

  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camera.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || camera.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getGridColumns = () => {
    switch (gridSize) {
      case '2x2': return 'grid-cols-2';
      case '3x3': return 'grid-cols-3';
      case '4x4': return 'grid-cols-4';
      default: return 'grid-cols-3';
    }
  };

  const getCameraStatusIcon = (status: CameraType['status']) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventSeverityColor = (severity: CCTVEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading CCTV Dashboard...</p>
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
              <Camera className="h-8 w-8" />
              CCTV Control Center
            </h1>
            <p className="text-muted-foreground">Real-time surveillance and monitoring</p>
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

        {/* System Health */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cameras</p>
                <p className="text-2xl font-bold">{systemHealth.total_cameras}</p>
              </div>
              <Camera className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{systemHealth.online_cameras}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recording</p>
                <p className="text-2xl font-bold text-red-600">{systemHealth.recording_cameras}</p>
              </div>
              <Radio className="h-8 w-8 text-red-500" />
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

        <div className="grid grid-cols-4 gap-6">
          {/* Camera Grid */}
          <div className="col-span-3">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Live Camera Feeds</h2>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search cameras..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48"
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
                  
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant={gridSize === '2x2' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setGridSize('2x2')}
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={gridSize === '3x3' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setGridSize('3x3')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={gridSize === '4x4' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setGridSize('4x4')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className={`grid ${getGridColumns()} gap-4`}>
                {filteredCameras.map((camera) => (
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
                          <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm opacity-75">Camera Offline</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute top-2 left-2">
                      <Badge variant={camera.status === 'online' ? 'default' : 'destructive'}>
                        {getCameraStatusIcon(camera.status)}
                        <span className="ml-1">{camera.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      {activeRecordings.has(camera.id) && (
                        <Badge variant="destructive">
                          <Radio className="h-3 w-3 mr-1" />
                          REC
                        </Badge>
                      )}
                      {camera.has_motion_detection && (
                        <Badge variant="secondary">
                          <Eye className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2">
                      <p className="font-medium text-sm truncate">{camera.name}</p>
                      <p className="text-xs opacity-75 truncate">{camera.location}</p>
                    </div>
                    
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTakeScreenshot(camera.id);
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={activeRecordings.has(camera.id) ? "destructive" : "secondary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeRecordings.has(camera.id)) {
                            handleStopRecording(camera.id);
                          } else {
                            handleStartRecording(camera.id);
                          }
                        }}
                      >
                        {activeRecordings.has(camera.id) ? (
                          <Square className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Camera Controls */}
            {selectedCamera && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Camera Controls</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{selectedCamera.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCamera.location}</p>
                  </div>
                  
                  {selectedCamera.type === 'ptz' && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">PTZ Controls</p>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div></div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePTZControl('tilt_up')}
                        >
                          ↑
                        </Button>
                        <div></div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePTZControl('pan_left')}
                        >
                          ←
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePTZControl('preset', 1)}
                        >
                          HOME
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePTZControl('pan_right')}
                        >
                          →
                        </Button>
                        
                        <div></div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePTZControl('tilt_down')}
                        >
                          ↓
                        </Button>
                        <div></div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePTZControl('zoom_in')}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePTZControl('zoom_out')}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Motion Detection</span>
                      <Switch
                        checked={selectedCamera.has_motion_detection}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            cctvService.enableMotionDetection(selectedCamera.id);
                          } else {
                            cctvService.disableMotionDetection(selectedCamera.id);
                          }
                        }}
                      />
                    </div>
                    
                    {selectedCamera.has_audio && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Audio</span>
                        <Button size="sm" variant="outline">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Events */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Recent Events</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.slice(0, 10).map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${getEventSeverityColor(event.severity)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {event.event_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-1">{event.camera_name}</p>
                    {event.zone_name && (
                      <p className="text-xs opacity-75">{event.zone_name}</p>
                    )}
                    
                    {!event.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => cctvService.acknowledgeEvent(event.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Geofence Zones */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Geofence Zones</h3>
                <Switch
                  checked={showGeofences}
                  onCheckedChange={setShowGeofences}
                />
              </div>
              
              <div className="space-y-2">
                {geofenceZones.slice(0, 5).map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{zone.name}</p>
                      <p className="text-xs text-muted-foreground">{zone.type}</p>
                    </div>
                    
                    <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}