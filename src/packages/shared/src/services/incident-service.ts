import { apiCall, uploadFile } from './api-client';
import { Incident, IncidentCreate } from '../types';

export class IncidentService {
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
          }
        }
      }

      // Create incident with uploaded file URLs
      const payload = {
        ...incidentData,
        photos: photoUrls,
        attachments: attachmentUrls
      };

      const { incident } = await apiCall('/incidents', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return incident;
    } catch (error) {
      console.error('Failed to create incident:', error);
      return null;
    }
  }

  async getIncidents(): Promise<Incident[]> {
    try {
      const { incidents } = await apiCall('/incidents');
      return incidents || [];
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      return [];
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

      return incident;
    } catch (error) {
      console.error('Failed to update incident status:', error);
      return null;
    }
  }

  async getIncidentsByStatus(status: Incident['status']): Promise<Incident[]> {
    try {
      const incidents = await this.getIncidents();
      return incidents.filter(incident => incident.status === status);
    } catch (error) {
      console.error('Failed to fetch incidents by status:', error);
      return [];
    }
  }

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

  // Emergency incident creation with current location
  async createEmergencyIncident(
    title: string, 
    description: string, 
    type: Incident['type'] = 'security'
  ): Promise<Incident | null> {
    try {
      // Get current location if available
      let location: Incident['location'] | undefined;
      
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
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
      return null;
    }
  }
}

export const incidentService = new IncidentService();