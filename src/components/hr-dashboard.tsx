import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  FileText,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  GraduationCap,
  Shield,
  BarChart3,
  Building,
  Star,
  MapPin,
  Settings,
  CreditCard,
  PieChart,
  Calculator,
  Receipt,
  Briefcase,
  UserCheck,
  Clock3,
  Target,
  BookOpen,
  AlertCircle,
  Percent
} from 'lucide-react';
import { 
  mockEmployees, 
  mockPayrollRecords, 
  mockExpenses, 
  mockFinancialSummary,
  type Employee,
  type PayrollRecord,
  type Expense
} from '../data/mock-data';

interface HRMetrics {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  turnoverRate: number;
  avgSalary: number;
  openPositions: number;
  trainingCompliance: number;
}

const hrMetrics: HRMetrics = {
  totalEmployees: 53,
  activeEmployees: 48,
  newHires: 8,
  turnoverRate: 12.5,
  avgSalary: 48500,
  openPositions: 5,
  trainingCompliance: 87
};

export function HRDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on-leave':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'inactive':
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'hr':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'guard':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredEmployees = mockEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">HR Management System</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
            <Avatar>
              <AvatarFallback>HR</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Button 
              variant={activeTab === 'overview' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button 
              variant={activeTab === 'employees' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('employees')}
            >
              <Users className="mr-2 h-4 w-4" />
              Employee Management
            </Button>
            <Button 
              variant={activeTab === 'recruitment' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('recruitment')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Recruitment
            </Button>
            <Button 
              variant={activeTab === 'payroll' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('payroll')}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Payroll & Benefits
            </Button>
            <Button 
              variant={activeTab === 'performance' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('performance')}
            >
              <Award className="mr-2 h-4 w-4" />
              Performance
            </Button>
            <Button 
              variant={activeTab === 'training' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('training')}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Training & Development
            </Button>
            <Button 
              variant={activeTab === 'compliance' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('compliance')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Compliance
            </Button>
            <Button 
              variant={activeTab === 'reports' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('reports')}
            >
              <FileText className="mr-2 h-4 w-4" />
              HR Reports
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">HR Overview</h2>
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Employees</p>
                        <p className="text-2xl font-bold">{hrMetrics.totalEmployees}</p>
                        <p className="text-sm text-green-600">
                          +{hrMetrics.newHires} new hires
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Active Employees</p>
                        <p className="text-2xl font-bold">{hrMetrics.activeEmployees}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((hrMetrics.activeEmployees / hrMetrics.totalEmployees) * 100)}% active
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Avg. Salary</p>
                        <p className="text-2xl font-bold">${hrMetrics.avgSalary.toLocaleString()}</p>
                        <p className="text-sm text-green-600">
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                          +5.2% vs last year
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Open Positions</p>
                        <p className="text-2xl font-bold">{hrMetrics.openPositions}</p>
                        <p className="text-sm text-orange-600">
                          {hrMetrics.turnoverRate}% turnover rate
                        </p>
                      </div>
                      <UserPlus className="h-8 w-8 text-orange-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Department Distribution</CardTitle>
                    <CardDescription>Employee count by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Security Operations</span>
                        <div className="flex items-center gap-2">
                          <Progress value={75} className="w-20" />
                          <span className="text-sm font-medium">38</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Administration</span>
                        <div className="flex items-center gap-2">
                          <Progress value={25} className="w-20" />
                          <span className="text-sm font-medium">8</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Human Resources</span>
                        <div className="flex items-center gap-2">
                          <Progress value={15} className="w-20" />
                          <span className="text-sm font-medium">4</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>IT Support</span>
                        <div className="flex items-center gap-2">
                          <Progress value={8} className="w-20" />
                          <span className="text-sm font-medium">3</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Training Compliance</CardTitle>
                    <CardDescription>Overall training completion rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {hrMetrics.trainingCompliance}%
                        </div>
                        <p className="text-sm text-muted-foreground">Overall compliance</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Security Training</span>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Safety Training</span>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">First Aid/CPR</span>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent HR Activities</CardTitle>
                  <CardDescription>Latest HR actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'New hire onboarding completed', employee: 'Alex Rodriguez', time: '2 hours ago', type: 'hire' },
                      { action: 'Performance review scheduled', employee: 'John Doe', time: '4 hours ago', type: 'review' },
                      { action: 'Training course assigned', employee: 'Sarah Johnson', time: '1 day ago', type: 'training' },
                      { action: 'Leave request approved', employee: 'Mike Wilson', time: '2 days ago', type: 'leave' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'hire' ? 'bg-green-100' :
                          activity.type === 'review' ? 'bg-blue-100' :
                          activity.type === 'training' ? 'bg-purple-100' :
                          'bg-orange-100'
                        }`}>
                          {activity.type === 'hire' && <UserPlus className="h-4 w-4 text-green-600" />}
                          {activity.type === 'review' && <Star className="h-4 w-4 text-blue-600" />}
                          {activity.type === 'training' && <GraduationCap className="h-4 w-4 text-purple-600" />}
                          {activity.type === 'leave' && <Calendar className="h-4 w-4 text-orange-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.employee} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Employee Management</h2>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Employee
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Employees</CardTitle>
                      <CardDescription>Manage your workforce</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search employees..." 
                          className="pl-9 w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button variant="outline">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Employee</th>
                          <th className="text-left p-3">Role & Department</th>
                          <th className="text-left p-3">Contact</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Performance</th>
                          <th className="text-left p-3">Salary</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((employee) => (
                          <tr key={employee.id} className="border-b">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{employee.name}</p>
                                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <Badge className={getRoleColor(employee.role)}>
                                  {employee.role.toUpperCase()}
                                </Badge>
                                <p className="text-sm text-muted-foreground">{employee.department}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {employee.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {employee.phone}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge className={getStatusColor(employee.status)}>
                                {employee.status.replace('-', ' ')}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{employee.performance}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-medium">${employee.salary.toLocaleString()}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Payroll & Benefits</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Payroll
                  </Button>
                  <Button>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process Payment
                  </Button>
                </div>
              </div>

              {/* Payroll Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Payroll</p>
                        <p className="text-2xl font-bold">$187,250</p>
                        <p className="text-sm text-green-600">This month</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Benefits Cost</p>
                        <p className="text-2xl font-bold">$23,480</p>
                        <p className="text-sm text-muted-foreground">Monthly</p>
                      </div>
                      <Shield className="h-8 w-8 text-blue-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Tax Deductions</p>
                        <p className="text-2xl font-bold">$42,350</p>
                        <p className="text-sm text-orange-600">
                          <Percent className="h-3 w-3 inline mr-1" />
                          22.6%
                        </p>
                      </div>
                      <Receipt className="h-8 w-8 text-orange-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Net Payments</p>
                        <p className="text-2xl font-bold">$144,900</p>
                        <p className="text-sm text-green-600">Ready to pay</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payroll Records Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Pay Period</CardTitle>
                  <CardDescription>January 1-15, 2024 Payroll Records</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Regular Hours</TableHead>
                        <TableHead>Overtime Hours</TableHead>
                        <TableHead>Gross Pay</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Pay</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPayrollRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{record.employeeName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{record.employeeName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{record.regularHours}h</TableCell>
                          <TableCell>{record.overtimeHours}h</TableCell>
                          <TableCell>${record.grossPay.toLocaleString()}</TableCell>
                          <TableCell>${(record.taxes + record.benefits).toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">${record.netPay.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={
                              record.status === 'paid' ? 'bg-green-100 text-green-800' :
                              record.status === 'processed' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }>
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Benefits Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Benefits Enrollment</CardTitle>
                    <CardDescription>Employee benefits participation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Health Insurance</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85} className="w-20" />
                          <span className="text-sm font-medium">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Dental Insurance</span>
                        <div className="flex items-center gap-2">
                          <Progress value={72} className="w-20" />
                          <span className="text-sm font-medium">72%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>401(k) Plan</span>
                        <div className="flex items-center gap-2">
                          <Progress value={68} className="w-20" />
                          <span className="text-sm font-medium">68%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Life Insurance</span>
                        <div className="flex items-center gap-2">
                          <Progress value={92} className="w-20" />
                          <span className="text-sm font-medium">92%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expense Management</CardTitle>
                    <CardDescription>Recent expense requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Receipt className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{expense.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {expense.submittedBy} • {expense.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${expense.amount.toLocaleString()}</p>
                            <Badge className={
                              expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                              expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }>
                              {expense.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'recruitment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Recruitment</h2>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </div>

              {/* Recruitment Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Open Positions</p>
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-orange-600">Urgent: 3</p>
                      </div>
                      <Briefcase className="h-8 w-8 text-orange-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Applications</p>
                        <p className="text-2xl font-bold">156</p>
                        <p className="text-sm text-green-600">+28 this week</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Interviews</p>
                        <p className="text-2xl font-bold">23</p>
                        <p className="text-sm text-muted-foreground">Scheduled</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Avg. Time to Hire</p>
                        <p className="text-2xl font-bold">18</p>
                        <p className="text-sm text-muted-foreground">Days</p>
                      </div>
                      <Clock3 className="h-8 w-8 text-purple-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Open Positions */}
              <Card>
                <CardHeader>
                  <CardTitle>Open Positions</CardTitle>
                  <CardDescription>Current job openings and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'Senior Security Guard', location: 'Downtown Plaza', applications: 45, urgency: 'high' },
                      { title: 'Night Shift Supervisor', location: 'Corporate Center', applications: 23, urgency: 'medium' },
                      { title: 'Security Guard', location: 'Shopping Mall', applications: 67, urgency: 'low' },
                      { title: 'Security Coordinator', location: 'Multiple Sites', applications: 21, urgency: 'high' }
                    ].map((position, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            position.urgency === 'high' ? 'bg-red-100' :
                            position.urgency === 'medium' ? 'bg-orange-100' :
                            'bg-green-100'
                          }`}>
                            <Briefcase className={`h-4 w-4 ${
                              position.urgency === 'high' ? 'text-red-600' :
                              position.urgency === 'medium' ? 'text-orange-600' :
                              'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{position.title}</p>
                            <p className="text-sm text-muted-foreground">{position.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{position.applications} applications</p>
                            <Badge className={
                              position.urgency === 'high' ? 'bg-red-100 text-red-800' :
                              position.urgency === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {position.urgency} priority
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            View Applications
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Performance Management</h2>
                <Button>
                  <Target className="mr-2 h-4 w-4" />
                  Start Review Cycle
                </Button>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Avg. Performance</p>
                        <p className="text-2xl font-bold">4.2/5.0</p>
                        <p className="text-sm text-green-600">+0.3 vs last quarter</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Reviews Due</p>
                        <p className="text-2xl font-bold">8</p>
                        <p className="text-sm text-orange-600">This month</p>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Goal Achievement</p>
                        <p className="text-2xl font-bold">78%</p>
                        <p className="text-sm text-green-600">Company average</p>
                      </div>
                      <Target className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Top Performers</p>
                        <p className="text-2xl font-bold">15</p>
                        <p className="text-sm text-muted-foreground">Above 4.5 rating</p>
                      </div>
                      <Award className="h-8 w-8 text-purple-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Distribution</CardTitle>
                    <CardDescription>Employee ratings across the organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Exceptional (4.5-5.0)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={30} className="w-20" />
                          <span className="text-sm font-medium">15 employees</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Exceeds (4.0-4.4)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={45} className="w-20" />
                          <span className="text-sm font-medium">22 employees</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Meets (3.0-3.9)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={20} className="w-20" />
                          <span className="text-sm font-medium">10 employees</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Needs Improvement (2.0-2.9)</span>
                        <div className="flex items-center gap-2">
                          <Progress value={5} className="w-20" />
                          <span className="text-sm font-medium">3 employees</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Reviews</CardTitle>
                    <CardDescription>Performance reviews scheduled</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'John Smith', role: 'Security Guard', date: '2024-01-25', status: 'scheduled' },
                        { name: 'Sarah Johnson', role: 'Supervisor', date: '2024-01-28', status: 'pending' },
                        { name: 'Mike Rodriguez', role: 'Security Guard', date: '2024-01-30', status: 'overdue' },
                        { name: 'Emily Davis', role: 'HR Manager', date: '2024-02-02', status: 'scheduled' }
                      ].map((review, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{review.name}</p>
                              <p className="text-xs text-muted-foreground">{review.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{review.date}</p>
                            <Badge className={
                              review.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              review.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {review.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Training & Development</h2>
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create Training Program
                </Button>
              </div>

              {/* Training Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Overall Compliance</p>
                        <p className="text-2xl font-bold">87%</p>
                        <p className="text-sm text-green-600">+5% this quarter</p>
                      </div>
                      <GraduationCap className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Active Programs</p>
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-muted-foreground">Running</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-blue-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Certifications Due</p>
                        <p className="text-2xl font-bold">23</p>
                        <p className="text-sm text-orange-600">Next 30 days</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-orange-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Training Hours</p>
                        <p className="text-2xl font-bold">1,247</p>
                        <p className="text-sm text-muted-foreground">This month</p>
                      </div>
                      <Clock3 className="h-8 w-8 text-purple-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Training Programs */}
              <Card>
                <CardHeader>
                  <CardTitle>Training Programs</CardTitle>
                  <CardDescription>Available training courses and completion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Security Fundamentals', participants: 45, completed: 42, duration: '8 hours', type: 'mandatory' },
                      { name: 'First Aid & CPR', participants: 38, completed: 35, duration: '6 hours', type: 'mandatory' },
                      { name: 'Conflict Resolution', participants: 25, completed: 18, duration: '4 hours', type: 'optional' },
                      { name: 'Emergency Response', participants: 32, completed: 28, duration: '5 hours', type: 'mandatory' },
                      { name: 'Customer Service', participants: 20, completed: 15, duration: '3 hours', type: 'optional' }
                    ].map((program, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{program.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {program.duration} • {program.participants} participants
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(program.completed / program.participants) * 100} 
                                className="w-20" 
                              />
                              <span className="text-sm font-medium">
                                {Math.round((program.completed / program.participants) * 100)}%
                              </span>
                            </div>
                            <Badge className={
                              program.type === 'mandatory' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }>
                              {program.type}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Compliance Management</h2>
                <Button>
                  <Shield className="mr-2 h-4 w-4" />
                  Generate Compliance Report
                </Button>
              </div>

              {/* Compliance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Overall Compliance</p>
                        <p className="text-2xl font-bold">94%</p>
                        <p className="text-sm text-green-600">Above target</p>
                      </div>
                      <Shield className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Licenses Valid</p>
                        <p className="text-2xl font-bold">47/48</p>
                        <p className="text-sm text-orange-600">1 expiring soon</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Background Checks</p>
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-sm text-green-600">All current</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Training Compliance</p>
                        <p className="text-2xl font-bold">87%</p>
                        <p className="text-sm text-orange-600">13% overdue</p>
                      </div>
                      <GraduationCap className="h-8 w-8 text-orange-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Issues */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Alerts</CardTitle>
                  <CardDescription>Items requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: 'license', employee: 'Mike Rodriguez', issue: 'Security license expires in 15 days', severity: 'high' },
                      { type: 'training', employee: 'John Smith', issue: 'CPR certification overdue by 30 days', severity: 'medium' },
                      { type: 'background', employee: 'New Hire', issue: 'Background check pending review', severity: 'high' },
                      { type: 'medical', employee: 'Sarah Johnson', issue: 'Medical clearance expires next month', severity: 'low' }
                    ].map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            alert.severity === 'high' ? 'bg-red-100' :
                            alert.severity === 'medium' ? 'bg-orange-100' :
                            'bg-yellow-100'
                          }`}>
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === 'high' ? 'text-red-600' :
                              alert.severity === 'medium' ? 'text-orange-600' :
                              'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{alert.issue}</p>
                            <p className="text-xs text-muted-foreground">{alert.employee}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {alert.severity}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">HR Reports</h2>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Reports
                </Button>
              </div>

              {/* Report Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Reports</CardTitle>
                    <CardDescription>Payroll and budget analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        'Monthly Payroll Summary',
                        'Benefits Cost Analysis',
                        'Department Budget Report',
                        'Overtime Analysis'
                      ].map((report, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{report}</span>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Reports</CardTitle>
                    <CardDescription>Employee performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        'Performance Summary',
                        'Goal Achievement Report',
                        'Training Completion',
                        'Certification Status'
                      ].map((report, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{report}</span>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Reports</CardTitle>
                    <CardDescription>Regulatory and compliance status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        'License Status Report',
                        'Background Check Summary',
                        'Training Compliance',
                        'Audit Trail Report'
                      ].map((report, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{report}</span>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle>HR Analytics Dashboard</CardTitle>
                  <CardDescription>Key metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Turnover by Department</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Security Operations</span>
                          <span className="text-sm font-medium">8.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Administration</span>
                          <span className="text-sm font-medium">12.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Human Resources</span>
                          <span className="text-sm font-medium">5.2%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Hiring Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Time to Fill (avg.)</span>
                          <span className="text-sm font-medium">18 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Cost per Hire</span>
                          <span className="text-sm font-medium">$2,450</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Quality of Hire</span>
                          <span className="text-sm font-medium">4.2/5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}