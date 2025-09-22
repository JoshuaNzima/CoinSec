import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Search,
  QrCode,
  Camera,
  Battery,
  Radio,
  Shield,
  Smartphone,
  Flashlight,
  Key,
  Clipboard,
  Tool,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface Equipment {
  id: string;
  name: string;
  type: 'radio' | 'flashlight' | 'keys' | 'badge' | 'device' | 'weapon' | 'misc';
  serialNumber: string;
  status: 'available' | 'checked-out' | 'maintenance' | 'missing';
  checkedOutBy?: string;
  checkedOutDate?: string;
  batteryLevel?: number;
  lastMaintenance?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  notes?: string;
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Two-Way Radio',
    type: 'radio',
    serialNumber: 'RAD-001',
    status: 'checked-out',
    checkedOutBy: 'John Doe',
    checkedOutDate: '2024-12-19T08:00:00Z',
    batteryLevel: 85,
    lastMaintenance: '2024-12-15',
    condition: 'excellent',
    location: 'Downtown Plaza',
    notes: 'Primary communication device'
  },
  {
    id: '2',
    name: 'LED Flashlight',
    type: 'flashlight',
    serialNumber: 'FLT-003',
    status: 'checked-out',
    checkedOutBy: 'John Doe',
    checkedOutDate: '2024-12-19T08:00:00Z',
    batteryLevel: 65,
    condition: 'good',
    location: 'Downtown Plaza'
  },
  {
    id: '3',
    name: 'Master Key Set',
    type: 'keys',
    serialNumber: 'KEY-007',
    status: 'checked-out',
    checkedOutBy: 'John Doe',
    checkedOutDate: '2024-12-19T08:00:00Z',
    condition: 'excellent',
    location: 'Downtown Plaza'
  },
  {
    id: '4',
    name: 'Backup Radio',
    type: 'radio',
    serialNumber: 'RAD-002',
    status: 'available',
    batteryLevel: 100,
    lastMaintenance: '2024-12-10',
    condition: 'good',
    location: 'Equipment Room A'
  },
  {
    id: '5',
    name: 'Security Badge',
    type: 'badge',
    serialNumber: 'BDG-101',
    status: 'maintenance',
    lastMaintenance: '2024-12-18',
    condition: 'fair',
    location: 'Maintenance',
    notes: 'RFID chip needs replacement'
  }
];

export function EquipmentTracking() {
  const [equipment, setEquipment] = useState(mockEquipment);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutNotes, setCheckoutNotes] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'checked-out': return 'bg-blue-500';
      case 'maintenance': return 'bg-orange-500';
      case 'missing': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-orange-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'radio': return <Radio className="h-5 w-5" />;
      case 'flashlight': return <Flashlight className="h-5 w-5" />;
      case 'keys': return <Key className="h-5 w-5" />;
      case 'badge': return <Shield className="h-5 w-5" />;
      case 'device': return <Smartphone className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckout = (item: Equipment) => {
    setSelectedEquipment(item);
    setShowCheckout(true);
  };

  const handleCheckin = (item: Equipment) => {
    setEquipment(prev => prev.map(eq => 
      eq.id === item.id 
        ? { ...eq, status: 'available', checkedOutBy: undefined, checkedOutDate: undefined }
        : eq
    ));
    toast.success(`${item.name} checked in successfully`);
  };

  const confirmCheckout = () => {
    if (selectedEquipment) {
      setEquipment(prev => prev.map(eq => 
        eq.id === selectedEquipment.id 
          ? { 
              ...eq, 
              status: 'checked-out',
              checkedOutBy: 'John Doe',
              checkedOutDate: new Date().toISOString(),
              notes: checkoutNotes || eq.notes
            }
          : eq
      ));
      toast.success(`${selectedEquipment.name} checked out successfully`);
      setShowCheckout(false);
      setSelectedEquipment(null);
      setCheckoutNotes('');
    }
  };

  const myEquipment = equipment.filter(item => item.checkedOutBy === 'John Doe');
  const availableEquipment = equipment.filter(item => item.status === 'available');

  return (
    <div className="space-y-6">
      {/* Search and Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Equipment Management
          </CardTitle>
          <CardDescription>
            Track and manage security equipment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Scan
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded bg-green-50 dark:bg-green-900/20">
              <div className="text-lg font-bold text-green-600">{availableEquipment.length}</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div className="text-center p-2 rounded bg-blue-50 dark:bg-blue-900/20">
              <div className="text-lg font-bold text-blue-600">{myEquipment.length}</div>
              <div className="text-xs text-muted-foreground">Checked Out</div>
            </div>
            <div className="text-center p-2 rounded bg-orange-50 dark:bg-orange-900/20">
              <div className="text-lg font-bold text-orange-600">
                {equipment.filter(item => item.status === 'maintenance').length}
              </div>
              <div className="text-xs text-muted-foreground">Maintenance</div>
            </div>
            <div className="text-center p-2 rounded bg-red-50 dark:bg-red-900/20">
              <div className="text-lg font-bold text-red-600">
                {equipment.filter(item => item.status === 'missing').length}
              </div>
              <div className="text-xs text-muted-foreground">Missing</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Equipment */}
      {myEquipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Equipment
            </CardTitle>
            <CardDescription>
              Equipment currently checked out to you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myEquipment.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                    {getEquipmentIcon(item.type)}
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.serialNumber} • {item.location}
                    </div>
                    {item.batteryLevel && (
                      <div className="flex items-center gap-1 text-sm">
                        <Battery className="h-3 w-3" />
                        <span className={item.batteryLevel < 20 ? 'text-red-600' : 'text-green-600'}>
                          {item.batteryLevel}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getConditionColor(item.condition)}>
                    {item.condition}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => handleCheckin(item)}>
                    Check In
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>All Equipment</CardTitle>
          <CardDescription>
            View and manage all equipment inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {getEquipmentIcon(item.type)}
                  </div>
                  <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${getStatusColor(item.status)}`} />
                </div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.serialNumber} • {item.location}
                  </div>
                  {item.batteryLevel && (
                    <div className="flex items-center gap-1 text-sm">
                      <Battery className="h-3 w-3" />
                      <span className={item.batteryLevel < 20 ? 'text-red-600' : 'text-green-600'}>
                        {item.batteryLevel}%
                      </span>
                    </div>
                  )}
                  {item.checkedOutBy && (
                    <div className="text-sm text-muted-foreground">
                      Checked out by: {item.checkedOutBy}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getConditionColor(item.condition)}>
                  {item.condition}
                </Badge>
                <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
                {item.status === 'available' && (
                  <Button size="sm" onClick={() => handleCheckout(item)}>
                    Check Out
                  </Button>
                )}
                {item.status === 'checked-out' && item.checkedOutBy === 'John Doe' && (
                  <Button size="sm" variant="outline" onClick={() => handleCheckin(item)}>
                    Check In
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Checkout Modal */}
      {showCheckout && selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Check Out Equipment</CardTitle>
              <CardDescription>
                {selectedEquipment.name} ({selectedEquipment.serialNumber})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this checkout..."
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={confirmCheckout} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Checkout
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCheckout(false);
                    setSelectedEquipment(null);
                    setCheckoutNotes('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}