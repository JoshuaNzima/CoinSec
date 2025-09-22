// Comprehensive mock data for the guard services application (Malawi localized)
import { convertUSDToMWK, formatMalawianPhone, malawianLocations } from '../utils/locale';

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

export interface Client {
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
}

export interface GuardResource {
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
}

export interface Canine {
  id: string;
  name: string;
  breed: string;
  age: number;
  handler: string;
  certifications: string[];
  status: 'available' | 'assigned' | 'training' | 'medical_leave';
  specialization: string[];
  lastVetCheck: string;
}

export interface Assignment {
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
  createdBy: string;
  createdAt: string;
}

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'guard',
    badge: 'GRD-001',
    phone: formatMalawianPhone('0999123456'),
    email: 'john.smith@guardforce.com',
    hireDate: '2023-01-15',
    salary: convertUSDToMWK(45000),
    status: 'active',
    certifications: ['Security Guard License', 'First Aid', 'CPR'],
    site: 'City Centre Lilongwe',
    shift: 'Day Shift'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'supervisor',
    badge: 'SUP-001',
    phone: formatMalawianPhone('0998234567'),
    email: 'sarah.johnson@guardforce.com',
    hireDate: '2022-08-20',
    salary: convertUSDToMWK(65000),
    status: 'active',
    certifications: ['Supervisor Certification', 'Security Management', 'Conflict Resolution'],
    site: 'Capital Hill Complex'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    role: 'guard',
    badge: 'GRD-002',
    phone: formatMalawianPhone('0997345678'),
    email: 'mike.rodriguez@guardforce.com',
    hireDate: '2023-03-10',
    salary: convertUSDToMWK(47000),
    status: 'active',
    certifications: ['Security Guard License', 'Emergency Response'],
    site: 'Lilongwe Shopping Centre',
    shift: 'Night Shift'
  },
  {
    id: '4',
    name: 'Emily Davis',
    role: 'hr',
    badge: 'HR-001',
    phone: formatMalawianPhone('0996456789'),
    email: 'emily.davis@guardforce.com',
    hireDate: '2021-11-05',
    salary: convertUSDToMWK(75000),
    status: 'active',
    certifications: ['HR Certification', 'Payroll Management']
  },
  {
    id: '5',
    name: 'David Wilson',
    role: 'admin',
    badge: 'ADM-001',
    phone: formatMalawianPhone('0995567890'),
    email: 'david.wilson@guardforce.com',
    hireDate: '2020-06-01',
    salary: convertUSDToMWK(95000),
    status: 'active',
    certifications: ['Security Management', 'Business Administration']
  }
];

// Mock Sites
export const mockSites: Site[] = [
  {
    id: '1',
    name: 'City Centre Lilongwe',
    address: 'Area 10, Lilongwe',
    coordinates: { lat: -13.9626, lng: 33.7741 },
    status: 'active',
    guards: ['1', '3'],
    checkpoints: ['cp1', 'cp2', 'cp3'],
    contractValue: convertUSDToMWK(250000),
    clientContact: 'City Centre Management Ltd'
  },
  {
    id: '2',
    name: 'Capital Hill Complex',
    address: 'Capital Hill, Lilongwe',
    coordinates: { lat: -13.9833, lng: 33.7833 },
    status: 'active',
    guards: ['2'],
    checkpoints: ['cp4', 'cp5'],
    contractValue: convertUSDToMWK(180000),
    clientContact: 'Government Complex Authority'
  },
  {
    id: '3',
    name: 'Lilongwe Shopping Centre',
    address: 'Old Town, Lilongwe',
    coordinates: { lat: -13.9700, lng: 33.7900 },
    status: 'active',
    guards: ['3'],
    checkpoints: ['cp6', 'cp7', 'cp8'],
    contractValue: convertUSDToMWK(320000),
    clientContact: 'Lilongwe Retail Properties'
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
    site: 'City Centre Lilongwe',
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
    site: 'Capital Hill Complex',
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
    site: 'Lilongwe Shopping Centre',
    category: 'Medical'
  }
];

