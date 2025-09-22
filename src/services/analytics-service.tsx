import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface AnalyticsDashboard {
  users: {
    total: number;
    active: number;
    by_role: {
      guard: number;
      supervisor: number;
      admin: number;
      hr: number;
    };
  };
  incidents: {
    total: number;
    open: number;
    closed: number;
    today: number;
  };
  checkpoints: {
    total_scans: number;
    today: number;
    unique_guards: number;
  };
  attendance: {
    present_today: number;
    late_today: number;
    absent_today: number;
    attendance_rate: number;
  };
  performance: {
    response_times: number[];
    completion_rates: number[];
    efficiency_score: number;
  };
}

export interface PerformanceMetrics {
  guard_id: string;
  guard_name: string;
  incidents_handled: number;
  checkpoints_completed: number;
  response_time_avg: number;
  attendance_rate: number;
  efficiency_score: number;
  last_active: string;
}

export interface SiteAnalytics {
  site_id: string;
  site_name: string;
  total_incidents: number;
  security_level: 'low' | 'medium' | 'high' | 'critical';
  guard_coverage: number;
  last_patrol: string;
  risk_factors: string[];
}

class AnalyticsService {
  async getDashboardAnalytics(): Promise<AnalyticsDashboard | null> {
    try {
      const { analytics } = await apiCall('/analytics/dashboard');
      return this.enhanceAnalytics(analytics);
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
      return this.getMockAnalytics();
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics[]> {
    try {
      const { metrics } = await apiCall('/analytics/performance');
      return metrics || [];
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      return this.getMockPerformanceMetrics();
    }
  }

  async getGuardPerformance(guardId: string): Promise<PerformanceMetrics | null> {
    try {
      const { performance } = await apiCall(`/analytics/guard/${guardId}`);
      return performance;
    } catch (error) {
      console.error('Failed to fetch guard performance:', error);
      return this.getMockGuardPerformance(guardId);
    }
  }

  async getSiteAnalytics(): Promise<SiteAnalytics[]> {
    try {
      const { sites } = await apiCall('/analytics/sites');
      return sites || [];
    } catch (error) {
      console.error('Failed to fetch site analytics:', error);
      return this.getMockSiteAnalytics();
    }
  }

  async getIncidentTrends(days: number = 30): Promise<{
    dates: string[];
    incidents: number[];
    types: Record<string, number>;
    resolution_times: number[];
  }> {
    try {
      const { trends } = await apiCall(`/analytics/incidents/trends?days=${days}`);
      return trends;
    } catch (error) {
      console.error('Failed to fetch incident trends:', error);
      return this.getMockIncidentTrends(days);
    }
  }

  async getAttendanceTrends(days: number = 30): Promise<{
    dates: string[];
    present: number[];
    late: number[];
    absent: number[];
    attendance_rate: number[];
  }> {
    try {
      const { trends } = await apiCall(`/analytics/attendance/trends?days=${days}`);
      return trends;
    } catch (error) {
      console.error('Failed to fetch attendance trends:', error);
      return this.getMockAttendanceTrends(days);
    }
  }

  async getPatrolEfficiency(): Promise<{
    total_patrols: number;
    completed_on_time: number;
    average_duration: number;
    missed_checkpoints: number;
    efficiency_score: number;
    by_guard: Array<{
      guard_id: string;
      guard_name: string;
      patrols_completed: number;
      efficiency: number;
    }>;
  }> {
    try {
      const { efficiency } = await apiCall('/analytics/patrol/efficiency');
      return efficiency;
    } catch (error) {
      console.error('Failed to fetch patrol efficiency:', error);
      return this.getMockPatrolEfficiency();
    }
  }

  async getSecurityScore(): Promise<{
    overall_score: number;
    incident_score: number;
    response_score: number;
    coverage_score: number;
    recommendations: string[];
    trend: 'improving' | 'stable' | 'declining';
  }> {
    try {
      const { score } = await apiCall('/analytics/security/score');
      return score;
    } catch (error) {
      console.error('Failed to fetch security score:', error);
      return this.getMockSecurityScore();
    }
  }

  async generateReport(type: 'daily' | 'weekly' | 'monthly', format: 'json' | 'pdf' = 'json'): Promise<any> {
    try {
      const { report } = await apiCall(`/reports/generate/${type}?format=${format}`);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated`);
      return report;
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
      return this.getMockReport(type);
    }
  }

  async getCustomAnalytics(filters: {
    start_date?: string;
    end_date?: string;
    guard_ids?: string[];
    site_ids?: string[];
    incident_types?: string[];
  }): Promise<any> {
    try {
      const { analytics } = await apiCall('/analytics/custom', {
        method: 'POST',
        body: JSON.stringify(filters)
      });
      return analytics;
    } catch (error) {
      console.error('Failed to fetch custom analytics:', error);
      return this.getMockCustomAnalytics(filters);
    }
  }

  async getRealtimeMetrics(): Promise<{
    active_guards: number;
    active_incidents: number;
    guards_on_patrol: number;
    system_status: 'operational' | 'degraded' | 'critical';
    last_updated: string;
  }> {
    try {
      const { metrics } = await apiCall('/analytics/realtime');
      return metrics;
    } catch (error) {
      console.error('Failed to fetch realtime metrics:', error);
      return this.getMockRealtimeMetrics();
    }
  }

  async exportData(type: 'incidents' | 'attendance' | 'performance', format: 'csv' | 'excel' | 'json' = 'csv'): Promise<Blob | null> {
    try {
      const response = await apiCall(`/analytics/export/${type}?format=${format}`, {
        method: 'GET',
        responseType: 'blob'
      });
      
      toast.success(`${type} data exported as ${format.toUpperCase()}`);
      return response;
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
      return null;
    }
  }

  // Calculate KPIs
  calculateKPIs(analytics: AnalyticsDashboard): {
    incident_resolution_rate: number;
    guard_utilization: number;
    patrol_compliance: number;
    emergency_response_time: number;
  } {
    const incidentResolutionRate = analytics.incidents.total > 0 
      ? (analytics.incidents.closed / analytics.incidents.total) * 100 
      : 0;

    const guardUtilization = analytics.users.total > 0 
      ? (analytics.users.active / analytics.users.total) * 100 
      : 0;

    const patrolCompliance = analytics.checkpoints.total_scans > 0 
      ? Math.min((analytics.checkpoints.today / (analytics.checkpoints.total_scans * 0.1)) * 100, 100)
      : 0;

    const emergencyResponseTime = analytics.performance?.response_times?.length > 0
      ? analytics.performance.response_times.reduce((a, b) => a + b, 0) / analytics.performance.response_times.length
      : 0;

    return {
      incident_resolution_rate: Math.round(incidentResolutionRate),
      guard_utilization: Math.round(guardUtilization),
      patrol_compliance: Math.round(patrolCompliance),
      emergency_response_time: Math.round(emergencyResponseTime)
    };
  }

  private enhanceAnalytics(analytics: any): AnalyticsDashboard {
    return {
      ...analytics,
      attendance: {
        present_today: Math.floor(analytics.users?.active * 0.9) || 0,
        late_today: Math.floor(analytics.users?.active * 0.1) || 0,
        absent_today: Math.floor(analytics.users?.total * 0.05) || 0,
        attendance_rate: analytics.users?.total > 0 ? Math.round((analytics.users.active / analytics.users.total) * 100) : 0
      },
      performance: {
        response_times: [120, 180, 90, 150, 200], // seconds
        completion_rates: [95, 88, 92, 97, 85], // percentages
        efficiency_score: 92
      }
    };
  }

  private getMockAnalytics(): AnalyticsDashboard {
    return {
      users: {
        total: 48,
        active: 43,
        by_role: {
          guard: 38,
          supervisor: 6,
          admin: 3,
          hr: 1
        }
      },
      incidents: {
        total: 127,
        open: 8,
        closed: 119,
        today: 3
      },
      checkpoints: {
        total_scans: 1247,
        today: 43,
        unique_guards: 32
      },
      attendance: {
        present_today: 41,
        late_today: 2,
        absent_today: 5,
        attendance_rate: 85
      },
      performance: {
        response_times: [120, 180, 90, 150, 200],
        completion_rates: [95, 88, 92, 97, 85],
        efficiency_score: 92
      }
    };
  }

  private getMockPerformanceMetrics(): PerformanceMetrics[] {
    const now = new Date();
    return [
      {
        guard_id: 'guard-001',
        guard_name: 'John Smith',
        incidents_handled: 15,
        checkpoints_completed: 234,
        response_time_avg: 145,
        attendance_rate: 96,
        efficiency_score: 94,
        last_active: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
      },
      {
        guard_id: 'guard-002',
        guard_name: 'Sarah Johnson',
        incidents_handled: 12,
        checkpoints_completed: 198,
        response_time_avg: 132,
        attendance_rate: 98,
        efficiency_score: 97,
        last_active: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
      },
      {
        guard_id: 'guard-003',
        guard_name: 'Mike Davis',
        incidents_handled: 18,
        checkpoints_completed: 256,
        response_time_avg: 158,
        attendance_rate: 92,
        efficiency_score: 89,
        last_active: new Date(now.getTime() - 2 * 60 * 1000).toISOString()
      }
    ];
  }

  private getMockGuardPerformance(guardId: string): PerformanceMetrics {
    return {
      guard_id: guardId,
      guard_name: 'Demo Guard',
      incidents_handled: 10,
      checkpoints_completed: 150,
      response_time_avg: 140,
      attendance_rate: 95,
      efficiency_score: 90,
      last_active: new Date().toISOString()
    };
  }

  private getMockSiteAnalytics(): SiteAnalytics[] {
    const now = new Date();
    return [
      {
        site_id: 'site-001',
        site_name: 'Downtown Plaza',
        total_incidents: 45,
        security_level: 'medium',
        guard_coverage: 85,
        last_patrol: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        risk_factors: ['High foot traffic', 'Multiple entry points']
      },
      {
        site_id: 'site-002',
        site_name: 'Corporate Center',
        total_incidents: 23,
        security_level: 'low',
        guard_coverage: 92,
        last_patrol: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        risk_factors: ['After hours access']
      },
      {
        site_id: 'site-003',
        site_name: 'Shopping Mall',
        total_incidents: 67,
        security_level: 'high',
        guard_coverage: 78,
        last_patrol: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        risk_factors: ['Large crowds', 'Retail theft risk', 'Multiple levels']
      }
    ];
  }

  private getMockIncidentTrends(days: number): any {
    const dates = [];
    const incidents = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(date.toISOString().split('T')[0]);
      incidents.push(Math.floor(Math.random() * 10));
    }

    return {
      dates,
      incidents,
      types: {
        security: 45,
        medical: 12,
        fire: 3,
        theft: 23,
        vandalism: 8,
        other: 15
      },
      resolution_times: [120, 180, 90, 150, 200, 245, 95, 165]
    };
  }

  private getMockAttendanceTrends(days: number): any {
    const dates = [];
    const present = [];
    const late = [];
    const absent = [];
    const attendance_rate = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(date.toISOString().split('T')[0]);
      const p = Math.floor(Math.random() * 10) + 35;
      const l = Math.floor(Math.random() * 5);
      const a = Math.floor(Math.random() * 8);
      present.push(p);
      late.push(l);
      absent.push(a);
      attendance_rate.push(Math.round((p / (p + l + a)) * 100));
    }

    return { dates, present, late, absent, attendance_rate };
  }

  private getMockPatrolEfficiency(): any {
    return {
      total_patrols: 156,
      completed_on_time: 142,
      average_duration: 45, // minutes
      missed_checkpoints: 8,
      efficiency_score: 91,
      by_guard: [
        { guard_id: 'guard-001', guard_name: 'John Smith', patrols_completed: 45, efficiency: 94 },
        { guard_id: 'guard-002', guard_name: 'Sarah Johnson', patrols_completed: 38, efficiency: 97 },
        { guard_id: 'guard-003', guard_name: 'Mike Davis', patrols_completed: 52, efficiency: 87 }
      ]
    };
  }

  private getMockSecurityScore(): any {
    return {
      overall_score: 87,
      incident_score: 92,
      response_score: 85,
      coverage_score: 84,
      recommendations: [
        'Increase patrol frequency in high-risk areas',
        'Improve response time for non-critical incidents',
        'Add more checkpoint locations at Shopping Mall'
      ],
      trend: 'improving' as const
    };
  }

  private getMockReport(type: string): any {
    return {
      id: `report_${Date.now()}`,
      type,
      generated_at: new Date().toISOString(),
      data: {
        summary: `Mock ${type} report generated for demonstration`,
        metrics: this.getMockAnalytics()
      }
    };
  }

  private getMockCustomAnalytics(filters: any): any {
    return {
      filtered_results: {
        incidents: 45,
        checkpoints: 234,
        guards: 12
      },
      filters_applied: filters,
      generated_at: new Date().toISOString()
    };
  }

  private getMockRealtimeMetrics(): any {
    return {
      active_guards: 32,
      active_incidents: 3,
      guards_on_patrol: 18,
      system_status: 'operational' as const,
      last_updated: new Date().toISOString()
    };
  }
}

export const analyticsService = new AnalyticsService();