import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Shield, 
  User, 
  Lock, 
  Eye, 
  Download, 
  Filter,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Key,
  Smartphone,
  Database,
  FileText
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'authentication' | 'data' | 'system' | 'security' | 'user';
  description: string;
  ipAddress: string;
  location?: string;
  deviceInfo: string;
  result: 'success' | 'failure' | 'warning';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

const mockAuditData: AuditEvent[] = [
  {
    id: '1',
    timestamp: '2024-12-19T14:30:15Z',
    userId: 'guard-001',
    userName: 'John Doe',
    action: 'Login',
    category: 'authentication',
    description: 'User logged in successfully using biometric authentication',
    ipAddress: '192.168.1.100',
    location: 'Downtown Plaza - Security Office',
    deviceInfo: 'Mobile App v2.1.0 (iOS 17.2)',
    result: 'success',
    riskLevel: 'low',
    metadata: { 
      loginMethod: 'biometric',
      sessionId: 'sess_abc123',
      mfaUsed: true
    }
  },
  {
    id: '2',
    timestamp: '2024-12-19T14:25:03Z',
    userId: 'guard-001',
    userName: 'John Doe',
    action: 'Incident Report Created',
    category: 'data',
    description: 'Created incident report #INR-2024-1219-001',
    ipAddress: '192.168.1.100',
    location: 'Main Entrance',
    deviceInfo: 'Mobile App v2.1.0 (iOS 17.2)',
    result: 'success',
    riskLevel: 'low',
    metadata: {
      reportId: 'INR-2024-1219-001',
      incidentType: 'suspicious_activity',
      attachments: 2
    }
  },
  {
    id: '3',
    timestamp: '2024-12-19T14:15:22Z',
    userId: 'guard-001',
    userName: 'John Doe',
    action: 'Equipment Checkout',
    category: 'system',
    description: 'Checked out radio equipment RAD-001',
    ipAddress: '192.168.1.100',
    location: 'Equipment Room A',
    deviceInfo: 'Mobile App v2.1.0 (iOS 17.2)',
    result: 'success',
    riskLevel: 'low',
    metadata: {
      equipmentId: 'RAD-001',
      serialNumber: 'RAD-001',
      batteryLevel: 100
    }
  },
  {
    id: '4',
    timestamp: '2024-12-19T13:45:12Z',
    userId: 'admin-001',
    userName: 'System Admin',
    action: 'Failed Login Attempt',
    category: 'security',
    description: 'Multiple failed login attempts detected',
    ipAddress: '203.0.113.15',
    deviceInfo: 'Unknown Device',
    result: 'failure',
    riskLevel: 'high',
    metadata: {
      attemptCount: 5,
      blocked: true,
      reason: 'invalid_credentials'
    }
  },
  {
    id: '5',
    timestamp: '2024-12-19T13:30:45Z',
    userId: 'guard-001',
    userName: 'John Doe',
    action: 'Data Export',
    category: 'data',
    description: 'Exported checkpoint data for date range 2024-12-15 to 2024-12-19',
    ipAddress: '192.168.1.100',
    location: 'Security Office',
    deviceInfo: 'Web App v1.8.2 (Chrome 120.0)',
    result: 'success',
    riskLevel: 'medium',
    metadata: {
      exportType: 'checkpoint_data',
      recordCount: 156,
      format: 'CSV'
    }
  }
];

export function AuditTrail() {
  const [auditData, setAuditData] = useState<AuditEvent[]>(mockAuditData);
  const [filteredData, setFilteredData] = useState<AuditEvent[]>(mockAuditData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const applyFilters = () => {
    let filtered = auditData;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    if (resultFilter) {
      filtered = filtered.filter(event => event.result === resultFilter);
    }

    if (riskFilter) {
      filtered = filtered.filter(event => event.riskLevel === riskFilter);
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, resultFilter, riskFilter, auditData]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Key className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      case 'system': return <Smartphone className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failure': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'critical': return 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Category', 'Result', 'Risk Level', 'IP Address', 'Location', 'Description'].join(','),
      ...filteredData.map(event => [
        event.timestamp,
        event.userName,
        event.action,
        event.category,
        event.result,
        event.riskLevel,
        event.ipAddress,
        event.location || '',
        event.description
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setResultFilter('');
    setRiskFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Audit Trail
          </CardTitle>
          <CardDescription>
            Complete log of all security-related activities and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600">
                {filteredData.filter(e => e.result === 'success').length}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-2xl font-bold text-red-600">
                {filteredData.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="text-2xl font-bold text-orange-600">
                {filteredData.filter(e => e.result === 'failure').length}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="outline" size="sm" onClick={exportAuditLog}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Result</label>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All results</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Level</label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All risk levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All risk levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Events */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>
            Showing {filteredData.length} events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredData.map((event) => (
            <div key={event.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex flex-col items-center gap-1 min-w-0">
                    {getCategoryIcon(event.category)}
                    {getResultIcon(event.result)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{event.action}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.userName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {event.ipAddress}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.deviceInfo}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <Badge className={getRiskColor(event.riskLevel)}>
                    {event.riskLevel.toUpperCase()}
                  </Badge>
                  <Badge variant={event.result === 'success' ? 'secondary' : 'destructive'}>
                    {event.result.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}