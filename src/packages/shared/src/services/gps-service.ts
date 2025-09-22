import { apiCall } from './api-client';
import { LocationData } from '../types';

export class GPSService {
  private watchId: number | null = null;
  private isTracking = false;

  async startTracking(): Promise<boolean> {
    if (this.isTracking) {
      return true;
    }

    // Check if geolocation is available
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        // Request permission first
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          throw new Error('Location permission denied');
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
        return true;
      } catch (error) {
        console.error('Failed to start GPS tracking:', error);
        return false;
      }
    } else {
      // For React Native, we would use a different implementation
      console.error('Geolocation not available');
      return false;
    }
  }

  stopTracking(): void {
    if (this.watchId && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
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
  }

  async updateLocation(locationData: Omit<LocationData, 'user_id' | 'timestamp'>): Promise<void> {
    try {
      await apiCall('/gps/location', {
        method: 'POST',
        body: JSON.stringify(locationData)
      });
    } catch (error) {
      console.error('Failed to update location on server:', error);
    }
  }

  async getCurrentLocation(): Promise<GeolocationPosition | null> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  async getAllLocations(): Promise<LocationData[]> {
    try {
      const { locations } = await apiCall('/gps/locations');
      return locations || [];
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      return [];
    }
  }

  async getLocationHistory(userId: string): Promise<LocationData[]> {
    try {
      const { history } = await apiCall(`/gps/history/${userId}`);
      return history || [];
    } catch (error) {
      console.error('Failed to fetch location history:', error);
      return [];
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
}

export const gpsService = new GPSService();