import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  BarChart3,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Star,
  Trophy,
  Activity,
  Users,
  Timer,
  Route
} from 'lucide-react';
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const weeklyData = [
  { day: 'Mon', hours: 8, checkpoints: 12, incidents: 1 },
  { day: 'Tue', hours: 8, checkpoints: 14, incidents: 0 },
  { day: 'Wed', hours: 10, checkpoints: 16, incidents: 2 },
  { day: 'Thu', hours: 8, checkpoints: 13, incidents: 0 },
  { day: 'Fri', hours: 9, checkpoints: 15, incidents: 1 },
  { day: 'Sat', hours: 12, checkpoints: 20, incidents: 3 },
  { day: 'Sun', hours: 8, checkpoints: 11, incidents: 0 }
];

const monthlyData = [
  { month: 'Aug', hours: 160, checkpoints: 240, incidents: 8, rating: 4.8 },
  { month: 'Sep', hours: 168, checkpoints: 252, incidents: 6, rating: 4.9 },
  { month: 'Oct', hours: 172, checkpoints: 268, incidents: 4, rating: 4.9 },
  { month: 'Nov', hours: 164, checkpoints: 246, incidents: 7, rating: 4.7 },
  { month: 'Dec', hours: 88, checkpoints: 132, incidents: 3, rating: 4.8 }
];

const performanceBreakdown = [
  { name: 'Punctuality', value: 95, color: '#10B981' },
  { name: 'Checkpoint Completion', value: 98, color: '#3B82F6' },
  { name: 'Incident Response', value: 92, color: '#F59E0B' },
  { name: 'Communication', value: 96, color: '#8B5CF6' }
];

const achievements = [
  {
    id: '1',
    title: 'Perfect Week',
    description: 'Completed all checkpoints for 7 consecutive days',
    icon: Trophy,
    color: 'text-yellow-600',
    earned: true,
    date: '2024-12-15'
  },
  {
    id: '2',
    title: 'Quick Responder',
    description: 'Responded to incidents within 2 minutes average',
    icon: Timer,
    color: 'text-blue-600',
    earned: true,
    date: '2024-12-10'
  },
  {
    id: '3',
    title: 'Route Master',
    description: 'Optimized patrol routes for maximum efficiency',
    icon: Route,
    color: 'text-green-600',
    earned: false,
    progress: 75
  },
  {
    id: '4',
    title: 'Team Player',
    description: 'Excellent collaboration with other guards',
    icon: Users,
    color: 'text-purple-600',
    earned: true,
    date: '2024-12-08'
  }
];

const kpiData = [
  {
    label: 'Shift Completion Rate',
    value: 98,
    target: 95,
    trend: '+2%',
    trendUp: true
  },
  {
    label: 'Checkpoint Accuracy',
    value: 96,
    target: 90,
    trend: '+1%',
    trendUp: true
  },
  {
    label: 'Incident Response Time',
    value: 2.3,
    target: 3.0,
    unit: 'min',
    trend: '-0.2min',
    trendUp: true
  },
  {
    label: 'Overall Rating',
    value: 4.8,
    target: 4.5,
    unit: '/5',
    trend: '+0.1',
    trendUp: true
  }
];

export function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedTab, setSelectedTab] = useState('overview');

  const currentData = timeRange === 'week' ? weeklyData : monthlyData;

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Track your performance metrics and achievements
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">
                    {kpi.value}{kpi.unit || '%'}
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className={`h-3 w-3 ${kpi.trendUp ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={kpi.trendUp ? 'text-green-600' : 'text-red-600'}>
                      {kpi.trend}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Target</div>
                  <div className="text-sm font-medium">{kpi.target}{kpi.unit || '%'}</div>
                </div>
              </div>
              {!kpi.unit && (
                <Progress 
                  value={kpi.value} 
                  className="mt-3 h-2" 
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
              <CardDescription>
                Your performance across different areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ backgroundColor: item.color, width: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>
                Your daily activity for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {currentData.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-muted-foreground mb-2">{day.day}</div>
                      <div className="space-y-1">
                        <div className="bg-blue-100 dark:bg-blue-900/20 rounded p-2">
                          <div className="text-sm font-medium text-blue-600">{day.hours}h</div>
                          <div className="text-xs text-muted-foreground">Hours</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/20 rounded p-2">
                          <div className="text-sm font-medium text-green-600">{day.checkpoints}</div>
                          <div className="text-xs text-muted-foreground">Points</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Overall Performance Score
              </CardTitle>
              <CardDescription>
                Based on punctuality, completion rate, and quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-blue-600">4.8</div>
                <div className="text-muted-foreground">out of 5.0</div>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= 4.8 ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Excellent Performance
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>
                Breakdown of your performance in different areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceBreakdown.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{metric.name}</span>
                    <span className="text-sm font-medium">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements & Badges
              </CardTitle>
              <CardDescription>
                Your earned achievements and progress towards new ones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      achievement.earned ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${achievement.earned ? achievement.color : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{achievement.title}</h4>
                        {achievement.earned && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-muted-foreground">Earned on {achievement.date}</p>
                      )}
                      {!achievement.earned && achievement.progress && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Your performance over the last few months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="font-medium">{month.month}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-purple-600">Rating: {month.rating}</div>
                      <div className="text-red-600">Incidents: {month.incidents}</div>
                      <div className="text-blue-600">Hours: {month.hours}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
              <CardDescription>
                Recommendations based on your performance data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Incident Response Time</h4>
                  <p className="text-sm text-muted-foreground">
                    Your average response time is 2.3 minutes. Try to respond within 2 minutes to improve your score.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Checkpoint Completion</h4>
                  <p className="text-sm text-muted-foreground">
                    Excellent work! You're completing 98% of checkpoints on time. Keep it up!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}