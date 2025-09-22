import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { 
  Clock, 
  User, 
  Calendar, 
  MapPin, 
  Smartphone, 
  PhoneOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Filter,
  Search,
  Plus,
  Edit
} from 'lucide-react';

interface Guard {
  id: string;
  name: string;
  badge: string;
  hasSmartphone: boolean;
  primaryMethod: 'smartphone' | 'rfid' | 'qr' | 'sms' | 'manual';
  shift: 'day' | 'night' | 'swing';
  site: string;
  status: 'active' | 'inactive' | 'on-duty' | 'off-duty';
  phoneNumber?: string;
  rfidCard?: string;
}

interface AttendanceRecord {
  id: string;
  guardId: string;
  guardName: string;
  timestamp: string;
  method: 'smartphone' | 'rfid' | 'qr' | 'sms' | 'manual' | 'supervisor';
  action: 'check-in' | 'check-out' | 'patrol' | 'break-start' | 'break-end';
  location: string;
  notes?: string;
  verifiedBy?: string;
  duration?: number; // in minutes
}

export function GuardAttendanceManager() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize with mock data
  useEffect(() => {
    setGuards(mockGuards);
    setAttendanceRecords(mockAttendanceRecords);
  }, []);

  const manualCheckIn = (guardId: string, action: AttendanceRecord['action']) => {
    const guard = guards.find(g => g.id === guardId);
    if (!guard) return;

    const newRecord: AttendanceRecord = {
      id: `manual-${Date.now()}`,
      guardId,
      guardName: guard.name,
      timestamp: new Date().toISOString(),
      method: 'manual',
      action,
      location: guard.site,
      verifiedBy: 'Supervisor',
      notes: 'Manual entry by supervisor'
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
  };

  const getMethodIcon = (method: string, hasSmartphone: boolean) => {
    if (!hasSmartphone) {
      return <PhoneOff className="h-4 w-4 text-red-500" />;
    }
    return <Smartphone className="h-4 w-4 text-green-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty': return 'bg-green-100 text-green-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'check-in': return 'bg-green-100 text-green-800';
      case 'check-out': return 'bg-red-100 text-red-800';
      case 'patrol': return 'bg-blue-100 text-blue-800';
      case 'break-start': return 'bg-yellow-100 text-yellow-800';
      case 'break-end': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGuards = guards.filter(guard => {
    const matchesSearch = guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guard.badge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = filterSite === 'all' || guard.site === filterSite;
    return matchesSearch && matchesSite;
  });

  const filteredRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
    const matchesDate = recordDate === selectedDate;
    const matchesMethod = filterMethod === 'all' || record.method === filterMethod;
    return matchesDate && matchesMethod;
  });

  const smartphoneStats = {
    total: guards.length,
    withSmartphone: guards.filter(g => g.hasSmartphone).length,
    withoutSmartphone: guards.filter(g => !g.hasSmartphone).length,
    alternativeMethodsNeeded: guards.filter(g => !g.hasSmartphone).length
  };

  const exportAttendanceReport = () => {
    // In a real app, this would generate a CSV/PDF report
    console.log('Exporting attendance report for', selectedDate);
    alert('Attendance report exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Guards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smartphoneStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <Smartphone className="h-4 w-4 text-green-600" />
              With Smartphones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {smartphoneStats.withSmartphone}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((smartphoneStats.withSmartphone / smartphoneStats.total) * 100)}% of total
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <PhoneOff className="h-4 w-4 text-red-600" />
              Without Smartphones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {smartphoneStats.withoutSmartphone}
            </div>
            <div className="text-xs text-muted-foreground">
              Need alternative methods
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today's Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredRecords.filter(r => r.action === 'check-in').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alternative Methods Alert */}
      {smartphoneStats.withoutSmartphone > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {smartphoneStats.withoutSmartphone} guards need alternative attendance tracking methods. 
            Consider implementing RFID cards, QR code stations, or SMS check-in systems.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="guards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="guards">Guard Management</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="manual">Manual Check-in</TabsTrigger>
        </TabsList>

        <TabsContent value="guards" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search guards..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterSite} onValueChange={setFilterSite}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    <SelectItem value="Downtown Plaza">Downtown Plaza</SelectItem>
                    <SelectItem value="Corporate Center">Corporate Center</SelectItem>
                    <SelectItem value="Shopping Mall">Shopping Mall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Guards Table */}
          <Card>
            <CardHeader>
              <CardTitle>Guard Technology Status</CardTitle>
              <CardDescription>
                Overview of guards and their attendance tracking capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guard</TableHead>
                    <TableHead>Technology</TableHead>
                    <TableHead>Primary Method</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuards.map((guard) => (
                    <TableRow key={guard.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{guard.name}</div>
                          <div className="text-sm text-muted-foreground">{guard.badge}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon('', guard.hasSmartphone)}
                          <span className="text-sm">
                            {guard.hasSmartphone ? 'Smartphone' : 'No Smartphone'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {guard.primaryMethod.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{guard.site}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {guard.shift}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(guard.status)}>
                          {guard.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!guard.hasSmartphone && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => manualCheckIn(guard.id, 'check-in')}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          {/* Date and Method Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="smartphone">Smartphone</SelectItem>
                    <SelectItem value="rfid">RFID Card</SelectItem>
                    <SelectItem value="qr">QR Code</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportAttendanceReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records - {selectedDate}</CardTitle>
              <CardDescription>
                All check-ins and activities for the selected date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Verified By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No attendance records found for the selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{record.guardName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionColor(record.action)}>
                            {record.action.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {record.method.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.location}</TableCell>
                        <TableCell>{record.verifiedBy || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Check-in Station</CardTitle>
              <CardDescription>
                For guards without smartphones or when technology fails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {guards.filter(g => !g.hasSmartphone).map((guard) => (
                  <div key={guard.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{guard.name}</div>
                        <div className="text-sm text-muted-foreground">{guard.badge} • {guard.site}</div>
                      </div>
                      <Badge className={getStatusColor(guard.status)}>
                        {guard.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => manualCheckIn(guard.id, 'check-in')}
                        className="flex-1"
                      >
                        Check In
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => manualCheckIn(guard.id, 'check-out')}
                        className="flex-1"
                      >
                        Check Out
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mock data
const mockGuards: Guard[] = [
  {
    id: 'guard-001',
    name: 'John Smith',
    badge: 'GRD-001',
    hasSmartphone: true,
    primaryMethod: 'smartphone',
    shift: 'day',
    site: 'Downtown Plaza',
    status: 'on-duty',
    phoneNumber: '+1-555-0101'
  },
  {
    id: 'guard-002',
    name: 'Maria Garcia',
    badge: 'GRD-002',
    hasSmartphone: false,
    primaryMethod: 'rfid',
    shift: 'night',
    site: 'Corporate Center',
    status: 'off-duty',
    rfidCard: 'RFID-123456'
  },
  {
    id: 'guard-003',
    name: 'James Wilson',
    badge: 'GRD-003',
    hasSmartphone: false,
    primaryMethod: 'sms',
    shift: 'swing',
    site: 'Shopping Mall',
    status: 'on-duty',
    phoneNumber: '+1-555-0103'
  },
  {
    id: 'guard-004',
    name: 'Sarah Johnson',
    badge: 'GRD-004',
    hasSmartphone: true,
    primaryMethod: 'smartphone',
    shift: 'day',
    site: 'Downtown Plaza',
    status: 'on-duty',
    phoneNumber: '+1-555-0104'
  },
  {
    id: 'guard-005',
    name: 'Robert Brown',
    badge: 'GRD-005',
    hasSmartphone: false,
    primaryMethod: 'manual',
    shift: 'night',
    site: 'Corporate Center',
    status: 'off-duty'
  }
];

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    guardId: 'guard-001',
    guardName: 'John Smith',
    timestamp: new Date().toISOString(),
    method: 'smartphone',
    action: 'check-in',
    location: 'Downtown Plaza'
  },
  {
    id: '2',
    guardId: 'guard-002',
    guardName: 'Maria Garcia',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    method: 'rfid',
    action: 'check-in',
    location: 'Corporate Center',
    verifiedBy: 'RFID System'
  },
  {
    id: '3',
    guardId: 'guard-003',
    guardName: 'James Wilson',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    method: 'sms',
    action: 'patrol',
    location: 'Shopping Mall',
    verifiedBy: 'SMS Gateway'
  }
];