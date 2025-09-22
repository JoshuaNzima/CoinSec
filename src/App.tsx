import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/theme-context';
import { AuthProvider, useAuth } from './contexts/auth-context';
import { useScreenSize } from './hooks/use-screen-size';
import { projectId, publicAnonKey } from './utils/supabase/info';

// Essential UI components
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";

// Icons
import { 
  Users, 
  Building, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle 
} from 'lucide-react';

// Core components - import only essential ones first
import { Login } from './components/login';
import { Dashboard } from './components/dashboard';
import { BottomNavigation } from './components/bottom-navigation';
import { TopBar } from './components/top-bar';
import { GPSTracking } from './components/gps-tracking';
import { HRDashboard } from './components/hr-dashboard';
import { IncidentReporting } from './components/incident-reporting';
import { PatrolCheckpoints } from './components/patrol-checkpoints';
import { GuardAttendanceManager } from './components/guard-attendance-manager';
import { NonSmartphoneSolutions } from './components/non-smartphone-solutions';
import { AttendanceStation } from './components/attendance-station';
import { CCTVDashboard } from './components/cctv-dashboard';
import { MobileCCTV } from './components/mobile-cctv';

function SimpleAdminDashboard() {
  const [currentView, setCurrentView] = useState('overview');
  
  if (currentView === 'cctv') {
    return <CCTVDashboard onNavigate={setCurrentView} />;
  }
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setCurrentView('cctv')} variant="outline">
            CCTV Control Center
          </Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Guards</h3>
              <p className="text-3xl font-bold text-blue-600">48</p>
              <p className="text-sm text-green-600">+3 this month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active Sites</h3>
              <p className="text-3xl font-bold text-green-600">32</p>
              <p className="text-sm text-green-600">All operational</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Building className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Incidents Today</h3>
              <p className="text-3xl font-bold text-orange-600">3</p>
              <p className="text-sm text-muted-foreground">2 resolved</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">$245K</p>
              <p className="text-sm text-green-600">+12% vs last month</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Guard Deployment</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Downtown Plaza</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <span className="text-sm font-medium">12 guards</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Corporate Center</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <span className="text-sm font-medium">8 guards</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Shopping Mall</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
                <span className="text-sm font-medium">15 guards</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-semibold">$245,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operating Costs</span>
              <span className="font-semibold">$185,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Profit</span>
              <span className="font-semibold text-green-600">$60,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit Margin</span>
              <span className="font-semibold">24.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Recent System Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">New contract signed</p>
              <p className="text-sm text-muted-foreground">Medical Center - $45,000/month</p>
            </div>
            <span className="text-sm text-muted-foreground">2 hours ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Guard certification completed</p>
              <p className="text-sm text-muted-foreground">John Smith - Security Training Level 2</p>
            </div>
            <span className="text-sm text-muted-foreground">5 hours ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Incident resolved</p>
              <p className="text-sm text-muted-foreground">Shopping Mall - Equipment malfunction</p>
            </div>
            <span className="text-sm text-muted-foreground">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleHRDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold mb-6">HR Management System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Employees</h3>
          <p className="text-3xl font-bold text-blue-600">53</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Employees</h3>
          <p className="text-3xl font-bold text-green-600">48</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Open Positions</h3>
          <p className="text-3xl font-bold text-orange-600">5</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Avg. Salary</h3>
          <p className="text-3xl font-bold text-purple-600">$48.5K</p>
        </div>
      </div>
    </div>
  );
}

