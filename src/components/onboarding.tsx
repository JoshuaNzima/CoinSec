import React, { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Shield, 
  MapPin, 
  Camera, 
  MessageSquare, 
  Bell, 
  Fingerprint,
  Smartphone,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to Guard Services',
    description: 'Your comprehensive security management platform',
    icon: Shield,
    content: 'This app helps you manage patrols, report incidents, communicate with dispatch, and track your daily activities. Let\'s get you set up!'
  },
  {
    id: 2,
    title: 'GPS Tracking',
    description: 'Real-time location monitoring',
    icon: MapPin,
    content: 'Your location will be tracked during shifts to ensure safety and provide accurate patrol logs. This helps dispatch know where you are at all times.'
  },
  {
    id: 3,
    title: 'Incident Reporting',
    description: 'Quick and detailed incident documentation',
    icon: Camera,
    content: 'Easily report incidents with photos, voice notes, and detailed descriptions. All reports are automatically timestamped and location-tagged.'
  },
  {
    id: 4,
    title: 'Communication',
    description: 'Stay connected with your team',
    icon: MessageSquare,
    content: 'Instant messaging with dispatch and other guards. Send updates, receive instructions, and coordinate effectively during your shift.'
  },
  {
    id: 5,
    title: 'Notifications & Alerts',
    description: 'Stay informed with real-time updates',
    icon: Bell,
    content: 'Receive important alerts, shift updates, and emergency notifications. You can customize which notifications you want to receive.'
  },
  {
    id: 6,
    title: 'Security Features',
    description: 'Biometric authentication and emergency panic button',
    icon: Fingerprint,
    content: 'Enable biometric login for quick access and learn about the emergency panic button that instantly alerts dispatch and nearby guards.'
  }
];

export function Onboarding() {
  const { completeOnboarding, enableBiometric } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isEnablingBiometric, setIsEnablingBiometric] = useState(false);

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEnableBiometric = async () => {
    setIsEnablingBiometric(true);
    try {
      await enableBiometric();
      handleNext();
    } catch (error) {
      console.error('Failed to enable biometric:', error);
    } finally {
      setIsEnablingBiometric(false);
    }
  };

  const IconComponent = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {currentStepData.content}
          </p>

          {currentStep === onboardingSteps.length - 1 && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Enable Biometric Login</span>
              </div>
              <p className="text-sm text-muted-foreground">
                For faster and more secure access, enable biometric authentication.
              </p>
              <Button 
                onClick={handleEnableBiometric}
                disabled={isEnablingBiometric}
                className="w-full"
              >
                {isEnablingBiometric ? (
                  'Setting up...'
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Enable Biometric Login
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button onClick={handleNext}>
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-center gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}