// Mock Shifts
export const mockShifts: Shift[] = [
  {
    id: '1',
    guardId: '1',
    guardName: 'John Smith',
    site: 'City Centre Lilongwe',
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
    site: 'Lilongwe Shopping Centre',
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
    site: 'Capital Hill Complex',
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
    site: 'City Centre Lilongwe',
    qrCode: 'QR001',
    lastChecked: '2024-01-21T10:30:00Z',
    checkedBy: 'John Smith',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 'cp2',
    name: 'Parking Garage',
    location: 'Level B1',
    site: 'City Centre Lilongwe',
    qrCode: 'QR002',
    lastChecked: '2024-01-21T11:00:00Z',
    checkedBy: 'John Smith',
    coordinates: { lat: 40.7129, lng: -74.0061 }
  },
  {
    id: 'cp3',
    name: 'Emergency Exit',
    location: 'East Wing',
    site: 'City Centre Lilongwe',
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
    regularRate: convertUSDToMWK(22.50),
    overtimeRate: convertUSDToMWK(33.75),
    grossPay: convertUSDToMWK(1968.75),
    taxes: convertUSDToMWK(315.00),
    benefits: convertUSDToMWK(125.00),
    netPay: convertUSDToMWK(1528.75),
    status: 'processed'
  },
  {
    id: '2',
    employeeId: '3',
    employeeName: 'Mike Rodriguez',
    period: '2024-01-01 to 2024-01-15',
    regularHours: 80,
    overtimeHours: 8,
    regularRate: convertUSDToMWK(23.50),
    overtimeRate: convertUSDToMWK(35.25),
    grossPay: convertUSDToMWK(2162.00),
    taxes: convertUSDToMWK(345.92),
    benefits: convertUSDToMWK(125.00),
    netPay: convertUSDToMWK(1691.08),
    status: 'processed'
  },
  {
    id: '3',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    period: '2024-01-01 to 2024-01-15',
    regularHours: 80,
    overtimeHours: 3,
    regularRate: convertUSDToMWK(31.25),
    overtimeRate: convertUSDToMWK(46.88),
    grossPay: convertUSDToMWK(2640.64),
    taxes: convertUSDToMWK(422.50),
    benefits: convertUSDToMWK(150.00),
    netPay: convertUSDToMWK(2068.14),
    status: 'paid'
  }
];

// Mock Expenses
export const mockExpenses: Expense[] = [
  {
    id: '1',
    category: 'equipment',
    description: 'New security radios (5 units)',
    amount: convertUSDToMWK(1250.00),
    date: '2024-01-15',
    submittedBy: 'Sarah Johnson',
    status: 'approved'
  },
  {
    id: '2',
    category: 'training',
    description: 'CPR/First Aid certification course',
    amount: convertUSDToMWK(350.00),
    date: '2024-01-18',
    submittedBy: 'Emily Davis',
    status: 'pending'
  },
  {
    id: '3',
    category: 'vehicle',
    description: 'Patrol vehicle fuel and maintenance',
    amount: convertUSDToMWK(285.50),
    date: '2024-01-19',
    submittedBy: 'John Smith',
    status: 'approved'
  }
];

// Financial Summary Data
export const mockFinancialSummary = {
  monthlyRevenue: convertUSDToMWK(245000),
  monthlyExpenses: convertUSDToMWK(185000),
  netProfit: convertUSDToMWK(60000),
  profitMargin: 24.5,
  totalContracts: 32,
  activeGuards: 48,
  overhead: {
    payroll: convertUSDToMWK(120000),
    equipment: convertUSDToMWK(15000),
    training: convertUSDToMWK(8000),
    vehicles: convertUSDToMWK(12000),
    insurance: convertUSDToMWK(18000),
    other: convertUSDToMWK(12000)
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
    { site: 'City Centre Lilongwe', compliance: 95 },
    { site: 'Capital Hill Complex', compliance: 88 },
    { site: 'Lilongwe Shopping Centre', compliance: 92 },
    { site: 'Industrial Area', compliance: 78 },
    { site: 'Kamuzu Central Hospital', compliance: 98 }
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

// Mock Clients for Assignment Management
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Kamuzu Central Hospital',
    contactPerson: 'Dr. James Phiri',
    email: 'security@kch.mw',
    phone: formatMalawianPhone('0888789456'),
    address: 'PO Box 149',
    city: 'Lilongwe',
    contractValue: convertUSDToMWK(45000),
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    status: 'active',
    requiresCanines: true,
    sitesCount: 3,
    notes: 'High security hospital requiring 24/7 coverage'
  },
  {
    id: '2',
    name: 'Lilongwe Shopping Centre',
    contactPerson: 'Mary Banda',
    email: 'security@lsc.mw',
    phone: formatMalawianPhone('0887456789'),
    address: 'City Centre',
    city: 'Lilongwe',
    contractValue: convertUSDToMWK(32000),
    contractStartDate: '2024-02-01',
    contractEndDate: '2025-01-31',
    status: 'active',
    requiresCanines: false,
    sitesCount: 1,
    notes: 'Shopping mall with multiple entrances'
  },
  {
    id: '3',
    name: 'Capital Hill Complex',
    contactPerson: 'John Mwale',
    email: 'facilities@caphill.gov.mw',
    phone: formatMalawianPhone('0886234567'),
    address: 'Capital Hill',
    city: 'Lilongwe',
    contractValue: convertUSDToMWK(78000),
    contractStartDate: '2024-01-15',
    contractEndDate: '2025-01-14',
    status: 'active',
    requiresCanines: true,
    sitesCount: 5,
    notes: 'Government complex requiring highest security clearance'
  }
];

