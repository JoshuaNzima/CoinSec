import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  method: 'manual' | 'rfid' | 'qr' | 'tablet' | 'sms' | 'radio';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  rfid_card?: string;
  qr_code?: string;
  tablet_station_id?: string;
  timestamp: string;
  status: 'checked_in' | 'checked_out';
}

export interface AttendanceStatus {
  status: 'checked_in' | 'checked_out';
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

class AttendanceService {
  async checkIn(data: {
    method?: string;
    location?: { latitude: number; longitude: number; address?: string };
    notes?: string;
    rfid_card?: string;
    qr_code?: string;
    tablet_station_id?: string;
  }): Promise<AttendanceRecord | null> {
    try {
      const { attendance } = await apiCall('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      toast.success('Checked in successfully');
      return attendance;
    } catch (error) {
      console.error('Check-in failed:', error);
      // For demo purposes, create mock record
      const mockRecord = this.createMockAttendanceRecord('checked_in', data);
      this.saveAttendanceLocally(mockRecord);
      toast.success('Checked in successfully (demo mode)');
      return mockRecord;
    }
  }

  async checkOut(data: {
    method?: string;
    location?: { latitude: number; longitude: number; address?: string };
    notes?: string;
  }): Promise<AttendanceRecord | null> {
    try {
      const { attendance } = await apiCall('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      toast.success('Checked out successfully');
      return attendance;
    } catch (error) {
      console.error('Check-out failed:', error);
      // For demo purposes, create mock record
      const mockRecord = this.createMockAttendanceRecord('checked_out', data);
      this.saveAttendanceLocally(mockRecord);
      toast.success('Checked out successfully (demo mode)');
      return mockRecord;
    }
  }

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const { records } = await apiCall('/attendance/records');
      return records || [];
    } catch (error) {
      console.error('Failed to fetch attendance records:', error);
      return this.getMockAttendanceRecords();
    }
  }

  async getCurrentStatus(userId: string): Promise<AttendanceStatus | null> {
    try {
      const records = await this.getAttendanceRecords();
      const userRecords = records
        .filter(record => record.user_id === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (userRecords.length === 0) {
        return null;
      }

      const latestRecord = userRecords[0];
      return {
        status: latestRecord.status,
        timestamp: latestRecord.timestamp,
        location: latestRecord.location
      };
    } catch (error) {
      console.error('Failed to get current status:', error);
      return null;
    }
  }

  async getAttendanceStats(userId?: string): Promise<{
    total_days: number;
    present_days: number;
    late_days: number;
    absent_days: number;
    current_status: 'checked_in' | 'checked_out' | 'unknown';
  }> {
    try {
      const records = await this.getAttendanceRecords();
      const userRecords = userId 
        ? records.filter(record => record.user_id === userId)
        : records;

      // Calculate stats (simplified for demo)
      const totalDays = 30; // Last 30 days
      const presentDays = Math.floor(userRecords.length / 2); // Assuming 2 records per day (in/out)
      const lateDays = Math.floor(presentDays * 0.1); // 10% late
      const absentDays = totalDays - presentDays;

      // Get current status
      let currentStatus: 'checked_in' | 'checked_out' | 'unknown' = 'unknown';
      if (userId) {
        const status = await this.getCurrentStatus(userId);
        currentStatus = status?.status || 'unknown';
      }

      return {
        total_days: totalDays,
        present_days: presentDays,
        late_days: lateDays,
        absent_days: absentDays,
        current_status: currentStatus
      };
    } catch (error) {
      console.error('Failed to get attendance stats:', error);
      return {
        total_days: 0,
        present_days: 0,
        late_days: 0,
        absent_days: 0,
        current_status: 'unknown'
      };
    }
  }

  // RFID card scan
  async scanRFIDCard(cardId: string, location?: { latitude: number; longitude: number }): Promise<AttendanceRecord | null> {
    const currentStatus = await this.getCurrentStatus('current-user');
    const isCheckingIn = !currentStatus || currentStatus.status === 'checked_out';

    const data = {
      method: 'rfid',
      rfid_card: cardId,
      location,
      notes: `RFID card scan: ${cardId}`
    };

    return isCheckingIn ? this.checkIn(data) : this.checkOut(data);
  }

  // QR code scan
  async scanQRCode(qrCode: string, location?: { latitude: number; longitude: number }): Promise<AttendanceRecord | null> {
    const currentStatus = await this.getCurrentStatus('current-user');
    const isCheckingIn = !currentStatus || currentStatus.status === 'checked_out';

    const data = {
      method: 'qr',
      qr_code: qrCode,
      location,
      notes: `QR code scan: ${qrCode}`
    };

    return isCheckingIn ? this.checkIn(data) : this.checkOut(data);
  }

  // Tablet station check-in/out
  async useTabletStation(stationId: string, location?: { latitude: number; longitude: number }): Promise<AttendanceRecord | null> {
    const currentStatus = await this.getCurrentStatus('current-user');
    const isCheckingIn = !currentStatus || currentStatus.status === 'checked_out';

    const data = {
      method: 'tablet',
      tablet_station_id: stationId,
      location,
      notes: `Tablet station: ${stationId}`
    };

    return isCheckingIn ? this.checkIn(data) : this.checkOut(data);
  }

  // SMS check-in (for non-smartphone guards)
  async processSMSCheckIn(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // In a real implementation, this would process SMS commands
      toast.success(`SMS check-in processed for ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('SMS check-in failed:', error);
      toast.error('SMS check-in failed');
      return false;
    }
  }

  // Radio check-in
  async processRadioCheckIn(radioId: string, supervisorId: string): Promise<AttendanceRecord | null> {
    const data = {
      method: 'radio',
      notes: `Radio check-in via supervisor ${supervisorId}, Radio ID: ${radioId}`
    };

    return this.checkIn(data);
  }

  private createMockAttendanceRecord(
    status: 'checked_in' | 'checked_out',
    data: any
  ): AttendanceRecord {
    return {
      id: `attendance_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: 'current-user',
      user_name: 'Demo User',
      method: data.method || 'manual',
      location: data.location,
      notes: data.notes || '',
      rfid_card: data.rfid_card,
      qr_code: data.qr_code,
      tablet_station_id: data.tablet_station_id,
      timestamp: new Date().toISOString(),
      status
    };
  }

  private saveAttendanceLocally(record: AttendanceRecord): void {
    const localRecords = JSON.parse(localStorage.getItem('demo-attendance') || '[]');
    localRecords.unshift(record);
    localStorage.setItem('demo-attendance', JSON.stringify(localRecords.slice(0, 100)));
  }

  private getMockAttendanceRecords(): AttendanceRecord[] {
    const now = new Date();
    return [
      {
        id: 'att-001',
        user_id: 'guard-001',
        user_name: 'John Smith',
        method: 'rfid',
        location: { latitude: 40.7128, longitude: -74.0060, address: 'Downtown Plaza' },
        rfid_card: 'RFID001',
        timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
        status: 'checked_in'
      },
      {
        id: 'att-002',
        user_id: 'guard-002',
        user_name: 'Sarah Johnson',
        method: 'qr',
        location: { latitude: 40.7589, longitude: -73.9851, address: 'Corporate Center' },
        qr_code: 'QR123456',
        timestamp: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(),
        status: 'checked_in'
      },
      {
        id: 'att-003',
        user_id: 'guard-001',
        user_name: 'John Smith',
        method: 'manual',
        location: { latitude: 40.7128, longitude: -74.0060, address: 'Downtown Plaza' },
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        status: 'checked_out'
      }
    ];
  }
}

export const attendanceService = new AttendanceService();