import React, { useState } from 'react';
import { AlertTriangle, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

export function PanicButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const handlePanicPress = () => {
    setShowDialog(true);
  };

  const activatePanic = () => {
    setIsActivated(true);
    setShowDialog(false);
    toast.error('EMERGENCY ALERT ACTIVATED! Dispatching immediate assistance...', {
      duration: 5000,
    });
    
    // Simulate emergency protocol
    setTimeout(() => {
      toast.success('Emergency services have been notified. Help is on the way.', {
        duration: 5000,
      });
    }, 2000);
  };

  return (
    <>
      <Button
        onClick={handlePanicPress}
        className={`fixed bottom-24 right-4 h-16 w-16 rounded-full shadow-lg ${
          isActivated 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-red-500 hover:bg-red-600'
        } text-white border-4 border-white`}
        size="lg"
      >
        <AlertTriangle className="h-8 w-8" />
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Emergency Alert
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-sm">
              Are you sure you want to activate the panic button? This will immediately alert:
            </p>
            <ul className="text-xs space-y-1 bg-muted p-3 rounded">
              <li>• Emergency services (911)</li>
              <li>• Security dispatch center</li>
              <li>• Your supervisor</li>
              <li>• Nearby guards</li>
            </ul>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={activatePanic}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                ACTIVATE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}