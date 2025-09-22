// Comprehensive mock data for the guard services application

export interface Employee {
  id: string;
  name: string;
  role: 'guard' | 'supervisor' | 'admin' | 'hr';
  badge: string;
  phone: string;
  email: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  certifications: string[];
  site?: string;
  shift?: string;
  profileImage?: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  status: 'active' | 'inactive';
  guards: string[];
  checkpoints: string[];
  contractValue: number;
  clientContact: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  location: string;
  site: string;
  category: string;
  images?: string[];
}

export interface Shift {
  id: string;
  guardId: string;
  guardName: string;
  site: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'missed';
  checkIns: number;
  totalCheckpoints: number;
}

export interface Checkpoint {
  id: string;
  name: string;
  location: string;
  site: string;
  qrCode: string;
  lastChecked?: string;
  checkedBy?: string;
  coordinates: { lat: number; lng: number };
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  regularHours: number;
  overtimeHours: number;
  regularRate: number;
  overtimeRate: number;
  grossPay: number;
  taxes: number;
  benefits: number;
  netPay: number;
  status: 'pending' | 'processed' | 'paid';
}

export interface Expense {
  id: string;
  category: 'equipment' | 'training' | 'vehicle' | 'supplies' | 'other';
  description: string;
  amount: number;
  date: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt?: string;
}

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'guard',
    badge: 'GRD-001',
    phone: '(555) 123-4567',
    email: 'john.smith@guardforce.com',
    hireDate: '2023-01-15',
    salary: 45000,
    status: 'active',
    certifications: ['Security Guard License', 'First Aid', 'CPR'],
    site: 'Downtown Plaza',
    shift: 'Day Shift'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'supervisor',
    badge: 'SUP-001',
    phone: '(555) 234-5678',
    email: 'sarah.johnson@guardforce.com',
    hireDate: '2022-08-20',
    salary: 65000,
    status: 'active',
    certifications: ['Supervisor Certification', 'Security Management', 'Conflict Resolution'],
    site: 'Corporate Center'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    role: 'guard',
    badge: 'GRD-002',
    phone: '(555) 345-6789',
    email: 'mike.rodriguez@guardforce.com',
    hireDate: '2023-03-10',
    salary: 47000,
    status: 'active',
    certifications: ['Security Guard License', 'Emergency Response'],
    site: 'Shopping Mall',
    shift: 'Night Shift'
  },
  {
    id: '4',
    name: 'Emily Davis',
    role: 'hr',
    badge: 'HR-001',
    phone: '(555) 456-7890',
    email: 'emily.davis@guardforce.com',
    hireDate: '2021-11-05',
    salary: 75000,
    status: 'active',
    certifications: ['HR Certification', 'Payroll Management']
  },
  {
    id: '5',
    name: 'David Wilson',
    role: 'admin',
    badge: 'ADM-001',
    phone: '(555) 567-8901',
    email: 'david.wilson@guardforce.com',
    hireDate: '2020-06-01',
    salary: 95000,
    status: 'active',
    certifications: ['Security Management', 'Business Administration']
  }
];

// Mock Sites
export const mockSites: Site[] = [
  {
    id: '1',
    name: 'Downtown Plaza',
    address: '123 Main St, Downtown',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    status: 'active',
    guards: ['1', '3'],
    checkpoints: ['cp1', 'cp2', 'cp3'],
    contractValue: 250000,
    clientContact: 'Plaza Management LLC'
  },
  {
    id: '2',
    name: 'Corporate Center',
    address: '456 Business Ave, Corporate District',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    status: 'active',
    guards: ['2'],
    checkpoints: ['cp4', 'cp5'],
    contractValue: 180000,
    clientContact: 'Corporate Holdings Inc'
  },
  {
    id: '3',
    name: 'Shopping Mall',
    address: '789 Commerce Blvd, Retail District',
    coordinates: { lat: 40.7505, lng: -73.9934 },
    status: 'active',
    guards: ['3'],
    checkpoints: ['cp6', 'cp7', 'cp8'],
    contractValue: 320000,
    clientContact: 'Mall Operators Group'
  }
];

// Mock Incidents
export const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Suspicious Activity',
    description: 'Individual observed loitering near employee entrance for extended period',
    severity: 'medium',
    status: 'investigating',
    reportedBy: 'John Smith',
    reportedAt: '2024-01-20T14:30:00Z',
    location: 'Employee Entrance',
    site: 'Downtown Plaza',
    category: 'Security Concern'
  },
  {
    id: '2',
    title: 'Equipment Malfunction',
    description: 'Security camera #12 not responding, requires maintenance',
    severity: 'low',
    status: 'open',
    reportedBy: 'Sarah Johnson',
    reportedAt: '2024-01-20T09:15:00Z',
    location: 'North Corridor',
    site: 'Corporate Center',
    category: 'Equipment'
  },
  {
    id: '3',
    title: 'Medical Emergency',
    description: 'Customer fell in food court area, ambulance called',
    severity: 'high',
    status: 'resolved',
    reportedBy: 'Mike Rodriguez',
    reportedAt: '2024-01-19T16:45:00Z',
    location: 'Food Court',
    site: 'Shopping Mall',
    category: 'Medical'
  }
];

