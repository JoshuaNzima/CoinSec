import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface Camera {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  type: 'fixed' | 'ptz' | 'dome' | 'bullet';
  resolution: '720p' | '1080p' | '4K';
  has_audio: boolean;
  has_night_vision: boolean;
  has_motion_detection: boolean;
  zone_ids: string[];
  stream_url?: string;
  thumbnail_url?: string;
  last_ping: string;
  created_at: string;
  updated_at: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  description?: string;
  type: 'restricted' | 'monitoring' | 'alert' | 'emergency';
  coordinates: Array<{ latitude: number; longitude: number }>;
  center: { latitude: number; longitude: number };
  radius?: number;
  is_active: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  camera_ids: string[];
  auto_recording: boolean;
  alert_settings: {
    notify_guards: boolean;
    notify_supervisors: boolean;
    sound_alarm: boolean;
    auto_lockdown?: boolean;
  };
  schedule?: {
    enabled: boolean;
    time_ranges: Array<{
      start_time: string;
      end_time: string;
      days: string[];
    }>;
  };
  created_at: string;
  updated_at: string;
}

export interface CCTVEvent {
  id: string;
  camera_id: string;
  camera_name: string;
  zone_id?: string;
  zone_name?: string;
  event_type: 'motion_detected' | 'zone_breach' | 'camera_offline' | 'recording_started' | 'alert_triggered';
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  metadata?: {
    confidence?: number;
    object_detected?: string;
    recording_duration?: number;
    screenshot_url?: string;
    video_url?: string;
  };
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export interface RecordingSession {
  id: string;
  camera_id: string;
  camera_name: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  file_size?: number;
  storage_location: string;
  trigger_type: 'manual' | 'motion' | 'zone_breach' | 'incident' | 'scheduled';
  status: 'recording' | 'completed' | 'failed' | 'processing';
  thumbnail_url?: string;
  video_url?: string;
}

class CCTVService {
  private eventSource: EventSource | null = null;
  private eventCallbacks: Map<string, Function[]> = new Map();

  async getCameras(): Promise<Camera[]> {
    try {
      const { cameras } = await apiCall('/cctv/cameras');
      return cameras || [];
    } catch (error) {
      console.log('Using mock data for cameras:', error.message);
      return this.getMockCameras();
    }
  }

  async getCamera(cameraId: string): Promise<Camera | null> {
    try {
      const { camera } = await apiCall(`/cctv/cameras/${cameraId}`);
      return camera;
    } catch (error) {
      console.error('Failed to fetch camera:', error);
      return this.getMockCameras().find(c => c.id === cameraId) || null;
    }
  }

  async createCamera(cameraData: Partial<Camera>): Promise<Camera | null> {
    try {
      const { camera } = await apiCall('/cctv/cameras', {
        method: 'POST',
        body: JSON.stringify(cameraData)
      });

      toast.success('Camera added successfully');
      return camera;
    } catch (error) {
      console.error('Failed to create camera:', error);
      toast.error('Failed to add camera');
      return null;
    }
  }

