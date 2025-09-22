import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface AssignmentServiceClient {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  contractValue: number;
  contractStartDate: string;
  contractEndDate: string;
  status: 'active' | 'inactive' | 'pending';
  requiresCanines: boolean;
  sitesCount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentServiceGuard {
  id: string;
  name: string;
  badge: string;
  role: string;
  experience: number;
  certifications: string[];
  status: 'available' | 'assigned' | 'on_leave' | 'inactive';
  location: string;
  phoneNumber: string;
  specializations: string[];
  hourlyRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentServiceCanine {
  id: string;
  name: string;
  breed: string;
  age: number;
  handler: string;
  certifications: string[];
  status: 'available' | 'assigned' | 'training' | 'medical_leave';
  specialization: string[];
  lastVetCheck: string;
  microchipId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentServiceAssignment {
  id: string;
  clientId: string;
  guardIds: string[];
  canineIds: string[];
  siteName: string;
  startDate: string;
  endDate?: string;
  shiftType: 'day' | 'night' | '24hour' | 'rotating';
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  requirements: string;
  budget: number;
  actualCost?: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

class AssignmentService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-def022bc`;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Client management
  async getClients(): Promise<AssignmentServiceClient[]> {
    try {
      return await this.request('/clients');
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  async getClient(id: string): Promise<AssignmentServiceClient> {
    try {
      return await this.request(`/clients/${id}`);
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  async createClient(client: Omit<AssignmentServiceClient, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssignmentServiceClient> {
    try {
      return await this.request('/clients', {
        method: 'POST',
        body: JSON.stringify(client),
      });
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id: string, client: Partial<AssignmentServiceClient>): Promise<AssignmentServiceClient> {
    try {
      return await this.request(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(client),
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      await this.request(`/clients/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // Guard management
  async getGuards(): Promise<AssignmentServiceGuard[]> {
    try {
      return await this.request('/guards');
    } catch (error) {
      console.error('Error fetching guards:', error);
      throw error;
    }
  }

  async getGuard(id: string): Promise<AssignmentServiceGuard> {
    try {
      return await this.request(`/guards/${id}`);
    } catch (error) {
      console.error('Error fetching guard:', error);
      throw error;
    }
  }

  async createGuard(guard: Omit<AssignmentServiceGuard, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssignmentServiceGuard> {
    try {
      return await this.request('/guards', {
        method: 'POST',
        body: JSON.stringify(guard),
      });
    } catch (error) {
      console.error('Error creating guard:', error);
      throw error;
    }
  }

  async updateGuard(id: string, guard: Partial<AssignmentServiceGuard>): Promise<AssignmentServiceGuard> {
    try {
      return await this.request(`/guards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guard),
      });
    } catch (error) {
      console.error('Error updating guard:', error);
      throw error;
    }
  }

  async updateGuardStatus(id: string, status: AssignmentServiceGuard['status']): Promise<void> {
    try {
      await this.request(`/guards/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Error updating guard status:', error);
      throw error;
    }
  }

  // Canine management
  async getCanines(): Promise<AssignmentServiceCanine[]> {
    try {
      return await this.request('/canines');
    } catch (error) {
      console.error('Error fetching canines:', error);
      throw error;
    }
  }

  async getCanine(id: string): Promise<AssignmentServiceCanine> {
    try {
      return await this.request(`/canines/${id}`);
    } catch (error) {
      console.error('Error fetching canine:', error);
      throw error;
    }
  }

  async createCanine(canine: Omit<AssignmentServiceCanine, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssignmentServiceCanine> {
    try {
      return await this.request('/canines', {
        method: 'POST',
        body: JSON.stringify(canine),
      });
    } catch (error) {
      console.error('Error creating canine:', error);
      throw error;
    }
  }

  async updateCanine(id: string, canine: Partial<AssignmentServiceCanine>): Promise<AssignmentServiceCanine> {
    try {
      return await this.request(`/canines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(canine),
      });
    } catch (error) {
      console.error('Error updating canine:', error);
      throw error;
    }
  }

  async updateCanineStatus(id: string, status: AssignmentServiceCanine['status']): Promise<void> {
    try {
      await this.request(`/canines/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Error updating canine status:', error);
      throw error;
    }
  }

  // Assignment management
  async getAssignments(): Promise<AssignmentServiceAssignment[]> {
    try {
      return await this.request('/assignments');
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  async getAssignment(id: string): Promise<AssignmentServiceAssignment> {
    try {
      return await this.request(`/assignments/${id}`);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  }

  async getAssignmentsByClient(clientId: string): Promise<AssignmentServiceAssignment[]> {
    try {
      return await this.request(`/assignments/client/${clientId}`);
    } catch (error) {
      console.error('Error fetching client assignments:', error);
      throw error;
    }
  }

  async getAssignmentsByGuard(guardId: string): Promise<AssignmentServiceAssignment[]> {
    try {
      return await this.request(`/assignments/guard/${guardId}`);
    } catch (error) {
      console.error('Error fetching guard assignments:', error);
      throw error;
    }
  }

  async createAssignment(assignment: Omit<AssignmentServiceAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssignmentServiceAssignment> {
    try {
      // Validate assignment before creating
      await this.validateAssignment(assignment);
      
      return await this.request('/assignments', {
        method: 'POST',
        body: JSON.stringify(assignment),
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  async updateAssignment(id: string, assignment: Partial<AssignmentServiceAssignment>): Promise<AssignmentServiceAssignment> {
    try {
      return await this.request(`/assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(assignment),
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    try {
      await this.request(`/assignments/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  // Assignment validation
  private async validateAssignment(assignment: Omit<AssignmentServiceAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    // Check if guards are available
    for (const guardId of assignment.guardIds) {
      const guard = await this.getGuard(guardId);
      if (guard.status !== 'available') {
        throw new Error(`Guard ${guard.name} is not available for assignment`);
      }
    }

    // Check if canines are available
    for (const canineId of assignment.canineIds) {
      const canine = await this.getCanine(canineId);
      if (canine.status !== 'available') {
        throw new Error(`Canine ${canine.name} is not available for assignment`);
      }
    }

    // Check if client exists and is active
    const client = await this.getClient(assignment.clientId);
    if (client.status !== 'active') {
      throw new Error(`Client ${client.name} is not active`);
    }
  }

  // Analytics and reporting
  async getAssignmentAnalytics(startDate?: string, endDate?: string): Promise<{
    totalAssignments: number;
    activeAssignments: number;
    totalRevenue: number;
    guardsUtilization: number;
    caninesUtilization: number;
    topClients: Array<{ clientId: string; clientName: string; assignmentCount: number; revenue: number }>;
  }> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      return await this.request(`/assignments/analytics?${params.toString()}`);
    } catch (error) {
      console.error('Error fetching assignment analytics:', error);
      throw error;
    }
  }

  async getAvailableResources(date: string): Promise<{
    availableGuards: AssignmentServiceGuard[];
    availableCanines: AssignmentServiceCanine[];
  }> {
    try {
      return await this.request(`/assignments/available-resources?date=${date}`);
    } catch (error) {
      console.error('Error fetching available resources:', error);
      throw error;
    }
  }

  // Assignment scheduling
  async scheduleAssignment(assignment: Omit<AssignmentServiceAssignment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<AssignmentServiceAssignment> {
    try {
      const scheduledAssignment = {
        ...assignment,
        status: 'scheduled' as const,
      };
      
      return await this.createAssignment(scheduledAssignment);
    } catch (error) {
      console.error('Error scheduling assignment:', error);
      throw error;
    }
  }

  async activateAssignment(id: string): Promise<void> {
    try {
      await this.request(`/assignments/${id}/activate`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error activating assignment:', error);
      throw error;
    }
  }

  async completeAssignment(id: string, actualCost?: number): Promise<void> {
    try {
      await this.request(`/assignments/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ actualCost }),
      });
    } catch (error) {
      console.error('Error completing assignment:', error);
      throw error;
    }
  }

  async cancelAssignment(id: string, reason: string): Promise<void> {
    try {
      await this.request(`/assignments/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    } catch (error) {
      console.error('Error cancelling assignment:', error);
      throw error;
    }
  }
}

export const assignmentService = new AssignmentService();