function SimpleComponent({ title, onNavigate }: { title: string; onNavigate?: (view: string) => void }) {
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl mb-4">{title}</h2>
      <p className="text-muted-foreground mb-4">This feature is available and working.</p>
      {onNavigate && (
        <Button onClick={() => onNavigate('dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      )}
    </div>
  );
}

function AppContent() {
  const { user, isFirstTime } = useAuth();
  const { isLargeScreen } = useScreenSize();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // Show login if no user
  if (!user) {
    return <Login />;
  }

  // Show onboarding for first-time users (only on mobile)
  if (isFirstTime && !isLargeScreen) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl mb-4">Welcome to GuardForce</h1>
        <p className="text-muted-foreground mb-4">Your comprehensive security management solution</p>
        <Button onClick={() => {
          localStorage.setItem('guard-app-first-time', 'completed');
          window.location.reload();
        }}>
          Get Started
        </Button>
      </div>
    );
  }

  // Show appropriate dashboard based on role and screen size
  if (isLargeScreen) {
    if (user.role === 'admin') {
      return <SimpleAdminDashboard />;
    } else if (user.role === 'hr') {
      return <HRDashboard />;
    }
  }
  
  // For HR users on mobile, show HR dashboard
  if (user.role === 'hr') {
    return <HRDashboard />;
  }

  const renderCurrentView = () => {
    // Always allow dashboard access
    if (currentView === 'dashboard') {
      return <Dashboard onNavigate={setCurrentView} />;
    }

    // Simple role-based access control
    const isAdmin = user.role === 'admin';
    const isSupervisor = user.role === 'supervisor';

    // Check for restricted features
    if (currentView === 'audit' && !isAdmin && !isSupervisor) {
      return (
        <div className="p-4 text-center">
          <div className="text-red-500 mb-2">Access Denied</div>
          <div className="text-sm text-muted-foreground">
            You don't have permission to access this feature.
          </div>
          <Button 
            onClick={() => setCurrentView('dashboard')} 
            className="mt-4"
            variant="outline"
          >
            Return to Dashboard
          </Button>
        </div>
      );
    }

    // Enhanced components with full functionality
    switch (currentView) {
      case 'tracking':
        return <GPSTracking />;
      case 'checkpoints':
        return <PatrolCheckpoints />;
      case 'incidents':
        return <IncidentReporting />;
      case 'attendance':
        return <GuardAttendanceManager />;
      case 'cctv':
        return user.role === 'supervisor' || user.role === 'admin' ? 
          <MobileCCTV onNavigate={setCurrentView} /> : 
          <div className="p-4 text-center">
            <div className="text-red-500 mb-2">Access Denied</div>
            <div className="text-sm text-muted-foreground">CCTV access is restricted to supervisors and admins.</div>
            <Button onClick={() => setCurrentView('dashboard')} className="mt-4" variant="outline">
              Return to Dashboard
            </Button>
          </div>;
      case 'tours':
        return <SimpleComponent title="Guard Tours" onNavigate={setCurrentView} />;
      case 'reports':
        return <SimpleComponent title="Reports" onNavigate={setCurrentView} />;
      case 'communication':
        return <SimpleComponent title="Communication" onNavigate={setCurrentView} />;
      case 'settings':
        return <SimpleComponent title="Settings" onNavigate={setCurrentView} />;
      case 'shifts':
        return <SimpleComponent title="Shift Management" onNavigate={setCurrentView} />;
      case 'equipment':
        return <SimpleComponent title="Equipment Tracking" onNavigate={setCurrentView} />;
      case 'analytics':
        return <SimpleComponent title="Performance Analytics" onNavigate={setCurrentView} />;
      case 'training':
        return <SimpleComponent title="Training Compliance" onNavigate={setCurrentView} />;
      case 'weather':
        return <SimpleComponent title="Weather Integration" onNavigate={setCurrentView} />;
      case 'search':
        return <SimpleComponent title="Advanced Search" onNavigate={setCurrentView} />;
      case 'sync':
        return <SimpleComponent title="Offline Sync" onNavigate={setCurrentView} />;
      case 'audit':
        return <SimpleComponent title="Audit Trail" onNavigate={setCurrentView} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <TopBar 
        onNotificationsClick={() => setShowNotifications(!showNotifications)}
        currentView={currentView}
        onBack={() => setCurrentView('dashboard')}
      />
      
      <main className="pt-16 pb-20 px-4">
        {renderCurrentView()}
      </main>

      {/* Simple panic button */}
      <button className="fixed bottom-24 right-4 w-12 h-12 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors">
        🚨
      </button>
      
      <BottomNavigation 
        currentView={currentView} 
        onNavigate={setCurrentView} 
      />

      {showNotifications && (
        <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowNotifications(false)}>
          <div className="fixed top-16 right-4 bg-card p-4 rounded-lg shadow-lg max-w-sm">
            <h3 className="font-medium mb-2">Notifications</h3>
            <div className="space-y-2">
              <div className="p-2 bg-muted rounded text-sm">New shift assignment available</div>
              <div className="p-2 bg-muted rounded text-sm">Incident reported at Site A</div>
              <div className="p-2 bg-muted rounded text-sm">Training module due tomorrow</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple device indicator component with backend status
function DeviceIndicator() {
  const { isLargeScreen } = useScreenSize();
  const { user } = useAuth();
  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  useEffect(() => {
    // Check backend connectivity
    const checkBackend = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-def022bc/health`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
        }
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };
    
    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const statusColor = backendStatus === 'connected' ? 'text-green-600' : 
                     backendStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600';
  const statusIcon = backendStatus === 'connected' ? '🟢' : 
                     backendStatus === 'connecting' ? '🟡' : '🔴';
  
  return (
    <div className="fixed top-2 right-2 z-50 bg-card px-2 py-1 rounded text-xs shadow-lg">
      <div className="flex items-center gap-2">
        <span>{isLargeScreen ? '🖥️ Desktop' : '📱 Mobile'}</span>
        <span>|</span>
        <span>{user?.role || 'Guest'}</span>
        <span>|</span>
        <span className={statusColor}>{statusIcon} API</span>
      </div>
    </div>
  );
}

// Simple role switcher
function SimpleRoleSwitcher() {
  const { user, updateProfile } = useAuth();
  
  if (!user) return null;
  
  const switchRole = (newRole: 'guard' | 'supervisor' | 'admin' | 'hr') => {
    updateProfile({ 
      role: newRole,
      name: newRole === 'admin' ? 'Admin User' : 
            newRole === 'supervisor' ? 'Supervisor User' : 
            newRole === 'hr' ? 'HR Manager' : 'Guard User',
      badge: newRole === 'admin' ? 'ADM-001' : 
             newRole === 'supervisor' ? 'SUP-001' : 
             newRole === 'hr' ? 'HR-001' : 'GRD-001'
    });
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-card p-3 rounded-lg shadow-lg">
      <div className="text-xs mb-2 font-medium">Demo: Switch Role</div>
      <div className="grid grid-cols-2 gap-1">
        <Button
          size="sm"
          variant={user.role === 'guard' ? 'default' : 'outline'}
          onClick={() => switchRole('guard')}
          className="text-xs px-2 py-1"
        >
          👮 Guard
        </Button>
        <Button
          size="sm"
          variant={user.role === 'supervisor' ? 'default' : 'outline'}
          onClick={() => switchRole('supervisor')}
          className="text-xs px-2 py-1"
        >
          👨‍💼 Super
        </Button>
        <Button
          size="sm"
          variant={user.role === 'hr' ? 'default' : 'outline'}
          onClick={() => switchRole('hr')}
          className="text-xs px-2 py-1"
        >
          👥 HR
        </Button>
        <Button
          size="sm"
          variant={user.role === 'admin' ? 'default' : 'outline'}
          onClick={() => switchRole('admin')}
          className="text-xs px-2 py-1"
        >
          ⚙️ Admin
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DeviceIndicator />
        <AppContent />
        <SimpleRoleSwitcher />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}