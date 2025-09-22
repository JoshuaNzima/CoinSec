import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'guard' | 'supervisor' | 'admin' | 'hr';
  badge: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  hire_date: string;
  department: string;
  supervisor_id?: string;
  phone: string;
  address: string;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  certifications: Certification[];
  salary?: number;
  performance_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  status: 'valid' | 'expired' | 'expiring_soon';
  document_url?: string;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  employee_name: string;
  reviewer_id: string;
  reviewer_name: string;
  review_period: {
    start_date: string;
    end_date: string;
  };
  overall_score: number;
  categories: {
    reliability: number;
    communication: number;
    professionalism: number;
    technical_skills: number;
    teamwork: number;
  };
  strengths: string[];
  areas_for_improvement: string[];
  goals: string[];
  comments: string;
  status: 'draft' | 'completed' | 'approved';
  created_at: string;
  updated_at: string;
}

export interface TrainingRecord {
  id: string;
  employee_id: string;
  training_name: string;
  training_type: 'mandatory' | 'optional' | 'certification';
  completion_date?: string;
  expiry_date?: string;
  score?: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired';
  instructor: string;
  location: string;
  notes?: string;
}

export interface Payroll {
  id: string;
  employee_id: string;
  pay_period: {
    start_date: string;
    end_date: string;
  };
  hours_worked: number;
  overtime_hours: number;
  base_pay: number;
  overtime_pay: number;
  deductions: {
    taxes: number;
    insurance: number;
    other: number;
  };
  net_pay: number;
  status: 'draft' | 'approved' | 'paid';
  created_at: string;
}

class HRService {
  async getEmployees(): Promise<Employee[]> {
    try {
      const { employees } = await apiCall('/hr/employees');
      return employees || [];
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      return this.getMockEmployees();
    }
  }

  async getEmployee(employeeId: string): Promise<Employee | null> {
    try {
      const { employee } = await apiCall(`/hr/employees/${employeeId}`);
      return employee;
    } catch (error) {
      console.error('Failed to fetch employee:', error);
      return this.getMockEmployee(employeeId);
    }
  }

  async createEmployee(employeeData: Partial<Employee>): Promise<Employee | null> {
    try {
      const { employee } = await apiCall('/hr/employees', {
        method: 'POST',
        body: JSON.stringify(employeeData)
      });

      toast.success('Employee created successfully');
      return employee;
    } catch (error) {
      console.error('Failed to create employee:', error);
      toast.error('Failed to create employee');
      return null;
    }
  }

  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee | null> {
    try {
      const { employee } = await apiCall(`/hr/employees/${employeeId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      toast.success('Employee updated successfully');
      return employee;
    } catch (error) {
      console.error('Failed to update employee:', error);
      toast.error('Failed to update employee');
      return null;
    }
  }

  async terminateEmployee(employeeId: string, terminationDate: string, reason: string): Promise<boolean> {
    try {
      await apiCall(`/hr/employees/${employeeId}/terminate`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'terminated',
          termination_date: terminationDate,
          termination_reason: reason
        })
      });

      toast.success('Employee terminated');
      return true;
    } catch (error) {
      console.error('Failed to terminate employee:', error);
      toast.error('Failed to terminate employee');
      return false;
    }
  }

  // Performance Reviews
  async createPerformanceReview(reviewData: Partial<PerformanceReview>): Promise<PerformanceReview | null> {
    try {
      const { review } = await apiCall('/hr/performance-review', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });

      toast.success('Performance review created');
      return review;
    } catch (error) {
      console.error('Failed to create performance review:', error);
      toast.error('Failed to create performance review');
      return null;
    }
  }

  async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
    try {
      const url = employeeId ? `/hr/performance-reviews?employee_id=${employeeId}` : '/hr/performance-reviews';
      const { reviews } = await apiCall(url);
      return reviews || [];
    } catch (error) {
      console.error('Failed to fetch performance reviews:', error);
      return this.getMockPerformanceReviews();
    }
  }

  async updatePerformanceReview(reviewId: string, updates: Partial<PerformanceReview>): Promise<PerformanceReview | null> {
    try {
      const { review } = await apiCall(`/hr/performance-reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      toast.success('Performance review updated');
      return review;
    } catch (error) {
      console.error('Failed to update performance review:', error);
      toast.error('Failed to update performance review');
      return null;
    }
  }

  // Training Management
  async getTrainingRecords(employeeId?: string): Promise<TrainingRecord[]> {
    try {
      const url = employeeId ? `/hr/training?employee_id=${employeeId}` : '/hr/training';
      const { records } = await apiCall(url);
      return records || [];
    } catch (error) {
      console.error('Failed to fetch training records:', error);
      return this.getMockTrainingRecords();
    }
  }

  async assignTraining(employeeId: string, trainingData: Partial<TrainingRecord>): Promise<TrainingRecord | null> {
    try {
      const { record } = await apiCall('/hr/training/assign', {
        method: 'POST',
        body: JSON.stringify({
          employee_id: employeeId,
          ...trainingData
        })
      });

      toast.success('Training assigned successfully');
      return record;
    } catch (error) {
      console.error('Failed to assign training:', error);
      toast.error('Failed to assign training');
      return null;
    }
  }

  async completeTraining(recordId: string, score?: number, notes?: string): Promise<boolean> {
    try {
      await apiCall(`/hr/training/${recordId}/complete`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'completed',
          completion_date: new Date().toISOString(),
          score,
          notes
        })
      });

