import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  Users, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  Settings,
  Building,
  UserPlus,
  Calendar,
  Package,
  FileText,
  DollarSign,
  Activity,
  TrendingUp,
  Bell,
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
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { AdminLiveMap } from './admin-live-map';

interface GuardData {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'on-duty' | 'off-duty';
  location: string;
  lastSeen: string;
  shiftsThisMonth: number;
  rating: number;
  avatar?: string;
}

interface CompanyData {
  totalRevenue: number;
  monthlyGrowth: number;
  totalGuards: number;
  activeContracts: number;
  totalSites: number;
  incidentsToday: number;
}

const mockGuards: GuardData[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    status: 'on-duty',
    location: 'Downtown Plaza',
    lastSeen: '2 minutes ago',
    shiftsThisMonth: 22,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 234-5678',
    status: 'on-duty',
    location: 'Corporate Center',
    lastSeen: '5 minutes ago',
    shiftsThisMonth: 20,
    rating: 4.9
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.w@company.com',
    phone: '+1 (555) 345-6789',
    status: 'off-duty',
    location: 'Not assigned',
    lastSeen: '2 hours ago',
    shiftsThisMonth: 18,
    rating: 4.6
  }
];

const companyStats: CompanyData = {
  totalRevenue: 245000,
  monthlyGrowth: 12.5,
  totalGuards: 45,
  activeContracts: 28,
  totalSites: 32,
  incidentsToday: 3
};

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGuard, setSelectedGuard] = useState<GuardData | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'off-duty':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">GuardForce Admin</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarFallback>AD</AvatarFallback>
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
              variant={activeTab === 'guards' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('guards')}
            >
              <Users className="mr-2 h-4 w-4" />
              Guard Management
            </Button>
            <Button 
              variant={activeTab === 'sites' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('sites')}
            >
              <Building className="mr-2 h-4 w-4" />
              Site Management
            </Button>
            <Button 
              variant={activeTab === 'scheduling' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('scheduling')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Scheduling
            </Button>
            <Button 
              variant={activeTab === 'incidents' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('incidents')}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Incidents
            </Button>
            <Button 
              variant={activeTab === 'reports' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('reports')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Button>
            <Button 
              variant={activeTab === 'company' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('company')}
            >
              <Building className="mr-2 h-4 w-4" />
              Company
            </Button>
            <Button 
              variant={activeTab === 'settings' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">${companyStats.totalRevenue.toLocaleString()}</p>
                        <div className="flex items-center text-sm text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{companyStats.monthlyGrowth}% this month
                        </div>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Active Guards</p>
                        <p className="text-2xl font-bold">{companyStats.totalGuards}</p>
                        <p className="text-sm text-muted-foreground">
                          {mockGuards.filter(g => g.status === 'on-duty').length} on duty
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
                        <p className="text-sm text-muted-foreground">Active Sites</p>
                        <p className="text-2xl font-bold">{companyStats.totalSites}</p>
                        <p className="text-sm text-muted-foreground">
                          {companyStats.activeContracts} contracts
                        </p>
                      </div>
                      <MapPin className="h-8 w-8 text-purple-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Incidents Today</p>
                        <p className="text-2xl font-bold">{companyStats.incidentsToday}</p>
                        <p className="text-sm text-muted-foreground">2 resolved</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Map */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AdminLiveMap />
                
                {/* Real-time Guard Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Real-time Guard Status</CardTitle>
                    <CardDescription>Current status of all guards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockGuards.map((guard) => (
                        <div key={guard.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{guard.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{guard.name}</p>
                              <p className="text-sm text-muted-foreground">{guard.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(guard.status)}>
                              {guard.status.replace('-', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{guard.lastSeen}</span>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'guards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Guard Management</h2>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Guard
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Guards</CardTitle>
                      <CardDescription>Manage your security personnel</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search guards..." className="pl-9 w-64" />
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
                          <th className="text-left p-3">Guard</th>
                          <th className="text-left p-3">Contact</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Current Location</th>
                          <th className="text-left p-3">Shifts/Month</th>
                          <th className="text-left p-3">Rating</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockGuards.map((guard) => (
                          <tr key={guard.id} className="border-b">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{guard.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{guard.name}</p>
                                  <p className="text-sm text-muted-foreground">ID: {guard.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {guard.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {guard.phone}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge className={getStatusColor(guard.status)}>
                                {guard.status.replace('-', ' ')}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                {guard.location}
                              </div>
                            </td>
                            <td className="p-3">{guard.shiftsThisMonth}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <span>{guard.rating}</span>
                                <span className="text-yellow-500">★</span>
                              </div>
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

          {activeTab === 'company' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Company Management</h2>
              
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="clients">Clients</TabsTrigger>
                  <TabsTrigger value="contracts">Contracts</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="payroll">Payroll</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Monthly Revenue</span>
                          <span className="font-semibold">$85,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Expenses</span>
                          <span className="font-semibold">$62,000</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Net Profit</span>
                          <span className="font-semibold text-green-600">$23,000</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Company Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Employees</span>
                          <span className="font-semibold">{companyStats.totalGuards + 8}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Clients</span>
                          <span className="font-semibold">24</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contract Retention</span>
                          <span className="font-semibold text-green-600">94%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="clients" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Management</CardTitle>
                      <CardDescription>Manage your security service clients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Client management features coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contracts" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contract Management</CardTitle>
                      <CardDescription>View and manage security service contracts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Contract management features coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing & Invoicing</CardTitle>
                      <CardDescription>Manage client billing and invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Billing management features coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payroll" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payroll Management</CardTitle>
                      <CardDescription>Manage guard payroll and timesheets</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Payroll management features coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Placeholder content for other tabs */}
          {activeTab === 'sites' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Site Management</h2>
                <Button>
                  <Building className="mr-2 h-4 w-4" />
                  Add New Site
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Downtown Plaza', status: 'active', guards: 3, address: '123 Main St', contract: 'Premium' },
                  { name: 'Corporate Center', status: 'active', guards: 2, address: '456 Business Ave', contract: 'Standard' },
                  { name: 'Financial District', status: 'maintenance', guards: 1, address: '789 Finance Blvd', contract: 'Premium' },
                ].map((site, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {site.name}
                        <Badge className={site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                          {site.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{site.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Guards On Duty:</span>
                          <span className="font-medium">{site.guards}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contract Type:</span>
                          <span className="font-medium">{site.contract}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Scheduling</h2>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Schedule
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Shifts</CardTitle>
                    <CardDescription>Current shift assignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockGuards.map((guard) => (
                        <div key={guard.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{guard.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{guard.name}</p>
                              <p className="text-sm text-muted-foreground">{guard.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">08:00 - 20:00</p>
                            <Badge className={getStatusColor(guard.status)}>
                              {guard.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                    <CardDescription>Upcoming week overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Advanced scheduling interface would appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Incident Management</h2>
                <Button variant="destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Create Incident
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Open Incidents</p>
                        <p className="text-2xl font-bold text-red-600">3</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Resolved Today</p>
                        <p className="text-2xl font-bold text-green-600">8</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Avg Response Time</p>
                        <p className="text-2xl font-bold">12m</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Incidents</CardTitle>
                  <CardDescription>Latest security incidents and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { id: 'INC-001', type: 'Suspicious Activity', location: 'Main Entrance', priority: 'High', status: 'Open', time: '14:30' },
                      { id: 'INC-002', type: 'Equipment Failure', location: 'Security Office', priority: 'Medium', status: 'In Progress', time: '13:45' },
                      { id: 'INC-003', type: 'Unauthorized Access', location: 'Parking Lot B', priority: 'High', status: 'Resolved', time: '12:15' },
                    ].map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-5 w-5 ${incident.priority === 'High' ? 'text-red-500' : 'text-orange-500'}`} />
                          <div>
                            <p className="font-medium">{incident.id} - {incident.type}</p>
                            <p className="text-sm text-muted-foreground">{incident.location} • {incident.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={incident.priority === 'High' ? 'destructive' : 'default'}>
                            {incident.priority}
                          </Badge>
                          <Badge className={incident.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {incident.status}
                          </Badge>
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
                <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Daily Activity Report', description: 'Guard activities, checkpoints, incidents', type: 'PDF', generated: '2 hours ago' },
                  { title: 'Weekly Performance', description: 'Performance metrics and KPIs', type: 'Excel', generated: '1 day ago' },
                  { title: 'Incident Summary', description: 'Monthly incident analysis', type: 'PDF', generated: '3 days ago' },
                  { title: 'Equipment Status', description: 'Equipment health and maintenance', type: 'PDF', generated: '1 week ago' },
                  { title: 'Guard Schedules', description: 'Shift schedules and coverage', type: 'Excel', generated: '2 days ago' },
                  { title: 'Site Analytics', description: 'Site-specific metrics and trends', type: 'PDF', generated: '5 days ago' },
                ].map((report, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {report.title}
                        <Badge variant="outline">{report.type}</Badge>
                      </CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Generated {report.generated}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">System Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>System security configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Required for all users</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Session Timeout</p>
                        <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                      </div>
                      <span className="text-sm font-medium">30 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Password Policy</p>
                        <p className="text-sm text-muted-foreground">Minimum security requirements</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Strong</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>System alerts and notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Incident Alerts</p>
                        <p className="text-sm text-muted-foreground">Real-time incident notifications</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Daily Reports</p>
                        <p className="text-sm text-muted-foreground">Automated daily summaries</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Maintenance</p>
                        <p className="text-sm text-muted-foreground">Maintenance window notifications</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}