  async updateCamera(cameraId: string, updates: Partial<Camera>): Promise<Camera | null> {
    try {
      const { camera } = await apiCall(`/cctv/cameras/${cameraId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      toast.success('Camera updated successfully');
      return camera;
    } catch (error) {
      console.error('Failed to update camera:', error);
      toast.error('Failed to update camera');
      return null;
    }
  }

  async deleteCamera(cameraId: string): Promise<boolean> {
    try {
      await apiCall(`/cctv/cameras/${cameraId}`, {
        method: 'DELETE'
      });

      toast.success('Camera removed successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete camera:', error);
      toast.error('Failed to remove camera');
      return false;
    }
  }

  // Geofencing Methods
  async getGeofenceZones(): Promise<GeofenceZone[]> {
    try {
      const { zones } = await apiCall('/cctv/geofence/zones');
      return zones || [];
    } catch (error) {
      console.log('Using mock data for geofence zones:', error.message);
      return this.getMockGeofenceZones();
    }
  }

  async createGeofenceZone(zoneData: Partial<GeofenceZone>): Promise<GeofenceZone | null> {
    try {
      const { zone } = await apiCall('/cctv/geofence/zones', {
        method: 'POST',
        body: JSON.stringify(zoneData)
      });

      toast.success('Geofence zone created successfully');
      return zone;
    } catch (error) {
      console.error('Failed to create geofence zone:', error);
      toast.error('Failed to create geofence zone');
      return null;
    }
  }

  async updateGeofenceZone(zoneId: string, updates: Partial<GeofenceZone>): Promise<GeofenceZone | null> {
    try {
      const { zone } = await apiCall(`/cctv/geofence/zones/${zoneId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      toast.success('Geofence zone updated successfully');
      return zone;
    } catch (error) {
      console.error('Failed to update geofence zone:', error);
      toast.error('Failed to update geofence zone');
      return null;
    }
  }

  async deleteGeofenceZone(zoneId: string): Promise<boolean> {
    try {
      await apiCall(`/cctv/geofence/zones/${zoneId}`, {
        method: 'DELETE'
      });

      toast.success('Geofence zone deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete geofence zone:', error);
      toast.error('Failed to delete geofence zone');
      return false;
    }
  }

  // Event Management
  async getCCTVEvents(limit: number = 100): Promise<CCTVEvent[]> {
    try {
      const { events } = await apiCall(`/cctv/events?limit=${limit}`);
      return events || [];
    } catch (error) {
      console.log('Using mock data for CCTV events:', error.message);
      return this.getMockCCTVEvents();
    }
  }

  async acknowledgeEvent(eventId: string): Promise<boolean> {
    try {
      await apiCall(`/cctv/events/${eventId}/acknowledge`, {
        method: 'PUT'
      });

      toast.success('Event acknowledged');
      return true;
    } catch (error) {
      console.error('Failed to acknowledge event:', error);
      toast.error('Failed to acknowledge event');
      return false;
    }
  }

  // Recording Management
  async startRecording(cameraId: string, duration?: number): Promise<RecordingSession | null> {
    try {
      const { recording } = await apiCall('/cctv/recordings/start', {
        method: 'POST',
        body: JSON.stringify({
          camera_id: cameraId,
          duration,
          trigger_type: 'manual'
        })
      });

      toast.success('Recording started');
      return recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording');
      return null;
    }
  }

  async stopRecording(recordingId: string): Promise<boolean> {
    try {
      await apiCall(`/cctv/recordings/${recordingId}/stop`, {
        method: 'PUT'
      });

      toast.success('Recording stopped');
      return true;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast.error('Failed to stop recording');
      return false;
    }
  }

  async getRecordings(cameraId?: string): Promise<RecordingSession[]> {
    try {
      const url = cameraId ? `/cctv/recordings?camera_id=${cameraId}` : '/cctv/recordings';
      const { recordings } = await apiCall(url);
      return recordings || [];
    } catch (error) {
      console.log('Using mock data for recordings:', error.message);
      return this.getMockRecordings();
    }
  }

  // PTZ Controls
  async controlPTZ(cameraId: string, command: 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out' | 'preset', value?: number): Promise<boolean> {
    try {
      await apiCall(`/cctv/cameras/${cameraId}/ptz`, {
        method: 'POST',
        body: JSON.stringify({ command, value })
      });

      return true;
    } catch (error) {
      console.error('Failed to control PTZ:', error);
      toast.error('PTZ control failed');
      return false;
    }
  }

  // Live Streaming
  getStreamUrl(cameraId: string, quality: '720p' | '1080p' | '4K' = '1080p'): string {
    // In a real implementation, this would return the actual stream URL
    return `https://demo-stream.example.com/camera/${cameraId}?quality=${quality}`;
  }

  async takeScreenshot(cameraId: string): Promise<string | null> {
    try {
      const { screenshot_url } = await apiCall(`/cctv/cameras/${cameraId}/screenshot`, {
        method: 'POST'
      });

      toast.success('Screenshot captured');
      return screenshot_url;
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      toast.error('Failed to capture screenshot');
      return null;
    }
  }

  // Real-time Event Monitoring
  startEventStream(callback: (event: CCTVEvent) => void): () => void {
    try {
      // In a real implementation, this would connect to Server-Sent Events or WebSocket
      const mockEventInterval = setInterval(() => {
        // Simulate random events
        if (Math.random() < 0.1) { // 10% chance every 5 seconds
          const mockEvent = this.generateMockEvent();
          callback(mockEvent);
        }
      }, 5000);

      return () => clearInterval(mockEventInterval);
    } catch (error) {
      console.error('Failed to start event stream:', error);
      return () => {};
    }
  }

  // Motion Detection
  async enableMotionDetection(cameraId: string, sensitivity: number = 50): Promise<boolean> {
    try {
      await apiCall(`/cctv/cameras/${cameraId}/motion-detection`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: true, sensitivity })
      });

      toast.success('Motion detection enabled');
      return true;
    } catch (error) {
      console.error('Failed to enable motion detection:', error);
      toast.error('Failed to enable motion detection');
      return false;
    }
  }

