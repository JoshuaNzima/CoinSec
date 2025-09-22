import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Smartphone, 
  PhoneOff, 
  CreditCard, 
  QrCode, 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Settings,
  Tablet,
  Radio,
  MapPin
} from 'lucide-react';

export function AttendanceSolutionsGuide() {
  const [selectedSolution, setSelectedSolution] = useState('overview');

  const solutions = [
    {
      id: 'rfid',
      name: 'RFID Card System',
      icon: CreditCard,
      cost: '$15-25/guard',
      reliability: 95,
      ease: 'Very Easy',
      description: 'Guards carry wallet-sized RFID cards that instantly check them in/out when tapped on readers.',
      benefits: [
        'Instant check-in (1-2 seconds)',
        'Works in all weather conditions',
        'No training required',
        'Cannot be easily faked or shared',
        'Works without power (battery backup)'
      ],
      implementation: [
        'Install weatherproof RFID readers at key locations',
        'Issue unique cards to each guard with their photo/ID',
        'Set up central system to track all card taps',
        'Configure backup battery systems for power outages'
      ],
      bestFor: 'Guards at fixed locations with regular checkpoints'
    },
    {
      id: 'sms',
      name: 'SMS Check-in System',
      icon: MessageSquare,
      cost: '$0.10/message',
      reliability: 85,
      ease: 'Easy',
      description: 'Guards use basic phones to send text messages with unique codes to report their status.',
      benefits: [
        'Works with any basic cell phone',
        'Real-time location reporting possible',
        'Can include emergency codes',
        'Very low hardware investment'
      ],
      implementation: [
        'Set up SMS gateway with your provider',
        'Create unique codes for each guard and location',
        'Send instructions card to each guard',
        'Monitor and track all incoming messages'
      ],
      bestFor: 'Mobile guards covering large areas with cell coverage'
    },
    {
      id: 'qr',
      name: 'QR Code Stations',
      icon: QrCode,
      cost: '$2-5/checkpoint',
      reliability: 90,
      ease: 'Easy',
      description: 'Printed QR codes at patrol points that supervisors scan to verify guard presence.',
      benefits: [
        'Extremely low cost to deploy',
        'Easy to replace if damaged',
        'Can include location coordinates',
        'Works with any camera phone'
      ],
      implementation: [
        'Generate unique QR codes for each checkpoint',
        'Laminate and securely mount codes',
        'Train supervisors on scanning procedures',
        'Create backup manual verification system'
      ],
      bestFor: 'Large sites with many patrol points and supervisor oversight'
    },
    {
      id: 'kiosk',
      name: 'Tablet Kiosks',
      icon: Tablet,
      cost: '$200-400/station',
      reliability: 92,
      ease: 'Medium',
      description: 'Weatherproof tablet stations at strategic locations for full-featured check-ins.',
      benefits: [
        'Can capture photos and notes',
        'Real-time data synchronization',
        'Works for multiple guards',
        'Professional appearance'
      ],
      implementation: [
        'Install weatherproof tablet enclosures',
        'Set up Wi-Fi or cellular connectivity',
        'Create simple touch-screen interface',
        'Install backup power systems'
      ],
      bestFor: 'High-security locations with dedicated entrances/exits'
    },
    {
      id: 'supervisor',
      name: 'Supervisor Buddy System',
      icon: Users,
      cost: '$0 (operational)',
      reliability: 88,
      ease: 'Easy',
      description: 'Supervisors use their smartphones to check in guards during rounds.',
      benefits: [
        'No additional hardware required',
        'Personal verification of guard',
        'Can capture photos for proof',
        'Flexible timing and locations'
      ],
      implementation: [
        'Train supervisors on mobile check-in app',
        'Create scheduled supervisor rounds',
        'Set up exception alert system',
        'Implement backup procedures'
      ],
      bestFor: 'Sites with regular supervisor presence and oversight'
    },
    {
      id: 'radio',
      name: 'Radio Check-in System',
      icon: Radio,
      cost: '$150-300/radio',
      reliability: 93,
      ease: 'Medium',
      description: 'Two-way radios for voice check-ins with central dispatch.',
      benefits: [
        'Voice verification provides confidence',
        'Immediate emergency communication',
        'Long-range coverage area',
        'Professional security standard'
      ],
      implementation: [
        'Obtain FCC radio licenses',
        'Install base station and repeaters',
        'Train guards on radio procedures',
        'Set up logging and recording system'
      ],
      bestFor: 'Large sites requiring constant communication and emergency response'
    }
  ];

  const hybridRecommendation = {
    primary: 'RFID Cards for regular checkpoints',
    backup: 'SMS system for remote locations',
    emergency: 'Radio communication for incidents',
    cost: '$50-75 per guard total',
    coverage: '99.5% reliability'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <PhoneOff className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold">Non-Smartphone Attendance Solutions</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive attendance tracking for guards without smartphones or when technology fails
        </p>
        
        {/* Problem Statement */}
        <Alert className="max-w-4xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Common Challenge:</strong> Many security guards don't own smartphones, but reliable attendance 
            tracking is essential for client contracts, payroll accuracy, and security accountability.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs value={selectedSolution} onValueChange={setSelectedSolution} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rfid">RFID</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="qr">QR Codes</TabsTrigger>
          <TabsTrigger value="kiosk">Kiosks</TabsTrigger>
          <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
          <TabsTrigger value="radio">Radio</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <Card key={solution.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-primary" />
                      <Badge variant="outline">{solution.ease}</Badge>
                    </div>
                    <CardTitle className="text-lg">{solution.name}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {solution.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Cost:</span>
                        <span className="font-semibold">{solution.cost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Reliability:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{width: `${solution.reliability}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{solution.reliability}%</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedSolution(solution.id)}
                      >
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recommended Hybrid Approach */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-blue-600" />
                Recommended Hybrid Approach
              </CardTitle>
              <CardDescription>
                For maximum reliability and coverage, combine multiple solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold">Solution Stack:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{hybridRecommendation.primary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{hybridRecommendation.backup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">{hybridRecommendation.emergency}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Expected Results:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Cost per Guard:</span>
                      <span className="font-semibold">{hybridRecommendation.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>System Reliability:</span>
                      <span className="font-semibold text-green-600">{hybridRecommendation.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Implementation Time:</span>
                      <span className="font-semibold">2-4 weeks</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Solution Tabs */}
        {solutions.map((solution) => {
          const Icon = solution.icon;
          return (
            <TabsContent key={solution.id} value={solution.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{solution.name}</CardTitle>
                      <CardDescription className="text-lg">{solution.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Benefits */}
                    <div>
                      <h4 className="font-semibold mb-3 text-green-600">Key Benefits</h4>
                      <ul className="space-y-2">
                        {solution.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Implementation */}
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-600">Implementation Steps</h4>
                      <ol className="space-y-2">
                        {solution.implementation.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{solution.cost}</div>
                      <div className="text-sm text-muted-foreground">Cost per Guard</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{solution.reliability}%</div>
                      <div className="text-sm text-muted-foreground">Reliability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{solution.ease}</div>
                      <div className="text-sm text-muted-foreground">Implementation</div>
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h5 className="font-semibold mb-2">Best For:</h5>
                    <p className="text-sm">{solution.bestFor}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Quick Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Comparison</CardTitle>
          <CardDescription>At-a-glance comparison of all solutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Solution</th>
                  <th className="text-left p-3">Cost</th>
                  <th className="text-left p-3">Reliability</th>
                  <th className="text-left p-3">Ease</th>
                  <th className="text-left p-3">Best For</th>
                </tr>
              </thead>
              <tbody>
                {solutions.map((solution) => (
                  <tr key={solution.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <solution.icon className="h-4 w-4" />
                        {solution.name}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-sm">{solution.cost}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{width: `${solution.reliability}%`}}
                          ></div>
                        </div>
                        <span className="text-sm">{solution.reliability}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{solution.ease}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground max-w-xs">
                      {solution.bestFor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}