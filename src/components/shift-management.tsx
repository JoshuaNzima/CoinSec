import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Calendar } from './ui/calendar';
import { 
  Clock, 
  MapPin, 
  Users, 
  Calendar as CalendarIcon,
  Play,
  Pause,
  Square,
  User,
  Building,
  Timer,
  CheckCircle,
  AlertCircle,
  Coffee,
  Moon
} from 'lucide-react';

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'upcoming' | 'active' | 'completed' | 'break';
  duration: number;
  breakTime: number;
  checkpoints: number;
  completedCheckpoints: number;
  partner?: string;
  notes?: string;
}

const mockShifts: Shift[] = [
  {
    id: '1',
    date: '2024-12-19',
    startTime: '08:00',
    endTime: '20:00',
    location: 'Downtown Plaza',
    status: 'active',
    duration: 480, // minutes
    breakTime: 60,
    checkpoints: 12,
    completedCheckpoints: 8,
    partner: 'Mike Johnson',
    notes: 'Night shift patrol with extra security checks'
  },
  {
    id: '2',
    date: '2024-12-20',
    startTime: '06:00',
    endTime: '18:00',
    location: 'Corporate Campus',
    status: 'upcoming',
    duration: 480,
    breakTime: 60,
    checkpoints: 10,
    completedCheckpoints: 0,
    partner: 'Sarah Wilson'
  },
  {
    id: '3',
    date: '2024-12-18',
    startTime: '22:00',
    endTime: '06:00',
    location: 'Warehouse District',
    status: 'completed',
    duration: 480,
    breakTime: 30,
    checkpoints: 8,
    completedCheckpoints: 8,
    notes: 'All systems normal, no incidents'
  }
];

export function ShiftManagement() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentShift, setCurrentShift] = useState<Shift>(mockShifts[0]);
  const [shiftTimer, setShiftTimer] = useState({ hours: 8, minutes: 23, seconds: 45 });

  const activeShift = mockShifts.find(shift => shift.status === 'active');
  const upcomingShifts = mockShifts.filter(shift => shift.status === 'upcoming');
  const completedShifts = mockShifts.filter(shift => shift.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'break': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStartBreak = () => {
    setCurrentShift(prev => ({ ...prev, status: 'break' }));
  };

  const handleEndBreak = () => {
    setCurrentShift(prev => ({ ...prev, status: 'active' }));
  };

  const handleEndShift = () => {
    setCurrentShift(prev => ({ ...prev, status: 'completed' }));
  };

  return (
    <div className="space-y-6">
      {/* Current Shift Status */}
      {activeShift && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                <Play className="h-4 w-4 text-white" />
              </div>
              Active Shift
            </CardTitle>
            <CardDescription>
              Current shift at {activeShift.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Timer className="h-4 w-4" />
                  <span>{shiftTimer.hours}h {shiftTimer.minutes}m {shiftTimer.seconds}s</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {activeShift.startTime} - {activeShift.endTime}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {activeShift.location}
                </div>
                {activeShift.partner && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Partner: {activeShift.partner}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((activeShift.completedCheckpoints / activeShift.checkpoints) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {activeShift.completedCheckpoints}/{activeShift.checkpoints} checkpoints
                </div>
              </div>
            </div>

            <Progress 
              value={(activeShift.completedCheckpoints / activeShift.checkpoints) * 100} 
              className="h-3"
            />

            <div className="flex gap-2">
              {currentShift.status === 'active' ? (
                <Button variant="outline" onClick={handleStartBreak} className="flex-1">
                  <Coffee className="mr-2 h-4 w-4" />
                  Start Break
                </Button>
              ) : (
                <Button variant="outline" onClick={handleEndBreak} className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  End Break
                </Button>
              )}
              <Button variant="destructive" onClick={handleEndShift} className="flex-1">
                <Square className="mr-2 h-4 w-4" />
                End Shift
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shift Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Shift Calendar
          </CardTitle>
          <CardDescription>
            View and manage your scheduled shifts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Upcoming Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Shifts</CardTitle>
          <CardDescription>
            Your scheduled shifts for the next few days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingShifts.map((shift) => (
            <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(shift.status)}`} />
                <div>
                  <div className="font-medium">{shift.location}</div>
                  <div className="text-sm text-muted-foreground">
                    {shift.date} • {shift.startTime} - {shift.endTime}
                  </div>
                  {shift.partner && (
                    <div className="text-sm text-muted-foreground">
                      Partner: {shift.partner}
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="secondary">{shift.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
          <CardDescription>
            Your completed shifts and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {completedShifts.map((shift) => (
            <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium">{shift.location}</div>
                  <div className="text-sm text-muted-foreground">
                    {shift.date} • {shift.startTime} - {shift.endTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {shift.completedCheckpoints}/{shift.checkpoints} checkpoints completed
                  </div>
                  {shift.notes && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {shift.notes}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {Math.floor(shift.duration / 60)}h {shift.duration % 60}m
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Shift Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Statistics</CardTitle>
          <CardDescription>
            Your performance summary for the current week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">32</div>
              <div className="text-sm text-muted-foreground">Hours Worked</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">28</div>
              <div className="text-sm text-muted-foreground">Checkpoints</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">4</div>
              <div className="text-sm text-muted-foreground">Shifts</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}