import React, { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Fingerprint, Eye, EyeOff, Shield, Smartphone } from 'lucide-react';
import { toast } from "sonner@2.0.3";

export function Login() {
  const { login, signup, biometricLogin, loading } = useAuth();
  const [email, setEmail] = useState('guard@company.com');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('guard');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await signup(email, password, name, role);
      if (success) {
        setActiveTab('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
      }
    } catch (error) {
      toast.error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    
    try {
      const success = await biometricLogin();
      if (success) {
        toast.success('Biometric authentication successful');
      } else {
        toast.error('Biometric authentication failed');
      }
    } catch (error) {
      toast.error('Biometric authentication error');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Guard Services</CardTitle>
          <CardDescription>
            Sign in to access your security dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleBiometricLogin}
            disabled={isBiometricLoading}
          >
            {isBiometricLoading ? (
              <Smartphone className="mr-2 h-4 w-4 animate-pulse" />
            ) : (
              <Fingerprint className="mr-2 h-4 w-4" />
            )}
            {isBiometricLoading ? 'Authenticating...' : 'Biometric Login'}
          </Button>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Demo Login Options:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Guard Mobile:</strong> guard@company.com</p>
              <p><strong>Admin Desktop:</strong> admin@company.com</p>
              <p><strong>Password:</strong> Any password works</p>
              <p className="text-muted-foreground mt-2">
                Large screens (≥1024px) or admin users see the desktop dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}