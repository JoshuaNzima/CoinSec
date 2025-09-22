import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Play, Pause, CheckCircle, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export function GuardTours() {
  const [activeTour, setActiveTour] = useState<string | null>('tour-1');
  const [tourProgress, setTourProgress] = useState(40);

  const tours = [
    {
      id: 'tour-1',
      name: 'Evening Patrol Route A',
      status: 'active',
      startTime: '2:00 PM',
      endTime: '6:00 PM',
      checkpoints: 8,
      completed: 3,
      nextCheckpoint: 'Building Lobby',
      nextTime: '2:30 PM'
    },
    {
      id: 'tour-2',
      name: 'Security Check Route B',
      status: 'scheduled',
      startTime: '6:00 PM',
      endTime: '10:00 PM',
      checkpoints: 12,
      completed: 0,
      nextCheckpoint: 'Main Entrance',
      nextTime: '6:00 PM'
    },
    {
      id: 'tour-3',
      name: 'Night Patrol Route',
      status: 'upcoming',
      startTime: '10:00 PM',
      endTime: '6:00 AM',
      checkpoints: 15,
      completed: 0,
      nextCheckpoint: 'Perimeter Gate',
      nextTime: '10:00 PM'
    }
  ];

  const currentTour = tours.find(tour => tour.id === activeTour);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startTour = (tourId: string) => {
    setActiveTour(tourId);
    setTourProgress(0);
  };

  const pauseTour = () => {
    setActiveTour(null);
  };

  return (
    <div className="space-y-4">
      {/* Active Tour Card */}
      {currentTour && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Active Tour
              </span>
              <Badge className={getStatusColor(currentTour.status)}>
                {currentTour.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">{currentTour.name}</h3>
              <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {currentTour.startTime} - {currentTour.endTime}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentTour.completed} of {currentTour.checkpoints} checkpoints</span>
              </div>
              <Progress value={tourProgress} className="h-2" />
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm">
                <div className="font-medium">Next Checkpoint:</div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{currentTour.nextCheckpoint}</span>
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  Scheduled: {currentTour.nextTime}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => pauseTour()}
                variant="outline" 
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Tour
              </Button>
              <Button className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Checkpoint
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tour Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tours.map((tour) => (
            <div 
              key={tour.id}
              className={`p-3 border rounded-lg ${
                tour.id === activeTour ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-sm">{tour.name}</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tour.startTime} - {tour.endTime}
                  </div>
                </div>
                <Badge className={getStatusColor(tour.status)}>
                  {tour.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{tour.checkpoints} checkpoints</span>
                <span>{tour.completed} completed</span>
              </div>

              {tour.status !== 'active' && (
                <Button 
                  size="sm" 
                  onClick={() => startTour(tour.id)}
                  disabled={tour.status === 'upcoming'}
                  className="w-full"
                >
                  {tour.status === 'upcoming' ? (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Scheduled for Later
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Tour
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tour Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Tour Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-medium">11</div>
            <div className="text-sm text-muted-foreground">Checkpoints Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium">3.2km</div>
            <div className="text-sm text-muted-foreground">Distance Covered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium">5h 30m</div>
            <div className="text-sm text-muted-foreground">Time on Tour</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium">98%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          View Route Map
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Tour
        </Button>
      </div>

      {/* Tour History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Morning Patrol Route', date: 'Today 8:00 AM', status: 'Completed', checkpoints: '8/8' },
            { name: 'Night Security Check', date: 'Yesterday 10:00 PM', status: 'Completed', checkpoints: '12/12' },
            { name: 'Weekend Patrol', date: 'Yesterday 2:00 PM', status: 'Completed', checkpoints: '6/6' },
          ].map((tour, index) => (
            <div key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
              <div>
                <div className="font-medium">{tour.name}</div>
                <div className="text-muted-foreground text-xs">{tour.date}</div>
              </div>
              <div className="text-right">
                <div className="text-green-600 text-xs">{tour.status}</div>
                <div className="text-muted-foreground text-xs">{tour.checkpoints}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}