import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Smartphone, 
  CreditCard, 
  QrCode,
  MessageSquare,
  ClipboardList,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';

interface AttendanceRecord {
  guardId: string;
  guardName: string;
  method: 'rfid' | 'qr' | 'manual' | 'sms' | 'supervisor';
  timestamp: string;
  status: 'check-in' | 'check-out' | 'patrol';
  location: string;
  supervisorId?: string;
  isOffline?: boolean;
}

export function AttendanceStation() {
  const [currentTab, setCurrentTab] = useState('rfid');
  const [rfidInput, setRfidInput] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [manualGuardId, setManualGuardId] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [stationLocation] = useState('Main Gate - Station 1');

  // Simulate offline detection
  useEffect(() => {
    const checkConnection = () => {
      setIsOffline(!navigator.onLine);
    };
    
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    checkConnection();
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  const recordAttendance = (record: Omit<AttendanceRecord, 'timestamp' | 'location' | 'isOffline'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      timestamp: new Date().toISOString(),
      location: stationLocation,
      isOffline
    };
    
    setRecentRecords(prev => [newRecord, ...prev.slice(0, 9)]);
    
    // In a real app, this would sync to the server
    if (isOffline) {
      // Store in localStorage for later sync
      const offlineRecords = JSON.parse(localStorage.getItem('offline-attendance') || '[]');
      offlineRecords.push(newRecord);
      localStorage.setItem('offline-attendance', JSON.stringify(offlineRecords));
    } else {
      // Send to server immediately
      console.log('Syncing attendance record:', newRecord);
    }
    
    // Clear inputs
    setRfidInput('');
    setQrInput('');
    setManualGuardId('');
    setSmsCode('');
  };

  const handleRFIDScan = () => {
    if (!rfidInput.trim()) return;
    
    // Mock guard lookup
    const guardName = getGuardName(rfidInput);
    if (guardName) {
      recordAttendance({
        guardId: rfidInput,
        guardName,
        method: 'rfid',
        status: 'check-in'
      });
    }
  };

  const handleQRScan = () => {
    if (!qrInput.trim()) return;
    
    const guardName = getGuardName(qrInput);
    if (guardName) {
      recordAttendance({
        guardId: qrInput,
        guardName,
        method: 'qr',
        status: 'patrol'
      });
    }
  };

  const handleManualEntry = () => {
    if (!manualGuardId.trim()) return;
    
    const guardName = getGuardName(manualGuardId);
    if (guardName) {
      recordAttendance({
        guardId: manualGuardId,
        guardName,
        method: 'manual',
        status: 'check-in'
      });
    }
  };

  const handleSMSVerification = () => {
    if (!smsCode.trim()) return;
    
    // Mock SMS code verification
    const guardInfo = verifySMSCode(smsCode);
    if (guardInfo) {
      recordAttendance({
        guardId: guardInfo.id,
        guardName: guardInfo.name,
        method: 'sms',
        status: 'check-in'
      });
    }
  };

  const getGuardName = (id: string): string | null => {
    // Mock guard database
    const guards: Record<string, string> = {
      'GRD001': 'John Smith',
      'GRD002': 'Sarah Johnson',
      'GRD003': 'Mike Davis',
      'GRD004': 'Lisa Brown',
      'RFID123456': 'John Smith',
      'RFID789012': 'Sarah Johnson',
    };
    return guards[id.toUpperCase()] || null;
  };

  const verifySMSCode = (code: string): { id: string; name: string } | null => {
    // Mock SMS verification
    const codes: Record<string, { id: string; name: string }> = {
      '1234': { id: 'GRD001', name: 'John Smith' },
      '5678': { id: 'GRD002', name: 'Sarah Johnson' },
    };
    return codes[code] || null;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'rfid': return <CreditCard className="h-4 w-4" />;
      case 'qr': return <QrCode className="h-4 w-4" />;
      case 'manual': return <ClipboardList className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'supervisor': return <User className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'check-in': return 'bg-green-100 text-green-800';
      case 'check-out': return 'bg-red-100 text-red-800';
      case 'patrol': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold">Attendance Station</h2>
            <p className="text-sm text-muted-foreground">{stationLocation}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOffline ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline Mode
            </Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
              <Wifi className="h-3 w-3" />
              Online
            </Badge>
          )}
          <span className="text-sm font-mono">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Offline Alert */}
      {isOffline && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Operating in offline mode. Attendance records will be synced when connection is restored.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Attendance Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Attendance Methods */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Check-In Methods</CardTitle>
              <CardDescription>
                Multiple ways for guards to record their attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="rfid" className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    RFID
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="flex items-center gap-1">
                    <QrCode className="h-3 w-3" />
                    QR Code
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-1">
                    <ClipboardList className="h-3 w-3" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    SMS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="rfid" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">RFID Card Scanner</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Guards tap their RFID cards on the reader
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Scan RFID card or enter card ID..."
                        value={rfidInput}
                        onChange={(e) => setRfidInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRFIDScan()}
                      />
                      <Button onClick={handleRFIDScan}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Scan
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">QR Code Scanner</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Scan guard's ID QR code or checkpoint QR code
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Scan QR code or enter code..."
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
                      />
                      <Button onClick={handleQRScan}>
                        <QrCode className="h-4 w-4 mr-2" />
                        Scan
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Manual Entry</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supervisor manually enters guard ID or badge number
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter Guard ID or Badge Number..."
                        value={manualGuardId}
                        onChange={(e) => setManualGuardId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
                      />
                      <Button onClick={handleManualEntry}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Submit
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">SMS Verification</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Guards text a code from their basic phone to check in
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter SMS verification code..."
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSMSVerification()}
                      />
                      <Button onClick={handleSMSVerification}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Guard sends SMS to: <strong>(555) 123-GUARD</strong>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Recent Records */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>
                Last 10 attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent records
                  </p>
                ) : (
                  recentRecords.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {getMethodIcon(record.method)}
                          {record.isOffline && <WifiOff className="h-3 w-3 text-orange-500" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{record.guardName}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Method Information Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              RFID Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Each guard carries an RFID card. Simply tap on the reader for instant check-in.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <QrCode className="h-4 w-4 text-green-600" />
              QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Printed QR codes at checkpoints or on guard badges for easy scanning.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              SMS System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Guards with basic phones can text a unique code to check in from anywhere.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-orange-600" />
              Manual Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Supervisors can manually record attendance for guards without technology.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}