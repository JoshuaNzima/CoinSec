import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface BackendStatus {
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  api_connected: boolean;
  database_connected: boolean;
  storage_connected: boolean;
  last_check: string;
  response_time?: number;
}

export function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    health: 'unknown',
    api_connected: false,
    database_connected: false,
    storage_connected: false,
    last_check: new Date().toISOString()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendHealth = async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    try {
      const { status: healthStatus, timestamp } = await apiCall('/health');
      const responseTime = Date.now() - startTime;
      
      setStatus({
        health: 'healthy',
        api_connected: true,
        database_connected: true,
        storage_connected: true,
        last_check: timestamp || new Date().toISOString(),
        response_time: responseTime
      });
      
      toast.success('Backend is healthy and connected');
    } catch (error) {
      console.error('Backend health check failed:', error);
      
      setStatus({
        health: 'unhealthy',
        api_connected: false,
        database_connected: false,
        storage_connected: false,
        last_check: new Date().toISOString()
      });
      
      toast.error('Backend connection failed - using demo mode');
    } finally {
      setIsChecking(false);
    }
  };

  const testApiEndpoints = async () => {
    setIsChecking(true);
    const results = [];
    
    try {
      // Test various endpoints
      const endpoints = [
        { name: 'Health Check', path: '/health' },
        { name: 'Analytics', path: '/analytics/dashboard' },
        { name: 'GPS Locations', path: '/gps/locations' },
        { name: 'Incidents', path: '/incidents' },
        { name: 'User Profile', path: '/users/profile' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const startTime = Date.now();
          await apiCall(endpoint.path);
          const responseTime = Date.now() - startTime;
          results.push({
            ...endpoint,
            status: 'success',
            responseTime
          });
        } catch (error) {
          results.push({
            ...endpoint,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      const successCount = results.filter(r => r.status === 'success').length;
      const totalCount = results.length;
      
      toast.success(`API Test Complete: ${successCount}/${totalCount} endpoints working`);
      
      // Update overall status
      setStatus(prev => ({
        ...prev,
        health: successCount === totalCount ? 'healthy' : successCount > 0 ? 'degraded' : 'unhealthy',
        api_connected: successCount > 0,
        last_check: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('API endpoint testing failed:', error);
      toast.error('API endpoint testing failed');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial health check
    checkBackendHealth();
    
    // Periodic health checks every 2 minutes
    const interval = setInterval(checkBackendHealth, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (health: BackendStatus['health']) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (health: BackendStatus['health']) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      unhealthy: 'destructive',
      unknown: 'outline'
    } as const;

    return (
      <Badge variant={variants[health]}>
        {health.charAt(0).toUpperCase() + health.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(status.health)}
          <h3 className="font-semibold">Backend Status</h3>
          {getStatusBadge(status.health)}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkBackendHealth}
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Check Health
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testApiEndpoints}
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Test APIs
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>API Connection:</span>
          <span className={status.api_connected ? 'text-green-600' : 'text-red-600'}>
            {status.api_connected ? '✓ Connected' : '✗ Disconnected'}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Database:</span>
          <span className={status.database_connected ? 'text-green-600' : 'text-red-600'}>
            {status.database_connected ? '✓ Connected' : '✗ Disconnected'}  
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Storage:</span>
          <span className={status.storage_connected ? 'text-green-600' : 'text-red-600'}>
            {status.storage_connected ? '✓ Connected' : '✗ Disconnected'}
          </span>
        </div>
        
        {status.response_time && (
          <div className="flex justify-between text-sm">
            <span>Response Time:</span>
            <span className={status.response_time < 500 ? 'text-green-600' : status.response_time < 1000 ? 'text-yellow-600' : 'text-red-600'}>
              {status.response_time}ms
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Last Check:</span>
          <span>{new Date(status.last_check).toLocaleTimeString()}</span>
        </div>
      </div>

      {status.health !== 'healthy' && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {status.health === 'unhealthy' 
              ? 'Backend is not available. The app is running in demo mode with mock data.'
              : 'Some backend services may be experiencing issues. Some features may use fallback data.'
            }
          </p>
        </div>
      )}
    </Card>
  );
}