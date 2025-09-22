import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';
import { User, authService } from '@guard-services/shared';

interface UserWithStatus extends User {
  lastSeen?: string;
  status: 'active' | 'inactive' | 'suspended';
  currentSite?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStatus | null>(null);

  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'guard' as User['role'],
    badge: '',
    phoneNumber: '',
    site: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // In a real app, this would call authService.getUsers()
      // For now, using mock data
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      // In a real app, this would call authService.createUser()
      const user: UserWithStatus = {
        id: `user-${Date.now()}`,
        ...newUser,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      };
      
      setUsers(prev => [user, ...prev]);
      setIsCreateDialogOpen(false);
      setNewUser({
        name: '',
        email: '',
        role: 'guard',
        badge: '',
        phoneNumber: '',
        site: '',
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const updateUserStatus = (userId: string, status: UserWithStatus['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'hr': return 'bg-green-100 text-green-800';
      case 'guard': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: UserWithStatus['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLastSeenText = (lastSeen?: string) => {
    if (!lastSeen) return 'Never';
    const minutesAgo = Math.floor((Date.now() - new Date(lastSeen).getTime()) / (1000 * 60));
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    if (minutesAgo < 1440) return `${Math.floor(minutesAgo / 60)}h ago`;
    return `${Math.floor(minutesAgo / 1440)}d ago`;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.badge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const userStats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: users.filter(u => u.status === 'active').length,
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Guards',
      value: users.filter(u => u.role === 'guard').length,
      icon: Shield,
      color: 'text-gray-600'
    },
    {
      title: 'Online Now',
      value: users.filter(u => {
        if (!u.lastSeen) return false;
        const minutesAgo = (Date.now() - new Date(u.lastSeen).getTime()) / (1000 * 60);
        return minutesAgo < 15;
      }).length,
      icon: Clock,
      color: 'text-purple-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage security personnel, roles, and access permissions.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the security management system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@company.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value: User['role']) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guard">Guard</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="hr">HR Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="badge">Badge Number</Label>
                <Input
                  id="badge"
                  value={newUser.badge}
                  onChange={(e) => setNewUser(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="GRD-001"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {userStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="guard">Guards</SelectItem>
                <SelectItem value="supervisor">Supervisors</SelectItem>
                <SelectItem value="hr">HR Managers</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">Badge: {user.badge}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {getLastSeenText(user.lastSeen)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.currentSite && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {user.currentSite}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'suspended')}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'active')}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock users data
const mockUsers: UserWithStatus[] = [
  {
    id: 'user-1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'guard',
    badge: 'GRD-001',
    phoneNumber: '+1 (555) 123-4567',
    status: 'active',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    currentSite: 'Downtown Plaza',
    createdAt: new Date(2024, 0, 15).toISOString(),
  },
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'supervisor',
    badge: 'SUP-001',
    phoneNumber: '+1 (555) 234-5678',
    status: 'active',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    currentSite: 'Corporate Center',
    createdAt: new Date(2024, 1, 10).toISOString(),
  },
  {
    id: 'user-3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    role: 'guard',
    badge: 'GRD-002',
    phoneNumber: '+1 (555) 345-6789',
    status: 'active',
    lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    currentSite: 'Shopping Mall',
    createdAt: new Date(2024, 1, 20).toISOString(),
  },
  {
    id: 'user-4',
    name: 'Lisa Brown',
    email: 'lisa.brown@company.com',
    role: 'hr',
    badge: 'HR-001',
    phoneNumber: '+1 (555) 456-7890',
    status: 'active',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(2023, 11, 5).toISOString(),
  },
  {
    id: 'user-5',
    name: 'Alex Wilson',
    email: 'alex.wilson@company.com',
    role: 'guard',
    badge: 'GRD-003',
    phoneNumber: '+1 (555) 567-8901',
    status: 'suspended',
    lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(2024, 2, 1).toISOString(),
  },
];