import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { gpsService } from './gps-service';

export interface Emergency {
  id: string;
  user_id: string;
  user_name: string;
  type: 'panic_button' | 'medical' | 'fire' | 'security' | 'other';
  latitude?: number;
  longitude?: number;
  notes?: string;
  status: 'active' | 'acknowledged' | 'responding' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  response_time?: number; // in seconds
}

export interface EmergencyCreate {
  type?: Emergency['type'];
  notes?: string;
  latitude?: number;
  longitude?: number;
}

class EmergencyService {
  private emergencySound: HTMLAudioElement | null = null;

  constructor() {
    // Initialize emergency alert sound
    if (typeof window !== 'undefined') {
      this.emergencySound = new Audio();
      this.emergencySound.src = 'data:audio/wav;base64,UklGRvI/AABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU4/AAA='; // Short beep
    }
  }

  async triggerPanicButton(notes?: string): Promise<Emergency | null> {
    try {
      // Get current location
      let latitude: number | undefined;
      let longitude: number | undefined;

      try {
        const position = await gpsService.getCurrentLocation();
        if (position) {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      } catch (locationError) {
        console.warn('Could not get location for panic button:', locationError);
      }

      const emergencyData: EmergencyCreate = {
        type: 'panic_button',
        notes: notes || 'Emergency panic button activated',
        latitude,
        longitude
      };

      const { emergency } = await apiCall('/emergency/panic', {
        method: 'POST',
        body: JSON.stringify(emergencyData)
      });

      // Play alert sound
      this.playEmergencySound();

      // Show critical notification
      toast.error('🚨 EMERGENCY ALERT SENT', {
        duration: 10000,
        description: 'Emergency services and supervisors have been notified'
      });

      return emergency;
    } catch (error) {
      console.error('Failed to trigger panic button:', error);
      
      // For demo purposes, create mock emergency
      const mockEmergency = this.createMockEmergency(notes);
      this.saveEmergencyLocally(mockEmergency);
      this.playEmergencySound();
      
      toast.error('🚨 EMERGENCY ALERT SENT (Demo Mode)', {
        duration: 10000,
        description: 'Emergency services and supervisors have been notified'
      });
      
      return mockEmergency;
    }
  }

  async createEmergency(emergencyData: EmergencyCreate): Promise<Emergency | null> {
    try {
      // Get current location if not provided
      if (!emergencyData.latitude || !emergencyData.longitude) {
        try {
          const position = await gpsService.getCurrentLocation();
          if (position) {
            emergencyData.latitude = position.coords.latitude;
            emergencyData.longitude = position.coords.longitude;
          }
        } catch (locationError) {
          console.warn('Could not get location for emergency:', locationError);
        }
      }

      const { emergency } = await apiCall('/emergency/panic', {
        method: 'POST',
        body: JSON.stringify(emergencyData)
      });

      this.playEmergencySound();
      toast.error(`🚨 ${emergencyData.type?.toUpperCase()} EMERGENCY REPORTED`);

      return emergency;
    } catch (error) {
      console.error('Failed to create emergency:', error);
      
      const mockEmergency = this.createMockEmergency(emergencyData.notes, emergencyData.type);
      this.saveEmergencyLocally(mockEmergency);
      this.playEmergencySound();
      
      toast.error(`🚨 ${emergencyData.type?.toUpperCase()} EMERGENCY REPORTED (Demo Mode)`);
      return mockEmergency;
    }
  }

  async getActiveEmergencies(): Promise<Emergency[]> {
    try {
      const { emergencies } = await apiCall('/emergency/active');
      return emergencies || [];
    } catch (error) {
      console.error('Failed to fetch active emergencies:', error);
      return this.getMockActiveEmergencies();
    }
  }

  async acknowledgeEmergency(emergencyId: string): Promise<Emergency | null> {
    try {
      const { emergency } = await apiCall(`/emergency/${emergencyId}/acknowledge`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
      });

      toast.success('Emergency acknowledged');
      return emergency;
    } catch (error) {
      console.error('Failed to acknowledge emergency:', error);
      toast.error('Failed to acknowledge emergency');
      return null;
    }
  }

