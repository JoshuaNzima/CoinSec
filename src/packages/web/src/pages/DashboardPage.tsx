import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';

// Mock data for charts
const incidentTrend = [
  { month: 'Jan', incidents: 12, resolved: 10 },
  { month: 'Feb', incidents: 8, resolved: 8 },
  { month: 'Mar', incidents: 15, resolved: 13 },
  { month: 'Apr', incidents: 6, resolved: 6 },
  { month: 'May', incidents: 9, resolved: 8 },
  { month: 'Jun', incidents: 4, resolved: 4 },
];

const guardActivity = [
  { hour: '00:00', active: 12 },
  { hour: '04:00', active: 15 },
  { hour: '08:00', active: 28 },
  { hour: '12:00', active: 35 },
  { hour: '16:00', active: 32 },
  { hour: '20:00', active: 18 },
];

const siteDistribution = [
  { name: 'Downtown Plaza', value: 15, color: '#0088FE' },
  { name: 'Corporate Center', value: 12, color: '#00C49F' },
  { name: 'Shopping Mall', value: 18, color: '#FFBB28' },
  { name: 'Medical Center', value: 8, color: '#FF8042' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Guards',
      value: '48',
      change: '+3',
      changeType: 'positive',
      icon: Users,
      description: 'Active personnel',
    },
    {
      title: 'Active Sites',
      value: '32',
      change: '+2',
      changeType: 'positive',
      icon: Building,
      description: 'Secured locations',
    },
    {
      title: 'Incidents Today',
      value: '3',
      change: '-2',
      changeType: 'positive',
      icon: AlertTriangle,
      description: '2 resolved, 1 pending',
    },
    {
      title: 'Monthly Revenue',
      value: '$245K',
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign,
      description: 'vs last month',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'incident',
      title: 'Security incident resolved',
      location: 'Downtown Plaza',
      time: '2 hours ago',
      status: 'resolved',
    },
    {
      id: 2,
      type: 'checkpoint',
      title: 'Guard checkpoint completed',
      location: 'Medical Center',
      time: '3 hours ago',
      status: 'completed',
    },
    {
      id: 3,
      type: 'shift',
      title: 'Night shift started',
      location: 'Shopping Mall',
      time: '4 hours ago',
      status: 'active',
    },
    {
      id: 4,
      type: 'contract',
      title: 'New contract signed',
      location: 'Tech Campus',
      time: '1 day ago',
      status: 'completed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="h-4 w-4" />;
      case 'checkpoint':
        return <CheckCircle className="h-4 w-4" />;
      case 'shift':
        return <Clock className="h-4 w-4" />;
      case 'contract':
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your security operations today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Button>
          <Button size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency Alert
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className={`mr-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                {stat.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Incident Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Incident Trends</CardTitle>
            <CardDescription>
              Monthly incident reports and resolution rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incidentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Incidents"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Site Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Guard Distribution</CardTitle>
            <CardDescription>
              Guards by site location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={siteDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {siteDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Guard Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Guard Activity</CardTitle>
            <CardDescription>
              Active guards throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={guardActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getStatusColor(activity.status)}`}
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used management functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Guards</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <AlertTriangle className="h-6 w-6 mb-2" />
              <span className="text-sm">View Incidents</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <MapPin className="h-6 w-6 mb-2" />
              <span className="text-sm">Live Tracking</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}