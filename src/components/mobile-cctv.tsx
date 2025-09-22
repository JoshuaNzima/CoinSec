import React, { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { 
  Camera, 
  Play, 
  Square, 
  Download, 
  Maximize, 
  Volume2, 
  VolumeX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Radio,
  Clock,
  Shield,
  Map
} from 'lucide-react';
import { cctvService, Camera as CameraType, GeofenceZone, CCTVEvent } from '../services/cctv-service';
import { toast } from 'sonner@2.0.3';

interface MobileCCTVProps {
  onNavigate?: (view: string) => void;
}

export function MobileCCTV({ onNavigate }: MobileCCTVProps) {
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [events, setEvents] = useState<CCTVEvent[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [currentView, setCurrentView] = useState<'cameras' | 'events' | 'zones'>('cameras');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRecordings, setActiveRecordings] = useState<Set<string>>(new Set());
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [unacknowledgedEvents, setUnacknowledgedEvents] = useState(0);

  useEffect(() => {
    loadMobileCCTVData();
    
    // Start real-time event monitoring
    const stopEventStream = cctvService.startEventStream((event) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
      
      // Update unacknowledged count
      if (!event.acknowledged) {
        setUnacknowledgedEvents(prev => prev + 1);
      }
      
      // Show toast for critical events
      if (event.severity === 'critical') {
        toast.error(`🚨 ${event.event_type.replace('_', ' ').toUpperCase()}`, {
          description: event.camera_name,
          duration: 8000
        });
      }
    });

    return () => {
      stopEventStream();
    };
  }, []);

  const loadMobileCCTVData = async () => {
    try {
      const [camerasData, zonesData, eventsData] = await Promise.all([
        cctvService.getCameras(),
        cctvService.getGeofenceZones(),
        cctvService.getCCTVEvents(50)
      ]);

      setCameras(camerasData);
      setGeofenceZones(zonesData);
      setEvents(eventsData);
      
      // Count unacknowledged events
      const unacknowledged = eventsData.filter(e => !e.acknowledged).length;
      setUnacknowledgedEvents(unacknowledged);
      
      if (!selectedCamera && camerasData.length > 0) {
        setSelectedCamera(camerasData[0]);
      }
    } catch (error) {
      console.error('Failed to load mobile CCTV data:', error);
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
    // Find active recording and stop it
    setActiveRecordings(prev => {
      const newSet = new Set(prev);
      newSet.delete(cameraId);
      return newSet;
    });
    toast.success('Recording stopped');
  };

  const handleAcknowledgeEvent = async (eventId: string) => {
    const success = await cctvService.acknowledgeEvent(eventId);
    if (success) {
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, acknowledged: true } : event
      ));
      setUnacknowledgedEvents(prev => Math.max(0, prev - 1));
    }
  };

  const navigateCamera = (direction: 'prev' | 'next') => {
    const currentIndex = cameras.findIndex(c => c.id === selectedCamera?.id);
    let newIndex = currentIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : cameras.length - 1;
    } else {
      newIndex = currentIndex < cameras.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedCamera(cameras[newIndex]);
  };

  const filteredCameras = cameras.filter(camera =>
    camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camera.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const criticalEvents = events.filter(e => e.severity === 'critical' && !e.acknowledged).length;
  const activeZones = geofenceZones.filter(z => z.is_active).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading CCTV System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6" />
            CCTV Mobile
          </h1>
          <p className="text-sm text-muted-foreground">Supervisor monitoring</p>
        </div>
        
        <Button variant="outline" size="sm" onClick={loadMobileCCTVData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-3">
          <div className="text-center">
            <Camera className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xs text-muted-foreground">Online</p>
            <p className="font-bold text-green-600">{onlineCameras}/{cameras.length}</p>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="font-bold text-red-600">{criticalEvents}</p>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-center">
            <Shield className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <p className="text-xs text-muted-foreground">Zones</p>
            <p className="font-bold">{activeZones}</p>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-center">
            <Radio className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-xs text-muted-foreground">Recording</p>
            <p className="font-bold text-orange-600">{activeRecordings.size}</p>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            currentView === 'cameras' ? 'bg-background shadow-sm' : 'text-muted-foreground'
          }`}
          onClick={() => setCurrentView('cameras')}
        >
          <Camera className="h-4 w-4 inline mr-1" />
          Cameras
        </button>
        
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${
            currentView === 'events' ? 'bg-background shadow-sm' : 'text-muted-foreground'
          }`}
          onClick={() => setCurrentView('events')}
        >
          <AlertTriangle className="h-4 w-4 inline mr-1" />
          Events
          {unacknowledgedEvents > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
              {unacknowledgedEvents}
            </Badge>
          )}
        </button>
        
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            currentView === 'zones' ? 'bg-background shadow-sm' : 'text-muted-foreground'
          }`}
          onClick={() => setCurrentView('zones')}
        >
          <Map className="h-4 w-4 inline mr-1" />
          Zones
        </button>
      </div>

      {/* Camera View */}
      {currentView === 'cameras' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search cameras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Current Camera View */}
          {selectedCamera && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{selectedCamera.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCamera.location}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={selectedCamera.status === 'online' ? 'default' : 'destructive'}>
                    {selectedCamera.status === 'online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                    {selectedCamera.status}
                  </Badge>
                  
                  {activeRecordings.has(selectedCamera.id) && (
                    <Badge variant="destructive">
                      <Radio className="h-3 w-3 mr-1" />
                      REC
                    </Badge>
                  )}
                </div>
              </div>

              <div className="relative">
                <div 
                  className="aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setShowFullscreen(true)}
                >
                  {selectedCamera.status === 'online' ? (
                    <img
                      src={selectedCamera.thumbnail_url}
                      alt={selectedCamera.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-75">Camera Offline</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setShowFullscreen(true)}>
                    <Maximize className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={activeRecordings.has(selectedCamera.id) ? "destructive" : "secondary"}
                    onClick={() => {
                      if (activeRecordings.has(selectedCamera.id)) {
                        handleStopRecording(selectedCamera.id);
                      } else {
                        handleStartRecording(selectedCamera.id);
                      }
                    }}
                  >
                    {activeRecordings.has(selectedCamera.id) ? (
                      <Square className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                <div className="absolute top-2 left-2 right-2 flex justify-between">
                  <Button size="sm" variant="secondary" onClick={() => navigateCamera('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigateCamera('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Camera List/Grid */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {filteredCameras.map((camera) => (
              <Card
                key={camera.id}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedCamera?.id === camera.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedCamera(camera)}
              >
                {viewMode === 'grid' ? (
                  <div>
                    <div className="aspect-video bg-gray-900 rounded mb-2 overflow-hidden">
                      {camera.status === 'online' ? (
                        <img
                          src={camera.thumbnail_url}
                          alt={camera.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{camera.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{camera.location}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {camera.status === 'online' ? (
                          <Wifi className="h-3 w-3 text-green-500" />
                        ) : (
                          <WifiOff className="h-3 w-3 text-red-500" />
                        )}
                        {activeRecordings.has(camera.id) && (
                          <Radio className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-12 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                      {camera.status === 'online' ? (
                        <img
                          src={camera.thumbnail_url}
                          alt={camera.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{camera.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{camera.location}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {camera.status === 'online' ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                      )}
                      {activeRecordings.has(camera.id) && (
                        <Radio className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Events View */}
      {currentView === 'events' && (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={
                      event.severity === 'critical' ? 'destructive' :
                      event.severity === 'warning' ? 'secondary' : 'outline'
                    }>
                      {event.event_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    
                    {!event.acknowledged && (
                      <Badge variant="outline" className="text-orange-600">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <p className="font-medium text-sm">{event.camera_name}</p>
                  {event.zone_name && (
                    <p className="text-xs text-muted-foreground">{event.zone_name}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                
                {!event.acknowledged && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAcknowledgeEvent(event.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    ACK
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Zones View */}
      {currentView === 'zones' && (
        <div className="space-y-3">
          {geofenceZones.map((zone) => (
            <Card key={zone.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{zone.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{zone.type} Zone</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {zone.camera_ids.length} camera(s) assigned
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  <Badge variant={
                    zone.priority === 'critical' ? 'destructive' :
                    zone.priority === 'high' ? 'secondary' : 'outline'
                  }>
                    {zone.priority}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-full h-full p-0">
          <div className="relative w-full h-full bg-black">
            {selectedCamera && (
              <>
                <img
                  src={selectedCamera.thumbnail_url}
                  alt={selectedCamera.name}
                  className="w-full h-full object-contain"
                />
                
                <div className="absolute top-4 left-4 right-4 flex justify-between text-white">
                  <div>
                    <h3 className="font-semibold">{selectedCamera.name}</h3>
                    <p className="text-sm opacity-75">{selectedCamera.location}</p>
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowFullscreen(false)}
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
                  <Button variant="secondary" onClick={() => navigateCamera('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant={activeRecordings.has(selectedCamera.id) ? "destructive" : "secondary"}
                    onClick={() => {
                      if (activeRecordings.has(selectedCamera.id)) {
                        handleStopRecording(selectedCamera.id);
                      } else {
                        handleStartRecording(selectedCamera.id);
                      }
                    }}
                  >
                    {activeRecordings.has(selectedCamera.id) ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  
                  <Button variant="secondary" onClick={() => navigateCamera('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}