// Mock Guard Resources for Assignment Management
export const mockGuardResources: GuardResource[] = [
  {
    id: 'g1',
    name: 'Francis Phiri',
    badge: 'GRD-001',
    role: 'Senior Guard',
    experience: 8,
    certifications: ['Basic Security', 'Fire Safety', 'First Aid'],
    status: 'available',
    location: 'Lilongwe',
    phoneNumber: formatMalawianPhone('0999123456'),
    specializations: ['Hospital Security', 'Emergency Response']
  },
  {
    id: 'g2',
    name: 'Grace Banda',
    badge: 'GRD-002',
    role: 'Guard',
    experience: 3,
    certifications: ['Basic Security', 'Customer Service'],
    status: 'assigned',
    location: 'Lilongwe',
    phoneNumber: formatMalawianPhone('0999234567'),
    specializations: ['Retail Security', 'Access Control']
  },
  {
    id: 'g3',
    name: 'Peter Mwale',
    badge: 'GRD-003',
    role: 'Guard Captain',
    experience: 12,
    certifications: ['Advanced Security', 'Leadership', 'Crisis Management'],
    status: 'available',
    location: 'Lilongwe',
    phoneNumber: formatMalawianPhone('0999345678'),
    specializations: ['VIP Protection', 'Team Leadership']
  },
  {
    id: 'g4',
    name: 'Alice Tembo',
    badge: 'GRD-004',
    role: 'Guard',
    experience: 5,
    certifications: ['Basic Security', 'CCTV Operations'],
    status: 'available',
    location: 'Blantyre',
    phoneNumber: formatMalawianPhone('0999456789'),
    specializations: ['CCTV Monitoring', 'Report Writing']
  }
];

// Mock Canines for Assignment Management
export const mockCanines: Canine[] = [
  {
    id: 'c1',
    name: 'Rex',
    breed: 'German Shepherd',
    age: 5,
    handler: 'Francis Phiri',
    certifications: ['Drug Detection', 'Patrol', 'Protection'],
    status: 'available',
    specialization: ['Drug Detection', 'Perimeter Security'],
    lastVetCheck: '2024-01-15'
  },
  {
    id: 'c2',
    name: 'Luna',
    breed: 'Belgian Malinois',
    age: 3,
    handler: 'Peter Mwale',
    certifications: ['Explosives Detection', 'Tracking'],
    status: 'assigned',
    specialization: ['Explosives Detection', 'VIP Protection'],
    lastVetCheck: '2024-01-20'
  },
  {
    id: 'c3',
    name: 'Max',
    breed: 'Labrador',
    age: 4,
    handler: 'James Nyirenda',
    certifications: ['Search and Rescue', 'Patrol'],
    status: 'available',
    specialization: ['Search Operations', 'Public Safety'],
    lastVetCheck: '2024-01-10'
  }
];

// Mock Assignments
export const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    clientId: '1',
    guardIds: ['g2'],
    canineIds: ['c2'],
    siteName: 'Main Hospital Building',
    startDate: '2024-01-01',
    shiftType: '24hour',
    status: 'active',
    requirements: '24/7 security with canine support for drug detection',
    budget: convertUSDToMWK(15000),
    createdBy: 'admin',
    createdAt: '2023-12-15'
  },
  {
    id: 'a2',
    clientId: '2',
    guardIds: ['g1', 'g4'],
    canineIds: [],
    siteName: 'Shopping Centre Main Entrance',
    startDate: '2024-02-01',
    shiftType: 'day',
    status: 'active',
    requirements: 'Day shift coverage for main entrance and CCTV monitoring',
    budget: convertUSDToMWK(8000),
    createdBy: 'supervisor',
    createdAt: '2024-01-15'
  }
];