import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Smartphone, 
  CreditCard, 
  QrCode, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  Settings,
  DollarSign,
  Tablet,
  Phone,
  Radio,
  Watch
} from 'lucide-react';

interface SolutionOption {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  cost: string;
  complexity: 'Low' | 'Medium' | 'High';
  reliability: number;
  description: string;
  pros: string[];
  cons: string[];
  implementation: string[];
}

export function NonSmartphoneSolutions() {
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);

  const solutions: SolutionOption[] = [
    {
      id: 'rfid-cards',
      name: 'RFID Card System',
      icon: CreditCard,
      cost: '$15-25 per guard',
      complexity: 'Low',
      reliability: 95,
      description: 'Guards carry RFID cards that they tap on readers at checkpoints and time clocks.',
      pros: [
        'Instant check-in/out',
        'No training required',
        'Works in all weather',
        'Very reliable',
        'Difficult to fake'
      ],
      cons: [
        'Cards can be lost',
        'Requires reader hardware',
        'Initial setup cost'
      ],
      implementation: [
        'Install RFID readers at key locations',
        'Issue unique RFID cards to each guard',
        'Connect readers to central system',
        'Set up backup battery power'
      ]
    },
    {
      id: 'qr-checkpoint',
      name: 'QR Code Checkpoints',
      icon: QrCode,
      cost: '$2-5 per checkpoint',
      complexity: 'Low',
      reliability: 90,
      description: 'Fixed QR codes at patrol points that supervisors scan for guards without phones.',
      pros: [
        'Very low cost',
        'Easy to deploy',
        'Weather resistant when laminated',
        'Easy to replace'
      ],
      cons: [
        'Requires supervisor verification',
        'Can be damaged',
        'Not real-time without supervisor'
      ],
      implementation: [
        'Generate unique QR codes for each checkpoint',
        'Laminate and mount codes at locations',
        'Train supervisors on scanning process',
        'Create backup verification system'
      ]
    },
    {
      id: 'sms-system',
      name: 'SMS Check-in System',
      icon: MessageSquare,
      cost: '$0.10 per message',
      complexity: 'Medium',
      reliability: 85,
      description: 'Guards with basic phones send SMS messages with unique codes to check in.',
      pros: [
        'Works with any phone',
        'Real-time reporting',
        'Location can be included',
        'Low hardware cost'
      ],
      cons: [
        'Requires cell coverage',
        'SMS costs add up',
        'Guards need basic phone',
        'Potential for abuse'
      ],
      implementation: [
        'Set up SMS gateway service',
        'Create unique codes for each guard/location',
        'Send instructions to guards',
        'Monitor SMS costs and usage'
      ]
    },
    {
      id: 'kiosk-stations',
      name: 'Tablet Kiosks',
      icon: Tablet,
      cost: '$200-400 per station',
      complexity: 'Medium',
      reliability: 92,
      description: 'Weather-resistant tablet stations at key locations for guard check-ins.',
      pros: [
        'Full featured interface',
        'Can capture photos',
        'Works for multiple guards',
        'Real-time sync'
      ],
      cons: [
        'Higher initial cost',
        'Requires power source',
        'Can be vandalized',
        'Need weatherproofing'
      ],
      implementation: [
        'Install weatherproof tablet enclosures',
        'Set up Wi-Fi or cellular connectivity',
        'Create simple check-in interface',
        'Implement backup power system'
      ]
    },
    {
      id: 'supervisor-buddy',
      name: 'Supervisor Buddy System',
      icon: Users,
      cost: '$0 (operational)',
      complexity: 'Low',
      reliability: 88,
      description: 'Supervisors with smartphones check in guards during rounds or shift changes.',
      pros: [
        'No additional hardware',
        'Personal verification',
        'Flexible timing',
        'Zero equipment cost'
      ],
      cons: [
        'Dependent on supervisor availability',
        'Not real-time',
        'Increases supervisor workload',
        'Potential delays'
      ],
      implementation: [
        'Train supervisors on check-in process',
        'Create scheduled check-in rounds',
        'Implement backup procedures',
        'Set up exception reporting'
      ]
    },
    {
      id: 'radio-checkin',
      name: 'Radio Check-in System',
      icon: Radio,
      cost: '$150-300 per radio',
      complexity: 'Medium',
      reliability: 93,
      description: 'Guards use two-way radios to report status and location verbally.',
      pros: [
        'Voice verification',
        'Emergency communication',
        'Long range coverage',
        'Immediate response'
      ],
      cons: [
        'Manual logging required',
        'Radio licensing needed',
        'Battery management',
        'Audio quality issues'
      ],
      implementation: [
        'Obtain radio licenses',
        'Install base station',
        'Train guards on radio procedures',
        'Set up logging system'
      ]
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedSolutionData = solutions.find(s => s.id === selectedSolution);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Non-Smartphone Solutions</h1>
        <p className="text-muted-foreground">
          Attendance and duty tracking options for guards without smartphones
        </p>
      </div>

      {/* Solution Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {solutions.map((solution) => {
          const Icon = solution.icon;
          return (
            <Card 
              key={solution.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSolution === solution.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedSolution(solution.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-primary" />
                  <Badge className={getComplexityColor(solution.complexity)}>
                    {solution.complexity}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{solution.name}</CardTitle>
                <CardDescription className="text-sm">
                  {solution.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cost:</span>
                    <span className="font-medium">{solution.cost}</span>
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View */}
      {selectedSolutionData && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <selectedSolutionData.icon className="h-6 w-6 text-primary" />
              <CardTitle>{selectedSolutionData.name} - Detailed Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="comparison">Cost Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Advantages</h4>
                    <ul className="space-y-1">
                      {selectedSolutionData.pros.map((pro, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Considerations</h4>
                    <ul className="space-y-1">
                      {selectedSolutionData.cons.map((con, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-3 w-3 border border-red-600 rounded-full flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="implementation" className="space-y-4">
                <h4 className="font-medium">Implementation Steps</h4>
                <div className="space-y-3">
                  {selectedSolutionData.implementation.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="comparison" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium">{selectedSolutionData.cost}</div>
                    <div className="text-sm text-muted-foreground">Per Unit Cost</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Settings className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium">{selectedSolutionData.complexity}</div>
                    <div className="text-sm text-muted-foreground">Complexity</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-medium">{selectedSolutionData.reliability}%</div>
                    <div className="text-sm text-muted-foreground">Reliability</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Recommended Hybrid Approach */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Recommended Hybrid Approach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            For maximum coverage and reliability, we recommend combining multiple solutions:
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Primary Solution</h4>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>RFID Cards for regular checkpoints</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Backup Solutions</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span>SMS system for remote locations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Supervisor verification as fallback</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
            <p className="text-sm">
              <strong>Estimated Total Cost:</strong> $50-75 per guard for comprehensive coverage
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}