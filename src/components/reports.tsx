import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Clock, MapPin, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedType, setSelectedType] = useState('all');

  const reportTypes = [
    { value: 'all', label: 'All Reports' },
    { value: 'patrol', label: 'Patrol Reports' },
    { value: 'incident', label: 'Incident Reports' },
    { value: 'attendance', label: 'Attendance Reports' },
    { value: 'visitor', label: 'Visitor Reports' }
  ];

  const timePeriods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const dailyStats = {
    checkpoints: 8,
    incidents: 2,
    hoursWorked: 5.5,
    visitorsProcesed: 12,
    alertsTriggered: 3
  };

  const recentReports = [
    {
      id: 'RPT-001234',
      type: 'Daily Activity Report',
      date: 'Today 2:30 PM',
      status: 'Generated',
      size: '2.4 MB'
    },
    {
      id: 'RPT-001233',
      type: 'Incident Summary',
      date: 'Today 1:45 PM',
      status: 'Pending Review',
      size: '1.8 MB'
    },
    {
      id: 'RPT-001232',
      type: 'Attendance Report',
      date: 'Today 8:00 AM',
      status: 'Approved',
      size: '0.9 MB'
    }
  ];

  const weeklyTrends = [
    { day: 'Mon', checkpoints: 12, incidents: 1 },
    { day: 'Tue', checkpoints: 15, incidents: 3 },
    { day: 'Wed', checkpoints: 10, incidents: 0 },
    { day: 'Thu', checkpoints: 14, incidents: 2 },
    { day: 'Fri', checkpoints: 8, incidents: 2 },
    { day: 'Sat', checkpoints: 6, incidents: 1 },
    { day: 'Sun', checkpoints: 4, incidents: 0 }
  ];

  const generateReport = () => {
    // Simulate report generation
    console.log(`Generating ${selectedType} report for ${selectedPeriod}`);
  };

  return (
    <div className="space-y-4">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reports & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm">Report Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generateReport} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Daily Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Checkpoints</span>
                <span className="font-medium">{dailyStats.checkpoints}</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Hours Worked</span>
                <span className="font-medium">{dailyStats.hoursWorked}h</span>
              </div>
              <Progress value={69} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Incidents</span>
                <span className="font-medium">{dailyStats.incidents}</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Visitors</span>
                <span className="font-medium">{dailyStats.visitorsProcesed}</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyTrends.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <div className="w-8 text-sm font-medium">{day.day}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Checkpoints: {day.checkpoints}</span>
                    <span>Incidents: {day.incidents}</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-2 bg-blue-200 rounded overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${(day.checkpoints / 15) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 h-2 bg-red-200 rounded overflow-hidden">
                      <div 
                        className="h-full bg-red-500"
                        style={{ width: `${(day.incidents / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium text-sm">{report.type}</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{report.id}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <Badge 
                  variant={
                    report.status === 'Generated' ? 'default' :
                    report.status === 'Approved' ? 'secondary' :
                    'outline'
                  }
                  className="text-xs"
                >
                  {report.status}
                </Badge>
                <div className="text-xs text-muted-foreground">{report.size}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Report
        </Button>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-medium text-green-600">98%</div>
              <div className="text-xs text-muted-foreground">Patrol Completion</div>
            </div>
            <div>
              <div className="text-2xl font-medium text-blue-600">2.5min</div>
              <div className="text-xs text-muted-foreground">Avg Response Time</div>
            </div>
            <div>
              <div className="text-2xl font-medium text-purple-600">15</div>
              <div className="text-xs text-muted-foreground">Reports This Week</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Attendance Rate</span>
              <span>95%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Incident Resolution</span>
              <span>100%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Equipment Checks</span>
              <span>92%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}