  async disableMotionDetection(cameraId: string): Promise<boolean> {
    try {
      await apiCall(`/cctv/cameras/${cameraId}/motion-detection`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: false })
      });

      toast.success('Motion detection disabled');
      return true;
    } catch (error) {
      console.error('Failed to disable motion detection:', error);
      toast.error('Failed to disable motion detection');
      return false;
    }
  }

  // System Health
  async getSystemHealth(): Promise<{
    total_cameras: number;
    online_cameras: number;
    recording_cameras: number;
    active_zones: number;
    storage_usage: number;
    bandwidth_usage: number;
  }> {
    try {
      const { health } = await apiCall('/cctv/system/health');
      return health;
    } catch (error) {
      console.log('Using mock data for system health:', error.message);
      return {
        total_cameras: 12,
        online_cameras: 10,
        recording_cameras: 3,
        active_zones: 8,
        storage_usage: 65,
        bandwidth_usage: 45
      };
    }
  }

  // Check if point is within geofence zone
  isPointInZone(point: { latitude: number; longitude: number }, zone: GeofenceZone): boolean {
    if (zone.radius && zone.center) {
      // Circular zone
      const distance = this.calculateDistance(point.latitude, point.longitude, zone.center.latitude, zone.center.longitude);
      return distance <= zone.radius;
    } else if (zone.coordinates.length >= 3) {
      // Polygon zone
      return this.pointInPolygon(point, zone.coordinates);
    }
    return false;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private pointInPolygon(point: { latitude: number; longitude: number }, polygon: Array<{ latitude: number; longitude: number }>): boolean {
    const { latitude: x, longitude: y } = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const { latitude: xi, longitude: yi } = polygon[i];
      const { latitude: xj, longitude: yj } = polygon[j];

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  private generateMockEvent(): CCTVEvent {
    const eventTypes: CCTVEvent['event_type'][] = ['motion_detected', 'zone_breach', 'camera_offline'];
    const severities: CCTVEvent['severity'][] = ['info', 'warning', 'critical'];
    
    return {
      id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      camera_id: 'cam-001',
      camera_name: 'Main Entrance',
      zone_id: 'zone-001',
      zone_name: 'Restricted Area',
      event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      timestamp: new Date().toISOString(),
      metadata: {
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
        object_detected: 'person'
      },
      acknowledged: false
    };
  }

  private getMockCameras(): Camera[] {
    const now = new Date();
    return [
      {
        id: 'cam-001',
        name: 'Main Entrance',
        location: 'Building A - Main Entrance',
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'online',
        type: 'dome',
        resolution: '4K',
        has_audio: true,
        has_night_vision: true,
        has_motion_detection: true,
        zone_ids: ['zone-001'],
        stream_url: 'https://demo-stream.example.com/camera/cam-001',
        thumbnail_url: 'https://picsum.photos/320/240?random=1',
        last_ping: new Date(now.getTime() - 30000).toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      },
      {
        id: 'cam-002',
        name: 'Parking Lot North',
        location: 'Parking Area - North Section',
        latitude: 40.7135,
        longitude: -74.0055,
        status: 'online',
        type: 'bullet',
        resolution: '1080p',
        has_audio: false,
        has_night_vision: true,
        has_motion_detection: true,
        zone_ids: ['zone-002'],
        stream_url: 'https://demo-stream.example.com/camera/cam-002',
        thumbnail_url: 'https://picsum.photos/320/240?random=2',
        last_ping: new Date(now.getTime() - 15000).toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      },
      {
        id: 'cam-003',
        name: 'Loading Dock',
        location: 'Building B - Loading Area',
        latitude: 40.7125,
        longitude: -74.0065,
        status: 'offline',
        type: 'ptz',
        resolution: '1080p',
        has_audio: true,
        has_night_vision: true,
        has_motion_detection: true,
        zone_ids: ['zone-003'],
        stream_url: 'https://demo-stream.example.com/camera/cam-003',
        thumbnail_url: 'https://picsum.photos/320/240?random=3',
        last_ping: new Date(now.getTime() - 300000).toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
    ];
  }

  private getMockGeofenceZones(): GeofenceZone[] {
    const now = new Date();
    return [
      {
        id: 'zone-001',
        name: 'Main Entrance Restricted Area',
        description: 'High security zone around main building entrance',
        type: 'restricted',
        coordinates: [
          { latitude: 40.7127, longitude: -74.0061 },
          { latitude: 40.7129, longitude: -74.0061 },
          { latitude: 40.7129, longitude: -74.0059 },
          { latitude: 40.7127, longitude: -74.0059 }
        ],
        center: { latitude: 40.7128, longitude: -74.0060 },
        is_active: true,
        priority: 'critical',
        camera_ids: ['cam-001'],
        auto_recording: true,
        alert_settings: {
          notify_guards: true,
          notify_supervisors: true,
          sound_alarm: true,
          auto_lockdown: true
        },
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      },
      {
        id: 'zone-002',
        name: 'Parking Monitoring Zone',
        description: 'General monitoring area for parking lot',
        type: 'monitoring',
        coordinates: [
          { latitude: 40.7133, longitude: -74.0057 },
          { latitude: 40.7137, longitude: -74.0057 },
          { latitude: 40.7137, longitude: -74.0053 },
          { latitude: 40.7133, longitude: -74.0053 }
        ],
        center: { latitude: 40.7135, longitude: -74.0055 },
        is_active: true,
        priority: 'medium',
        camera_ids: ['cam-002'],
        auto_recording: false,
        alert_settings: {
          notify_guards: true,
          notify_supervisors: false,
          sound_alarm: false
        },
        schedule: {
          enabled: true,
          time_ranges: [
            {
              start_time: '18:00',
              end_time: '06:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            }
          ]
        },
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
    ];
  }

  private getMockCCTVEvents(): CCTVEvent[] {
    const now = new Date();
    return [
      {
        id: 'event-001',
        camera_id: 'cam-001',
        camera_name: 'Main Entrance',
        zone_id: 'zone-001',
        zone_name: 'Main Entrance Restricted Area',
        event_type: 'motion_detected',
        severity: 'warning',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        metadata: {
          confidence: 85,
          object_detected: 'person',
          screenshot_url: 'https://picsum.photos/640/480?random=10'
        },
        acknowledged: false
      },
      {
        id: 'event-002',
        camera_id: 'cam-003',
        camera_name: 'Loading Dock',
        event_type: 'camera_offline',
        severity: 'critical',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        acknowledged: true,
        acknowledged_by: 'supervisor-001',
        acknowledged_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
      }
    ];
  }

  private getMockRecordings(): RecordingSession[] {
    const now = new Date();
    return [
      {
        id: 'rec-001',
        camera_id: 'cam-001',
        camera_name: 'Main Entrance',
        start_time: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        duration: 900, // 15 minutes
        file_size: 245760000, // ~245MB
        storage_location: '/recordings/2024/01/cam-001-20240115-1400.mp4',
        trigger_type: 'motion',
        status: 'completed',
        thumbnail_url: 'https://picsum.photos/320/240?random=20',
        video_url: 'https://demo-video.example.com/rec-001.mp4'
      }
    ];
  }
}

export const cctvService = new CCTVService();