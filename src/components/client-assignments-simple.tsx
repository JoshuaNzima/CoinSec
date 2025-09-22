import React from 'react';
import { useAuth } from '../contexts/auth-context';

export function ClientAssignments() {
  const { user } = useAuth();

  // Check permissions
  const canManageAssignments = user?.role === 'admin' || user?.role === 'supervisor';

  if (!canManageAssignments) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">⚠️</div>
        <h2>Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to manage client assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1>Client & Assignment Management</h1>
        <p className="text-muted-foreground">Manage guard and canine assignments to clients</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-card border rounded-lg p-6">
          <div className="mb-4">
            <h3 className="font-medium">🏥 Kamuzu Central Hospital - Main Building</h3>
            <div className="text-sm text-muted-foreground mt-1">
              Started: January 1, 2024 • Status: Active
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Assigned Guards (1)</h4>
              <div className="p-2 bg-muted rounded">
                <div className="font-medium">Francis Phiri</div>
                <div className="text-sm text-muted-foreground">GRD-001 • Senior Guard</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Assigned Canines (1)</h4>
              <div className="p-2 bg-muted rounded">
                <div className="font-medium">Rex</div>
                <div className="text-sm text-muted-foreground">German Shepherd • Drug Detection</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Assignment Details</h4>
              <div className="space-y-1">
                <div className="text-sm">Budget: MK12,000,000</div>
                <div className="text-sm">Shift: 24 Hour</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="mb-4">
            <h3 className="font-medium">🏪 Lilongwe Shopping Centre - Main Entrance</h3>
            <div className="text-sm text-muted-foreground mt-1">
              Started: February 1, 2024 • Status: Active
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Assigned Guards (2)</h4>
              <div className="space-y-2">
                <div className="p-2 bg-muted rounded">
                  <div className="font-medium">Grace Banda</div>
                  <div className="text-sm text-muted-foreground">GRD-002 • Guard</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="font-medium">Alice Tembo</div>
                  <div className="text-sm text-muted-foreground">GRD-004 • Guard</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Assigned Canines (0)</h4>
              <p className="text-sm text-muted-foreground">No canines assigned</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Assignment Details</h4>
              <div className="space-y-1">
                <div className="text-sm">Budget: MK6,400,000</div>
                <div className="text-sm">Shift: Day Shift</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">2</div>
            <div className="text-sm text-muted-foreground">Active Assignments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Guards Deployed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">1</div>
            <div className="text-sm text-muted-foreground">Canines Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}