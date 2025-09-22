import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface Shift {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  site_id?: string;
  site_name?: string;
  assigned_guard?: string;
  guard_name?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requirements?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ShiftCreate {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  site_id?: string;
  site_name?: string;
  requirements?: string[];
  notes?: string;
}

class ShiftService {
  async createShift(shiftData: ShiftCreate): Promise<Shift | null> {
    try {
      const { shift } = await apiCall('/shifts', {
        method: 'POST',
        body: JSON.stringify(shiftData)
      });

      toast.success('Shift created successfully');
      return shift;
    } catch (error) {
      console.error('Failed to create shift:', error);
      // For demo purposes, create mock shift
      const mockShift = this.createMockShift(shiftData);
      this.saveShiftLocally(mockShift);
      toast.success('Shift created successfully (demo mode)');
      return mockShift;
    }
  }

  async getShifts(): Promise<Shift[]> {
    try {
      const { shifts } = await apiCall('/shifts');
      return shifts || [];
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
      return this.getMockShifts();
    }
  }

  async assignShift(shiftId: string, guardId: string): Promise<Shift | null> {
    try {
      const { shift } = await apiCall(`/shifts/${shiftId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ guard_id: guardId })
      });

      toast.success('Shift assigned successfully');
      return shift;
    } catch (error) {
      console.error('Failed to assign shift:', error);
      toast.error('Failed to assign shift');
      return null;
    }
  }

  async updateShiftStatus(shiftId: string, status: Shift['status']): Promise<Shift | null> {
    try {
      const { shift } = await apiCall(`/shifts/${shiftId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });

      toast.success(`Shift ${status}`);
      return shift;
    } catch (error) {
      console.error('Failed to update shift status:', error);
      toast.error('Failed to update shift status');
      return null;
    }
  }

  async getMyShifts(guardId: string): Promise<Shift[]> {
    try {
      const shifts = await this.getShifts();
      return shifts.filter(shift => shift.assigned_guard === guardId);
    } catch (error) {
      console.error('Failed to fetch my shifts:', error);
      return [];
    }
  }

  async getUpcomingShifts(guardId?: string): Promise<Shift[]> {
    try {
      const shifts = await this.getShifts();
      const now = new Date();
      
      return shifts
        .filter(shift => {
          const shiftStart = new Date(shift.start_date + 'T' + shift.start_time);
          const isUpcoming = shiftStart > now;
          const isMyShift = !guardId || shift.assigned_guard === guardId;
          return isUpcoming && isMyShift;
        })
        .sort((a, b) => {
          const dateA = new Date(a.start_date + 'T' + a.start_time);
          const dateB = new Date(b.start_date + 'T' + b.start_time);
          return dateA.getTime() - dateB.getTime();
        });
    } catch (error) {
      console.error('Failed to fetch upcoming shifts:', error);
      return [];
    }
  }

  async getCurrentShift(guardId: string): Promise<Shift | null> {
    try {
      const shifts = await this.getShifts();
      const now = new Date();
      
      const currentShift = shifts.find(shift => {
        if (shift.assigned_guard !== guardId) return false;
        
        const shiftStart = new Date(shift.start_date + 'T' + shift.start_time);
        const shiftEnd = new Date(shift.end_date + 'T' + shift.end_time);
        
        return now >= shiftStart && now <= shiftEnd && shift.status === 'in_progress';
      });

      return currentShift || null;
    } catch (error) {
      console.error('Failed to get current shift:', error);
      return null;
    }
  }

  async startShift(shiftId: string): Promise<boolean> {
    try {
      await this.updateShiftStatus(shiftId, 'in_progress');
      return true;
    } catch (error) {
      console.error('Failed to start shift:', error);
      return false;
    }
  }

  async endShift(shiftId: string): Promise<boolean> {
    try {
      await this.updateShiftStatus(shiftId, 'completed');
      return true;
    } catch (error) {
      console.error('Failed to end shift:', error);
      return false;
    }
  }

  async getShiftsByDate(date: string): Promise<Shift[]> {
    try {
      const shifts = await this.getShifts();
      return shifts.filter(shift => 
        shift.start_date <= date && shift.end_date >= date
      );
    } catch (error) {
      console.error('Failed to fetch shifts by date:', error);
      return [];
    }
  }

  async getShiftStats(): Promise<{
    total: number;
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    unassigned: number;
  }> {
    try {
      const shifts = await this.getShifts();
      
      return {
        total: shifts.length,
        scheduled: shifts.filter(s => s.status === 'scheduled').length,
        in_progress: shifts.filter(s => s.status === 'in_progress').length,
        completed: shifts.filter(s => s.status === 'completed').length,
        cancelled: shifts.filter(s => s.status === 'cancelled').length,
        unassigned: shifts.filter(s => !s.assigned_guard).length
      };
    } catch (error) {
      console.error('Failed to get shift stats:', error);
      return {
        total: 0, scheduled: 0, in_progress: 0, completed: 0, cancelled: 0, unassigned: 0
      };
    }
  }

  // Generate recurring shifts
  async createRecurringShifts(
    baseShift: ShiftCreate,
    pattern: 'daily' | 'weekly' | 'monthly',
    occurrences: number
  ): Promise<Shift[]> {
    const createdShifts: Shift[] = [];
    
    try {
      for (let i = 0; i < occurrences; i++) {
        const shiftData = { ...baseShift };
        const startDate = new Date(baseShift.start_date);
        const endDate = new Date(baseShift.end_date);
        
        switch (pattern) {
          case 'daily':
            startDate.setDate(startDate.getDate() + i);
            endDate.setDate(endDate.getDate() + i);
            break;
          case 'weekly':
            startDate.setDate(startDate.getDate() + (i * 7));
            endDate.setDate(endDate.getDate() + (i * 7));
            break;
          case 'monthly':
            startDate.setMonth(startDate.getMonth() + i);
            endDate.setMonth(endDate.getMonth() + i);
            break;
        }
        
        shiftData.start_date = startDate.toISOString().split('T')[0];
        shiftData.end_date = endDate.toISOString().split('T')[0];
        shiftData.title = `${baseShift.title} (${i + 1}/${occurrences})`;
        
        const shift = await this.createShift(shiftData);
        if (shift) {
          createdShifts.push(shift);
        }
      }
      
      toast.success(`Created ${createdShifts.length} recurring shifts`);
      return createdShifts;
    } catch (error) {
      console.error('Failed to create recurring shifts:', error);
      toast.error('Failed to create recurring shifts');
      return createdShifts;
    }
  }

  private createMockShift(shiftData: ShiftCreate): Shift {
    return {
      id: `shift_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...shiftData,
      status: 'scheduled',
      created_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private saveShiftLocally(shift: Shift): void {
    const localShifts = JSON.parse(localStorage.getItem('demo-shifts') || '[]');
    localShifts.unshift(shift);
    localStorage.setItem('demo-shifts', JSON.stringify(localShifts.slice(0, 100)));
  }

  private getMockShifts(): Shift[] {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return [
      {
        id: 'shift-001',
        title: 'Morning Security Patrol',
        description: 'Regular morning patrol of downtown plaza',
        start_date: today,
        end_date: today,
        start_time: '06:00',
        end_time: '14:00',
        site_id: 'site-001',
        site_name: 'Downtown Plaza',
        assigned_guard: 'guard-001',
        guard_name: 'John Smith',
        status: 'in_progress',
        requirements: ['Security License', 'Radio Equipment'],
        created_by: 'supervisor-001',
        created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'shift-002',
        title: 'Evening Security Coverage',
        description: 'Evening shift for corporate center',
        start_date: today,
        end_date: today,
        start_time: '18:00',
        end_time: '02:00',
        site_id: 'site-002',
        site_name: 'Corporate Center',
        assigned_guard: 'guard-002',
        guard_name: 'Sarah Johnson',
        status: 'scheduled',
        requirements: ['First Aid Certification', 'Access Control Training'],
        created_by: 'supervisor-001',
        created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'shift-003',
        title: 'Weekend Mall Security',
        description: 'Weekend coverage for shopping mall',
        start_date: tomorrow,
        end_date: tomorrow,
        start_time: '10:00',
        end_time: '22:00',
        site_id: 'site-003',
        site_name: 'Shopping Mall',
        status: 'scheduled',
        requirements: ['Crowd Control Training'],
        notes: 'High foot traffic expected',
        created_by: 'supervisor-001',
        created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}

export const shiftService = new ShiftService();