      toast.success('Training marked as completed');
      return true;
    } catch (error) {
      console.error('Failed to complete training:', error);
      toast.error('Failed to complete training');
      return false;
    }
  }

  // Certification Management
  async addCertification(employeeId: string, certificationData: Partial<Certification>): Promise<Certification | null> {
    try {
      const { certification } = await apiCall(`/hr/employees/${employeeId}/certifications`, {
        method: 'POST',
        body: JSON.stringify(certificationData)
      });

      toast.success('Certification added');
      return certification;
    } catch (error) {
      console.error('Failed to add certification:', error);
      toast.error('Failed to add certification');
      return null;
    }
  }

  async getExpiringCertifications(days: number = 30): Promise<Certification[]> {
    try {
      const { certifications } = await apiCall(`/hr/certifications/expiring?days=${days}`);
      return certifications || [];
    } catch (error) {
      console.error('Failed to fetch expiring certifications:', error);
      return this.getMockExpiringCertifications();
    }
  }

  // Payroll
  async getPayroll(employeeId?: string, payPeriod?: string): Promise<Payroll[]> {
    try {
      let url = '/hr/payroll';
      const params = new URLSearchParams();
      if (employeeId) params.append('employee_id', employeeId);
      if (payPeriod) params.append('pay_period', payPeriod);
      if (params.toString()) url += `?${params.toString()}`;

      const { payroll } = await apiCall(url);
      return payroll || [];
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
      return this.getMockPayroll();
    }
  }

  async calculatePayroll(employeeId: string, payPeriod: { start_date: string; end_date: string }): Promise<Payroll | null> {
    try {
      const { payroll } = await apiCall('/hr/payroll/calculate', {
        method: 'POST',
        body: JSON.stringify({
          employee_id: employeeId,
          pay_period: payPeriod
        })
      });

      toast.success('Payroll calculated');
      return payroll;
    } catch (error) {
      console.error('Failed to calculate payroll:', error);
      toast.error('Failed to calculate payroll');
      return null;
    }
  }

  // HR Analytics
  async getHRAnalytics(): Promise<{
    total_employees: number;
    active_employees: number;
    turnover_rate: number;
    average_tenure: number;
    departments: Record<string, number>;
    upcoming_reviews: number;
    expiring_certifications: number;
    training_completion_rate: number;
  }> {
    try {
      const { analytics } = await apiCall('/hr/analytics');
      return analytics;
    } catch (error) {
      console.error('Failed to fetch HR analytics:', error);
      return this.getMockHRAnalytics();
    }
  }

  async getEmployeesByDepartment(): Promise<Record<string, Employee[]>> {
    try {
      const employees = await this.getEmployees();
      return employees.reduce((acc, employee) => {
        const dept = employee.department || 'Unassigned';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(employee);
        return acc;
      }, {} as Record<string, Employee[]>);
    } catch (error) {
      console.error('Failed to group employees by department:', error);
      return {};
    }
  }

  async generateHRReport(type: 'employees' | 'performance' | 'training' | 'payroll'): Promise<any> {
    try {
      const { report } = await apiCall(`/hr/reports/${type}`);
      toast.success(`${type} report generated`);
      return report;
    } catch (error) {
      console.error('Failed to generate HR report:', error);
      toast.error('Failed to generate report');
      return null;
    }
  }

  // Utility functions
  calculatePerformanceScore(review: PerformanceReview): number {
    const categories = review.categories;
    const total = categories.reliability + categories.communication + 
                 categories.professionalism + categories.technical_skills + categories.teamwork;
    return Math.round(total / 5);
  }

  isTrainingExpired(record: TrainingRecord): boolean {
    if (!record.expiry_date) return false;
    return new Date(record.expiry_date) < new Date();
  }

  isCertificationExpiring(certification: Certification, days: number = 30): boolean {
    if (!certification.expiry_date) return false;
    const expiryDate = new Date(certification.expiry_date);
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + days);
    return expiryDate <= warningDate;
  }

  private getMockEmployees(): Employee[] {
    const now = new Date();
    return [
      {
        id: 'emp-001',
        name: 'John Smith',
        email: 'john.smith@company.com',
        role: 'guard',
        badge: 'GRD-001',
        status: 'active',
        hire_date: '2023-01-15',
        department: 'Security Operations',
        phone: '+1-555-0101',
        address: '123 Main St, City, State 12345',
        emergency_contact: {
          name: 'Jane Smith',
          phone: '+1-555-0102',
          relationship: 'Spouse'
        },
        certifications: [
          {
            id: 'cert-001',
            name: 'Security Guard License',
            issuer: 'State Security Board',
            issue_date: '2023-01-10',
            expiry_date: '2025-01-10',
            status: 'valid'
          }
        ],
        salary: 45000,
        performance_score: 4.2,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      },
      {
        id: 'emp-002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        role: 'supervisor',
        badge: 'SUP-001',
        status: 'active',
        hire_date: '2022-06-01',
        department: 'Security Operations',
        supervisor_id: 'emp-010',
        phone: '+1-555-0201',
        address: '456 Oak Ave, City, State 12345',
        emergency_contact: {
          name: 'Mike Johnson',
          phone: '+1-555-0202',
          relationship: 'Brother'
        },
        certifications: [
          {
            id: 'cert-002',
            name: 'Supervisor Certification',
            issuer: 'Security Institute',
            issue_date: '2022-05-15',
            expiry_date: '2024-05-15',
            status: 'expiring_soon'
          }
        ],
        salary: 65000,
        performance_score: 4.8,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
    ];
  }

  private getMockEmployee(employeeId: string): Employee {
    const employees = this.getMockEmployees();
    return employees.find(emp => emp.id === employeeId) || employees[0];
  }

  private getMockPerformanceReviews(): PerformanceReview[] {
    const now = new Date();
    return [
      {
        id: 'review-001',
        employee_id: 'emp-001',
        employee_name: 'John Smith',
        reviewer_id: 'emp-002',
        reviewer_name: 'Sarah Johnson',
        review_period: {
          start_date: '2024-01-01',
          end_date: '2024-06-30'
        },
        overall_score: 4.2,
        categories: {
          reliability: 4.5,
          communication: 4.0,
          professionalism: 4.3,
          technical_skills: 4.1,
          teamwork: 4.2
        },
        strengths: ['Punctual', 'Professional demeanor', 'Good problem-solving skills'],
        areas_for_improvement: ['Communication with team members', 'Technology skills'],
        goals: ['Complete advanced security training', 'Improve incident report writing'],
        comments: 'John has shown consistent performance and dedication to his role.',
        status: 'completed',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
    ];
  }

  private getMockTrainingRecords(): TrainingRecord[] {
    const now = new Date();
    return [
      {
        id: 'train-001',
        employee_id: 'emp-001',
        training_name: 'First Aid/CPR Certification',
        training_type: 'mandatory',
        completion_date: '2024-03-15',
        expiry_date: '2026-03-15',
        score: 95,
        status: 'completed',
        instructor: 'Red Cross Instructor',
        location: 'Training Center A',
        notes: 'Excellent performance during practical exercises'
      },
      {
        id: 'train-002',
        employee_id: 'emp-001',
        training_name: 'De-escalation Techniques',
        training_type: 'optional',
        status: 'in_progress',
        instructor: 'Security Training Institute',
        location: 'Online',
        notes: 'Enrolled on 2024-01-10'
      }
    ];
  }

  private getMockExpiringCertifications(): Certification[] {
    return [
      {
        id: 'cert-003',
        name: 'First Aid Certification',
        issuer: 'Red Cross',
        issue_date: '2022-04-15',
        expiry_date: '2024-04-15',
        status: 'expiring_soon'
      }
    ];
  }

  private getMockPayroll(): Payroll[] {
    const now = new Date();
    return [
      {
        id: 'pay-001',
        employee_id: 'emp-001',
        pay_period: {
          start_date: '2024-01-01',
          end_date: '2024-01-15'
        },
        hours_worked: 80,
        overtime_hours: 8,
        base_pay: 1800,
        overtime_pay: 270,
        deductions: {
          taxes: 414,
          insurance: 150,
          other: 50
        },
        net_pay: 1456,
        status: 'paid',
        created_at: now.toISOString()
      }
    ];
  }

  private getMockHRAnalytics(): any {
    return {
      total_employees: 53,
      active_employees: 48,
      turnover_rate: 8.5,
      average_tenure: 2.3,
      departments: {
        'Security Operations': 38,
        'Administration': 8,
        'Management': 5,
        'HR': 2
      },
      upcoming_reviews: 12,
      expiring_certifications: 5,
      training_completion_rate: 87
    };
  }
}

export const hrService = new HRService();