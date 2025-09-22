import { apiCall, uploadFile } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface Incident {
  id: string;
  reporter_id: string;
  reporter_name: string;
  title: string;
  description: string;
  type: 'security' | 'medical' | 'fire' | 'theft' | 'vandalism' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photos?: string[];
  attachments?: string[];
  notes?: string;
  assigned_to?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface IncidentCreate {
  title: string;
  description: string;
  type: Incident['type'];
  priority: Incident['priority'];
  location?: Incident['location'];
  photos?: File[];
  attachments?: File[];
  notes?: string;
}

class IncidentService {
  async createIncident(incidentData: IncidentCreate): Promise<Incident | null> {
    try {
      // Upload photos and attachments first
      const photoUrls: string[] = [];
      const attachmentUrls: string[] = [];

      if (incidentData.photos) {
        for (const photo of incidentData.photos) {
          try {
            const { url } = await uploadFile(photo, 'incidents');
            if (url) photoUrls.push(url);
          } catch (uploadError) {
            console.error('Photo upload failed:', uploadError);
            // For demo, create a placeholder URL
            photoUrls.push(`demo-photo-${Date.now()}.jpg`);
          }
        }
      }

      if (incidentData.attachments) {
        for (const attachment of incidentData.attachments) {
          try {
            const { url } = await uploadFile(attachment, 'incidents');
            if (url) attachmentUrls.push(url);
          } catch (uploadError) {
            console.error('Attachment upload failed:', uploadError);
            // For demo, create a placeholder URL
            attachmentUrls.push(`demo-attachment-${Date.now()}.pdf`);
          }
        }
      }

      // Create incident with uploaded file URLs
      const payload = {
        ...incidentData,
        photos: photoUrls,
        attachments: attachmentUrls
      };

      try {
        const { incident } = await apiCall('/incidents', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        toast.success('Incident reported successfully');
        return incident;
      } catch (apiError) {
        // For demo purposes, create a mock incident and store locally
        const mockIncident = this.createMockIncident(payload);
        this.saveIncidentLocally(mockIncident);
        toast.success('Incident reported successfully (demo mode)');
        return mockIncident;
      }
    } catch (error) {
      console.error('Failed to create incident:', error);
      toast.error('Failed to report incident. Please try again.');
      return null;
    }
  }

  async getIncidents(): Promise<Incident[]> {
    try {
      const { incidents } = await apiCall('/incidents');
      return incidents || [];
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      // Return mock data for demo purposes instead of showing error
      return this.getMockIncidents();
    }
  }

  async updateIncidentStatus(
    incidentId: string, 
    status: Incident['status'], 
    notes?: string
  ): Promise<Incident | null> {
    try {
      const { incident } = await apiCall(`/incidents/${incidentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes })
      });

      toast.success(`Incident marked as ${status}`);
      return incident;
    } catch (error) {
      console.error('Failed to update incident status:', error);
      toast.error('Failed to update incident status');
      return null;
    }
  }

  async assignIncident(incidentId: string, assigneeId: string): Promise<Incident | null> {
    try {
      const { incident } = await apiCall(`/incidents/${incidentId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ assigned_to: assigneeId })
      });

      toast.success('Incident assigned successfully');
      return incident;
    } catch (error) {
      console.error('Failed to assign incident:', error);
      toast.error('Failed to assign incident');
      return null;
    }
  }

  async addIncidentNote(incidentId: string, note: string): Promise<boolean> {
    try {
      await apiCall(`/incidents/${incidentId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });

      toast.success('Note added to incident');
      return true;
    } catch (error) {
      console.error('Failed to add note to incident:', error);
      toast.error('Failed to add note');
      return false;
    }
  }

  // Get incidents by status
  async getIncidentsByStatus(status: Incident['status']): Promise<Incident[]> {
    try {
      const incidents = await this.getIncidents();
      return incidents.filter(incident => incident.status === status);
    } catch (error) {
      console.error('Failed to fetch incidents by status:', error);
      return [];
    }
  }

  // Get incidents by priority
  async getIncidentsByPriority(priority: Incident['priority']): Promise<Incident[]> {
    try {
      const incidents = await this.getIncidents();
      return incidents.filter(incident => incident.priority === priority);
    } catch (error) {
      console.error('Failed to fetch incidents by priority:', error);
      return [];
    }
  }

  // Get incidents for current user
  async getMyIncidents(userId: string): Promise<Incident[]> {
    try {
      const incidents = await this.getIncidents();
      return incidents.filter(incident => 
        incident.reporter_id === userId || incident.assigned_to === userId
      );
    } catch (error) {
      console.error('Failed to fetch user incidents:', error);
      return [];
    }
  }

  // Get incident statistics
  async getIncidentStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }> {
    try {
      const incidents = await this.getIncidents();
      
      return {
        total: incidents.length,
        open: incidents.filter(i => i.status === 'open').length,
        inProgress: incidents.filter(i => i.status === 'in_progress').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        closed: incidents.filter(i => i.status === 'closed').length,
        critical: incidents.filter(i => i.priority === 'critical').length,
        high: incidents.filter(i => i.priority === 'high').length,
        medium: incidents.filter(i => i.priority === 'medium').length,
        low: incidents.filter(i => i.priority === 'low').length,
      };
    } catch (error) {
      console.error('Failed to fetch incident statistics:', error);
      return {
        total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0,
        critical: 0, high: 0, medium: 0, low: 0
      };
    }
  }

  // Emergency incident creation with current location
  async createEmergencyIncident(
    title: string, 
    description: string, 
    type: Incident['type'] = 'security'
  ): Promise<Incident | null> {
    try {
      // Get current location
      let location: Incident['location'] | undefined;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 60000
            });
          });

          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (locationError) {
          console.warn('Could not get location for emergency incident:', locationError);
        }
      }

      const emergencyIncident: IncidentCreate = {
        title,
        description,
        type,
        priority: 'critical',
        location,
        notes: 'Emergency incident - immediate attention required'
      };

      return await this.createIncident(emergencyIncident);
    } catch (error) {
      console.error('Failed to create emergency incident:', error);
      toast.error('Failed to create emergency incident');
      return null;
    }
  }

  // Mock data for demo purposes
  private getMockIncidents(): Incident[] {
    const now = new Date();
    return [
      {
        id: 'incident-001',
        reporter_id: 'guard-001',
        reporter_name: 'John Smith',
        title: 'Suspicious Activity',
        description: 'Unidentified person observed near building entrance',
        type: 'security',
        priority: 'medium',
        status: 'open',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'Downtown Plaza, Main Entrance'
        },
        created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        notes: 'Subject wearing dark clothing, approximately 5\'10"'
      },
      {
        id: 'incident-002',
        reporter_id: 'guard-002',
        reporter_name: 'Sarah Johnson',
        title: 'Equipment Malfunction',
        description: 'Security camera #12 not functioning properly',
        type: 'other',
        priority: 'low',
        status: 'in_progress',
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: 'Corporate Center, Floor 3'
        },
        assigned_to: 'tech-001',
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        notes: 'Camera shows distorted image, may need replacement'
      },
      {
        id: 'incident-003',
        reporter_id: 'guard-003',
        reporter_name: 'Mike Davis',
        title: 'Medical Emergency',
        description: 'Visitor collapsed in lobby area',
        type: 'medical',
        priority: 'critical',
        status: 'resolved',
        location: {
          latitude: 40.7505,
          longitude: -73.9934,
          address: 'Shopping Mall, Main Lobby'
        },
        resolved_by: 'supervisor-001',
        resolution_notes: 'EMS responded, visitor stable and transported to hospital',
        created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private createMockIncident(payload: any): Incident {
    return {
      id: `incident-${Date.now()}`,
      reporter_id: 'current-user',
      reporter_name: 'Demo User',
      ...payload,
      status: 'open' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private saveIncidentLocally(incident: Incident): void {
    const localIncidents = JSON.parse(localStorage.getItem('demo-incidents') || '[]');
    localIncidents.unshift(incident);
    localStorage.setItem('demo-incidents', JSON.stringify(localIncidents.slice(0, 50))); // Keep last 50 incidents
  }
}

export const incidentService = new IncidentService();