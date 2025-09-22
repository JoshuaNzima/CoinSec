import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { user, signIn, loading } = useAuth();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signIn(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = (role: string) => {
    const credentials = {
      admin: { email: 'admin@company.com', password: 'password123' },
      hr: { email: 'hr@company.com', password: 'password123' },
      supervisor: { email: 'supervisor@company.com', password: 'password123' },
      guard: { email: 'guard@company.com', password: 'password123' }
    };
    
    const cred = credentials[role as keyof typeof credentials];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">GuardForce</h1>
          <p className="text-muted-foreground">
            Sign in to your security management account
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Quick Login */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Access</CardTitle>
            <CardDescription className="text-xs">
              Quick login for different roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('admin')}
                className="text-xs"
              >
                👨‍💼 Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('hr')}
                className="text-xs"
              >
                👥 HR Manager
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('supervisor')}
                className="text-xs"
              >
                👨‍🏫 Supervisor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('guard')}
                className="text-xs"
              >
                👮 Guard
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Any password works for demo purposes
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 GuardForce. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}