import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Database,
  Sync,
  HardDrive,
  CloudOff
} from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface SyncItem {
  id: string;
  type: 'incident' | 'checkpoint' | 'report' | 'photo' | 'log';
  title: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  timestamp: string;
  size: string;
  retryCount: number;
}

const mockSyncData: SyncItem[] = [
  {
    id: '1',
    type: 'incident',
    title: 'Suspicious Activity Report #001',
    status: 'synced',
    timestamp: '2024-12-19T14:30:00Z',
    size: '2.4 KB',
    retryCount: 0
  },
  {
    id: '2',
    type: 'photo',
    title: 'Evidence Photo - Parking Lot',
    status: 'pending',
    timestamp: '2024-12-19T14:25:00Z',
    size: '1.2 MB',
    retryCount: 0
  },
  {
    id: '3',
    type: 'checkpoint',
    title: 'Checkpoint A1 Scan',
    status: 'syncing',
    timestamp: '2024-12-19T14:15:00Z',
    size: '0.8 KB',
    retryCount: 0
  },
  {
    id: '4',
    type: 'report',
    title: 'Hourly Activity Log',
    status: 'failed',
    timestamp: '2024-12-19T13:00:00Z',
    size: '3.1 KB',
    retryCount: 2
  }
];

export function OfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncData, setSyncData] = useState<SyncItem[]>(mockSyncData);
  const [autoSync, setAutoSync] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageUsed, setStorageUsed] = useState(45); // MB

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored - starting auto-sync');
      if (autoSync) {
        handleSyncAll();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Connection lost - working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'syncing': return <Sync className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident': return '🚨';
      case 'checkpoint': return '📍';
      case 'report': return '📄';
      case 'photo': return '📷';
      case 'log': return '📝';
      default: return '📄';
    }
  };

  const handleSyncItem = async (itemId: string) => {
    if (!isOnline) {
      toast.error('Cannot sync - no internet connection');
      return;
    }

    setSyncData(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'syncing' } : item
    ));

    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSyncData(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'synced' } : item
    ));

    toast.success('Item synced successfully');
  };

  const handleSyncAll = async () => {
    if (!isOnline) {
      toast.error('Cannot sync - no internet connection');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    const pendingItems = syncData.filter(item => item.status === 'pending' || item.status === 'failed');
    
    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      
      setSyncData(prev => prev.map(syncItem => 
        syncItem.id === item.id ? { ...syncItem, status: 'syncing' } : syncItem
      ));

      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSyncData(prev => prev.map(syncItem => 
        syncItem.id === item.id ? { ...syncItem, status: 'synced' } : syncItem
      ));

      setSyncProgress(((i + 1) / pendingItems.length) * 100);
    }

    setIsSyncing(false);
    setSyncProgress(0);
    toast.success(`Synced ${pendingItems.length} items successfully`);
  };

  const handleRetryFailed = async () => {
    const failedItems = syncData.filter(item => item.status === 'failed');
    
    for (const item of failedItems) {
      setSyncData(prev => prev.map(syncItem => 
        syncItem.id === item.id 
          ? { ...syncItem, status: 'pending', retryCount: syncItem.retryCount + 1 }
          : syncItem
      ));
    }

    toast.success(`Queued ${failedItems.length} failed items for retry`);
  };

  const clearSyncedItems = () => {
    setSyncData(prev => prev.filter(item => item.status !== 'synced'));
    toast.success('Cleared synced items');
  };

  const pendingCount = syncData.filter(item => item.status === 'pending').length;
  const failedCount = syncData.filter(item => item.status === 'failed').length;
  const syncedCount = syncData.filter(item => item.status === 'synced').length;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={isOnline ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Connection Status
          </CardTitle>
          <CardDescription>
            {isOnline ? 'Connected to server - data will sync automatically' : 'Working offline - data will sync when connection is restored'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant={isOnline ? 'secondary' : 'destructive'} className={isOnline ? 'bg-green-100 text-green-800' : ''}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            {isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                disabled={isSyncing || pendingCount === 0}
              >
                <Sync className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync All'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Progress */}
      {isSyncing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Syncing data...</span>
                <span>{Math.round(syncProgress)}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sync Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600">{syncedCount}</div>
              <div className="text-sm text-muted-foreground">Synced</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">{storageUsed}</div>
              <div className="text-sm text-muted-foreground">MB Used</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sync Queue</CardTitle>
            <div className="flex gap-2">
              {failedCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleRetryFailed}>
                  Retry Failed
                </Button>
              )}
              {syncedCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearSyncedItems}>
                  Clear Synced
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Items waiting to be synchronized with the server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {syncData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CloudOff className="h-12 w-12 mx-auto mb-2" />
              <p>No items in sync queue</p>
            </div>
          ) : (
            syncData.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="text-lg">{getTypeIcon(item.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()} • {item.size}
                      {item.retryCount > 0 && ` • ${item.retryCount} retries`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <Badge variant="outline" className="capitalize">
                    {item.status}
                  </Badge>
                  {item.status === 'pending' && isOnline && (
                    <Button size="sm" variant="outline" onClick={() => handleSyncItem(item.id)}>
                      <Upload className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Storage Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Local Storage
          </CardTitle>
          <CardDescription>
            Manage offline data storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Used</span>
              <span>{storageUsed} MB of 100 MB</span>
            </div>
            <Progress value={storageUsed} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Backup Data
            </Button>
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}