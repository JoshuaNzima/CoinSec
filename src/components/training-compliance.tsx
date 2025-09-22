import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  Play, 
  BookOpen,
  Award,
  AlertTriangle,
  Calendar,
  FileText,
  Video,
  Headphones,
  Users,
  Target,
  Star
} from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'interactive' | 'assessment';
  duration: number; // minutes
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  certificateRequired: boolean;
  score?: number;
}

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'warning' | 'overdue';
  dueDate: string;
  lastCompleted?: string;
  frequency: string;
  documents: string[];
}

const trainingModules: TrainingModule[] = [
  {
    id: '1',
    title: 'Security Fundamentals',
    description: 'Basic security protocols and procedures',
    type: 'video',
    duration: 45,
    status: 'completed',
    progress: 100,
    priority: 'high',
    category: 'Core Training',
    certificateRequired: true,
    score: 95
  },
  {
    id: '2',
    title: 'Emergency Response Procedures',
    description: 'How to respond to various emergency situations',
    type: 'interactive',
    duration: 60,
    status: 'in-progress',
    progress: 70,
    dueDate: '2024-12-25',
    priority: 'high',
    category: 'Emergency',
    certificateRequired: true
  },
  {
    id: '3',
    title: 'Customer Service Excellence',
    description: 'Professional interaction with clients and visitors',
    type: 'video',
    duration: 30,
    status: 'not-started',
    progress: 0,
    dueDate: '2024-12-30',
    priority: 'medium',
    category: 'Soft Skills',
    certificateRequired: false
  },
  {
    id: '4',
    title: 'Equipment Safety Training',
    description: 'Safe handling and maintenance of security equipment',
    type: 'document',
    duration: 25,
    status: 'overdue',
    progress: 0,
    dueDate: '2024-12-15',
    priority: 'high',
    category: 'Safety',
    certificateRequired: true
  }
];

const complianceItems: ComplianceItem[] = [
  {
    id: '1',
    title: 'Security License Renewal',
    description: 'State security guard license',
    status: 'compliant',
    dueDate: '2025-06-15',
    lastCompleted: '2024-06-15',
    frequency: 'Annual',
    documents: ['License Certificate', 'Background Check']
  },
  {
    id: '2',
    title: 'First Aid Certification',
    description: 'CPR and First Aid certification',
    status: 'warning',
    dueDate: '2025-01-30',
    lastCompleted: '2023-01-30',
    frequency: 'Biennial',
    documents: ['First Aid Certificate']
  },
  {
    id: '3',
    title: 'Annual Safety Training',
    description: 'Workplace safety and OSHA compliance',
    status: 'overdue',
    dueDate: '2024-11-30',
    lastCompleted: '2023-11-30',
    frequency: 'Annual',
    documents: ['Safety Training Certificate']
  }
];

export function TrainingCompliance() {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [showModuleDetails, setShowModuleDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'compliant': 
        return 'bg-green-500';
      case 'in-progress': 
      case 'warning': 
        return 'bg-orange-500';
      case 'not-started': 
        return 'bg-gray-500';
      case 'overdue': 
        return 'bg-red-500';
      default: 
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'interactive': return <Target className="h-4 w-4" />;
      case 'assessment': return <CheckCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const startModule = (module: TrainingModule) => {
    setSelectedModule(module);
    setShowModuleDetails(true);
  };

  const completeModule = () => {
    if (selectedModule) {
      toast.success(`${selectedModule.title} completed successfully!`);
      setShowModuleDetails(false);
      setSelectedModule(null);
    }
  };

  const overallProgress = Math.round(
    trainingModules.reduce((sum, module) => sum + module.progress, 0) / trainingModules.length
  );

  return (
    <div className="space-y-6">
      {/* Training Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Training & Compliance
          </CardTitle>
          <CardDescription>
            Stay up-to-date with required training and certifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600">
                {trainingModules.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="text-2xl font-bold text-orange-600">
                {trainingModules.filter(m => m.status === 'in-progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-2xl font-bold text-red-600">
                {trainingModules.filter(m => m.status === 'overdue').length}
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="training" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="training">Training Modules</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-4">
          {/* Training Modules */}
          {trainingModules.map((module) => (
            <Card key={module.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {getTypeIcon(module.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{module.title}</h4>
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(module.status)}`} />
                        {module.certificateRequired && (
                          <Award className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.duration} min
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {module.category}
                        </Badge>
                        {module.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      {module.dueDate && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(module.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {module.status !== 'not-started' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>
                      )}
                      {module.score && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Score: {module.score}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {module.status === 'completed' ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant={module.status === 'overdue' ? 'destructive' : 'default'}
                        onClick={() => startModule(module)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {module.status === 'in-progress' ? 'Continue' : 'Start'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {/* Compliance Items */}
          {complianceItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`h-3 w-3 rounded-full mt-2 ${getStatusColor(item.status)}`} />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                        <span>({item.frequency})</span>
                      </div>
                      {item.lastCompleted && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Last completed: {new Date(item.lastCompleted).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.documents.map((doc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge
                      variant={item.status === 'compliant' ? 'secondary' : 'destructive'}
                      className={
                        item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                        item.status === 'warning' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {item.status === 'compliant' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {item.status === 'warning' && <Clock className="h-3 w-3 mr-1" />}
                      {item.status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Training Module Details Modal */}
      {showModuleDetails && selectedModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(selectedModule.type)}
                {selectedModule.title}
              </CardTitle>
              <CardDescription>
                {selectedModule.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Training content would load here</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{selectedModule.progress}%</span>
                </div>
                <Progress value={selectedModule.progress} className="h-2" />
              </div>

              <div className="flex gap-2">
                <Button onClick={completeModule} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowModuleDetails(false);
                    setSelectedModule(null);
                  }}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}