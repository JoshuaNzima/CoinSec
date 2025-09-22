import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface LocationData {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface LocationHistory {
  history: LocationData[];
}

class GPSService {
  private watchId: number | null = null;
  private isTracking = false;
  private updateInterval: NodeJS.Timeout | null = null;

  async startTracking(): Promise<boolean> {
    if (this.isTracking) {
      return true;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return false;
    }

    try {
      // Request permission first
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        toast.error('Location permission denied');
        return false;
      }

      // Start watching position
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handleLocationUpdate(position),
        (error) => this.handleLocationError(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      this.isTracking = true;
      toast.success('GPS tracking started');
      return true;
    } catch (error) {
      console.error('Failed to start GPS tracking:', error);
      toast.error('Failed to start GPS tracking');
      return false;
    }
  }

  stopTracking(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isTracking = false;
    toast.success('GPS tracking stopped');
  }

  private async handleLocationUpdate(position: GeolocationPosition): Promise<void> {
    try {
      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };

      await this.updateLocation(locationData);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }

  private handleLocationError(error: GeolocationPositionError): void {
    let message = 'Location error occurred';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out';
        break;
    }

    console.error('GPS Error:', message);
    toast.error(message);
  }

  async updateLocation(locationData: Omit<LocationData, 'user_id' | 'timestamp'>): Promise<void> {
    try {
      await apiCall('/gps/location', {
        method: 'POST',
        body: JSON.stringify(locationData)
      });
    } catch (error) {
      // Check if we're in demo mode
      const localUser = localStorage.getItem('guard-app-user');
      if (localUser) {
        // Store location locally for demo purposes
        const localLocations = JSON.parse(localStorage.getItem('demo-locations') || '[]');
        localLocations.push({
          ...locationData,
          user_id: 'current-user',
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('demo-locations', JSON.stringify(localLocations.slice(-50))); // Keep last 50 locations
        console.log('Location stored locally in demo mode');
      } else {
        console.error('Failed to update location on server:', error);
        // Only show toast for real auth errors, not demo mode
        if (!error.message.includes('Demo mode')) {
          toast.error('Failed to update location');
        }
      }
    }
  }

  async getCurrentLocation(): Promise<GeolocationPosition | null> {
    if (!navigator.geolocation) {
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // Use 1-minute old position if available
        }
      );
    });
  }

  async getAllLocations(): Promise<LocationData[]> {
    try {
      const { locations } = await apiCall('/gps/locations');
      return locations || [];
    } catch (error) {
      console.log('Using mock data for locations:', error.message);
      // Return mock data for demo purposes - don't log as error
      return this.getMockLocations();
    }
  }

  async getLocationHistory(userId: string): Promise<LocationData[]> {
    try {
      const { history } = await apiCall(`/gps/history/${userId}`);
      return history || [];
    } catch (error) {
      console.log('Using mock data for location history:', error.message);
      // Return mock data for demo purposes - don't log as error
      return this.getMockLocationHistory(userId);
    }
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Utility function to calculate distance between two points
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Check if user is within a geofence
  checkGeofence(userLat: number, userLon: number, fenceLat: number, fenceLon: number, radiusKm: number): boolean {
    const distance = this.calculateDistance(userLat, userLon, fenceLat, fenceLon);
    return distance <= radiusKm;
  }

  // Mock data for demo purposes
  private getMockLocations(): LocationData[] {
    const now = new Date();
    return [
      {
        user_id: 'guard-001',
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 5,
        heading: 45,
        speed: 0,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
      },
      {
        user_id: 'guard-002',
        latitude: 40.7589,
        longitude: -73.9851,
        accuracy: 8,
        heading: 90,
        speed: 2.5,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
      },
      {
        user_id: 'guard-003',
        latitude: 40.7505,
        longitude: -73.9934,
        accuracy: 3,
        heading: 180,
        speed: 1.2,
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString()
      }
    ];
  }

  private getMockLocationHistory(userId: string): LocationData[] {
    const now = new Date();
    const history: LocationData[] = [];
    
    // Generate 10 mock location points over the last 2 hours
    for (let i = 0; i < 10; i++) {
      const baseLatitude = 40.7128 + (Math.random() - 0.5) * 0.01;
      const baseLongitude = -74.0060 + (Math.random() - 0.5) * 0.01;
      
      history.push({
        user_id: userId,
        latitude: baseLatitude,
        longitude: baseLongitude,
        accuracy: Math.floor(Math.random() * 10) + 3,
        heading: Math.floor(Math.random() * 360),
        speed: Math.random() * 5,
        timestamp: new Date(now.getTime() - i * 12 * 60 * 1000).toISOString()
      });
    }
    
    return history.reverse(); // Return in chronological order
  }
}

export const gpsService = new GPSService();