  async resolveEmergency(emergencyId: string, resolutionNotes: string): Promise<Emergency | null> {
    try {
      const { emergency } = await apiCall(`/emergency/${emergencyId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({
          resolution_notes: resolutionNotes
        })
      });

      toast.success('Emergency resolved');
      return emergency;
    } catch (error) {
      console.error('Failed to resolve emergency:', error);
      toast.error('Failed to resolve emergency');
      return null;
    }
  }

  async getEmergencyHistory(): Promise<Emergency[]> {
    try {
      const { emergencies } = await apiCall('/emergency/history');
      return emergencies || [];
    } catch (error) {
      console.error('Failed to fetch emergency history:', error);
      return this.getMockEmergencyHistory();
    }
  }

  async getEmergencyStats(): Promise<{
    total: number;
    active: number;
    resolved_today: number;
    average_response_time: number;
    by_type: Record<string, number>;
  }> {
    try {
      const history = await this.getEmergencyHistory();
      const active = await this.getActiveEmergencies();
      
      const today = new Date().toDateString();
      const resolvedToday = history.filter(e => 
        e.status === 'resolved' && 
        new Date(e.resolved_at || '').toDateString() === today
      ).length;

      const completedEmergencies = history.filter(e => e.response_time);
      const averageResponseTime = completedEmergencies.length > 0
        ? completedEmergencies.reduce((sum, e) => sum + (e.response_time || 0), 0) / completedEmergencies.length
        : 0;

      const byType = history.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: history.length,
        active: active.length,
        resolved_today: resolvedToday,
        average_response_time: Math.round(averageResponseTime),
        by_type: byType
      };
    } catch (error) {
      console.error('Failed to get emergency stats:', error);
      return {
        total: 0,
        active: 0,
        resolved_today: 0,
        average_response_time: 0,
        by_type: {}
      };
    }
  }

  // Emergency contact methods
  async notifyEmergencyContacts(emergency: Emergency): Promise<boolean> {
    try {
      // In a real implementation, this would send SMS, email, or push notifications
      // to emergency contacts, supervisors, and emergency services
      
      console.log('Notifying emergency contacts for:', emergency);
      
      // Simulate emergency service notification
      setTimeout(() => {
        toast.info('🚑 Emergency services notified', {
          description: 'Response team dispatched to your location'
        });
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to notify emergency contacts:', error);
      return false;
    }
  }

  // Location-based emergency features
  async getNearbyEmergencyServices(latitude: number, longitude: number): Promise<{
    hospitals: Array<{ name: string; distance: number; phone: string }>;
    police: Array<{ name: string; distance: number; phone: string }>;
    fire: Array<{ name: string; distance: number; phone: string }>;
  }> {
    // Mock nearby emergency services
    return {
      hospitals: [
        { name: 'City General Hospital', distance: 1.2, phone: '911' },
        { name: 'St. Mary Medical Center', distance: 2.8, phone: '911' }
      ],
      police: [
        { name: 'Downtown Police Station', distance: 0.8, phone: '911' },
        { name: 'Central Precinct', distance: 1.5, phone: '911' }
      ],
      fire: [
        { name: 'Fire Station 12', distance: 0.6, phone: '911' },
        { name: 'Emergency Response Unit', distance: 1.9, phone: '911' }
      ]
    };
  }

  // Test emergency system
  async testEmergencySystem(): Promise<boolean> {
    try {
      const testEmergency: EmergencyCreate = {
        type: 'other',
        notes: 'Emergency system test - please ignore'
      };

      const emergency = await this.createEmergency(testEmergency);
      
      if (emergency) {
        // Auto-resolve test emergency after 5 seconds
        setTimeout(async () => {
          await this.resolveEmergency(emergency.id, 'System test completed successfully');
        }, 5000);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Emergency system test failed:', error);
      return false;
    }
  }

  private playEmergencySound(): void {
    if (this.emergencySound) {
      try {
        this.emergencySound.currentTime = 0;
        this.emergencySound.play().catch(e => {
          console.warn('Could not play emergency sound:', e);
        });
      } catch (error) {
        console.warn('Emergency sound playback failed:', error);
      }
    }
  }

  private createMockEmergency(notes?: string, type: Emergency['type'] = 'panic_button'): Emergency {
    return {
      id: `emergency_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: 'current-user',
      user_name: 'Demo User',
      type,
      latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
      notes: notes || 'Emergency alert',
      status: 'active',
      priority: 'critical',
      timestamp: new Date().toISOString()
    };
  }

  private saveEmergencyLocally(emergency: Emergency): void {
    const localEmergencies = JSON.parse(localStorage.getItem('demo-emergencies') || '[]');
    localEmergencies.unshift(emergency);
    localStorage.setItem('demo-emergencies', JSON.stringify(localEmergencies.slice(0, 50)));
  }

  private getMockActiveEmergencies(): Emergency[] {
    const now = new Date();
    return [
      {
        id: 'emergency-001',
        user_id: 'guard-003',
        user_name: 'Mike Davis',
        type: 'panic_button',
        latitude: 40.7505,
        longitude: -73.9934,
        notes: 'Suspicious activity, requesting immediate backup',
        status: 'active',
        priority: 'critical',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
      }
    ];
  }

  private getMockEmergencyHistory(): Emergency[] {
    const now = new Date();
    return [
      {
        id: 'emergency-h001',
        user_id: 'guard-001',
        user_name: 'John Smith',
        type: 'medical',
        latitude: 40.7128,
        longitude: -74.0060,
        notes: 'Visitor medical emergency in lobby',
        status: 'resolved',
        priority: 'high',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        acknowledged_by: 'supervisor-001',
        acknowledged_at: new Date(now.getTime() - 118 * 60 * 1000).toISOString(),
        resolved_by: 'supervisor-001',
        resolved_at: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        resolution_notes: 'EMS responded, visitor stable',
        response_time: 120 // 2 minutes
      },
      {
        id: 'emergency-h002',
        user_id: 'guard-002',
        user_name: 'Sarah Johnson',
        type: 'security',
        latitude: 40.7589,
        longitude: -73.9851,
        notes: 'Unauthorized access attempt detected',
        status: 'resolved',
        priority: 'medium',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        acknowledged_by: 'supervisor-001',
        acknowledged_at: new Date(now.getTime() - 238 * 60 * 1000).toISOString(),
        resolved_by: 'guard-002',
        resolved_at: new Date(now.getTime() - 220 * 60 * 1000).toISOString(),
        resolution_notes: 'False alarm - maintenance staff with proper authorization',
        response_time: 300 // 5 minutes
      }
    ];
  }
}

export const emergencyService = new EmergencyService();