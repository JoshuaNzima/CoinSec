import React, { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useTheme } from '../contexts/theme-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  User, 
  Moon, 
  Sun, 
  Shield, 
  Fingerprint, 
  Bell, 
  Download, 
  Battery, 
  Wifi, 
  Lock,
  LogOut,
  Edit,
  Camera,
  Smartphone,
  Key,
  Database,
  Activity,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface SettingsProps {
  onNavigate?: (view: string) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const { user, logout, enableBiometric, enableTwoFactor, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    badge: user?.badge || ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    offlineMode: true,
    biometric: user?.biometricEnabled || false,
    twoFactor: user?.twoFactorEnabled || false,
    autoSync: true,
    batteryOptimization: true,
    dataEncryption: true,
    sessionTimeout: 30
  });

  const handleSaveProfile = () => {
    updateProfile(editForm);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleToggleBiometric = async () => {
    if (!settings.biometric) {
      try {
        await enableBiometric();
        setSettings(prev => ({ ...prev, biometric: true }));
        toast.success('Biometric authentication enabled');
      } catch (error) {
        toast.error('Failed to enable biometric authentication');
      }
    } else {
      setSettings(prev => ({ ...prev, biometric: false }));
      toast.success('Biometric authentication disabled');
    }
  };

  const handleToggleTwoFactor = async () => {
    if (!settings.twoFactor) {
      try {
        await enableTwoFactor();
        setSettings(prev => ({ ...prev, twoFactor: true }));
        toast.success('Two-factor authentication enabled');
      } catch (error) {
        toast.error('Failed to enable two-factor authentication');
      }
    } else {
      setSettings(prev => ({ ...prev, twoFactor: false }));
      toast.success('Two-factor authentication disabled');
    }
  };

  const handleExportData = () => {
    toast.success('Data export started. Check your downloads folder.');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Manage your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline" className="absolute -bottom-1 -right-1 h-8 w-8 p-0">
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{user?.name}</h3>
                <Badge variant="secondary">{user?.role}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Badge: {user?.badge}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          {isEditing && (
            <div className="space-y-3 pt-4 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    value={editForm.badge}
                    onChange={(e) => setEditForm(prev => ({ ...prev, badge: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security and authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Biometric Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Use fingerprint or face recognition
                </p>
              </div>
            </div>
            <Switch
              checked={settings.biometric}
              onCheckedChange={handleToggleBiometric}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <Switch
              checked={settings.twoFactor}
              onCheckedChange={handleToggleTwoFactor}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Data Encryption</Label>
                <p className="text-sm text-muted-foreground">
                  Encrypt sensitive data locally
                </p>
              </div>
            </div>
            <Switch
              checked={settings.dataEncryption}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dataEncryption: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            App Preferences
          </CardTitle>
          <CardDescription>
            Configure app behavior and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts and updates
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Location Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Share your location during shifts
              </p>
            </div>
            <Switch
              checked={settings.locationTracking}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, locationTracking: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Offline Mode</Label>
              <p className="text-sm text-muted-foreground">
                Continue working without internet
              </p>
            </div>
            <Switch
              checked={settings.offlineMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, offlineMode: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync data when online
              </p>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSync: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Battery Optimization</Label>
              <p className="text-sm text-muted-foreground">
                Reduce battery usage during shifts
              </p>
            </div>
            <Switch
              checked={settings.batteryOptimization}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, batteryOptimization: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export and manage your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
            <FileText className="mr-2 h-4 w-4" />
            Export All Data
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate?.('audit')}>
            <Activity className="mr-2 h-4 w-4" />
            View Activity Log
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate?.('sync')}>
            <Wifi className="mr-2 h-4 w-4" />
            Sync Status
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}