import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
  Download
} from 'lucide-react';

// Mock data for analytics
const incidentTrends = [
  { month: 'Jan', incidents: 45, resolved: 42, critical: 3 },
  { month: 'Feb', incidents: 32, resolved: 30, critical: 2 },
  { month: 'Mar', incidents: 38, resolved: 35, critical: 1 },
  { month: 'Apr', incidents: 28, resolved: 28, critical: 0 },
  { month: 'May', incidents: 41, resolved: 39, critical: 2 },
  { month: 'Jun', incidents: 25, resolved: 24, critical: 1 },
];

const guardPerformance = [
  { month: 'Jan', checkpoints: 1250, patrols: 340, incidents: 12 },
  { month: 'Feb', checkpoints: 1180, patrols: 315, incidents: 8 },
  { month: 'Mar', checkpoints: 1320, patrols: 380, incidents: 15 },
  { month: 'Apr', checkpoints: 1280, patrols: 365, incidents: 6 },
  { month: 'May', checkpoints: 1410, patrols: 390, incidents: 9 },
  { month: 'Jun', checkpoints: 1350, patrols: 375, incidents: 4 },
];

const sitePerformance = [
  { name: 'Downtown Plaza', incidents: 15, rating: 4.8, coverage: 98 },
  { name: 'Corporate Center', incidents: 8, rating: 4.9, coverage: 99 },
  { name: 'Shopping Mall', incidents: 22, rating: 4.6, coverage: 96 },
  { name: 'Medical Center', incidents: 6, rating: 4.9, coverage: 100 },
  { name: 'Tech Campus', incidents: 12, rating: 4.7, coverage: 97 },
];

const responseTimeData = [
  { hour: '00:00', avgTime: 3.2 },
  { hour: '04:00', avgTime: 2.8 },
  { hour: '08:00', avgTime: 4.1 },
  { hour: '12:00', avgTime: 3.7 },
  { hour: '16:00', avgTime: 3.9 },
  { hour: '20:00', avgTime: 3.4 },
];

const incidentTypes = [
  { name: 'Security Breach', value: 35, color: '#ef4444' },
  { name: 'Equipment Issue', value: 28, color: '#f59e0b' },
  { name: 'Medical Emergency', value: 15, color: '#3b82f6' },
  { name: 'Maintenance', value: 12, color: '#10b981' },
  { name: 'Other', value: 10, color: '#8b5cf6' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('incidents');

  const overallStats = [
    {
      title: 'Total Incidents',
      value: '209',
      change: '-12%',
      changeType: 'positive',
      icon: AlertTriangle,
      description: 'vs last period',
    },
    {
      title: 'Resolution Rate',
      value: '94.7%',
      change: '+2.3%',
      changeType: 'positive',
      icon: CheckCircle,
      description: 'average resolution',
    },
    {
      title: 'Response Time',
      value: '3.4 min',
      change: '-0.8 min',
      changeType: 'positive',
      icon: Clock,
      description: 'average response',
    },
    {
      title: 'Guard Efficiency',
      value: '87.2%',
      change: '+5.1%',
      changeType: 'positive',
      icon: Users,
      description: 'checkpoint completion',
    },
  ];

  const generateReport = () => {
    console.log('Generating comprehensive analytics report...');
    // Implementation for report generation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive performance metrics and security insights.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {overallStats.map((stat) => (
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
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
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

      {/* Main Analytics */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Incident Trends</CardTitle>
                <CardDescription>Monthly incident reports and resolution rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={incidentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Types</CardTitle>
                <CardDescription>Distribution of incident categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incidentTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {incidentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Response Time Analysis</CardTitle>
              <CardDescription>Average incident response times by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="avgTime"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guard Performance Metrics</CardTitle>
              <CardDescription>Checkpoint completion, patrol activity, and incident response</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={guardPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="checkpoints" fill="#3b82f6" name="Checkpoints" />
                  <Bar dataKey="patrols" fill="#10b981" name="Patrols" />
                  <Bar dataKey="incidents" fill="#ef4444" name="Incidents" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">John Smith</span>
                  <Badge className="bg-green-100 text-green-800">98.5%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sarah Johnson</span>
                  <Badge className="bg-green-100 text-green-800">97.2%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mike Davis</span>
                  <Badge className="bg-green-100 text-green-800">96.8%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Needed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alex Wilson</span>
                  <Badge className="bg-yellow-100 text-yellow-800">82.1%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lisa Brown</span>
                  <Badge className="bg-orange-100 text-orange-800">79.5%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">87.2%</div>
                  <div className="text-sm text-muted-foreground">Overall efficiency</div>
                  <div className="text-xs text-green-600 mt-1">+5.1% from last period</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Performance Overview</CardTitle>
              <CardDescription>Security metrics across all monitored locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sitePerformance.map((site, index) => (
                  <div key={site.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{site.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {site.incidents} incidents this month
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Rating: {site.rating}/5</div>
                        <div className="text-xs text-muted-foreground">Coverage: {site.coverage}%</div>
                      </div>
                      <Badge className={
                        site.rating >= 4.8 ? 'bg-green-100 text-green-800' :
                        site.rating >= 4.5 ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }>
                        {site.rating >= 4.8 ? 'Excellent' :
                         site.rating >= 4.5 ? 'Good' : 'Fair'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Uptime</CardTitle>
                <CardDescription>Service availability and reliability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>GPS Tracking</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '99.9%'}}></div>
                      </div>
                      <span className="text-sm font-medium">99.9%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Incident Reporting</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '99.7%'}}></div>
                      </div>
                      <span className="text-sm font-medium">99.7%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Communication</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '99.5%'}}></div>
                      </div>
                      <span className="text-sm font-medium">99.5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Operational expenses and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Personnel Costs</span>
                    <span className="font-medium">$185,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Technology & Equipment</span>
                    <span className="font-medium">$25,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Training & Certification</span>
                    <span className="font-medium">$8,500</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Monthly Cost</span>
                    <span className="font-bold">$218,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost per Incident</span>
                    <span className="font-medium">$1,045</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Efficiency Trends</CardTitle>
              <CardDescription>Resource utilization and productivity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">94.7%</div>
                  <div className="text-sm text-muted-foreground">Resource Utilization</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">87.2%</div>
                  <div className="text-sm text-muted-foreground">Guard Productivity</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">91.8%</div>
                  <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}