// Mock Shifts
export const mockShifts: Shift[] = [
  {
    id: '1',
    guardId: '1',
    guardName: 'John Smith',
    site: 'Downtown Plaza',
    startTime: '2024-01-21T08:00:00Z',
    endTime: '2024-01-21T16:00:00Z',
    status: 'active',
    checkIns: 15,
    totalCheckpoints: 20
  },
  {
    id: '2',
    guardId: '3',
    guardName: 'Mike Rodriguez',
    site: 'Shopping Mall',
    startTime: '2024-01-20T22:00:00Z',
    endTime: '2024-01-21T06:00:00Z',
    status: 'completed',
    checkIns: 24,
    totalCheckpoints: 24
  },
  {
    id: '3',
    guardId: '2',
    guardName: 'Sarah Johnson',
    site: 'Corporate Center',
    startTime: '2024-01-21T12:00:00Z',
    endTime: '2024-01-21T20:00:00Z',
    status: 'scheduled',
    checkIns: 0,
    totalCheckpoints: 16
  }
];

// Mock Checkpoints
export const mockCheckpoints: Checkpoint[] = [
  {
    id: 'cp1',
    name: 'Main Entrance',
    location: 'Front Lobby',
    site: 'Downtown Plaza',
    qrCode: 'QR001',
    lastChecked: '2024-01-21T10:30:00Z',
    checkedBy: 'John Smith',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 'cp2',
    name: 'Parking Garage',
    location: 'Level B1',
    site: 'Downtown Plaza',
    qrCode: 'QR002',
    lastChecked: '2024-01-21T11:00:00Z',
    checkedBy: 'John Smith',
    coordinates: { lat: 40.7129, lng: -74.0061 }
  },
  {
    id: 'cp3',
    name: 'Emergency Exit',
    location: 'East Wing',
    site: 'Downtown Plaza',
    qrCode: 'QR003',
    coordinates: { lat: 40.7127, lng: -74.0059 }
  }
];

// Mock Payroll Records
export const mockPayrollRecords: PayrollRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Smith',
    period: '2024-01-01 to 2024-01-15',
    regularHours: 80,
    overtimeHours: 5,
    regularRate: 22.50,
    overtimeRate: 33.75,
    grossPay: 1968.75,
    taxes: 315.00,
    benefits: 125.00,
    netPay: 1528.75,
    status: 'processed'
  },
  {
    id: '2',
    employeeId: '3',
    employeeName: 'Mike Rodriguez',
    period: '2024-01-01 to 2024-01-15',
    regularHours: 80,
    overtimeHours: 8,
    regularRate: 23.50,
    overtimeRate: 35.25,
    grossPay: 2162.00,
    taxes: 345.92,
    benefits: 125.00,
    netPay: 1691.08,
    status: 'processed'
  },
  {
    id: '3',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    period: '2024-01-01 to 2024-01-15',
    regularHours: 80,
    overtimeHours: 3,
    regularRate: 31.25,
    overtimeRate: 46.88,
    grossPay: 2640.64,
    taxes: 422.50,
    benefits: 150.00,
    netPay: 2068.14,
    status: 'paid'
  }
];

// Mock Expenses
export const mockExpenses: Expense[] = [
  {
    id: '1',
    category: 'equipment',
    description: 'New security radios (5 units)',
    amount: 1250.00,
    date: '2024-01-15',
    submittedBy: 'Sarah Johnson',
    status: 'approved'
  },
  {
    id: '2',
    category: 'training',
    description: 'CPR/First Aid certification course',
    amount: 350.00,
    date: '2024-01-18',
    submittedBy: 'Emily Davis',
    status: 'pending'
  },
  {
    id: '3',
    category: 'vehicle',
    description: 'Patrol vehicle fuel and maintenance',
    amount: 285.50,
    date: '2024-01-19',
    submittedBy: 'John Smith',
    status: 'approved'
  }
];

// Financial Summary Data
export const mockFinancialSummary = {
  monthlyRevenue: 245000,
  monthlyExpenses: 185000,
  netProfit: 60000,
  profitMargin: 24.5,
  totalContracts: 32,
  activeGuards: 48,
  overhead: {
    payroll: 120000,
    equipment: 15000,
    training: 8000,
    vehicles: 12000,
    insurance: 18000,
    other: 12000
  }
};

// Analytics Data
export const mockAnalytics = {
  incidentTrends: [
    { month: 'Jul', incidents: 12 },
    { month: 'Aug', incidents: 8 },
    { month: 'Sep', incidents: 15 },
    { month: 'Oct', incidents: 6 },
    { month: 'Nov', incidents: 9 },
    { month: 'Dec', incidents: 4 },
    { month: 'Jan', incidents: 7 }
  ],
  checkpointCompliance: [
    { site: 'Downtown Plaza', compliance: 95 },
    { site: 'Corporate Center', compliance: 88 },
    { site: 'Shopping Mall', compliance: 92 },
    { site: 'Warehouse District', compliance: 78 },
    { site: 'Medical Center', compliance: 98 }
  ],
  guardPerformance: [
    { guard: 'John Smith', score: 94 },
    { guard: 'Sarah Johnson', score: 98 },
    { guard: 'Mike Rodriguez', score: 91 },
    { guard: 'Lisa Chen', score: 96 },
    { guard: 'Tom Wilson', score: 87 }
  ]
};

// Equipment Tracking Data
export const mockEquipment = [
  {
    id: 'eq1',
    name: 'Radio Unit #001',
    type: 'Communication',
    assignedTo: 'John Smith',
    status: 'active',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    condition: 'excellent'
  },
  {
    id: 'eq2',
    name: 'Flashlight #023',
    type: 'Lighting',
    assignedTo: 'Mike Rodriguez',
    status: 'active',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-07-05',
    condition: 'good'
  },
  {
    id: 'eq3',
    name: 'Body Camera #012',
    type: 'Recording',
    assignedTo: 'Sarah Johnson',
    status: 'maintenance',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-01-22',
    condition: 'needs_repair'
  }
];