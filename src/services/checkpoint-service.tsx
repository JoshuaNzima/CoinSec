import { apiCall } from '../utils/supabase/client';
import { gpsService } from './gps-service';
import { toast } from 'sonner@2.0.3';

export interface CheckpointScan {
  id: string;
  user_id: string;
  user_name: string;
  checkpoint_id: string;
  latitude: number;
  longitude: number;
  notes: string;
  timestamp: string;
  verified?: boolean;
  verification_method?: 'qr' | 'nfc' | 'manual';
}

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  qr_code?: string;
  nfc_tag?: string;
  required_interval_minutes?: number;
  is_active: boolean;
  created_at: string;
}

export interface PatrolRoute {
  id: string;
  name: string;
  description: string;
  checkpoints: string[]; // Array of checkpoint IDs
  estimated_duration_minutes: number;
  is_active: boolean;
  assigned_guards?: string[];
}

class CheckpointService {
  private scanCache: Map<string, CheckpointScan> = new Map();

  // Scan a checkpoint (QR code, NFC, or manual)
  async scanCheckpoint(
    checkpointId: string, 
    notes: string = '',
    verificationMethod: 'qr' | 'nfc' | 'manual' = 'manual'
  ): Promise<CheckpointScan | null> {
    try {
      // Get current location
      let latitude = 0;
      let longitude = 0;

      try {
        const position = await gpsService.getCurrentLocation();
        if (position) {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      } catch (locationError) {
        console.warn('Could not get location for checkpoint scan:', locationError);
        // Use default location for demo
        latitude = 40.7128 + (Math.random() - 0.5) * 0.01;
        longitude = -74.0060 + (Math.random() - 0.5) * 0.01;
      }

      const scanData = {
        checkpoint_id: checkpointId,
        latitude,
        longitude,
        notes,
        verification_method: verificationMethod
      };

      try {
        const { scan } = await apiCall('/checkpoints/scan', {
          method: 'POST',
          body: JSON.stringify(scanData)
        });

        // Cache the scan
        this.scanCache.set(scan.id, scan);

        toast.success(`Checkpoint ${checkpointId} scanned successfully`);
        return scan;
      } catch (apiError) {
        // Check if we're in demo mode
        const localUser = localStorage.getItem('guard-app-user');
        if (localUser) {
          // Create mock scan for demo purposes
          const mockScan = this.createMockScan(scanData);
          this.saveScanLocally(mockScan);

          toast.success(`Checkpoint ${checkpointId} scanned successfully (demo mode)`);
          return mockScan;
        } else {
          throw apiError; // Re-throw if not in demo mode
        }
      }
    } catch (error) {
      console.error('Failed to scan checkpoint:', error);
      toast.error('Failed to scan checkpoint. Please try again.');
      return null;
    }
  }

  // Get all checkpoint scans
  async getCheckpointScans(): Promise<CheckpointScan[]> {
    try {
      const { scans } = await apiCall('/checkpoints/scans');
      return scans || [];
    } catch (error) {
      console.log('Using mock data for checkpoint scans:', error.message);
      // Return mock data for demo purposes
      return this.getMockCheckpointScans();
    }
  }

  // Get scans for a specific checkpoint
  async getCheckpointScanHistory(checkpointId: string): Promise<CheckpointScan[]> {
    try {
      const scans = await this.getCheckpointScans();
      return scans.filter(scan => scan.checkpoint_id === checkpointId);
    } catch (error) {
      console.error('Failed to fetch checkpoint scan history:', error);
      return [];
    }
  }

  // Get scans for a specific user
  async getUserScans(userId: string): Promise<CheckpointScan[]> {
    try {
      const scans = await this.getCheckpointScans();
      return scans.filter(scan => scan.user_id === userId);
    } catch (error) {
      console.error('Failed to fetch user scans:', error);
      return [];
    }
  }

  // Verify if a checkpoint scan is within acceptable range
  verifyCheckpointLocation(
    scanLat: number, 
    scanLon: number, 
    checkpointLat: number, 
    checkpointLon: number,
    maxDistanceMeters: number = 50
  ): boolean {
    const distance = gpsService.calculateDistance(scanLat, scanLon, checkpointLat, checkpointLon);
    const distanceMeters = distance * 1000; // Convert km to meters
    return distanceMeters <= maxDistanceMeters;
  }

  // QR Code scanning simulation
  async scanQRCode(): Promise<string | null> {
    try {
      // In a real app, this would integrate with a QR code scanner library
      // For demo purposes, we'll simulate QR code scanning
      const result = await new Promise<string>((resolve, reject) => {
        // Simulate camera access and QR scanning
        setTimeout(() => {
          // Generate a mock QR code result
          const mockQrCodes = [
            'CHECKPOINT_001',
            'CHECKPOINT_002', 
            'CHECKPOINT_003',
            'CHECKPOINT_004',
            'CHECKPOINT_005'
          ];
          const randomCode = mockQrCodes[Math.floor(Math.random() * mockQrCodes.length)];
          resolve(randomCode);
        }, 2000); // Simulate 2-second scan time
      });

      return result;
    } catch (error) {
      console.error('QR Code scanning failed:', error);
      toast.error('Failed to scan QR code');
      return null;
    }
  }

  // NFC tag scanning simulation
  async scanNFC(): Promise<string | null> {
    try {
      // Check if NFC is available
      if (!('NDEFReader' in window)) {
        toast.error('NFC is not supported on this device');
        return null;
      }

      // In a real app, this would use Web NFC API
      // For demo purposes, we'll simulate NFC scanning
      const result = await new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          const mockNfcTags = [
            'NFC_CHECKPOINT_A',
            'NFC_CHECKPOINT_B',
            'NFC_CHECKPOINT_C',
            'NFC_CHECKPOINT_D'
          ];
          const randomTag = mockNfcTags[Math.floor(Math.random() * mockNfcTags.length)];
          resolve(randomTag);
        }, 1500);
      });

      return result;
    } catch (error) {
      console.error('NFC scanning failed:', error);
      toast.error('Failed to scan NFC tag');
      return null;
    }
  }

  // Get checkpoint scan statistics
  async getScanStatistics(): Promise<{
    totalScans: number;
    scansToday: number;
    scansThisWeek: number;
    uniqueCheckpoints: number;
    averageScansPerDay: number;
  }> {
    try {
      const scans = await this.getCheckpointScans();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const scansToday = scans.filter(scan => 
        new Date(scan.timestamp) >= today
      ).length;

      const scansThisWeek = scans.filter(scan => 
        new Date(scan.timestamp) >= weekAgo
      ).length;

      const uniqueCheckpoints = new Set(scans.map(scan => scan.checkpoint_id)).size;

      return {
        totalScans: scans.length,
        scansToday,
        scansThisWeek,
        uniqueCheckpoints,
        averageScansPerDay: scansThisWeek / 7
      };
    } catch (error) {
      console.error('Failed to get scan statistics:', error);
      return {
        totalScans: 0,
        scansToday: 0,
        scansThisWeek: 0,
        uniqueCheckpoints: 0,
        averageScansPerDay: 0
      };
    }
  }

  // Check if checkpoint is overdue for scanning
  async checkOverdueCheckpoints(): Promise<string[]> {
    try {
      const scans = await this.getCheckpointScans();
      const now = new Date();
      const overdueCheckpoints: string[] = [];

      // Group scans by checkpoint
      const checkpointScans = new Map<string, CheckpointScan[]>();
      scans.forEach(scan => {
        if (!checkpointScans.has(scan.checkpoint_id)) {
          checkpointScans.set(scan.checkpoint_id, []);
        }
        checkpointScans.get(scan.checkpoint_id)!.push(scan);
      });

      // Check each checkpoint for overdue status
      for (const [checkpointId, checkpointScanList] of checkpointScans) {
        const latestScan = checkpointScanList
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        if (latestScan) {
          const lastScanTime = new Date(latestScan.timestamp);
          const timeSinceLastScan = now.getTime() - lastScanTime.getTime();
          const hoursSinceLastScan = timeSinceLastScan / (1000 * 60 * 60);

          // Consider checkpoint overdue if not scanned in last 4 hours
          if (hoursSinceLastScan > 4) {
            overdueCheckpoints.push(checkpointId);
          }
        }
      }

      return overdueCheckpoints;
    } catch (error) {
      console.error('Failed to check overdue checkpoints:', error);
      return [];
    }
  }

  // Generate patrol report
  async generatePatrolReport(
    startTime: Date, 
    endTime: Date, 
    userId?: string
  ): Promise<{
    scans: CheckpointScan[];
    totalDistance: number;
    duration: number;
    checkpointsVisited: number;
  }> {
    try {
      let scans = await this.getCheckpointScans();

      // Filter by time range
      scans = scans.filter(scan => {
        const scanTime = new Date(scan.timestamp);
        return scanTime >= startTime && scanTime <= endTime;
      });

      // Filter by user if specified
      if (userId) {
        scans = scans.filter(scan => scan.user_id === userId);
      }

      // Calculate total distance (simplified)
      let totalDistance = 0;
      for (let i = 1; i < scans.length; i++) {
        const prevScan = scans[i - 1];
        const currentScan = scans[i];
        totalDistance += gpsService.calculateDistance(
          prevScan.latitude,
          prevScan.longitude,
          currentScan.latitude,
          currentScan.longitude
        );
      }

      const duration = endTime.getTime() - startTime.getTime();
      const checkpointsVisited = new Set(scans.map(scan => scan.checkpoint_id)).size;

      return {
        scans,
        totalDistance,
        duration,
        checkpointsVisited
      };
    } catch (error) {
      console.error('Failed to generate patrol report:', error);
      return {
        scans: [],
        totalDistance: 0,
        duration: 0,
        checkpointsVisited: 0
      };
    }
  }

  // Clear scan cache
  clearCache(): void {
    this.scanCache.clear();
  }

  // Mock data for demo purposes
  private getMockCheckpointScans(): CheckpointScan[] {
    const now = new Date();
    return [
      {
        id: 'scan-001',
        user_id: 'guard-001',
        user_name: 'John Smith',
        checkpoint_id: 'CHECKPOINT_001',
        latitude: 40.7128,
        longitude: -74.0060,
        notes: 'All clear, no issues observed',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        verified: true,
        verification_method: 'qr'
      },
      {
        id: 'scan-002',
        user_id: 'guard-002',
        user_name: 'Sarah Johnson',
        checkpoint_id: 'CHECKPOINT_002',
        latitude: 40.7589,
        longitude: -73.9851,
        notes: 'Door found unlocked, secured',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        verified: true,
        verification_method: 'nfc'
      },
      {
        id: 'scan-003',
        user_id: 'guard-003',
        user_name: 'Mike Davis',
        checkpoint_id: 'CHECKPOINT_003',
        latitude: 40.7505,
        longitude: -73.9934,
        notes: 'Routine patrol check',
        timestamp: new Date(now.getTime() - 75 * 60 * 1000).toISOString(),
        verified: true,
        verification_method: 'manual'
      },
      {
        id: 'scan-004',
        user_id: 'guard-001',
        user_name: 'John Smith',
        checkpoint_id: 'CHECKPOINT_004',
        latitude: 40.7614,
        longitude: -73.9776,
        notes: 'Equipment check completed',
        timestamp: new Date(now.getTime() - 105 * 60 * 1000).toISOString(),
        verified: true,
        verification_method: 'qr'
      }
    ];
  }

  private createMockScan(scanData: any): CheckpointScan {
    return {
      id: `scan-${Date.now()}`,
      user_id: 'current-user',
      user_name: 'Demo User',
      checkpoint_id: scanData.checkpoint_id,
      latitude: scanData.latitude,
      longitude: scanData.longitude,
      notes: scanData.notes,
      timestamp: new Date().toISOString(),
      verified: true,
      verification_method: scanData.verification_method
    };
  }

  private saveScanLocally(scan: CheckpointScan): void {
    const localScans = JSON.parse(localStorage.getItem('demo-checkpoint-scans') || '[]');
    localScans.unshift(scan);
    localStorage.setItem('demo-checkpoint-scans', JSON.stringify(localScans.slice(0, 100))); // Keep last 100 scans
  }
}

export const checkpointService = new CheckpointService();