import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { 
  CheckSquare, 
  QrCode, 
  MapPin, 
  Clock, 
  Users,
  Target,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Navigation,
  Timer,
  RefreshCw
} from 'lucide-react';
import { mockCheckpoints, mockShifts, type Checkpoint } from '../data/mock-data';

export function PatrolCheckpoints() {
  const [activeTab, setActiveTab] = useState<'scan' | 'overview' | 'history'>('scan');
  const [scannedCode, setScannedCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [checkpointHistory, setCheckpointHistory] = useState<any[]>([]);
  
  // Mock current shift data
  const currentShift = mockShifts[0]; // Assume first shift is current user's shift
  const siteCheckpoints = mockCheckpoints.filter(cp => cp.site === currentShift.site);
  const completedCheckpoints = checkpointHistory.length;
  const totalCheckpoints = siteCheckpoints.length;
  const completionRate = totalCheckpoints > 0 ? (completedCheckpoints / totalCheckpoints) * 100 : 0;

  useEffect(() => {
    // Simulate some existing checkpoint scans for demo
    const mockHistory = [
      {
        id: '1',
        checkpointId: 'cp1',
        checkpointName: 'Main Entrance',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        notes: 'All clear, no issues observed'
      },
      {
        id: '2',
        checkpointId: 'cp2',
        checkpointName: 'Parking Garage',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        notes: 'Minor lighting issue in section B'
      }
    ];
    setCheckpointHistory(mockHistory);
  }, []);

  const handleScan = () => {
    setScanning(true);
    
    // Simulate QR code scanning
    setTimeout(() => {
      const checkpoint = siteCheckpoints.find(cp => cp.qrCode === scannedCode || cp.id === scannedCode);
      
      if (checkpoint) {
        // Add to history
        const newScan = {
          id: Date.now().toString(),
          checkpointId: checkpoint.id,
          checkpointName: checkpoint.name,
          timestamp: new Date().toISOString(),
          notes: 'Checkpoint scanned successfully'
        };
        setCheckpointHistory(prev => [newScan, ...prev]);
        setScannedCode('');
        alert(`Checkpoint "${checkpoint.name}" scanned successfully!`);
      } else {
        alert('Invalid QR code. Please try again.');
      }
      setScanning(false);
    }, 2000);
  };

  const getCheckpointStatus = (checkpoint: Checkpoint) => {
    const recentScan = checkpointHistory.find(h => h.checkpointId === checkpoint.id);
    if (recentScan) {
      const scanTime = new Date(recentScan.timestamp);
      const now = new Date();
      const hoursSince = (now.getTime() - scanTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince < 2) return 'recent';
      if (hoursSince < 4) return 'okay';
      return 'overdue';
    }
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recent':
        return 'bg-green-100 text-green-800';
      case 'okay':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextCheckpoint = () => {
    const pendingCheckpoints = siteCheckpoints.filter(cp => getCheckpointStatus(cp) === 'pending');
    const overdueCheckpoints = siteCheckpoints.filter(cp => getCheckpointStatus(cp) === 'overdue');
    
    if (overdueCheckpoints.length > 0) return overdueCheckpoints[0];
    if (pendingCheckpoints.length > 0) return pendingCheckpoints[0];
    return siteCheckpoints[0];
  };

  const nextCheckpoint = getNextCheckpoint();

  return (
    <div className="space-y-4">
      {/* Header with Tab Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Patrol Checkpoints</h2>
          <p className="text-sm text-muted-foreground">
            Scan QR codes at designated patrol points
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'scan' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('scan')}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Scan
          </Button>
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            <Target className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button 
            variant={activeTab === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('history')}
          >
            <Clock className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Current Shift Progress
          </CardTitle>
          <CardDescription>
            {currentShift.site} • {currentShift.startTime} - {currentShift.endTime}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Checkpoints Completed</span>
              <span className="font-semibold">{completedCheckpoints}/{totalCheckpoints}</span>
            </div>
            <Progress value={completionRate} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-lg font-semibold text-green-600">{completedCheckpoints}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-lg font-semibold text-orange-600">{totalCheckpoints - completedCheckpoints}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{totalCheckpoints}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeTab === 'scan' && (
        <>
          {/* Next Checkpoint Card */}
          {nextCheckpoint && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  Next Checkpoint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{nextCheckpoint.name}</h3>
                    <p className="text-sm text-muted-foreground">{nextCheckpoint.location}</p>
                    <Badge className={getStatusColor(getCheckpointStatus(nextCheckpoint))}>
                      {getCheckpointStatus(nextCheckpoint)}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Scan the QR code at your checkpoint location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                {scanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Scanning...</p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <QrCode className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-sm">Position QR code in the frame</p>
                    <p className="text-xs">Or enter code manually below</p>
                  </div>
                )}
                
                {/* Scanning overlay */}
                {scanning && (
                  <div className="absolute inset-0 border-2 border-primary rounded-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter QR code manually"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    disabled={scanning}
                  />
                  <Button 
                    onClick={handleScan}
                    disabled={!scannedCode || scanning}
                  >
                    {scanning ? (
                      <>
                        <Timer className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Check In
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Notes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Site Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Checkpoint Map - {currentShift.site}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Interactive Site Map</p>
                  <p className="text-xs">Showing checkpoint locations</p>
                </div>
                
                {/* Mock checkpoint markers */}
                {siteCheckpoints.map((checkpoint, index) => (
                  <div 
                    key={checkpoint.id}
                    className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      getCheckpointStatus(checkpoint) === 'recent' ? 'bg-green-500 text-white' :
                      getCheckpointStatus(checkpoint) === 'okay' ? 'bg-blue-500 text-white' :
                      getCheckpointStatus(checkpoint) === 'overdue' ? 'bg-red-500 text-white' :
                      'bg-orange-500 text-white'
                    }`}
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + (index % 2) * 20}%`
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Checkpoint List */}
          <Card>
            <CardHeader>
              <CardTitle>All Checkpoints</CardTitle>
              <CardDescription>Status of all patrol points in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {siteCheckpoints.map((checkpoint) => {
                  const status = getCheckpointStatus(checkpoint);
                  const lastScan = checkpointHistory.find(h => h.checkpointId === checkpoint.id);
                  
                  return (
                    <div key={checkpoint.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'recent' ? 'bg-green-500' :
                          status === 'okay' ? 'bg-blue-500' :
                          status === 'overdue' ? 'bg-red-500' :
                          'bg-orange-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{checkpoint.name}</p>
                          <p className="text-sm text-muted-foreground">{checkpoint.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                        {lastScan && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(lastScan.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scan History
            </CardTitle>
            <CardDescription>
              Recent checkpoint scans for this shift
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkpointHistory.length > 0 ? (
              <div className="space-y-3">
                {checkpointHistory.map((scan) => (
                  <div key={scan.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{scan.checkpointName}</p>
                      <p className="text-sm text-muted-foreground">{scan.notes}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scan.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No checkpoints scanned yet</p>
                <p className="text-sm">Start your patrol to see scan history</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-semibold">{completedCheckpoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold">{totalCheckpoints - completedCheckpoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-xl font-semibold">{Math.round(completionRate)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-semibold">
                  {siteCheckpoints.filter(cp => getCheckpointStatus(cp) === 'overdue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}